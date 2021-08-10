import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { FormUtilsService, GenericConfirmComponent } from '@app/shared';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { ToolboxConfig } from '@app/shared/components/toolbox/toolbox-config';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { ZuweisungCodeEnum } from '@app/shared/enums/domain-code/zuweisung-code.enum';
import { ZuweisungStatusCodeEnum } from '@app/shared/enums/domain-code/zuweisung-status-code.enum';
import { ZuweisungVermittlungsstandCode } from '@app/shared/enums/domain-code/zuweisung-vermittlungsstand-code.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { StesArbeitsvermittlungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { BaseResponseWrapperZuweisungDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperZuweisungDTOWarningMessages';
import { BaseResponseWrapperZuweisungViewDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperZuweisungViewDTOWarningMessages';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { ZuweisungDTO } from '@app/shared/models/dtos-generated/zuweisungDTO';
import { ZuweisungViewDTO } from '@app/shared/models/dtos-generated/zuweisungViewDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { NavigationService } from '@app/shared/services/navigation-service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { DateValidator } from '@app/shared/validators/date-validator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { VermittlungLabels } from '@shared/enums/stes-routing-labels.enum';
import { MessageBus } from '@shared/services/message-bus';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin, Subject, Subscription, zip } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VermittlungDataPanelComponent } from '@shared/components/vermittlung-data-panel/vermittlung-data-panel.component';
import { FacadeService } from '@shared/services/facade.service';

enum UpdateType {
    SPEICHERN = 'speichern',
    FREIGEBEN = 'freigeben',
    ZURUECKWEISEN = 'zurueckweisen'
}

@Component({
    selector: 'avam-vermittlung-bearbeiten',
    templateUrl: './vermittlung-bearbeiten.component.html'
})
export class VermittlungBearbeitenComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('osteDetailsModal') osteDetailsModal: ElementRef;

    vermittlungBearbeitenToolboxId = 'vermittlungBearbeitenToolbox';
    zuweisungChannel = 'zuweisungBearbeitenChannel';

    zuweisungId: string;

    formNumber = StesFormNumberEnum.VERMITTLUNG_BEARBEITEN;
    dateWithRadioId: string;
    vermittlungsStatusCodeId: string;

    vermittlungFormBearbeiten: FormGroup;

    @ViewChild('vermittlungDataPanel') vermittlungPanel: VermittlungDataPanelComponent;
    radioBtns: QueryList<ElementRef>;

    mergedToolboxSub: Subscription;
    toolboxActionSub: Subscription;
    langChangeSubscription: Subscription;

    zuweisungData: ZuweisungDTO;
    zuweisungViewData: ZuweisungViewDTO;

    labels = [];
    anredeOptions = [];
    radioButtonOptions = [];
    zuweisungStatusOptions: CodeDTO[] = [];
    zuweisungStatusLabels = [];
    vermittlungsergebnisOptions: CodeDTO[] = [];
    vermittlungsergebnisLabels = [];

    radioValueCodeId: number;
    vermittlungsartId: number;
    stesId: number;
    osteId: number;
    startIndex: string;
    unternehmenId: number = null;
    calendarDisabled = true;
    updateType = UpdateType;

    statusFreigabebereit = false;

    hasBearbeitenPermission = false;
    hasFreigebenPermission = false;
    hasSuchenPermission = false;

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;

    permissions: typeof Permissions = Permissions;

    constructor(
        private navigationService: NavigationService,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private dbTranslateService: DbTranslateService,
        private stesDataRestService: StesDataRestService,
        private translateService: TranslateService,
        private router: Router,
        private authService: AuthenticationService,
        private toolboxService: ToolboxService,
        private readonly modalService: NgbModal,
        private spinnerService: SpinnerService,
        private fehlermeldungenService: FehlermeldungenService,
        private resetDialogService: ResetDialogService,
        private changeDetector: ChangeDetectorRef,
        private obliqueHelper: ObliqueHelperService,
        private facade: FacadeService,
        private notificationService: NotificationService,
        private messageBus: MessageBus,
        private stesInfobarService: AvamStesInfoBarService
    ) {
        super();
        SpinnerService.CHANNEL = this.zuweisungChannel;
        ToolboxService.CHANNEL = this.vermittlungBearbeitenToolboxId;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.setPermissionFlags();
        this.getZuweisungId();
        this.setSideNav();
        this.createForm();
        this.subscribeToLangChange();
        this.loadData();
        this.subscribeToStatusChange();
        this.toolboxActionSub = this.subscribeToToolbox();
        this.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                this.closeComponent(message);
            }
        });
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.vermittlung.bearbeiten' });
    }

    closeComponent(message) {
        if (message.data.label === this.translateService.instant(VermittlungLabels.VERMITTLUNG_BEARBEITEN)) {
            this.navigateToAnzeigen();
        }
    }

    ngAfterViewInit() {
        this.changeDetector.detectChanges();
        this.radioBtns = this.vermittlungPanel.radioBtns;
        this.radioBtns.changes.subscribe(() => {
            this.radioBtns.first.nativeElement.focus();
        });
    }

    createForm() {
        this.vermittlungFormBearbeiten = this.formBuilder.group(
            {
                vermittlungVom: null,
                vermittlungsNr: null,
                status: [null, Validators.required],
                bewerbungBis: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                versanddatum: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                vermittlungsArt: null,
                meldungStellenangebot: false,
                meldungStellensuchender: false,
                vermittlungsverantwortung: ['', Validators.required],
                stellenangebotName: null,
                stellenangebotOrt: null,
                stellenbezeichnung: null,
                stellenNr: null,
                stellenangebotStatus: null,
                osteBerater: [''],
                anrede: null,
                kontaktpersonName: null,
                kontaktpersonVorname: null,
                kontaktpersonTelefon: null,
                kontaktpersonEmail: null,
                vermittlungsergebnis: null,
                ergaenzendeAngaben: null,
                rueckmeldungStes: null,
                rueckmeldungArbeitgeber: null
            },
            { validator: [DateValidator.rangeBetweenDatesWarning('vermittlungVom', 'bewerbungBis', 'val207'), DateValidator.val318('vermittlungVom', 'versanddatum')] }
        );
    }

    mapToForm(zuweisung: ZuweisungDTO, zuweisungViewData: ZuweisungViewDTO) {
        const map = {
            vermittlungVom: this.facade.formUtilsService.parseDate(zuweisung.zuweisungDatumVom),
            vermittlungsNr: zuweisung.zuweisungNummer,
            status: zuweisung.zuweisungStatusId,
            bewerbungBis: this.facade.formUtilsService.parseDate(zuweisung.bewerbungBis),
            versanddatum: this.facade.formUtilsService.parseDate(zuweisung.versanddatum),
            meldungStellenangebot: zuweisung.cbMeldungBeiAbmeldungOste,
            meldungStellensuchender: zuweisung.cbMeldungBeiAbmeldungStes,
            vermittlungsverantwortung: zuweisung.vermittlerDetailObject,
            stellenangebotName: `${zuweisungViewData.ugName1 ? zuweisungViewData.ugName1 : ''} ${zuweisungViewData.ugName2 ? zuweisungViewData.ugName2 : ''} ${
                zuweisungViewData.ugName3 ? zuweisungViewData.ugName3 : ''
            }`,
            stellenangebotOrt: this.dbTranslateService.translate(zuweisungViewData, 'ugOrt'),
            stellenbezeichnung: zuweisungViewData.osteStellenbezeichnung,
            stellenNr: zuweisungViewData.osteStellenNummerAvam,
            stellenangebotStatus: this.dbTranslateService.translate(zuweisungViewData, 'osteStatus'),
            osteBerater: zuweisungViewData.stellenverantwortungDetailObject,
            anrede: zuweisungViewData.kontaktpersonAnredeDe
                ? this.dbTranslateService.translate(zuweisungViewData, 'kontaktpersonAnrede')
                : this.dbTranslateService.translate(zuweisungViewData, 'bewerbAnrede'),
            kontaktpersonName: zuweisungViewData.kontaktpersonVorname ? zuweisungViewData.kontaktpersonName : zuweisungViewData.bewerbName,
            kontaktpersonVorname: zuweisungViewData.kontaktpersonVorname ? zuweisungViewData.kontaktpersonVorname : zuweisungViewData.bewerbVorname,
            kontaktpersonTelefon: zuweisungViewData.kontaktpersonTelefon ? zuweisungViewData.kontaktpersonTelefon : zuweisungViewData.bewerbTelefon,
            kontaktpersonEmail: zuweisungViewData.kontaktpersonEMail ? zuweisungViewData.kontaktpersonEMail : zuweisungViewData.bewerbEMail,
            vermittlungsergebnis: zuweisung.vermittlungsstandId,
            ergaenzendeAngaben: zuweisung.ergaenzendeAngaben,
            rueckmeldungStes: zuweisung.rueckmeldungStes,
            rueckmeldungArbeitgeber: zuweisung.rueckmeldungAg,
            vermittlungsArt: zuweisung.vermittlungsartId
        };

        return map;
    }

    mapToDTO(): ZuweisungDTO {
        const formControls = this.vermittlungFormBearbeiten.controls;

        return {
            zuweisungId: +this.zuweisungId,
            ojbVersion: this.zuweisungData.ojbVersion,
            zuweisungDatumVom: this.facade.formUtilsService.parseDate(formControls.vermittlungVom.value),
            zuweisungNummer: formControls.vermittlungsNr.value,
            stesId: this.stesId,
            osteId: this.osteId,
            isVonStesAusgehend: true,
            vermittlungsartId: formControls.vermittlungsArt.value,
            bewerbungBis: this.facade.formUtilsService.parseDate(formControls.bewerbungBis.value),
            versanddatum: this.facade.formUtilsService.parseDate(formControls.versanddatum.value),
            zuweisungStatusId: formControls.status.value,
            vermittlungsstandId: formControls.vermittlungsergebnis.value ? formControls.vermittlungsergebnis.value : null,
            ergaenzendeAngaben: formControls.ergaenzendeAngaben.value,
            vermittlerDetailObject: formControls.vermittlungsverantwortung['benutzerObject']
                ? formControls.vermittlungsverantwortung['benutzerObject']
                : formControls.vermittlungsverantwortung.value,
            cbMeldungBeiAbmeldungOste: formControls.meldungStellenangebot.value,
            cbMeldungBeiAbmeldungStes: formControls.meldungStellensuchender.value,
            rueckmeldungStes: formControls.rueckmeldungStes.value,
            rueckmeldungAg: formControls.rueckmeldungArbeitgeber.value
        };
    }

    checkedRadioButton(index: number): boolean {
        this.radioValueCodeId = this.radioButtonOptions[index].codeId;

        return this.vermittlungsartId === this.radioButtonOptions[index].codeId;
    }

    isRadioWithDateSelected(index) {
        this.vermittlungFormBearbeiten.controls.vermittlungsArt.setValue(this.startIndex);
        const bewerbungBis = this.vermittlungFormBearbeiten.controls.bewerbungBis;

        if (this.radioButtonOptions[index].codeId !== +this.dateWithRadioId) {
            bewerbungBis.reset();
            bewerbungBis.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            this.calendarDisabled = true;
            bewerbungBis.updateValueAndValidity();
        } else {
            bewerbungBis.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            this.calendarDisabled = false;
            bewerbungBis.updateValueAndValidity();
        }

        this.vermittlungFormBearbeiten.controls.vermittlungsArt.setValue(this.radioButtonOptions[index].codeId);

        this.vermittlungFormBearbeiten.markAsDirty();
    }

    loadData() {
        this.spinnerService.activate(this.zuweisungChannel);
        forkJoin<CodeDTO[], BaseResponseWrapperZuweisungViewDTOWarningMessages, CodeDTO[], BaseResponseWrapperZuweisungDTOWarningMessages, CodeDTO[]>([
            this.stesDataRestService.getCode(DomainEnum.STATUS_ZUWEISUNG_OSTE),
            this.stesDataRestService.getZuweisungView(this.zuweisungId),
            this.stesDataRestService.getCode(DomainEnum.VERMITTLUNGSSTAND),
            this.stesDataRestService.getZuweisung(this.zuweisungId),
            this.stesDataRestService.getCode(DomainEnum.VERMITTLUNGSART)
        ]).subscribe(
            ([statusOptions, zuweisungView, ergebnisOptions, zuweisung, vermirrlungsArt]) => {
                if (vermirrlungsArt) {
                    this.radioButtonOptions = vermirrlungsArt;
                    this.labels = [];
                    this.dateWithRadioId = this.facade.formUtilsService.getCodeIdByCode(vermirrlungsArt, ZuweisungCodeEnum.BEWERBUNGSANFORDERUNG);
                    for (const value of vermirrlungsArt) {
                        this.labels.push(this.dbTranslateService.translate(value, 'text'));
                    }
                }
                if (statusOptions) {
                    this.zuweisungStatusOptions = statusOptions;
                    this.zuweisungStatusLabels = this.facade.formUtilsService.mapDropdownKurztext(statusOptions);
                }
                if (ergebnisOptions) {
                    this.vermittlungsergebnisOptions = ergebnisOptions;
                    this.vermittlungsergebnisLabels = this.facade.formUtilsService.mapDropdownKurztext(ergebnisOptions);
                }
                if (zuweisung && zuweisungView) {
                    this.vermittlungsartId = zuweisung.data.vermittlungsartId;
                    this.stesId = zuweisung.data.stesId;
                    this.osteId = zuweisung.data.osteId;
                    this.startIndex = zuweisung.data.vermittlungsartObject.code;
                    this.calendarDisabled = zuweisung.data.vermittlungsartId !== +this.dateWithRadioId;
                    const bewerbungBis = this.vermittlungFormBearbeiten.controls.bewerbungBis;
                    this.calendarDisabled
                        ? bewerbungBis.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx])
                        : bewerbungBis.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
                    this.zuweisungData = zuweisung.data;
                    this.zuweisungViewData = zuweisungView.data;
                    this.configureToolbox();
                    this.statusFreigabebereit = this.isStatusFreigabebereit(this.zuweisungData);
                    this.vermittlungFormBearbeiten.reset(this.mapToForm(this.zuweisungData, this.zuweisungViewData));
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

    canDeactivate(): boolean {
        return this.vermittlungFormBearbeiten.dirty;
    }

    configureToolbox() {
        const toolboxData: DokumentVorlageToolboxData = {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.STELLENVERMITTLUNGZUWEISUNG,
            vorlagenKategorien: [VorlagenKategorie.Vermittlung_Stellenvermittlung],
            entityIDsMapping: { ARBEITSVERMITTLUNG_ZUWEISUNG_ID: +this.zuweisungId }
        };
        const toolboxConfig = ToolboxConfig.getDefaultConfig();
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));

        //BSP15 Wenn Zuweisungsstatus "freigabebereit" oder Vermittlungsstand "Zuweisung nicht geeignet"
        //dann DokManager NICHT anzeigen
        if (this.hasSuchenPermission && (!this.isStatusFreigabebereit(this.zuweisungData) && !this.isVermittlungsstandNichtGeeignet(this.zuweisungData))) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true));
        }

        this.toolboxService.sendConfiguration(toolboxConfig, this.vermittlungBearbeitenToolboxId, toolboxData);
    }

    subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(this.vermittlungBearbeitenToolboxId).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                window.print();
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(this.zuweisungId, AvamCommonValueObjectsEnum.T_ZUWEISUNG);
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.openDmsCopyModal();
            }
        });
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

    openHistoryModal(objId: string, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }

    openDmsCopyModal() {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;

        comp.context = DmsMetadatenContext.DMS_CONTEXT_ZUWEISUNG;
        comp.id = this.zuweisungId;
    }

    getZuweisungId() {
        this.route.queryParamMap.subscribe(params => {
            this.zuweisungId = params.get('zuweisungId');
        });
    }

    isStatusFreigabebereit(zuweisung) {
        return zuweisung && zuweisung.zuweisungStatusId === +this.facade.formUtilsService.getCodeIdByCode(this.zuweisungStatusOptions, ZuweisungStatusCodeEnum.FREIGABEBEREIT);
    }

    isVermittlungsstandNichtGeeignet(zuweisung) {
        return (
            zuweisung &&
            zuweisung.vermittlungsstandId ===
                +this.facade.formUtilsService.getCodeIdByCode(this.vermittlungsergebnisOptions, ZuweisungVermittlungsstandCode.VERMITTLUNG_NICHT_GEEIGNET)
        );
    }

    setSideNav() {
        this.navigationService.showNavigationTreeRoute(StesArbeitsvermittlungPaths.VERMITTLUNG_BEARBEITEN, { zuweisungId: this.zuweisungId });
    }

    subscribeToLangChange() {
        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
            this.loadData();
        });
    }

    subscribeToStatusChange() {
        this.vermittlungFormBearbeiten.controls['status'].valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
            const statusCode = this.facade.formUtilsService.getCodeByCodeId(this.zuweisungStatusOptions, value);
            if (statusCode === ZuweisungCodeEnum.STATUS_VERSENDET && this.zuweisungData && !this.zuweisungData.versanddatum) {
                this.vermittlungFormBearbeiten.patchValue({ versanddatum: this.facade.formUtilsService.parseDate(new Date()) });
            }
        });
    }

    navigateToAnzeigen() {
        if (this.router.url.includes(StesArbeitsvermittlungPaths.VERMITTLUNG_BEARBEITEN)) {
            this.router.navigate([`./${StesArbeitsvermittlungPaths.ARBEITSVERMITTLUNGEN_ANZEIGEN}`], { relativeTo: this.route.parent });
            this.navigationService.hideNavigationTreeRoute(StesArbeitsvermittlungPaths.VERMITTLUNG_BEARBEITEN, { zuweisungId: this.zuweisungId });
        }
    }

    update(updateType: UpdateType) {
        this.fehlermeldungenService.closeMessage();

        if (!this.vermittlungFormBearbeiten.valid) {
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.ngForm.onSubmit(undefined);
            OrColumnLayoutUtils.scrollTop();
            return;
        }

        this.spinnerService.activate(this.zuweisungChannel);
        this.stesDataRestService.updateZuweisung(this.translateService.currentLang, updateType.toString(), this.mapToDTO()).subscribe(
            response => {
                if (response.data) {
                    this.zuweisungData = response.data;
                    this.statusFreigabebereit = this.isStatusFreigabebereit(this.zuweisungData);
                    this.configureToolbox();
                    this.stesDataRestService.getZuweisungView(this.zuweisungId).subscribe(
                        resp => {
                            this.vermittlungFormBearbeiten.reset(this.mapToForm(this.zuweisungData, resp.data));

                            this.vermittlungFormBearbeiten.markAsPristine();
                            this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                            this.spinnerService.deactivate(this.zuweisungChannel);
                            OrColumnLayoutUtils.scrollTop();
                        },
                        () => {
                            this.handleError('common.message.datennichtgespeichert');
                        }
                    );
                } else {
                    this.handleError('common.message.datennichtgespeichert');
                }
            },
            () => {
                this.handleError('common.message.datennichtgespeichert');
            }
        );
    }

    reset() {
        if (this.vermittlungFormBearbeiten.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                this.vermittlungFormBearbeiten.reset(this.mapToForm(this.zuweisungData, this.zuweisungViewData));
                this.vermittlungFormBearbeiten.controls.vermittlungsArt.setValue(this.startIndex);

                document.getElementById(this.startIndex).click();
            });
        }
    }

    delete() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.zuweisungChannel);

        this.stesDataRestService.deleteZuweisung(this.zuweisungId).subscribe(
            response => {
                if (!response.warning) {
                    this.vermittlungFormBearbeiten.markAsPristine();
                    this.notificationService.success(this.translateService.instant('common.message.datengeloescht'));
                    this.navigateToAnzeigen();
                } else {
                    this.notificationService.error(this.translateService.instant('common.message.datennichtgeloescht'));
                }
                this.spinnerService.deactivate(this.zuweisungChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            error => {
                this.handleError('common.message.datennichtgeloescht');
            }
        );
    }

    openProfilvergleich(template) {
        this.fehlermeldungenService.closeMessage();
        this.modalService.open(template, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-full-height', backdrop: 'static' });
    }

    openOsteDetails() {
        this.fehlermeldungenService.closeMessage();
        this.modalService.open(this.osteDetailsModal, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-full-height', backdrop: 'static' });
    }

    handleError(message: string) {
        this.notificationService.error(this.translateService.instant(message));
        this.spinnerService.deactivate(this.zuweisungChannel);
        OrColumnLayoutUtils.scrollTop();
    }

    setPermissionFlags() {
        this.hasBearbeitenPermission = this.authService.hasAllPermissions([this.permissions.STES_VM_ZUWEISUNG_BEARBEITEN]);
        this.hasFreigebenPermission = this.authService.hasAllPermissions([this.permissions.STES_VM_ZUWEISUNG_FREIGEBEN_ZURUECKWEISEN]);
        this.hasSuchenPermission = this.authService.hasAllPermissions([this.permissions.STES_VM_STES_ZUWEISUNG_SUCHEN]);
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
        if (this.mergedToolboxSub) {
            this.mergedToolboxSub.unsubscribe();
        }
        if (this.toolboxActionSub) {
            this.toolboxActionSub.unsubscribe();
        }
        this.toolboxService.sendConfiguration([]);
        this.fehlermeldungenService.closeMessage();
    }
}
