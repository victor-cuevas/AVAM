import { DateValidator } from '@shared/validators/date-validator';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ToolboxService } from '@app/shared';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { StesDatenfreigabeDTO } from 'src/app/shared/models/dtos-generated/stesDatenfreigabeDTO';
import { forkJoin, iif, Subscription } from 'rxjs';
import { BenutzerstelleSucheParamsModel } from '../benutzerstelle-suche-params.model';
import { StatusEnum } from '@app/shared/classes/fixed-codes';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { JwtDTO } from '@shared/models/dtos-generated/jwtDTO';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import PrintHelper from '@shared/helpers/print.helper';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { TranslateService } from '@ngx-translate/core';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { DomainEnum } from '@shared/enums/domain.enum';
import { DisableControlDirective } from '@app/library/core/directives/disable-control.directive';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'app-stes-datenfreigabe',
    templateUrl: './stes-datenfreigabe.component.html',
    styleUrls: ['./stes-datenfreigabe.component.scss'],
    providers: [ObliqueHelperService]
})
export class StesDatenfreigabeComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('resetBefragungConfirm') resetBefragungConfirm: NgbModalRef;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('benutzerstellenIdInput', { read: DisableControlDirective }) disableControlDirective: DisableControlDirective;
    datenfreigabeChannel = 'datenfreigabe';
    strasseNr = '';
    plz: string = null;
    datenfreigabeForm: FormGroup;
    stesId: string;
    data: StesDatenfreigabeDTO;
    benutzerStelleObj: any;
    disableCheckbox: boolean;
    sozialhilfestelleRegionTyp;
    sozialhilfestellenTyp;
    aktivStatus = StatusEnum.AKTIV;
    benutzerstelleSucheParams: BenutzerstelleSucheParamsModel;
    disableLogin: boolean;
    observeClickActionSub: Subscription;
    datenfreigabeSucheToolboxId = 'datenfreigabe';
    permissions: typeof Permissions = Permissions;

    constructor(
        private formBuilder: FormBuilder,
        private dataRestService: StesDataRestService,
        private route: ActivatedRoute,
        private obliqueHelper: ObliqueHelperService,
        private translateService: TranslateService,
        private stesInfobarService: AvamStesInfoBarService,
        private facade: FacadeService
    ) {
        super();
        SpinnerService.CHANNEL = this.datenfreigabeChannel;
        ToolboxService.CHANNEL = this.datenfreigabeChannel;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;

        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesPublikation' });
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.initForm();
        this.getData();

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe(action => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
            if (action.message.action === ToolboxActionEnum.HISTORY && this.data) {
                this.openHistoryModal(this.data.stesDatenweitergabeID.toString(), AvamCommonValueObjectsEnum.T_STES_DATENWEITERGABE);
            }
        });
    }

    ngAfterViewInit(): void {
        this.initValidators();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.facade.fehlermeldungenService.closeMessage();
        this.observeClickActionSub.unsubscribe();
    }

    canDeactivate(): boolean {
        return this.datenfreigabeForm.dirty;
    }

    resetBefragung() {
        if (!this.datenfreigabeForm.controls.wurdeBefragt.value) {
            this.facade.openModalFensterService.openModal(this.resetBefragungConfirm);
        } else {
            this.disableCheckbox = false;
        }
    }

    resetDatenfreigabe(event: any) {
        if (event) {
            this.disableCheckbox = true;
            this.datenfreigabeForm.controls.oeffentlich.setValue(false);
            this.datenfreigabeForm.controls.login.setValue(false);
            this.datenfreigabeForm.controls.kontaktangebenJobroom.setValue(false);
            this.datenfreigabeForm.controls.kontaktangebenArbeitgeber.setValue(false);
            this.datenfreigabeForm.controls.unterlagen.setValue(false);
            this.datenfreigabeForm.controls.bulletin.setValue(false);
        } else {
            this.datenfreigabeForm.controls.wurdeBefragt.setValue(true);
        }

        this.facade.openModalFensterService.dismissAll('dismissAll() called');
    }

    getData() {
        this.facade.spinnerService.activate(this.datenfreigabeChannel);

        forkJoin(
            this.dataRestService.getCode(DomainEnum.VOLLZUGSREGIONTYP),
            this.dataRestService.getCode(DomainEnum.BENUTZERSTELLETYP),
            this.dataRestService.getDatenfreigabe(this.stesId)
        )
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                ([vollzugsregiontypData, benutzerstelletypData, response]) => {
                    this.sozialhilfestelleRegionTyp = vollzugsregiontypData.find(c => c.code === 'SH').codeId;
                    this.sozialhilfestellenTyp = benutzerstelletypData.find(c => c.code === '13').codeId;
                    this.data = response.data;
                    if (this.data) {
                        this.datenfreigabeForm.setValue(this.mapToForm());
                        this.setLoginDisabled();
                        this.benutzerStelleObj = this.data.benutzerstelleObject;
                        this.printBenutzerstelle();
                        this.displayVermittlungsstoppAktiviertMsg();
                        if (this.data.stesID) {
                            this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesPublikationBearbeiten' });
                        } else {
                            this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesPublikationErfassen' });
                            this.datenfreigabeForm.patchValue(this.setDefaultValues());
                        }
                        this.configureUINumber();
                    } else {
                        this.disableCheckbox = true;
                    }
                    this.configureToolbox();
                    this.facade.spinnerService.deactivate(this.datenfreigabeChannel);
                },
                () => {
                    this.facade.spinnerService.deactivate(this.datenfreigabeChannel);
                }
            );
    }

    setDefaultValues() {
        return {
            wurdeBefragt: false,
            oeffentlich: false,
            login: false,
            kontaktangebenJobroom: false,
            kontaktangebenArbeitgeber: false,
            unterlagen: false,
            bulletin: false
        };
    }

    mapToForm(): any | undefined {
        if (this.data) {
            this.disableCheckbox = !this.data.statusBefragungB;

            return {
                wurdeBefragt: this.data.statusBefragungB,
                oeffentlich: this.data.oeffentlichB,
                login: this.data.geschuetztB,
                kontaktangebenJobroom: this.data.geschuetztKontaktangabenB,
                kontaktangebenArbeitgeber: this.data.arbeitsvermittlerB,
                unterlagen: this.data.arbeitsvermittlerBewerbB,
                bulletin: this.data.bewerberBulletinB,
                beantragtAm: this.data.shAntragsdatum ? new Date(this.data.shAntragsdatum) : null,
                benutzerstellenId: this.data.benutzerstelleObject ? this.data.benutzerstelleObject.code : ''
            };
        }

        this.disableCheckbox = true;
    }

    mapToDTO() {
        return {
            stesDatenweitergabeID: this.data ? this.data.stesDatenweitergabeID : null,
            stesID: this.stesId,
            statusBefragungB: this.datenfreigabeForm.controls.wurdeBefragt.value,
            oeffentlichB: this.datenfreigabeForm.controls.oeffentlich.value,
            geschuetztB: this.datenfreigabeForm.controls.login.value,
            geschuetztKontaktangabenB: this.datenfreigabeForm.controls.kontaktangebenJobroom.value,
            arbeitsvermittlerB: this.datenfreigabeForm.controls.kontaktangebenArbeitgeber.value,
            arbeitsvermittlerBewerbB: this.datenfreigabeForm.controls.unterlagen.value,
            bewerberBulletinB: this.datenfreigabeForm.controls.bulletin.value,
            benutzerstelleObject: this.benutzerStelleObj,
            shAntragsdatum: this.datenfreigabeForm.controls.beantragtAm.value
                ? this.facade.formUtilsService.formatDateNgx(this.datenfreigabeForm.controls.beantragtAm.value)
                : null,
            ojbVersion: this.data ? this.data.ojbVersion : null,
            zuweisungsStop: this.data ? this.data.zuweisungsStop : null,
            shOwnerId: this.benutzerStelleObj ? this.benutzerStelleObj.benutzerstelleId : null
        };
    }

    reset() {
        this.facade.resetDialogService.resetIfDirty(this.datenfreigabeForm, () => {
            this.facade.fehlermeldungenService.closeMessage();
            this.ngForm.resetForm(this.mapToForm());
            this.setLoginDisabled();

            if (this.data.benutzerstelleObject) {
                this.benutzerStelleObj = this.data.benutzerstelleObject;
                this.strasseNr = this.data.benutzerstelleObject.strasseNr;

                if (this.data.benutzerstelleObject.plzObject) {
                    this.plz = this.data.benutzerstelleObject.plzObject.postleitzahl;
                }
            } else {
                this.benutzerStelleObj = null;
                this.strasseNr = null;
                this.plz = null;
            }
            this.initValidators();
        });
    }

    openBenutzerstelleSuche(content) {
        this.facade.fehlermeldungenService.closeMessage();

        this.benutzerstelleSucheParams = {
            benutzerstellentyp: this.sozialhilfestellenTyp,
            vollzugsregiontyp: this.sozialhilfestelleRegionTyp,
            status: this.aktivStatus,
            kanton: null
        };
        this.openModal(content);
    }

    openBenutzerstellenTabelle(content) {
        const currentUser: JwtDTO = JSON.parse(localStorage.getItem('currentUser'));
        this.benutzerstelleSucheParams = {
            benutzerstellentyp: this.sozialhilfestellenTyp,
            vollzugsregiontyp: null,
            status: this.aktivStatus,
            kanton: currentUser.userDto.kantonKuerzel
        };
        this.openModal(content);
    }

    openModal(content) {
        this.facade.openModalFensterService.openXLModal(content).result.then(
            result => {
                ToolboxService.CHANNEL = this.datenfreigabeChannel;
            },
            reason => {
                ToolboxService.CHANNEL = this.datenfreigabeChannel;
            }
        );
    }

    // BSP19
    setLoginDisabled() {
        if (this.datenfreigabeForm.controls.oeffentlich.value) {
            this.disableLogin = true;
            this.datenfreigabeForm.controls.login.setValue(true);
        } else {
            this.disableLogin = false;
        }
    }

    // BSP10
    resetLoginMitKontaktangaben() {
        if (!this.datenfreigabeForm.controls.login.value) {
            this.datenfreigabeForm.controls.kontaktangebenJobroom.setValue(false);
        }
    }

    // BSP18
    resetKontaktangebenArbeitgeber() {
        if (!this.datenfreigabeForm.controls.kontaktangebenArbeitgeber.value) {
            this.datenfreigabeForm.controls.unterlagen.patchValue(false);
            this.datenfreigabeForm.controls.unterlagen.markAsTouched();
        }
    }

    // BSP3
    clearBenutzerstelle() {
        this.datenfreigabeForm.controls.benutzerstellenId.clearValidators();
        this.datenfreigabeForm.controls.benutzerstellenId.reset();
        this.benutzerStelleObj = null;
        this.strasseNr = '';
        this.plz = null;
        this.datenfreigabeForm.controls.beantragtAm.clearValidators();
        this.datenfreigabeForm.controls.beantragtAm.reset();

        this.datenfreigabeForm.markAsDirty();
    }

    // BSP14
    displayVermittlungsstoppAktiviertMsg() {
        if (this.data.zuweisungsStop) {
            this.facade.fehlermeldungenService.showMessage('stes.message.publikation.zuweisungsstoppaktivpublikationpruefen', 'warning');
        }
    }

    save() {
        this.facade.fehlermeldungenService.closeMessage();

        const benutzerstellenIdControl: AbstractControl = this.datenfreigabeForm.get('benutzerstellenId');
        const beantragtAmControl: AbstractControl = this.datenfreigabeForm.get('beantragtAm');
        this.updateValidators(benutzerstellenIdControl, beantragtAmControl);

        if (this.datenfreigabeForm.valid) {
            this.facade.spinnerService.activate(this.datenfreigabeChannel);

            const update = this.dataRestService.updateDatenfreigabe(this.stesId, this.mapToDTO());
            const create = this.dataRestService.createDatenfreigabe(this.stesId, this.mapToDTO());

            iif(() => !!this.data.stesID, update, create)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    response => {
                        OrColumnLayoutUtils.scrollTop();
                        this.facade.spinnerService.deactivate(this.datenfreigabeChannel);
                        if (response.data !== null) {
                            this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesPublikationBearbeiten' });
                            this.facade.notificationService.success('common.message.datengespeichert');
                            this.data = response.data;
                            this.ngForm.resetForm(this.mapToForm());
                            this.configureToolbox();
                            this.configureUINumber();
                        }
                    },
                    () => {
                        this.facade.spinnerService.deactivate(this.datenfreigabeChannel);
                        OrColumnLayoutUtils.scrollTop();
                    }
                );
        } else {
            this.ngForm.onSubmit(undefined);
            this.showValidationMessages(benutzerstellenIdControl, beantragtAmControl);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    fillDataBenutzerstelle(data) {
        this.benutzerStelleObj = data.benutzerstelleObj;
        this.plz = this.benutzerStelleObj.plzObject.postleitzahl;
        this.strasseNr = this.benutzerStelleObj.strasseNr;
        this.datenfreigabeForm.controls.benutzerstellenId.setValue(data.id);
        this.onChangeBeantragtAmBenutzerstellenId();
        this.datenfreigabeForm.markAsDirty();
    }

    openHistoryModal(objId: string, objType: string) {
        this.facade.openModalFensterService.openHistoryModal(objId, objType);
    }

    cancelEvent(event: any): void {
        event.preventDefault();
        event.stopPropagation();
    }

    onChangeBeantragtAmBenutzerstellenId(): void {
        const benutzerstellenIdControl: AbstractControl = this.datenfreigabeForm.get('benutzerstellenId');
        const beantragtAmControl: AbstractControl = this.datenfreigabeForm.get('beantragtAm');
        if ((beantragtAmControl.value && beantragtAmControl.value !== '') || (benutzerstellenIdControl.value && benutzerstellenIdControl.value !== '')) {
            this.updateValidators(benutzerstellenIdControl, beantragtAmControl);
        } else {
            this.initValidators();
        }
    }

    private initValidators(): void {
        const beantragtAmControl: AbstractControl = this.datenfreigabeForm.get('beantragtAm');
        beantragtAmControl.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        beantragtAmControl.updateValueAndValidity();
        const benutzerstellenIdControl: AbstractControl = this.datenfreigabeForm.get('benutzerstellenId');
        benutzerstellenIdControl.setValidators([]);
        benutzerstellenIdControl.updateValueAndValidity();
        this.disableControlDirective.disableControl = true;
    }

    private updateValidators(benutzerstellenIdControl: AbstractControl, beantragtAmControl: AbstractControl): void {
        if (beantragtAmControl.value && (!benutzerstellenIdControl.value || benutzerstellenIdControl.value === '')) {
            benutzerstellenIdControl.setValidators([Validators.required]);
            this.disableControlDirective.disableControl = false;
        } else if ((!beantragtAmControl.value || beantragtAmControl.value === '') && benutzerstellenIdControl.value) {
            beantragtAmControl.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            this.disableControlDirective.disableControl = false;
        } else {
            this.initValidators();
        }
        benutzerstellenIdControl.updateValueAndValidity();
        beantragtAmControl.updateValueAndValidity();
    }

    private showValidationMessages(benutzerstellenIdControl, beantragtAmControl): void {
        if (benutzerstellenIdControl.invalid) {
            this.facade.fehlermeldungenService.showMessage('stes.message.publikation.benutzerstelleLeer', 'danger');
        } else if (beantragtAmControl.invalid) {
            this.facade.fehlermeldungenService.showMessage('stes.message.publikation.datumungueltig', 'danger');
        }
    }

    private printBenutzerstelle() {
        if (this.data.benutzerstelleObject) {
            this.strasseNr = this.data.benutzerstelleObject.strasseNr;
            if (this.data.benutzerstelleObject.plzObject) {
                this.plz = this.data.benutzerstelleObject.plzObject.postleitzahl;
            }
        }
    }

    private initForm() {
        this.datenfreigabeForm = this.formBuilder.group({
            wurdeBefragt: false,
            oeffentlich: false,
            login: false,
            kontaktangebenJobroom: false,
            kontaktangebenArbeitgeber: [false, [Validators.required]],
            unterlagen: [false, [Validators.required]],
            bulletin: false,
            beantragtAm: null,
            benutzerstellenId: null
        });
    }

    private configureToolbox() {
        if (this.data && this.data.stesDatenweitergabeID) {
            this.facade.toolboxService.sendConfiguration(
                ToolboxConfig.getDatenfreigabeBearbeitenConfig(),
                this.datenfreigabeSucheToolboxId,
                ToolboxDataHelper.createForStellensuchende(this.stesId)
            );
        } else {
            this.facade.toolboxService.sendConfiguration(
                ToolboxConfig.getDatenfreigabeErfassenConfig(),
                this.datenfreigabeSucheToolboxId,
                ToolboxDataHelper.createForStellensuchende(this.stesId)
            );
        }
    }

    private configureUINumber() {
        if (this.data && this.data.stesDatenweitergabeID) {
            this.facade.messageBus.buildAndSend('footer-infos.formNumber', { formNumber: StesFormNumberEnum.DATENFREIGABE_BEARBEITEN });
        } else {
            this.facade.messageBus.buildAndSend('footer-infos.formNumber', { formNumber: StesFormNumberEnum.DATENFREIGABE_ERFASSEN });
        }
    }
}
