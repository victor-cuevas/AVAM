import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationService } from '@shared/services/navigation-service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin } from 'rxjs';
import { CodeDTO } from '@dtos/codeDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { BaseResponseWrapperZuweisungContainerDTOWarningMessages } from '@dtos/baseResponseWrapperZuweisungContainerDTOWarningMessages';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { ZuweisungViewDTO } from '@dtos/zuweisungViewDTO';
import { ZuweisungDTO } from '@dtos/zuweisungDTO';
import { takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { HistorisierungComponent } from '@shared/components/historisierung/historisierung.component';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { DateValidator } from '@shared/validators/date-validator';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormUtilsService, GenericConfirmComponent } from '@app/shared';
import { ZuweisungCodeEnum } from '@shared/enums/domain-code/zuweisung-code.enum';
import { DbTranslateService } from '@shared/services/db-translate.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AuthenticationService } from '@core/services/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { ZuweisungStatusCodeEnum } from '@shared/enums/domain-code/zuweisung-status-code.enum';
import { UnternehmenSideNavLabels } from '@shared/enums/stes-routing-labels.enum';
import { ResetDialogService } from '@shared/services/reset-dialog.service';
import { BaseResponseWrapperZuweisungDTOWarningMessages } from '@dtos/baseResponseWrapperZuweisungDTOWarningMessages';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { ZuweisungVermittlungsstandCode } from '@shared/enums/domain-code/zuweisung-vermittlungsstand-code.enum';
import { ContentService } from '@shared/components/unternehmen/common/content/content.service';
import { BaseResponseWrapperOsteHeaderParamDTOWarningMessages } from '@dtos/baseResponseWrapperOsteHeaderParamDTOWarningMessages';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { OsteNavigationHelperService } from '@modules/arbeitgeber/arbeitgeber-details/services/oste-navigation-helper.service';
import { MessageBus } from '@shared/services/message-bus';
import { StesTerminePaths } from '@shared/enums/stes-navigation-paths.enum';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-stellenangebote-vermittlung-bearbeiten',
    templateUrl: './stellenangebote-vermittlung-bearbeiten.component.html'
})
export class StellenangeboteVermittlungBearbeitenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('stesDetailsModal') stesDetailsModal: ElementRef;
    @ViewChild('profilvergleichModal') profilvergleichModal: ElementRef;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    zuweisungChannel = 'zuweisungChannel';
    formNumber = UnternehmenSideNavLabels.STELLENANGEBOT_VERMITTLUNG;
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;
    permissions: typeof Permissions = Permissions;

    calendarDisabled: boolean;
    bewerbungsanforderungCode: string;

    statusLabels: any = [];
    vermittlungsArtLabels = [];
    vermittlungsErgebnisLabels: any = [];
    bearbeitenForm: FormGroup;
    stellensuchenderForm: FormGroup;

    statusOptions: CodeDTO[];
    vermittlungsErgebnisOptions: CodeDTO[];
    vermittlungsArtOptions: CodeDTO[];
    zuweisungView: ZuweisungViewDTO;
    zuweisung: ZuweisungDTO;

    istDatenschutz: boolean;

    private stellenangeboteVermittlungBearbeiten = './stellenangebote/stellenangebot/vermittlungen/bearbeiten';
    private unternehmenId: string;
    private zuweisungId: string;
    private osteId: string;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private facade: FacadeService,
        public toolboxService: ToolboxService,
        private spinnerService: SpinnerService,
        private stesService: StesDataRestService,
        private authService: AuthenticationService,
        private translateService: TranslateService,
        private navigationService: NavigationService,
        private infopanelService: AmmInfopanelService,
        private resetDialogService: ResetDialogService,
        private dbTranslateService: DbTranslateService,
        private notificationService: NotificationService,
        private unternehmenService: UnternehmenRestService,
        private fehlermeldungService: FehlermeldungenService,
        private contentService: ContentService,
        private osteService: OsteDataRestService,
        private osteSideNavHelper: OsteNavigationHelperService,
        private messageBus: MessageBus
    ) {
        super();
    }

    ngOnInit() {
        this.infopanelService.updateInformation({ subtitle: 'arbeitgeber.oste.label.vermittlung' });
        this.getRouteParams();
        this.generateForms();
    }

    ngAfterViewInit() {
        this.getData();
    }

    ngOnDestroy() {
        this.fehlermeldungService.closeMessage();
        this.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    updateBewerbungBisControl(index) {
        this.bearbeitenForm.controls.vermittlungsArt.markAsDirty();
        this.bearbeitenForm.controls.vermittlungsArt.setValue(this.vermittlungsArtOptions[index].codeId);
        this.bearbeitenForm.controls.vermittlungsArt.updateValueAndValidity();
        const bewerbungBis = this.bearbeitenForm.controls.bewerbungBis;
        if (this.vermittlungsArtOptions[index].codeId !== +this.bewerbungsanforderungCode) {
            this.calendarDisabled = true;
            bewerbungBis.reset();
            bewerbungBis.clearValidators();
        } else {
            this.calendarDisabled = false;
            bewerbungBis.setValue(this.facade.formUtilsService.parseDate(this.zuweisung.bewerbungBis));
            bewerbungBis.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        }
        bewerbungBis.updateValueAndValidity();
        this.bearbeitenForm.markAsDirty();
    }

    openStesDetails() {
        this.fehlermeldungService.closeMessage();
        this.modalService.open(this.stesDetailsModal, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-full-height', backdrop: 'static' });
    }

    isFreigabebereit(): boolean {
        return this.zuweisung && this.zuweisung.zuweisungStatusId === +this.facade.formUtilsService.getCodeIdByCode(this.statusOptions, ZuweisungStatusCodeEnum.FREIGABEBEREIT);
    }

    canDeactivate(): boolean {
        return this.bearbeitenForm.dirty;
    }

    cancel() {
        this.navigationService.hideNavigationTreeRoute(this.stellenangeboteVermittlungBearbeiten, { osteId: this.osteId, zuweisungId: this.zuweisungId });
        if (this.router.url.includes('stellenangebote/stellenangebot/vermittlungen/bearbeiten')) {
            this.router.navigate(['../'], { queryParams: { osteId: this.osteId }, relativeTo: this.route });
        }
    }

    reset() {
        if (this.bearbeitenForm.dirty) {
            this.fehlermeldungService.closeMessage();
            this.resetDialogService.reset(() => {
                this.mapToForm();
                this.bearbeitenForm.controls.vermittlungsArt.setValue(this.zuweisung.vermittlungsartObject.code);
                document.getElementById(this.zuweisung.vermittlungsartObject.code.toString()).click();
                this.bearbeitenForm.markAsPristine();
                this.bearbeitenForm.markAsUntouched();
                this.bearbeitenForm.updateValueAndValidity();
            });
        }
    }

    profilSenden() {
        this.spinnerService.activate(this.zuweisungChannel);
        this.fehlermeldungService.closeMessage();
        this.unternehmenService
            .profileSenden(this.osteId, this.zuweisungId, this.translateService.currentLang)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperZuweisungDTOWarningMessages) => {
                    if (!response.warning) {
                        OrColumnLayoutUtils.scrollTop();
                        this.notificationService.success(this.translateService.instant('stes.vermittlung.feedback.mailVersandt'));
                        this.bearbeitenForm.markAsPristine();
                    }
                    this.spinnerService.deactivate(this.zuweisungChannel);
                },
                () => {
                    OrColumnLayoutUtils.scrollTop();
                    this.spinnerService.deactivate(this.zuweisungChannel);
                    this.notificationService.error(this.translateService.instant('stes.vermittlung.feedback.mailError'));
                }
            );
    }

    openProfilvergleich() {
        this.fehlermeldungService.closeMessage();
        this.modalService.open(this.profilvergleichModal, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-full-height', backdrop: 'static' });
    }

    openDeleteDialog() {
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

    delete() {
        this.fehlermeldungService.closeMessage();
        this.spinnerService.activate(this.zuweisungChannel);
        this.stesService
            .deleteZuweisung(this.zuweisungId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperZuweisungDTOWarningMessages) => {
                    if (!response.warning) {
                        OrColumnLayoutUtils.scrollTop();
                        this.notificationService.success(this.translateService.instant('common.message.datengeloescht'));
                        this.bearbeitenForm.markAsPristine();
                        this.cancel();
                    }
                    this.spinnerService.deactivate(this.zuweisungChannel);
                },
                () => {
                    OrColumnLayoutUtils.scrollTop();
                    this.spinnerService.deactivate(this.zuweisungChannel);
                }
            );
    }

    update(actionType: string) {
        this.fehlermeldungService.closeMessage();
        if (this.bearbeitenForm.valid) {
            this.spinnerService.activate(this.zuweisungChannel);
            this.stesService
                .updateZuweisung(this.translateService.currentLang, actionType, this.mapToDTO())
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    (response: BaseResponseWrapperZuweisungDTOWarningMessages) => {
                        if (response.data) {
                            this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                            this.zuweisung = response.data;
                            this.mapToForm();
                            this.bearbeitenForm.markAsPristine();
                            this.bearbeitenForm.updateValueAndValidity();
                        }
                        OrColumnLayoutUtils.scrollTop();
                        this.spinnerService.deactivate(this.zuweisungChannel);
                    },
                    () => {
                        OrColumnLayoutUtils.scrollTop();
                        this.spinnerService.deactivate(this.zuweisungChannel);
                    }
                );
        } else {
            OrColumnLayoutUtils.scrollTop();
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    private getRouteParams() {
        this.route.parent.params.subscribe(parentData => {
            this.unternehmenId = parentData['unternehmenId'];
        });

        this.route.queryParamMap.subscribe(params => {
            this.zuweisungId = params.get('zuweisungId');
            this.osteId = params.get('osteId');
            this.setSideNav();
        });
    }

    private setSideNav() {
        this.osteSideNavHelper.setSecondLevelNav(this.zuweisungId);
    }

    private generateForms() {
        this.bearbeitenForm = this.fb.group(
            {
                vermittlungVom: null,
                vermittlungsNr: null,
                vermittlungsArt: null,
                bewerbungBis: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                versanddatum: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                status: [null, Validators.required],
                vermittlungsverantwortung: [null, Validators.required],
                meldungStellenangebot: false,
                meldungStellensuchender: false,
                vermittlungsergebnis: null,
                ergaenzendeAngaben: null,
                rueckmeldungStes: null,
                rueckmeldungArbeitgeber: null
            },
            { validator: [DateValidator.rangeBetweenDatesWarning('vermittlungVom', 'bewerbungBis', 'val207'), DateValidator.val318('vermittlungVom', 'versanddatum')] }
        );

        this.stellensuchenderForm = this.fb.group({
            personalberater: null
        });
    }

    private getData() {
        this.spinnerService.activate(this.zuweisungChannel);
        forkJoin<BaseResponseWrapperZuweisungContainerDTOWarningMessages, CodeDTO[], CodeDTO[], CodeDTO[]>([
            this.unternehmenService.getZuweisung(this.osteId, this.zuweisungId),
            this.stesService.getCode(DomainEnum.STATUS_ZUWEISUNG_OSTE),
            this.stesService.getCode(DomainEnum.VERMITTLUNGSSTAND),
            this.stesService.getCode(DomainEnum.VERMITTLUNGSART)
        ])
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                ([zuweisung, statusOptions, ergebnisOptions, vermittlungsArtOptions]) => {
                    if (vermittlungsArtOptions) {
                        this.vermittlungsArtOptions = vermittlungsArtOptions;
                        this.bewerbungsanforderungCode = this.facade.formUtilsService.getCodeIdByCode(vermittlungsArtOptions, ZuweisungCodeEnum.BEWERBUNGSANFORDERUNG);
                        this.vermittlungsArtLabels = this.vermittlungsArtOptions.map(option => this.dbTranslateService.translate(option, 'text'));
                    }
                    if (statusOptions) {
                        this.statusOptions = statusOptions;
                        this.statusLabels = this.facade.formUtilsService.mapDropdownKurztext(statusOptions);
                    }
                    if (ergebnisOptions) {
                        this.vermittlungsErgebnisOptions = ergebnisOptions;
                        this.vermittlungsErgebnisLabels = this.facade.formUtilsService.mapDropdownKurztext(ergebnisOptions);
                    }
                    if (zuweisung.data) {
                        this.zuweisung = zuweisung.data.zuweisungDTO;
                        this.zuweisungView = zuweisung.data.zuweisungViewDTO;
                        this.mapToForm();
                        this.initToolBox();
                        this.setSubscriptions();
                        this.istDatenschutz = this.zuweisungView.istDatenschutz;
                        this.updateBewerbungBisValidators();
                        this.authService.setStesPermissionContext(this.zuweisung.stesId);
                        this.authService.setOwnerPermissionContext(this.zuweisung.stesId, this.zuweisung.ownerId);
                    }

                    this.spinnerService.deactivate(this.zuweisungChannel);
                    OrColumnLayoutUtils.scrollTop();
                },
                () => {
                    this.spinnerService.deactivate(this.zuweisungChannel);
                    OrColumnLayoutUtils.scrollTop();
                }
            );
    }

    private initToolBox(): void {
        const toolboxConfig = ToolboxConfig.getStellenangebotVermittlungConfig();
        if (!this.isFreigabebereit() && !this.isVermittlungsstandNichtGeeignet(this.zuweisung)) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true));
        }
        this.toolboxService.sendConfiguration(toolboxConfig, this.zuweisungChannel, ToolboxDataHelper.createForOsteZuweisung(+this.zuweisungId));
    }

    private setSubscriptions() {
        this.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.vermittlungsArtLabels = this.vermittlungsArtOptions.map(option => this.dbTranslateService.translate(option, 'text'));
        });

        this.bearbeitenForm.controls.status.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
            const statusCode = this.facade.formUtilsService.getCodeByCodeId(this.statusOptions, value);
            if (statusCode === ZuweisungCodeEnum.STATUS_VERSENDET && this.zuweisung && !this.zuweisung.versanddatum) {
                this.bearbeitenForm.patchValue({ versanddatum: this.facade.formUtilsService.parseDate(new Date()) });
            }
        });

        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.openHistoryModal(this.zuweisungId, AvamCommonValueObjectsEnum.T_ZUWEISUNG);
                } else if (action.message.action === ToolboxActionEnum.COPY) {
                    this.openDmsCopyModal();
                }
            });

        this.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data && message.data.label === this.dbTranslateService.instant(UnternehmenSideNavLabels.STELLENANGEBOT_VERMITTLUNG)) {
                this.cancel();
            }
        });
    }

    private openHistoryModal(objId: string, objType: string): void {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }

    private openDmsCopyModal() {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;

        comp.context = DmsMetadatenContext.DMS_CONTEXT_ZUWEISUNG;
        comp.id = this.zuweisungId;
    }

    private isVermittlungsstandNichtGeeignet(zuweisung) {
        return (
            zuweisung &&
            zuweisung.vermittlungsstandId ===
                +this.facade.formUtilsService.getCodeIdByCode(this.vermittlungsErgebnisOptions, ZuweisungVermittlungsstandCode.VERMITTLUNG_NICHT_GEEIGNET)
        );
    }

    private updateBewerbungBisValidators() {
        this.calendarDisabled = this.zuweisung.vermittlungsartId !== +this.bewerbungsanforderungCode;
        const bewerbungBis = this.bearbeitenForm.controls.bewerbungBis;
        this.calendarDisabled
            ? bewerbungBis.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx])
            : bewerbungBis.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        bewerbungBis.updateValueAndValidity();
    }

    private mapToForm() {
        this.bearbeitenForm.patchValue({
            vermittlungVom: this.facade.formUtilsService.parseDate(this.zuweisung.zuweisungDatumVom),
            vermittlungsNr: this.zuweisung.zuweisungNummer,
            vermittlungsArt: this.zuweisung.vermittlungsartId,
            bewerbungBis: this.facade.formUtilsService.parseDate(this.zuweisung.bewerbungBis),
            versanddatum: this.facade.formUtilsService.parseDate(this.zuweisung.versanddatum),
            status: this.zuweisung.zuweisungStatusId,
            vermittlungsverantwortung: this.zuweisung.vermittlerDetailObject,
            meldungStellenangebot: this.zuweisung.cbMeldungBeiAbmeldungOste,
            meldungStellensuchender: this.zuweisung.cbMeldungBeiAbmeldungStes,
            vermittlungsergebnis: this.zuweisung.vermittlungsstandId,
            ergaenzendeAngaben: this.zuweisung.ergaenzendeAngaben,
            rueckmeldungStes: this.zuweisung.rueckmeldungStes,
            rueckmeldungArbeitgeber: this.zuweisung.rueckmeldungAg
        });

        this.stellensuchenderForm.patchValue({
            personalberater: this.zuweisungView.personalberaterObject
        });
    }

    private mapToDTO(): ZuweisungDTO {
        const formControls = this.bearbeitenForm.controls;
        const zuweisungDTO = Object.assign({}, this.zuweisung);
        zuweisungDTO.isVonStesAusgehend = false;
        zuweisungDTO.vermittlungsartId = formControls.vermittlungsArt.value;
        zuweisungDTO.bewerbungBis = this.facade.formUtilsService.parseDate(formControls.bewerbungBis.value);
        zuweisungDTO.versanddatum = this.facade.formUtilsService.parseDate(formControls.versanddatum.value);
        zuweisungDTO.zuweisungStatusId = formControls.status.value;
        zuweisungDTO.vermittlerDetailObject = formControls.vermittlungsverantwortung['benutzerObject'];
        zuweisungDTO.cbMeldungBeiAbmeldungOste = formControls.meldungStellenangebot.value;
        zuweisungDTO.cbMeldungBeiAbmeldungStes = formControls.meldungStellensuchender.value;
        zuweisungDTO.vermittlungsstandId = formControls.vermittlungsergebnis.value ? formControls.vermittlungsergebnis.value : null;
        zuweisungDTO.ergaenzendeAngaben = formControls.ergaenzendeAngaben.value;
        zuweisungDTO.rueckmeldungStes = formControls.rueckmeldungStes.value;
        zuweisungDTO.rueckmeldungAg = formControls.rueckmeldungArbeitgeber.value;
        return zuweisungDTO;
    }
}
