import { Permissions } from '@shared/enums/permissions.enum';
import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { NavigationService } from '@app/shared/services/navigation-service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FormGroupDirective, FormGroup, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { KontakteViewDTO } from '@app/shared/models/dtos-generated/kontakteViewDTO';
import { PhoneValidator } from '@app/shared/validators/phone-validator';
import { EmailValidator } from '@app/shared/validators/email-validator';
import { SpinnerService, NotificationService, Unsubscribable } from 'oblique-reactive';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, iif, Subject, Subscription } from 'rxjs';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { ToolboxService, FormUtilsService, GenericConfirmComponent } from '@app/shared';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { AmmGesuchFseDTO } from '@app/shared/models/dtos-generated/ammGesuchFseDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AmmGeschaeftsstatusCode } from '@app/shared/enums/domain-code/amm-geschaeftsstatus-code.enum';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { AmmGesuchstypFseCodeEnum } from '@app/shared/enums/domain-code/amm-gesuchstyp-fse-code.enum';
import { DateValidator } from '@app/shared/validators/date-validator';
import { AmmVierAugenStatusCode } from '@app/shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { ReloadHelper } from '@app/shared/helpers/reload.helper';
import { MessageBus } from '@app/shared/services/message-bus';
import { AMMLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { DmsMetadatenKopierenModalComponent, DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { first } from 'rxjs/operators';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { FacadeService } from '@shared/services/facade.service';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';

@Component({
    selector: 'avam-fse-gesuch',
    templateUrl: './fse-gesuch.component.html',
    styleUrls: ['./fse-gesuch.component.scss'],
    providers: [ObliqueHelperService]
})
export class FseGesuchComponent extends AmmCloseableAbstract implements OnInit, OnDestroy, DeactivationGuarded {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('infobartemp') infobartemp: TemplateRef<any>;

    /**
     * Tracks the value and validity state of a group of FormControl instances.
     *
     * @memberof FseGesuchComponent
     */
    fseGesuchForm: FormGroup;

    /**
     * Current component channel.
     *
     * @memberof FseGesuchComponent
     */
    channel = 'fse-gesuch-channel';

    /**
     *  Tracks the state of the form if it is submitted.
     *
     * @memberof FseGesuchComponent
     */
    submitted = false;

    /**
     * The variables checks if the Konktaktperson object is chosen from the modal window or not. If it is chosen
     * from the modal window the fields underneath are read-only if it isn't the fields are editable
     */
    isKontaktpersonSelected = true;

    fseGesuchData: AmmGesuchFseDTO;
    bearbeitungSuchenTokens: {};
    unternehmendId: number;
    kontaktPersonObject: KontakteViewDTO;
    geschaeftsfallId: number;
    shouldKeepMessages: boolean;

    statusOptions: any[] = [];
    gesuchstypOptions: any[] = [];

    buttonsFse: Subject<any[]> = new Subject();
    ammButtonsTypeEnum = AmmButtonsTypeEnum;

    isGesuchstypGewaehrungVonTaggeldern = false;
    isGesuchstypUebernahmeDesVerlustrisikos = false;
    isGesuchstypGewaehrungVonTaggeldernUndVerlusrisikoBE = false;
    isGesuchstypGewaehrungVonTaggeldernUndVerlusrisiko = false;
    isGesuchStatusGeprueft = false;
    isEntscheidFreigabebereitFreigegebenOderErsetzt = false;
    hasGeschaeftsfallVorgaenger = false;
    entscheidStatusCode: string;
    selectedStatusOptionCodeId: string;
    fseAmmEntscheidId: number;
    vorgaengerEntscheidId: number;
    nachfolgerEntscheidId: number;
    isKpersonCleared = false;

    reloadSubscription: Subscription;
    observeClickActionSub: Subscription;
    basisNr: any;

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;

    constructor(
        private navigationService: NavigationService,
        private obliqueHelper: ObliqueHelperService,
        private formBuilder: FormBuilder,
        private spinnerService: SpinnerService,
        private dataRestService: StesDataRestService,
        private route: ActivatedRoute,
        private notificationService: NotificationService,
        private authService: AuthenticationService,
        private translateService: TranslateService,
        protected router: Router,
        private fehlermeldungenService: FehlermeldungenService,
        private dbTranslateService: DbTranslateService,
        private modalService: NgbModal,
        private resetDialogService: ResetDialogService,
        protected facade: FacadeService,
        private ammDataService: AmmRestService,
        private toolboxService: ToolboxService,
        private messageBus: MessageBus,
        private stesInfobarService: AvamStesInfoBarService,
        private ammHelper: AmmHelper,
        protected interactionService: StesComponentInteractionService
    ) {
        super(facade, router, interactionService);
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
        this.ammEntscheidTypeCode = AmmMassnahmenCode.FSE;
    }

    ngOnInit() {
        this.reloadSubscription = ReloadHelper.enable(this.router, this.unsubscribe, () => {
            this.getData();
        });

        this.obliqueHelper.ngForm = this.ngForm;
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesAmm.fseGesuchHeader' });
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.route.queryParamMap.subscribe(params => {
            this.geschaeftsfallId = params.get('gfId') ? +params.get('gfId') : null;
            this.fseAmmEntscheidId = params.get('entscheidId') ? +params.get('entscheidId') : null;
        });

        this.fseGesuchForm = this.createFormGroup();
        this.getData();
        super.ngOnInit();
    }

    isOurLabel(message) {
        return message.data.label === this.dbTranslateService.instant(AMMLabels.FSE);
    }

    isOurUrl(): boolean {
        return (
            this.router.url.includes(AMMPaths.FSE_GESUCH) ||
            this.router.url.includes(AMMPaths.FSE_KOSTEN) ||
            this.router.url.includes(AMMPaths.SPEZIELL_ENTSCHEID.replace(':type', this.ammEntscheidTypeCode))
        );
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));

        this.toolboxService.sendConfiguration(
            toolboxConfig,
            this.channel,
            ToolboxDataHelper.createForAmm(
                DokumentVorlageActionDTO.TargetEntityEnum.FSEGESUCH,
                [VorlagenKategorie.AMM_GESUCH_FSE],
                +this.stesId,
                this.geschaeftsfallId,
                null,
                this.fseAmmEntscheidId
            )
        );

        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.openDmsCopyModal(this.geschaeftsfallId, +this.fseGesuchData.gesuchsNr);
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(+this.fseGesuchData.ammGesuchId, AvamCommonValueObjectsEnum.T_AMM_GESUCH_FSE);
            }
        });
    }

    /**
     * HTTP GET call.
     *
     * The property "prüfbereit" is filtered out of the Status Dropdown because it shouldn't be shown.
     * @memberof FseGesuchComponent
     */
    getData() {
        this.spinnerService.activate(this.channel);
        const get = this.ammDataService.getGesuchFse(this.stesId, this.geschaeftsfallId);
        const create = this.ammDataService.createGesuchFse(this.stesId);
        forkJoin<CodeDTO[], CodeDTO[], any>([
            this.dataRestService.getCode(DomainEnum.AMMGESCHAEFTSSTATUS),
            this.dataRestService.getCode(DomainEnum.GESUCHSTYPFSE),
            iif(() => (this.geschaeftsfallId ? true : false), get, create)
        ]).subscribe(
            ([statusOptions, gesuchstypOptions, gesuchFseResponse]) => {
                this.statusOptions = this.facade.formUtilsService.mapDropdownKurztext(statusOptions).filter(s => s.code !== AmmGeschaeftsstatusCode.PRUEFBEREIT);
                this.gesuchstypOptions = this.facade.formUtilsService.mapDropdownKurztext(gesuchstypOptions);
                this.buttonsFse.next(null);
                if (gesuchFseResponse.data) {
                    this.isKpersonCleared = false;
                    this.fseGesuchData = gesuchFseResponse.data;
                    this.initializeBearbeitungTokens(this.fseGesuchData);
                    this.fseAmmEntscheidId = this.ammHelper.getEntscheidId(this.fseGesuchData.ammGeschaeftsfallObject);
                    this.basisNr = this.fseGesuchData.ammGeschaeftsfallObject.basisNr;
                    this.unternehmendId = this.fseGesuchData.ammGeschaeftsfallObject.unternehmenObject
                        ? this.fseGesuchData.ammGeschaeftsfallObject.unternehmenObject.unternehmenId
                        : null;
                    this.getButtons();
                    this.vorgaengerEntscheidId = this.ammHelper.getEntscheidId(this.fseGesuchData.ammGeschaeftsfallObject.vorgaengerObject);
                    this.nachfolgerEntscheidId = this.ammHelper.getEntscheidId(this.fseGesuchData.ammGeschaeftsfallObject.nachfolgerObject);
                    if (!this.geschaeftsfallId) {
                        this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                        this.shouldKeepMessages = true;
                        this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.FSE_GESUCH}`], {
                            queryParams: {
                                gfId: this.fseGesuchData.ammGeschaeftsfallId,
                                entscheidId: this.fseAmmEntscheidId
                            }
                        });
                    } else {
                        this.shouldKeepMessages = false;
                    }
                    this.fseGesuchForm.setValue(this.mapToForm(this.fseGesuchData));
                    this.geschaeftsfallId = this.fseGesuchData.ammGeschaeftsfallId;
                    this.prepareMask();
                    this.configureToolbox();
                    this.stesInfobarService.addItemToInfoPanel(this.infobartemp);
                    this.stesInfobarService.sendLastUpdate(this.fseGesuchData);
                }
                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    /**
     * Submit form.
     *
     * @memberof FseGesuchComponent
     */
    onSubmit() {
        this.fehlermeldungenService.closeMessage();
        this.submitted = true;

        if (this.fseGesuchForm.invalid) {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.onSave();
    }

    /**
     * Trigger onSave when form is valid.
     *
     * @memberof FseGesuchComponent
     */
    onSave() {
        this.spinnerService.activate(this.channel);

        this.ammDataService.updateGesuchFse(this.stesId, this.mapToDTO()).subscribe(
            response => {
                this.buttonsFse.next(null);
                this.getButtons();

                if (response.data) {
                    this.isKpersonCleared = false;
                    this.fseGesuchData = response.data;

                    this.unternehmendId = this.fseGesuchData.ammGeschaeftsfallObject.unternehmenObject
                        ? this.fseGesuchData.ammGeschaeftsfallObject.unternehmenObject.unternehmenId
                        : null;

                    this.fseGesuchForm.reset(this.mapToForm(this.fseGesuchData));
                    this.prepareMask();
                    this.stesInfobarService.sendLastUpdate(this.fseGesuchData);
                    this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                } else {
                    this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
                this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
            }
        );
    }

    mapToForm(ammGesuchFseData: AmmGesuchFseDTO) {
        const ammKontaktpersonObject = ammGesuchFseData.ammKontaktpersonObject;

        return {
            eingangsdatum: this.facade.formUtilsService.parseDate(ammGesuchFseData.eingangsdatum),
            projekt: ammGesuchFseData.projekt,
            branche: ammGesuchFseData.nogaObject,
            beginnPlanungsphase: this.facade.formUtilsService.parseDate(ammGesuchFseData.massnahmeVon),
            beginnSelbstaendigkeit: this.facade.formUtilsService.parseDate(ammGesuchFseData.massnahmeBis),
            bearbeitung: ammGesuchFseData.bearbeiterDetailObject,
            gesuchsNr: ammGesuchFseData.gesuchsNr,
            status: ammGesuchFseData.statusObject.codeId,
            gesuchstyp: ammGesuchFseData.typIdObject.codeId,
            buergsschaftsgenossenschaft: ammGesuchFseData.ammGeschaeftsfallObject ? ammGesuchFseData.ammGeschaeftsfallObject.unternehmenObject : null,
            kontaktperson: this.setKontaktperson(ammKontaktpersonObject),
            name: ammKontaktpersonObject ? ammKontaktpersonObject.name : null,
            vorname: ammKontaktpersonObject ? ammKontaktpersonObject.vorname : null,
            telefon: ammKontaktpersonObject ? ammKontaktpersonObject.telefon : null,
            mobile: ammKontaktpersonObject ? ammKontaktpersonObject.mobile : null,
            fax: ammKontaktpersonObject ? ammKontaktpersonObject.fax : null,
            email: ammKontaktpersonObject ? ammKontaktpersonObject.email : null
        };
    }

    /**
     * Map form object to backend.
     *
     * @memberof FseGesuchComponent
     */
    mapToDTO(): AmmGesuchFseDTO {
        const fseGesuchDataToSave = { ...this.fseGesuchData };

        fseGesuchDataToSave.eingangsdatum = this.facade.formUtilsService.parseDate(this.fseGesuchForm.controls.eingangsdatum.value);
        fseGesuchDataToSave.projekt = this.fseGesuchForm.controls.projekt.value;
        fseGesuchDataToSave.nogaId = this.fseGesuchForm.controls.branche.value ? this.fseGesuchForm.controls.branche['branchAutosuggestObj'].nogaId : null;
        fseGesuchDataToSave.nogaObject = this.fseGesuchForm.controls.branche.value ? this.fseGesuchForm.controls.branche['branchAutosuggestObj'] : null;
        fseGesuchDataToSave.massnahmeVon = this.facade.formUtilsService.parseDate(this.fseGesuchForm.controls.beginnPlanungsphase.value);
        fseGesuchDataToSave.massnahmeBis = this.facade.formUtilsService.parseDate(this.fseGesuchForm.controls.beginnSelbstaendigkeit.value);
        fseGesuchDataToSave.bearbeiterDetailObject = this.fseGesuchForm.controls.bearbeitung['benutzerObject'];
        fseGesuchDataToSave.statusObject = this.statusOptions.find(option => option.codeId === +this.fseGesuchForm.controls.status.value) as CodeDTO;
        fseGesuchDataToSave.typIdObject = this.gesuchstypOptions.find(option => option.codeId === +this.fseGesuchForm.controls.gesuchstyp.value) as CodeDTO;

        fseGesuchDataToSave.ammGeschaeftsfallObject.unternehmenObject = {
            unternehmenId: this.fseGesuchForm.controls.buergsschaftsgenossenschaft['unternehmenAutosuggestObject'].unternehmenId,
            name1: this.fseGesuchForm.controls.buergsschaftsgenossenschaft['unternehmenAutosuggestObject'].name1
        };

        fseGesuchDataToSave.ammKontaktpersonObject = this.ammHelper.initializeKperson(this.fseGesuchForm, this.fseGesuchData, this.kontaktPersonObject, this.isKpersonCleared);

        return fseGesuchDataToSave;
    }

    /**
     * Create form group with formBuilder.
     *
     * @returns {FormGroup}
     * @memberof FseGesuchComponent
     */
    createFormGroup() {
        return this.formBuilder.group(
            {
                eingangsdatum: [null, [DateValidator.isDateInFutureNgx, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                projekt: null,
                branche: null,
                beginnPlanungsphase: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                beginnSelbstaendigkeit: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                bearbeitung: null,
                gesuchsNr: null,
                status: [null, Validators.required],
                gesuchstyp: [null, Validators.required],
                buergsschaftsgenossenschaft: null,
                kontaktperson: null,
                name: null,
                vorname: null,
                telefon: [null, this.getTelefonValidator()],
                mobile: [null, this.getTelefonValidator()],
                fax: [null, this.getTelefonValidator()],
                email: [null, this.getEmailValidator()]
            },
            {
                validator: DateValidator.rangeBetweenDates('beginnPlanungsphase', 'beginnSelbstaendigkeit', 'val208', false, false)
            }
        );
    }

    onKontaktpersonClear() {
        this.isKontaktpersonSelected = false;
        this.kontaktPersonObject = null;
        this.isKpersonCleared = true;
        this.fseGesuchForm.patchValue({
            kontaktperson: null,
            name: null,
            vorname: null,
            telefon: null,
            mobile: null,
            fax: null,
            email: null
        });
    }

    onKontaktpersonSelected(kontaktperson: KontakteViewDTO) {
        this.kontaktPersonObject = kontaktperson;
        this.isKontaktpersonSelected = true;
        this.fseGesuchForm.markAsDirty();
        this.fseGesuchForm.patchValue({
            name: kontaktperson.name,
            vorname: kontaktperson.vorname,
            telefon: kontaktperson.telefonNr,
            mobile: kontaktperson.mobileNr,
            fax: kontaktperson.telefaxNr,
            email: kontaktperson.email
        });
    }

    /**
     * Triggered when Geschaeftsfall-Loeschen Button is clicked
     * Also redirects to the Geschaeftsfall of the vorgaenger, if there is one.
     * If not the tree table is loaded.
     *
     * @memberof FseGesuchComponent
     */
    onGeschaeftsfallLoeschen() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);

        this.ammDataService.geschaeftsfallLoeschen(this.stesId, this.geschaeftsfallId).subscribe(
            response => {
                if (response.data) {
                    this.fseGesuchForm.markAsPristine();
                    this.notificationService.success(this.dbTranslateService.instant('common.message.datengeloescht'));

                    const vorgaengerGeschaeftsfallId = this.fseGesuchData.ammGeschaeftsfallObject ? this.fseGesuchData.ammGeschaeftsfallObject.vorgaengerId : null;

                    if (vorgaengerGeschaeftsfallId) {
                        const vorgaengerEntscheidIdId = this.fseGesuchData.ammGeschaeftsfallObject
                            ? this.fseGesuchData.ammGeschaeftsfallObject.vorgaengerObject.allAmmEntscheid[0].ammEntscheidId
                            : null;

                        this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.FSE_GESUCH}`], {
                            queryParams: {
                                gfId: vorgaengerGeschaeftsfallId,
                                entscheidId: vorgaengerEntscheidIdId
                            }
                        });
                    } else {
                        this.navigationService.hideNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammEntscheidTypeCode));
                        this.cancel();
                    }
                } else {
                    this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgeloescht'));
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
                this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgeloescht'));
            }
        );
    }

    /**
     * Triggered when Zuruecknehmen Button is clicked
     *
     * @memberof FseGesuchComponent
     */
    onGesuchFseZuruecknehmen() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);

        this.ammDataService.zuruecknehmenGesuchFse(this.stesId, this.geschaeftsfallId).subscribe(
            response => {
                this.buttonsFse.next(null);
                this.getButtons();

                if (response.data) {
                    this.fseGesuchData = response.data;

                    this.unternehmendId = this.fseGesuchData.ammGeschaeftsfallObject.unternehmenObject
                        ? this.fseGesuchData.ammGeschaeftsfallObject.unternehmenObject.unternehmenId
                        : null;

                    this.fseGesuchForm.setValue(this.mapToForm(this.fseGesuchData));
                    this.prepareMask();
                    this.stesInfobarService.sendLastUpdate(this.fseGesuchData);
                    this.notificationService.success(this.dbTranslateService.instant('common.message.datengespeichert'));
                } else {
                    this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
                this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
            }
        );
    }

    /**
     * Triggered when Geschäftsfall ersetzen Button is clicked
     *
     * @memberof FseGesuchComponent
     */
    onGeschaeftsfallErsetzen() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);

        this.ammDataService.geschaeftsfallErsetzen(this.stesId, this.geschaeftsfallId).subscribe(
            response => {
                if (response.data) {
                    const newGeschaeftsfallId = response.data;
                    let newAmmEntscheidId: number;

                    this.ammDataService.getGesuchFse(this.stesId, newGeschaeftsfallId).subscribe(
                        gesuchResponse => {
                            if (gesuchResponse.data) {
                                newAmmEntscheidId = this.ammHelper.getEntscheidId(gesuchResponse.data.ammGeschaeftsfallObject);
                            }

                            this.notificationService.success(this.dbTranslateService.instant('amm.nutzung.feedback.geschaeftsfallersetzt'));

                            this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.FSE_GESUCH}`], {
                                queryParams: {
                                    gfId: newGeschaeftsfallId,
                                    entscheidId: newAmmEntscheidId
                                }
                            });
                        },
                        () => {
                            this.deactivateSpinnerAndScrollTop();
                        }
                    );
                } else {
                    this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
                this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
            }
        );
    }

    onReset() {
        if (this.fseGesuchForm.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                this.fseGesuchForm.reset(this.mapToForm(this.fseGesuchData));
                this.prepareMask();
                this.isKontaktpersonSelected = this.isKontaktPersonSelected();
            });

            this.isKpersonCleared = false;
        }
    }

    onGesuchstypChange(gesuchStatusCodeId: number) {
        const gesuchStatus = this.gesuchstypOptions.find(gesuchtyp => gesuchtyp.codeId === +gesuchStatusCodeId) as CodeDTO;

        this.setIsGesuchstypGewaehrungVonTaggeldern(gesuchStatus.code);
        this.setIsGesuchstypUebernahmeDesVerlustrisikos(gesuchStatus.code);
        this.setIsGesuchstypGewaehrungVonTaggeldernUndVerlusrisiko(gesuchStatus.code);

        if (this.selectedStatusOptionCodeId) {
            this.setRequiredFields(this.selectedStatusOptionCodeId);
        }
    }

    onChangeBuergsschaftsgenossenschaft(event: any) {
        if (event) {
            if (event.unternehmenId) {
                this.unternehmendId = event.unternehmenId;
            } else {
                this.unternehmendId = null;
            }
        } else {
            this.unternehmendId = null;
        }

        this.onKontaktpersonClear();
    }

    setRequiredFields(selectedOptionCodeId: string) {
        this.selectedStatusOptionCodeId = selectedOptionCodeId;
        const selectedOptionCode = this.facade.formUtilsService.getCodeByCodeId(this.statusOptions, selectedOptionCodeId);

        if (selectedOptionCode === AmmGeschaeftsstatusCode.GEPRUEFT) {
            this.fseGesuchForm.controls.eingangsdatum.setValidators([
                Validators.required,
                DateValidator.isDateInFutureNgx,
                DateValidator.dateFormatNgx,
                DateValidator.dateValidNgx
            ]);
            this.fseGesuchForm.controls.branche.setValidators(Validators.required);
            this.fseGesuchForm.controls.beginnSelbstaendigkeit.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);

            if (this.isGesuchstypGewaehrungVonTaggeldern || this.isGesuchstypGewaehrungVonTaggeldernUndVerlusrisiko) {
                this.fseGesuchForm.controls.beginnPlanungsphase.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            } else {
                this.fseGesuchForm.controls.beginnPlanungsphase.clearValidators();
            }

            if (this.isGesuchstypUebernahmeDesVerlustrisikos || this.isGesuchstypGewaehrungVonTaggeldernUndVerlusrisiko) {
                this.fseGesuchForm.controls.buergsschaftsgenossenschaft.setValidators(Validators.required);
            } else {
                this.fseGesuchForm.controls.buergsschaftsgenossenschaft.clearValidators();
            }

            this.updateValueAndValidityOnRequiredFields();
        } else {
            this.setDefaultValidators();
            this.updateValueAndValidityOnRequiredFields();
        }
    }

    getTelefonValidator(): ValidatorFn {
        return PhoneValidator.isValidFormatWarning;
    }

    getEmailValidator(): ValidatorFn {
        return EmailValidator.isValidFormat;
    }

    /**
     * Set side navigation for this component
     *
     * @memberof FseGesuchComponent
     */
    setSideNavigation() {
        this.navigationService.showNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammEntscheidTypeCode), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.fseAmmEntscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.FSE_GESUCH, {
            gfId: this.geschaeftsfallId,
            entscheidId: this.fseAmmEntscheidId
        });
        //BSP23
        if (!this.isGesuchstypUebernahmeDesVerlustrisikos) {
            this.navigationService.showNavigationTreeRoute(AMMPaths.FSE_KOSTEN, {
                gfId: this.geschaeftsfallId,
                entscheidId: this.fseAmmEntscheidId
            });
        } else {
            this.navigationService.hideNavigationTreeRoute(AMMPaths.FSE_KOSTEN);
        }
        this.navigationService.showNavigationTreeRoute(AMMPaths.SPEZIELL_ENTSCHEID.replace(':type', this.ammEntscheidTypeCode), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.fseAmmEntscheidId
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        if (this.reloadSubscription) {
            this.reloadSubscription.unsubscribe();
        }

        if (!this.shouldKeepMessages) {
            this.fehlermeldungenService.closeMessage();
        }

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        this.toolboxService.sendConfiguration([]);
        this.stesInfobarService.removeItemFromInfoPanel(this.infobartemp);
        this.stesInfobarService.sendLastUpdate({}, true);
    }

    openModalLoeschen() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.onGeschaeftsfallLoeschen();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    canDeactivate(): boolean {
        return this.fseGesuchForm.dirty;
    }

    setIsKpersonCleared() {
        this.isKpersonCleared = true;
    }

    private deactivateSpinnerAndScrollTop() {
        this.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    private prepareMask() {
        this.setIsGesuchstypGewaehrungVonTaggeldern(this.fseGesuchData.typIdObject.code);
        this.setIsGesuchstypUebernahmeDesVerlustrisikos(this.fseGesuchData.typIdObject.code);
        this.setIsGesuchstypGewaehrungVonTaggeldernUndVerlusrisiko(this.fseGesuchData.typIdObject.code);
        this.checkReadOnlyFields();
        this.isKontaktpersonSelected = this.isKontaktPersonSelected();

        this.setSideNavigation();
    }

    private isKontaktPersonSelected(): boolean {
        return this.fseGesuchData.ammKontaktpersonObject && !!this.fseGesuchData.ammKontaktpersonObject.kontaktId;
    }

    private setKontaktperson(kontaktperson) {
        let kontaktpersonInputValue = '';

        if (kontaktperson) {
            if (kontaktperson.name) {
                kontaktpersonInputValue += kontaktperson.name;

                if (kontaktperson.vorname) {
                    kontaktpersonInputValue += `, ${kontaktperson.vorname}`;
                }
            } else if (kontaktperson.vorname) {
                kontaktpersonInputValue += kontaktperson.vorname;
            }
        }

        return kontaktpersonInputValue;
    }

    private getButtons() {
        this.ammDataService.getButtonsAmmGesuch(this.stesId, this.fseGesuchData.ammGeschaeftsfallId).subscribe(btnResponse => {
            this.buttonsFse.next(btnResponse.data);
        });
    }

    //BSP21
    private setIsGesuchstypGewaehrungVonTaggeldern(gesuchStatusCode: string) {
        this.isGesuchstypGewaehrungVonTaggeldern = gesuchStatusCode === AmmGesuchstypFseCodeEnum.GEWAEHRUNGVONTAGGELDERN;

        if (this.isGesuchstypGewaehrungVonTaggeldern) {
            this.onKontaktpersonClear();

            this.fseGesuchForm.controls.buergsschaftsgenossenschaft.reset();
        }
    }

    //BSP22
    private setIsGesuchstypUebernahmeDesVerlustrisikos(gesuchStatusCode: string) {
        this.isGesuchstypUebernahmeDesVerlustrisikos = gesuchStatusCode === AmmGesuchstypFseCodeEnum.UEBERNAHMEDESVERLUSTRISIKOS;

        if (this.isGesuchstypUebernahmeDesVerlustrisikos) {
            this.fseGesuchForm.controls.beginnPlanungsphase.reset();
        }
    }

    private setIsGesuchstypGewaehrungVonTaggeldernUndVerlusrisiko(gesuchStatusCode: string) {
        this.isGesuchstypGewaehrungVonTaggeldernUndVerlusrisiko = gesuchStatusCode === AmmGesuchstypFseCodeEnum.GEWAEHRUNGVONTGGUNDUEBERNAHMEVERLUSTRISIKO;
    }

    private checkReadOnlyFields() {
        this.setIsGesuchStatusGeprueft();
        this.getOldestEntscheidStatusCode();
        this.setIsEntscheidFreigabebereitFreigegebenOderErsetzt();
        this.setIsGesuchstypGewaehrungVonTaggeldernUndVerlusrisikoBE();
        this.setHasGeschaeftsfallVorgaenger();
    }

    private setIsGesuchStatusGeprueft() {
        this.isGesuchStatusGeprueft = this.fseGesuchData.statusObject.code === AmmGeschaeftsstatusCode.GEPRUEFT;
    }

    /**
     * The function gets the status of the very first Entscheid (The one that has no Vorgaenger)
     */
    private getOldestEntscheidStatusCode() {
        let statusCode = null;
        const allAmmEntscheidArray = this.fseGesuchData.ammGeschaeftsfallObject.allAmmEntscheid;
        const allAmmEntscheidArrayLastIndex = allAmmEntscheidArray.length - 1;

        if (
            this.fseGesuchData.ammGeschaeftsfallObject &&
            allAmmEntscheidArray &&
            allAmmEntscheidArray[allAmmEntscheidArrayLastIndex] &&
            allAmmEntscheidArray[allAmmEntscheidArrayLastIndex].statusObject
        ) {
            statusCode = allAmmEntscheidArray[allAmmEntscheidArrayLastIndex].statusObject.code;
        }

        this.entscheidStatusCode = statusCode;
    }

    private setIsEntscheidFreigabebereitFreigegebenOderErsetzt() {
        this.isEntscheidFreigabebereitFreigegebenOderErsetzt =
            this.entscheidStatusCode === AmmVierAugenStatusCode.ERSETZT ||
            this.entscheidStatusCode === AmmVierAugenStatusCode.FREIGEGEBEN ||
            this.entscheidStatusCode === AmmVierAugenStatusCode.FREIGABEBEREIT;
    }

    private setIsGesuchstypGewaehrungVonTaggeldernUndVerlusrisikoBE() {
        const gesuchStatus = this.gesuchstypOptions.find(gesuchtyp => gesuchtyp.codeId === this.fseGesuchData.typIdObject.codeId) as CodeDTO;

        this.isGesuchstypGewaehrungVonTaggeldernUndVerlusrisikoBE = gesuchStatus.code === AmmGesuchstypFseCodeEnum.GEWAEHRUNGVONTGGUNDUEBERNAHMEVERLUSTRISIKO;
    }

    private setHasGeschaeftsfallVorgaenger() {
        this.hasGeschaeftsfallVorgaenger = this.fseGesuchData.ammGeschaeftsfallObject.vorgaengerId !== 0;
    }

    private updateValueAndValidityOnRequiredFields() {
        this.fseGesuchForm.controls.eingangsdatum.updateValueAndValidity();
        this.fseGesuchForm.controls.branche.updateValueAndValidity();
        this.fseGesuchForm.controls.beginnPlanungsphase.updateValueAndValidity();
        this.fseGesuchForm.controls.beginnSelbstaendigkeit.updateValueAndValidity();
        this.fseGesuchForm.controls.buergsschaftsgenossenschaft.updateValueAndValidity();
    }

    private setDefaultValidators() {
        this.fseGesuchForm.controls.branche.clearValidators();
        this.fseGesuchForm.controls.buergsschaftsgenossenschaft.clearValidators();

        this.fseGesuchForm.controls.eingangsdatum.setValidators([DateValidator.isDateInFutureNgx, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        this.fseGesuchForm.controls.beginnPlanungsphase.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        this.fseGesuchForm.controls.beginnSelbstaendigkeit.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
    }

    private openDmsCopyModal(geschaeftsfallId: number, gesuchNr: number) {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;

        comp.context = DmsMetadatenContext.DMS_CONTEXT_STES_AMM;
        comp.id = geschaeftsfallId.toString();
        comp.nr = gesuchNr.toString();
    }

    private openHistoryModal(objId: number, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });

        const comp = modalRef.componentInstance as HistorisierungComponent;

        comp.id = objId.toString();
        comp.type = objType;
    }

    private initializeBearbeitungTokens(fseGesuchData: AmmGesuchFseDTO) {
        const currentUser = this.authService.getLoggedUser();
        const benutzerstelleId = fseGesuchData.ownerId ? fseGesuchData.ownerId : currentUser.benutzerstelleId;

        if (currentUser) {
            this.bearbeitungSuchenTokens = {
                berechtigung: Permissions.AMM_NUTZUNG_GESUCH_BEARBEITEN,
                myBenutzerstelleId: benutzerstelleId,
                stati: DomainEnum.BENUTZER_STATUS_AKTIV,
                benutzerstelleId
            };
        }
    }
}
