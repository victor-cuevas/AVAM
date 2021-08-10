import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { OsteNavigationHelperService } from '@modules/arbeitgeber/arbeitgeber-details/services/oste-navigation-helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Unsubscribable } from 'oblique-reactive';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { Step4OsteErfassenFormComponent } from '@shared/components/unternehmen/oste-erfassen/step4-oste-erfassen-form/step4-oste-erfassen-form.component';
import { FormUtilsService, GenericConfirmComponent, ToolboxService } from '@app/shared';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { distinctUntilChanged, finalize, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { DmsMetadatenContext } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FacadeService } from '@shared/services/facade.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { OsteDTO } from '@dtos/osteDTO';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { OsteBewirtschaftungParamDTO } from '@dtos/osteBewirtschaftungParamDTO';
import { OsteSchlagwortDTO } from '@dtos/osteSchlagwortDTO';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { OsteStatusCode } from '@shared/enums/domain-code/oste-status-code.enum';
import { CodeDTO } from '@dtos/codeDTO';
import { WarningMessages } from '@dtos/warningMessages';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { BaseResponseWrapperOsteBearbeitenDTOWarningMessages } from '@dtos/baseResponseWrapperOsteBearbeitenDTOWarningMessages';
import { OsteBearbeitenDTO } from '@dtos/osteBearbeitenDTO';
import * as moment from 'moment';
import { DateValidator } from '@shared/validators/date-validator';
import { NumberValidator } from '@shared/validators/number-validator';
import { BaseResponseWrapperCodeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperCodeDTOWarningMessages';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'avam-bewirtschaftung',
    templateUrl: './bewirtschaftung.component.html'
})
export class BewirtschaftungComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('beweirtForm') bewirtschaftungForm: Step4OsteErfassenFormComponent;
    osteId: string;
    unternehmenId: string;
    channel = 'stes4OsteErfassen';
    permissions: typeof Permissions = Permissions;
    public isLoschenVisible = false;

    private maxSperrfristDate = new Date(9999, 11, 31);
    private currentOste: OsteDTO;
    private currentStatus: CodeDTO;

    constructor(
        private facadeService: FacadeService,
        private infopanelService: AmmInfopanelService,
        private osteSideNavHelper: OsteNavigationHelperService,
        private route: ActivatedRoute,
        private router: Router,
        private formUtils: FormUtilsService,
        private osteRestService: OsteDataRestService,
        private stesDataRestService: StesDataRestService,
        public modalService: NgbModal
    ) {
        super();
    }

    static getCheckboxesValues(formControls) {
        return {
            zuweisungMeldung: formControls.meldungBeiVermittlung.value ? true : null,
            zuweisungFreigeben: formControls.vermittlungenFreigegeben.value ? true : null,
            ravVorselektion: formControls.vorselektion.value ? true : null,
            zuweisungsstopp: formControls.vermittlungsstop.value ? true : null
        };
    }

    public ngOnInit() {
        this.infopanelService.updateInformation({ subtitle: 'arbeitgeber.oste.subnavmenuitem.bewirtschaftung' });
        this.getRouteParams();
        this.initToolbox();
        this.setSubscriptions();
    }

    public ngAfterViewInit() {
        this.initData();
        this.addValidationAbmeldungGrund();
    }

    public ngOnDestroy(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.facadeService.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    public cancel() {
        if (this.router.url.includes('stellenangebote/stellenangebot/bewirtschaftung')) {
            this.router.navigate(['../../'], { queryParams: {}, relativeTo: this.route });
        }
        if (this.canDeactivate()) {
            this.osteSideNavHelper.checkConfirmationToCancel();
        } else {
            this.osteSideNavHelper.hideSideNav();
        }
    }

    public reset() {
        if (this.bewirtschaftungForm.bewirtschaftungForm.dirty) {
            this.facadeService.fehlermeldungenService.closeMessage();
            this.facadeService.resetDialogService.reset(() => {
                this.bewirtschaftungForm.setForm(this.currentOste);
                this.bewirtschaftungForm.bewirtschaftungForm.markAsPristine();
            });
        }
    }

    public openDeleteConfirmationModal() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.delete();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    public save() {
        this.facadeService.fehlermeldungenService.closeMessage();
        if (this.bewirtschaftungForm.bewirtschaftungForm.valid) {
            if (this.bewirtschaftungForm.bewirtschaftungForm.controls.abmeldung.value && this.currentStatus.code !== OsteStatusCode.ABGEMELDET) {
                this.openAbmeldungConfirmationModal();
            } else {
                this.commonSave();
            }
        } else {
            this.bewirtschaftungForm.ngForm.onSubmit(undefined);
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    public canDeactivate() {
        return this.bewirtschaftungForm.bewirtschaftungForm.dirty;
    }

    private commonSave() {
        this.facadeService.spinnerService.activate(this.channel);
        this.osteRestService
            .osteBewirschaftungSpeichern(this.mapToDTO())
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                    OrColumnLayoutUtils.scrollTop();
                })
            )
            .subscribe((response: BaseResponseWrapperOsteBearbeitenDTOWarningMessages) => {
                if (this.isNotSomeErrorIntoResponse(response.warning)) {
                    this.setDataIntoForm(response.data, false);
                    this.facadeService.notificationService.success('common.message.datengespeichert');
                }
            });
    }

    private getRouteParams() {
        this.route.parent.params.subscribe(parentData => {
            this.unternehmenId = parentData['unternehmenId'];
        });

        this.route.queryParamMap.subscribe(params => {
            this.osteId = params.get('osteId');
            if (params.get('abmeldeGrundCode') && params.get('abmeldeDatum')) {
                this.applyJobroomAbmeldung();
                this.osteSideNavHelper.setFirstLevelNav({ abmeldeGrundCode: params.get('abmeldeGrundCode'), abmeldeDatum: params.get('abmeldeDatum') });
            } else {
                this.osteSideNavHelper.setFirstLevelNav();
            }
        });
    }

    private initData() {
        this.facadeService.spinnerService.activate(this.channel);
        this.osteRestService
            .getOsteBewirtschaftungOwner(this.osteId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperOsteBearbeitenDTOWarningMessages) => {
                    if (response.data) {
                        this.setDataIntoForm(response.data, true);
                    }
                    this.facadeService.spinnerService.deactivate(this.channel);
                },
                () => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                }
            );
    }

    private setDataIntoForm(osteBearbeitenDTO: OsteBearbeitenDTO, isInitData: boolean) {
        this.currentOste = osteBearbeitenDTO.osteDTO;
        this.applyBSPS(osteBearbeitenDTO.osteDTO, isInitData);
        this.bewirtschaftungForm.setForm(osteBearbeitenDTO.osteDTO);
        this.stesDataRestService
            .getCodeById(osteBearbeitenDTO.osteDTO.statusId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response: BaseResponseWrapperCodeDTOWarningMessages) => {
                this.currentStatus = response.data ? response.data : {};
                this.disableFormByStatus();
                this.showInitialMessages(osteBearbeitenDTO, isInitData);
                this.addValidationWhenMeldeplichtIsCheckedAndIsStatusAktive();
                this.isLoschenVisible = this.isButtonLoschenVisible(osteBearbeitenDTO);
            });

        this.bewirtschaftungForm.bewirtschaftungForm.controls.zuweisungMax.setValidators([
            NumberValidator.isPositiveInteger,
            NumberValidator.isNumberWithinRage(osteBearbeitenDTO.anzahlZuweisung, 999, 'val279')
        ]);

        this.bewirtschaftungForm.bewirtschaftungForm.markAsPristine();
    }

    private disabledCheckBoxes() {
        this.disableCheckBox(this.bewirtschaftungForm.bewirtschaftungForm.controls.vorselektion);
        this.disableCheckBox(this.bewirtschaftungForm.bewirtschaftungForm.controls.vermittlungsstop);
        this.disableCheckBox(this.bewirtschaftungForm.bewirtschaftungForm.controls.vermittlungenFreigegeben);
        this.disableCheckBox(this.bewirtschaftungForm.bewirtschaftungForm.controls.meldungBeiVermittlung);
    }

    private addValidationWhenMeldeplichtIsCheckedAndIsStatusAktive() {
        if (this.currentStatus.code === OsteStatusCode.ACTIVE && this.bewirtschaftungForm.bewirtschaftungForm.controls.meldepflicht.value) {
            this.bewirtschaftungForm.bewirtschaftungForm.controls.sperrfristbis.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            this.bewirtschaftungForm.bewirtschaftungForm.markAsDirty();
        } else {
            this.bewirtschaftungForm.bewirtschaftungForm.controls.sperrfristbis.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        }
        this.bewirtschaftungForm.bewirtschaftungForm.controls.sperrfristbis.updateValueAndValidity();
    }

    private initToolbox() {
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getOsteBearbeitenConfig(), this.channel, ToolboxDataHelper.createForOsteBearbeiten(+this.osteId));
    }

    private setSubscriptions() {
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.facadeService.openModalFensterService.openHistoryModal(this.osteId, AvamCommonValueObjectsEnum.T_OSTE);
                } else if (action.message.action === ToolboxActionEnum.COPY) {
                    this.facadeService.openModalFensterService.openDmsCopyModal(DmsMetadatenContext.DMS_CONTEXT_OSTE_BEARBEITEN, this.osteId);
                }
            });
    }

    private delete() {
        this.facadeService.spinnerService.activate(this.channel);
        this.osteRestService
            .removeOste(this.osteId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperLongWarningMessages) => {
                    if (this.isNotSomeErrorIntoResponse(response.warning)) {
                        this.facadeService.notificationService.success(this.facadeService.translateService.instant('common.message.datengeloescht'));
                        this.bewirtschaftungForm.bewirtschaftungForm.markAsPristine();
                        this.cancel();
                    }
                    this.facadeService.spinnerService.deactivate(this.channel);
                    OrColumnLayoutUtils.scrollTop();
                },
                () => {
                    OrColumnLayoutUtils.scrollTop();
                    this.facadeService.spinnerService.deactivate(this.channel);
                }
            );
    }

    private mapToDTO(): OsteBewirtschaftungParamDTO {
        const formControls = this.bewirtschaftungForm.bewirtschaftungForm.controls;
        const currentAuftraggeber: any = this.bewirtschaftungForm.bewirtschaftungForm.controls.stellenmeldung.value ? this.bewirtschaftungForm.getCurrentAuftraggeber() : null;
        return {
            osteId: +this.osteId,
            ojbVersion: this.currentOste.ojbVersion,
            statusId: +this.currentOste.statusId,
            osteInaktiv: this.currentStatus ? this.currentStatus.code === OsteStatusCode.INACTIVE : false,
            stellenverantwortlicherDetailObject: formControls.stellenverantwortung['benutzerObject'],
            meldepflichtBearbeitungId: formControls.bearbeitungsstand.value,

            anzahlStellen: formControls.anzhalstellen.value,
            auftraggeberBurId: currentAuftraggeber ? currentAuftraggeber.burOrtEinheitId : null,
            auftraggeberId: currentAuftraggeber ? currentAuftraggeber.unternehmenId : null,
            auftraggeberName1: currentAuftraggeber ? currentAuftraggeber.name1 : null,
            auftraggeberName2: currentAuftraggeber ? currentAuftraggeber.name2 : null,
            auftraggeberName3: currentAuftraggeber ? currentAuftraggeber.name3 : null,
            auftraggeber: !!currentAuftraggeber,
            weitereAngaben: formControls.weitereAngaben.value,
            maxZuweisungen: formControls.zuweisungMax.value,
            schlagworte: this.getSchlagworteList(formControls.schlagworte.value),
            sperrfrist: formControls.sperrfristbis.value,
            jobroomInternPublikation: this.bewirtschaftungForm.internButtons.getCurrentValue().isYesSelected,
            jobroomInternAnonym: this.bewirtschaftungForm.internButtons.getCurrentValue().isAnonym,
            jobroomExternPublikation: this.bewirtschaftungForm.externButtons.getCurrentValue().isYesSelected,
            jobroomExternAnonym: this.bewirtschaftungForm.externButtons.getCurrentValue().isAnonym,
            publEures: this.bewirtschaftungForm.euresButtons.getCurrentValue().isYesSelected,
            publEuresAnonym: this.bewirtschaftungForm.euresButtons.getCurrentValue().isAnonym,
            meldeDatum: this.formUtils.parseDate(formControls.anmeldeDatum.value),
            gueltigkeitsDatum: !formControls.unbegrentz.value ? this.formUtils.parseDate(formControls.gueltigkeitsDatum.value) : this.maxSperrfristDate,
            abmeldeDatum: this.formUtils.parseDate(formControls.abmeldung.value),
            abmeldeGrund: formControls.grund.value,
            ...(this.currentStatus.code === OsteStatusCode.ACTIVE && BewirtschaftungComponent.getCheckboxesValues(formControls))
        };
    }

    private getSchlagworteList(schlagworteList: Array<any>): OsteSchlagwortDTO[] {
        return schlagworteList
            .filter(item => item.value)
            .map(item => {
                return {
                    schlagwortId: item.id
                };
            });
    }

    private isNotSomeErrorIntoResponse(warning: Array<WarningMessages>): boolean {
        return warning === null || (!!warning && !warning.filter((warningItem: WarningMessages) => warningItem.key === WarningMessages.KeyEnum.DANGER).length);
    }

    private isButtonLoschenVisible(osteBearbeitenDTO: OsteBearbeitenDTO): boolean {
        return (
            (osteBearbeitenDTO.osteDTO.jobRoomNummer === null || osteBearbeitenDTO.osteDTO.jobRoomNummer === '') &&
            (this.currentStatus !== null && this.currentStatus.code === OsteStatusCode.ACTIVE) &&
            osteBearbeitenDTO.anzahlZuweisung === 0
        );
    }

    private disableCheckBox(control: AbstractControl) {
        control.disable();
        control.setValue(null);
    }

    private applyBSPS(oste: OsteDTO, isInitData: boolean) {
        if (oste.meldepflicht) {
            //BSP85
            this.facadeService.fehlermeldungenService.showMessage('arbeitgeber.oste.message.stelleMeldepflicht', 'info');
        }
        if (!isInitData && moment(oste.gueltigkeit).isBefore(moment(new Date()), 'day')) {
            //BSP10
            this.facadeService.fehlermeldungenService.showMessage('arbeitgeber.oste.message.stelleabgelaufen', 'info');
        }
    }

    private showInitialMessages(osteBearbeitenDTO: OsteBearbeitenDTO, isInitData: boolean) {
        if (this.currentStatus.code === OsteStatusCode.INACTIVE) {
            //BSP63
            this.facadeService.fehlermeldungenService.showMessage('arbeitgeber.oste.message.ostestelleinaktiv', 'info');
        }
        if (isInitData && (this.currentStatus.code !== OsteStatusCode.ABGEMELDET && osteBearbeitenDTO.anzahlUnbearbeiteteJobroomMeldungen > 0)) {
            // BSP68
            this.facadeService.fehlermeldungenService.showMessage('arbeitgeber.oste.message.bearbeitenausstehendeabmeldung', 'info');
        }
    }

    private disableFormByStatus() {
        if (this.currentStatus.code === OsteStatusCode.INACTIVE) {
            this.bewirtschaftungForm.disableAllForm();
            this.bewirtschaftungForm.bewirtschaftungForm.controls.gueltigkeitsDatum.enable();
            this.bewirtschaftungForm.bewirtschaftungForm.controls.abmeldung.enable();
            this.bewirtschaftungForm.bewirtschaftungForm.controls.grund.enable();
            this.bewirtschaftungForm.bewirtschaftungForm.controls.unbegrentz.enable();
            this.bewirtschaftungForm.bewirtschaftungForm.controls.weitereAngaben.enable();
            this.bewirtschaftungForm.bewirtschaftungForm.controls.schlagworte.enable();
        } else if (this.currentStatus.code === OsteStatusCode.ABGEMELDET) {
            this.bewirtschaftungForm.disableAllForm();
            this.disabledCheckBoxes();
            this.bewirtschaftungForm.bewirtschaftungForm.controls.schlagworte.enable();
            this.bewirtschaftungForm.bewirtschaftungForm.controls.weitereAngaben.enable();
        } else {
            this.bewirtschaftungForm.enableAllForms();
            this.bewirtschaftungForm.bewirtschaftungForm.controls.meldepflicht.disable();
            if (!this.currentOste.meldepflicht) {
                this.bewirtschaftungForm.bewirtschaftungForm.controls.bearbeitungsstand.disable();
                this.bewirtschaftungForm.bewirtschaftungForm.controls.sperrfristbis.disable();
            }
            if (this.bewirtschaftungForm.bewirtschaftungForm.controls.unbegrentz.value) {
                this.bewirtschaftungForm.bewirtschaftungForm.controls.gueltigkeitsDatum.disable();
            }
            this.bewirtschaftungForm.applyBsp84();
        }
    }

    private addValidationAbmeldungGrund() {
        const datum = this.bewirtschaftungForm.bewirtschaftungForm.controls.abmeldung as FormControl;
        const grund = this.bewirtschaftungForm.bewirtschaftungForm.controls.grund as FormControl;
        datum.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
            if (datum.value) {
                grund.setValidators(Validators.required);
            } else {
                grund.setValidators(null);
                grund.patchValue(grund.value, { emitEvent: false, onlySelf: true });
            }
            grund.updateValueAndValidity();
        });

        grund.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
            if (grund.value) {
                datum.setValidators(Validators.required);
            } else {
                datum.setValidators(null);
                datum.patchValue(datum.value, { emitEvent: false, onlySelf: true });
            }
            datum.updateValueAndValidity();
        });
    }

    private openAbmeldungConfirmationModal(isJobRoom = false) {
        const modalRef = this.setModalCallback();
        if (isJobRoom) {
            modalRef.componentInstance.titleLabel = 'arbeitgeber.oste.title.jobroomabmelden.title';
            modalRef.componentInstance.promptLabel = 'arbeitgeber.oste.title.jobroomabmelden.prompt';
            modalRef.componentInstance.primaryButton = 'arbeitgeber.oste.title.jobroomabmelden.primaryBtnText';
            modalRef.componentInstance.secondaryButton = 'common.button.abbrechen';
        } else {
            modalRef.componentInstance.titleLabel = 'arbeitgeber.oste.title.abmelden';
            modalRef.componentInstance.promptLabel = 'arbeitgeber.oste.message.stelleabmeldenbestaetigen';
            modalRef.componentInstance.primaryButton = 'common.button.jaAbmelden';
            modalRef.componentInstance.secondaryButton = 'common.button.abbrechen';
        }
    }

    private applyJobroomAbmeldung() {
        forkJoin([this.bewirtschaftungForm.dataLoaded, this.bewirtschaftungForm.mapToFormEnded])
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.bewirtschaftungForm.bewirtschaftungForm.controls.abmeldung.setValue(
                    moment(this.route.snapshot.queryParams['abmeldeDatum'], 'YYYY-MM-DD-HH-mm-ss-SSSSSS').toDate()
                );
                this.bewirtschaftungForm.bewirtschaftungForm.controls.grund.setValue(
                    this.facadeService.formUtilsService.getCodeIdByCode(this.bewirtschaftungForm.abmeldegrundOptions, this.route.snapshot.queryParams['abmeldeGrundCode'])
                );
                this.openAbmeldungConfirmationModal(true);
            });
    }

    private setModalCallback(): NgbModalRef {
        const modalRef = this.facadeService.openModalFensterService.openDeleteModal();
        modalRef.result.then(result => {
            if (result) {
                this.commonSave();
            }
        });
        return modalRef;
    }
}
