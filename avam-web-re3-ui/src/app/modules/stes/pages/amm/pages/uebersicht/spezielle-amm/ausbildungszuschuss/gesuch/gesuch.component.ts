import { Permissions } from '@shared/enums/permissions.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { FormUtilsService } from '@shared/services/forms/form-utils.service';
import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { NavigationService } from '@app/shared/services/navigation-service';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { FormBuilder, FormGroup, ValidatorFn, FormGroupDirective, Validators } from '@angular/forms';
import { SpinnerService, NotificationService, Unsubscribable } from 'oblique-reactive';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { Subscription, forkJoin, iif, Subject } from 'rxjs';
import PrintHelper from '@app/shared/helpers/print.helper';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { ActivatedRoute, Router } from '@angular/router';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { DmsMetadatenKopierenModalComponent, DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';

import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { DateValidator } from '@app/shared/validators/date-validator';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { PhoneValidator } from '@app/shared/validators/phone-validator';
import { EmailValidator } from '@app/shared/validators/email-validator';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { AmmGesuchAzDTO } from '@app/shared/models/dtos-generated/ammGesuchAzDTO';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { AmmGeschaeftsstatusCode } from '@app/shared/enums/domain-code/amm-geschaeftsstatus-code.enum';
import { AmmVierAugenStatusCode } from '@app/shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { AmmEntscheidCode } from '@app/shared/enums/domain-code/amm-entscheid-code.enum';
import { KontakteViewDTO } from '@app/shared/models/dtos-generated/kontakteViewDTO';
import { GesuchstypAZCodeEnum } from '@app/shared/enums/domain-code/gesuchstyp-az-code.enum';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { MessageBus } from '@shared/services/message-bus';
import { AMMLabels } from '@shared/enums/stes-routing-labels.enum';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { ReloadHelper } from '@app/shared/helpers/reload.helper';
import { AmmStesGeschaeftsfallDTO } from '@app/shared/models/dtos-generated/ammStesGeschaeftsfallDTO';
import { AmmEntscheidDTO } from '@app/shared/models/dtos-generated/ammEntscheidDTO';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { GenericConfirmComponent } from '@app/shared';
import { first } from 'rxjs/operators';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { FacadeService } from '@shared/services/facade.service';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';

/**
 * Component created for editing data in the first UI from Ausbildungszuschuss - Gesuch
 *
 * @export
 * @class GesuchComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
    selector: 'avam-gesuch',
    templateUrl: './gesuch.component.html',
    styleUrls: ['./gesuch.component.scss'],
    providers: [ObliqueHelperService]
})
export class GesuchComponent extends AmmCloseableAbstract implements OnInit, OnDestroy, DeactivationGuarded {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('infobartemp') infobartemp: TemplateRef<any>;

    /**
     * Tracks the value and validity state of a group of FormControl instances.
     *
     * @memberof GesuchComponent
     */
    gesuchForm: FormGroup;

    /**
     * Current component channel.
     *
     * @memberof GesuchComponent
     */
    channel = 'gesuch-channel';

    /**
     *  Tracks the state of the form if it is submitted.
     *
     * @memberof GesuchComponent
     */
    submitted = false;

    faehigkeitsAusweisOptions: any[] = [];
    statusOptions: any[] = [];
    observeClickActionSub: Subscription;

    languageSubscription: Subscription;
    gesuchData: AmmGesuchAzDTO;
    permissions: typeof Permissions = Permissions;
    ammEntscheidId: number;
    geschaeftsfallId: number;
    bearbeitungSuchenTokens: {};
    primaryFolgegesuchErstellen = false;
    shouldKeepMessages: boolean;
    kontaktPersonObject: KontakteViewDTO;
    unternehmendId: number;

    /**
     * Depending on whether or not the status of the Gesuch is "geprüft" and the status of the Entscheid
     * is not "freigabebereit", "freigegeben" or "ersetzt" certain fields and/or buttons should be disabled/hidden
     * The third variables checks if the Konktaktperson object is chosen from the modal window or not. If it is chosen
     * from the modal window the fields underneath are read-only if it isn't the fields are editable
     */
    isGesuchStatusGeprueft = false;
    isEntscheidFreigabebereitFreigegebenOderErsetzt = false;
    isKontaktpersonSelected = true;

    hasNachfolgerOfSameType = false;
    isKpersonCleared = false;
    buttons: Subject<any[]> = new Subject();
    ammButtonsTypeEnum = AmmButtonsTypeEnum;
    vorgaengerEntscheidId: number;
    nachfolgerEntscheidId: number;
    reloadSubscription: Subscription;

    basisNr: number;

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;

    /**
     * Creates an instance of GesuchComponent.
     * @param {FormBuilder} formBuilder
     * @param {SpinnerService} spinnerService
     * @param {NavigationService} navigationService
     * @memberof GesuchComponent
     */
    constructor(
        private navigationService: NavigationService,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private fehlermeldungenService: FehlermeldungenService,
        private modalService: NgbModal,
        private authService: AuthenticationService,
        private dataRestService: StesDataRestService,
        private notificationService: NotificationService,
        private translateService: TranslateService,
        private dbTranslateService: DbTranslateService,
        private resetDialogService: ResetDialogService,
        protected router: Router,
        private obliqueHelper: ObliqueHelperService,
        protected facade: FacadeService,
        private ammDataService: AmmRestService,
        private stesInfobarService: AvamStesInfoBarService,
        private messageBus: MessageBus,
        private ammHelper: AmmHelper,
        protected interactionService: StesComponentInteractionService
    ) {
        super(facade, router, interactionService);
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
        this.ammEntscheidTypeCode = AmmMassnahmenCode.AZ;
    }

    /**
     * Init GesuchComponent
     *
     * @memberof GesuchComponent
     */
    ngOnInit() {
        this.reloadSubscription = ReloadHelper.enable(this.router, this.unsubscribe, () => {
            this.setSideNavigation();
            this.getData();
        });

        this.obliqueHelper.ngForm = this.ngForm;

        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesAmm.azGesuchHeader' });
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.route.queryParamMap.subscribe(params => {
            this.geschaeftsfallId = params.get('gfId') ? +params.get('gfId') : null;
            this.ammEntscheidId = params.get('entscheidId') ? +params.get('entscheidId') : null;
        });

        this.gesuchForm = this.createFormGroup();
        this.getData();

        this.languageSubscription = this.dbTranslateService.getEventEmitter().subscribe(() => {
            this.patchValue();
        });
        super.ngOnInit();
    }

    isOurLabel(message) {
        return message.data.label === this.dbTranslateService.instant(AMMLabels.AZ);
    }

    isOurUrl(): boolean {
        return (
            this.router.url.includes(AMMPaths.AZ_GESUCH) ||
            this.router.url.includes(AMMPaths.AZ_KOSTEN) ||
            this.router.url.includes(AMMPaths.SPEZIELL_ENTSCHEID.replace(':type', this.ammEntscheidTypeCode))
        );
    }

    patchValue() {
        if (this.gesuchData && this.gesuchData.typIdObject) {
            this.gesuchForm.patchValue({ gesuchstyp: this.dbTranslateService.translate(this.gesuchData.typIdObject, 'text') });
        }
    }

    /**
     * HTTP GET call.
     *
     * The property "prüfbereit" is filtered out of the Status Dropdown because it shouldn't be shown.
     * @memberof GesuchComponent
     */
    getData() {
        this.spinnerService.activate(this.channel);
        const get = this.ammDataService.getGesuchAz(this.stesId, this.geschaeftsfallId);
        const create = this.ammDataService.createGesuchAz(this.stesId);

        forkJoin<CodeDTO[], CodeDTO[], any>([
            //NOSONAR
            this.dataRestService.getCode(DomainEnum.FAEHIGKEITSAUSWEIS),
            this.dataRestService.getCode(DomainEnum.AMMGESCHAEFTSSTATUS),
            iif(() => (this.geschaeftsfallId ? true : false), get, create)
        ]).subscribe(
            ([faehigkeitsOptions, statusOptions, gesuchResponse]) => {
                this.faehigkeitsAusweisOptions = this.facade.formUtilsService.mapDropdownKurztext(faehigkeitsOptions);
                this.statusOptions = this.facade.formUtilsService.mapDropdownKurztext(statusOptions).filter(s => s.code !== AmmGeschaeftsstatusCode.PRUEFBEREIT);
                this.buttons.next(null);
                if (gesuchResponse.data) {
                    this.loadGesuch(gesuchResponse);
                }
                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    private loadGesuch(gesuchResponse) {
        this.isKpersonCleared = false;
        this.gesuchData = gesuchResponse.data;
        this.initializeBearbeitungTokens(this.gesuchData);
        this.ammEntscheidId = this.getEntscheid(this.gesuchData.ammGeschaeftsfallObject).ammEntscheidId;

        this.unternehmendId = this.gesuchData.ammGeschaeftsfallObject.unternehmenObject ? this.gesuchData.ammGeschaeftsfallObject.unternehmenObject.unternehmenId : null;

        this.basisNr = this.gesuchData.ammGeschaeftsfallObject.basisNr;

        this.ammDataService.getButtonsAmmGesuch(this.stesId, this.gesuchData.ammGeschaeftsfallId).subscribe(btnResponse => {
            this.buttons.next(btnResponse.data);
        });

        const vorgaengerEntscheid = this.getEntscheid(this.gesuchData.ammGeschaeftsfallObject.vorgaengerObject);

        if (vorgaengerEntscheid) {
            this.vorgaengerEntscheidId = vorgaengerEntscheid.ammEntscheidId;
        }

        const nachfolgerEntscheid = this.getEntscheid(this.gesuchData.ammGeschaeftsfallObject.nachfolgerObject);

        if (nachfolgerEntscheid) {
            this.nachfolgerEntscheidId = nachfolgerEntscheid.ammEntscheidId;
            this.hasNachfolgerOfSameType = this.checkHasNachfolgerOfSameType(this.gesuchData);
        }

        if (!this.geschaeftsfallId) {
            this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
            this.shouldKeepMessages = true;

            this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.AZ_GESUCH}`], {
                queryParams: {
                    gfId: this.gesuchData.ammGeschaeftsfallId,
                    entscheidId: this.ammEntscheidId
                }
            });
        } else {
            this.shouldKeepMessages = false;
        }

        this.gesuchForm.setValue(this.mapToForm(this.gesuchData));
        this.geschaeftsfallId = this.gesuchData.ammGeschaeftsfallId;
        this.checkDisabledFields(this.gesuchData);

        this.checkFolgegesuchErstellen();
        this.stesInfobarService.addItemToInfoPanel(this.infobartemp);
        this.stesInfobarService.sendLastUpdate(this.gesuchData);

        this.configureToolbox();

        this.setSideNavigation();
    }

    /**
     * Submit form.
     *
     * @memberof GesuchComponent
     */
    onSubmit() {
        this.fehlermeldungenService.closeMessage();
        this.submitted = true;

        if (this.gesuchForm.invalid) {
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
     * @memberof GesuchComponent
     */
    onSave() {
        this.spinnerService.activate(this.channel);
        this.fehlermeldungenService.closeMessage();

        this.ammDataService.updateGesuchAz(this.stesId, this.translateService.currentLang, this.mapToDTO()).subscribe(
            response => {
                this.buttons.next(null);

                this.ammDataService.getButtonsAmmGesuch(this.stesId, this.gesuchData.ammGeschaeftsfallId).subscribe(btnResponse => {
                    this.buttons.next(btnResponse.data);
                });

                if (response.data) {
                    this.isKpersonCleared = false;
                    this.gesuchData = response.data;

                    this.unternehmendId = this.gesuchData.ammGeschaeftsfallObject.unternehmenObject
                        ? this.gesuchData.ammGeschaeftsfallObject.unternehmenObject.unternehmenId
                        : null;

                    this.gesuchForm.reset(this.mapToForm(this.gesuchData));
                    this.stesInfobarService.sendLastUpdate(this.gesuchData);
                    this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                    this.checkDisabledFields(this.gesuchData);
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
     * The function gets the status of the very first Entscheid (The one that has no Vorgaenger)
     */
    getOldestEntscheidStatusCode(data: AmmGesuchAzDTO) {
        let statusCode = null;
        const allAmmEntscheidArray = data.ammGeschaeftsfallObject.allAmmEntscheid;
        const allAmmEntscheidArrayLastIndex = allAmmEntscheidArray.length - 1;

        if (
            data.ammGeschaeftsfallObject &&
            allAmmEntscheidArray &&
            allAmmEntscheidArray[allAmmEntscheidArrayLastIndex] &&
            allAmmEntscheidArray[allAmmEntscheidArrayLastIndex].statusObject
        ) {
            statusCode = allAmmEntscheidArray[allAmmEntscheidArrayLastIndex].statusObject.code;
        }

        return statusCode;
    }

    mapToForm(data: AmmGesuchAzDTO) {
        const ammKontaktpersonObject = data.ammKontaktpersonObject;

        return {
            eingangsdatum: this.facade.formUtilsService.parseDate(data.eingangsdatum),
            ausbildungsvertragVom: this.facade.formUtilsService.parseDate(data.ausbildungsvertragVom),
            ausbildungsAls: data.ausbildungAlsObject ? data.ausbildungAlsObject : null,
            faehigkeitsausweis: data.faehigkeitsausweisAlsId ? data.faehigkeitsausweisAlsId : null,
            ausbildungVon: this.facade.formUtilsService.parseDate(data.ausbildungVon),
            ausbildungBis: this.facade.formUtilsService.parseDate(data.ausbildungBis),
            gesuchszeitraumVon: this.facade.formUtilsService.parseDate(data.massnahmeVon),
            gesuchszeitraumBis: this.facade.formUtilsService.parseDate(data.massnahmeBis),
            bearbeitung: data.bearbeiterDetailObject,
            gesuchsNr: data.gesuchsNr,
            status: data.statusObject.codeId,
            gesuchstyp: this.dbTranslateService.translate(data.typIdObject, 'text'),
            arbeitgeber: data.ammGeschaeftsfallObject ? data.ammGeschaeftsfallObject.unternehmenObject : null,
            kontaktperson: this.setKontaktperson(ammKontaktpersonObject),
            name: ammKontaktpersonObject ? ammKontaktpersonObject.name : null,
            vorname: ammKontaktpersonObject ? ammKontaktpersonObject.vorname : null,
            telefon: ammKontaktpersonObject ? ammKontaktpersonObject.telefon : null,
            mobile: ammKontaktpersonObject ? ammKontaktpersonObject.mobile : null,
            fax: ammKontaktpersonObject ? ammKontaktpersonObject.fax : null,
            email: ammKontaktpersonObject ? ammKontaktpersonObject.email : null
        };
    }

    onKontaktpersonClear() {
        this.isKontaktpersonSelected = false;
        this.kontaktPersonObject = null;
        this.isKpersonCleared = true;
        this.gesuchForm.patchValue({
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
        this.gesuchForm.markAsDirty();
        this.gesuchForm.patchValue({
            name: kontaktperson.name,
            vorname: kontaktperson.vorname,
            telefon: kontaktperson.telefonNr,
            mobile: kontaktperson.mobileNr,
            fax: kontaktperson.telefaxNr,
            email: kontaktperson.email
        });
    }

    /**
     * Map form object to backend.
     *
     * @memberof GesuchComponent
     */
    mapToDTO(): AmmGesuchAzDTO {
        const ammGesuchDataSave = { ...this.gesuchData };
        const ausbildungAlsControl = this.gesuchForm.controls.ausbildungsAls;

        ammGesuchDataSave.eingangsdatum = this.facade.formUtilsService.parseDate(this.gesuchForm.controls.eingangsdatum.value);
        ammGesuchDataSave.ausbildungsvertragVom = this.facade.formUtilsService.parseDate(this.gesuchForm.controls.ausbildungsvertragVom.value);
        ammGesuchDataSave.ausbildungAlsId = ausbildungAlsControl['berufAutosuggestObject'].berufId;
        ammGesuchDataSave.ausbildungAlsObject = ausbildungAlsControl['berufAutosuggestObject'];
        ammGesuchDataSave.faehigkeitsausweisAlsId = +this.gesuchForm.controls.faehigkeitsausweis.value;
        ammGesuchDataSave.faehigkeitsausweisAlsObject = this.faehigkeitsAusweisOptions.find(
            option => option.codeId === +this.gesuchForm.controls.faehigkeitsausweis.value
        ) as CodeDTO;
        ammGesuchDataSave.ausbildungVon = this.facade.formUtilsService.parseDate(this.gesuchForm.controls.ausbildungVon.value);
        ammGesuchDataSave.ausbildungBis = this.facade.formUtilsService.parseDate(this.gesuchForm.controls.ausbildungBis.value);
        ammGesuchDataSave.massnahmeVon = this.facade.formUtilsService.parseDate(this.gesuchForm.controls.gesuchszeitraumVon.value);
        ammGesuchDataSave.massnahmeBis = this.facade.formUtilsService.parseDate(this.gesuchForm.controls.gesuchszeitraumBis.value);
        ammGesuchDataSave.bearbeiterDetailObject = this.gesuchForm.controls.bearbeitung['benutzerObject'];
        ammGesuchDataSave.statusId = +this.gesuchForm.controls.status.value;
        ammGesuchDataSave.statusObject = this.statusOptions.find(option => option.codeId === +this.gesuchForm.controls.status.value) as CodeDTO;

        ammGesuchDataSave.ammGeschaeftsfallObject.unternehmenObject = {
            unternehmenId: this.gesuchForm.controls.arbeitgeber['unternehmenAutosuggestObject'].unternehmenId,
            name1: this.gesuchForm.controls.arbeitgeber['unternehmenAutosuggestObject'].name1
        };

        ammGesuchDataSave.ammKontaktpersonObject = this.ammHelper.initializeKperson(this.gesuchForm, this.gesuchData, this.kontaktPersonObject, this.isKpersonCleared);

        return ammGesuchDataSave;
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
                DokumentVorlageActionDTO.TargetEntityEnum.AZGESUCH,
                [VorlagenKategorie.AMM_GESUCH_AZ],
                +this.stesId,
                this.geschaeftsfallId,
                null,
                this.ammEntscheidId
            )
        );

        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.openDmsCopyModal(this.geschaeftsfallId, +this.gesuchData.gesuchsNr);
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(+this.gesuchData.ammGesuchId, AvamCommonValueObjectsEnum.T_AMM_GESUCH_AZ);
            }
        });
    }

    openDmsCopyModal(geschaeftsfallId: number, gesuchNr: number) {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;

        comp.context = DmsMetadatenContext.DMS_CONTEXT_STES_AMM;
        comp.id = geschaeftsfallId.toString();
        comp.nr = gesuchNr.toString();
    }

    openHistoryModal(objId: number, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId.toString();
        comp.type = objType;
    }

    getTelefonValidator(): ValidatorFn {
        return PhoneValidator.isValidFormatWarning;
    }

    getEmailValidator(): ValidatorFn {
        return EmailValidator.isValidFormat;
    }

    /**
     * Create form group with formBuilder.
     *
     * @returns {FormGroup}
     * @memberof GesuchComponent
     */
    createFormGroup() {
        return this.formBuilder.group(
            {
                eingangsdatum: [null, [DateValidator.dateFormatNgx, DateValidator.isDateInFutureNgx, DateValidator.dateValidNgx]],
                ausbildungsvertragVom: [null, [DateValidator.dateFormatNgx, DateValidator.isDateInFutureNgx, DateValidator.dateValidNgx]],
                ausbildungsAls: null,
                faehigkeitsausweis: null,
                ausbildungVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                ausbildungBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gesuchszeitraumVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gesuchszeitraumBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                bearbeitung: null,
                gesuchsNr: null,
                status: [null, Validators.required],
                gesuchstyp: null,
                arbeitgeber: null,
                kontaktperson: null,
                name: null,
                vorname: null,
                telefon: [null, this.getTelefonValidator()],
                fax: [null, this.getTelefonValidator()],
                mobile: [null, this.getTelefonValidator()],
                email: [null, this.getEmailValidator()]
            },
            {
                validator: [
                    DateValidator.rangeBetweenDates('ausbildungVon', 'ausbildungBis', 'val202', false),
                    DateValidator.rangeBetweenDates('gesuchszeitraumVon', 'gesuchszeitraumBis', 'val202', false),
                    DateValidator.dateRange12M('gesuchszeitraumVon', 'gesuchszeitraumBis', 'val203'),
                    DateValidator.dateRangeWarning48M('ausbildungVon', 'ausbildungBis'),
                    DateValidator.checkDateWithinRange('gesuchszeitraumVon', 'ausbildungVon', 'ausbildungBis', 'val282'),
                    DateValidator.checkDateWithinRange('gesuchszeitraumBis', 'ausbildungVon', 'ausbildungBis', 'val282')
                ]
            }
        );
    }

    /**
     * Triggered when Zuruecknehmen Button is clicked
     *
     * @memberof GesuchComponent
     */
    onGesuchZuruecknehmen() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);
        this.isGesuchStatusGeprueft = false;

        this.ammDataService.zuruecknehmenGesuchAz(this.stesId, this.geschaeftsfallId).subscribe(
            response => {
                this.buttons.next(null);

                this.ammDataService.getButtonsAmmGesuch(this.stesId, this.gesuchData.ammGeschaeftsfallId).subscribe(btnResponse => {
                    this.buttons.next(btnResponse.data);
                });

                if (response.data) {
                    this.gesuchData = response.data;

                    this.unternehmendId = this.gesuchData.ammGeschaeftsfallObject.unternehmenObject
                        ? this.gesuchData.ammGeschaeftsfallObject.unternehmenObject.unternehmenId
                        : null;

                    this.gesuchForm.setValue(this.mapToForm(this.gesuchData));
                    this.checkDisabledFields(this.gesuchData);
                    this.notificationService.success(this.dbTranslateService.instant('common.message.datengespeichert'));
                    this.stesInfobarService.sendLastUpdate(this.gesuchData);
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    /**
     * Triggered when Geschaeftsfall-Loeschen Button is clicked
     * Also redirects to the Geschaeftsfall of the vorgaenger, if there is one.
     * If not the tree table is loaded.
     *
     * @memberof GesuchComponent
     */
    onGeschaeftsfallLoeschen() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);

        this.ammDataService.geschaeftsfallLoeschen(this.stesId, this.geschaeftsfallId).subscribe(
            response => {
                if (response.data) {
                    this.gesuchForm.markAsPristine();
                    this.notificationService.success(this.dbTranslateService.instant('common.message.datengeloescht'));

                    const vorgaengerGeschaeftsfallId = this.gesuchData.ammGeschaeftsfallObject ? this.gesuchData.ammGeschaeftsfallObject.vorgaengerId : null;

                    if (vorgaengerGeschaeftsfallId) {
                        const vorgaengerEntscheidIdId = this.gesuchData.ammGeschaeftsfallObject
                            ? this.gesuchData.ammGeschaeftsfallObject.vorgaengerObject.allAmmEntscheid[0].ammEntscheidId
                            : null;

                        this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.AZ_GESUCH}`], {
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
            }
        );
    }

    /**
     * Triggered when Geschäftsfall ersetzen Button is clicked
     *
     * @memberof GesuchComponent
     */
    onGeschaeftsfallErsetzen() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);

        this.ammDataService.geschaeftsfallErsetzen(this.stesId, this.geschaeftsfallId).subscribe(
            response => {
                if (response.data) {
                    const newGeschaeftsfallId = response.data;
                    let newAmmEntscheidId: number;

                    this.ammDataService.getGesuchAz(this.stesId, newGeschaeftsfallId).subscribe(
                        gesuchResponse => {
                            if (gesuchResponse.data) {
                                newAmmEntscheidId = this.getEntscheid(gesuchResponse.data.ammGeschaeftsfallObject).ammEntscheidId;
                            }

                            this.notificationService.success(this.dbTranslateService.instant('amm.nutzung.feedback.geschaeftsfallersetzt'));

                            this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.AZ_GESUCH}`], {
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
            }
        );
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

    /**
     * Triggered when Folgegesuch Erfassen Button is clicked
     *
     * @memberof GesuchComponent
     */
    onFolgegesuchErstellen() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);

        this.ammDataService.folgegesuchErstellenAz(this.stesId, this.geschaeftsfallId).subscribe(
            response => {
                if (response.data) {
                    const folgegesuchGeschaeftsfallId = response.data.ammGeschaeftsfallId;
                    const folgegesuchEntscheidId = this.getEntscheid(response.data.ammGeschaeftsfallObject).ammEntscheidId;

                    this.shouldKeepMessages = true;
                    this.notificationService.success(this.dbTranslateService.instant('common.message.datengespeichert'));

                    this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.AZ_GESUCH}`], {
                        queryParams: {
                            gfId: folgegesuchGeschaeftsfallId,
                            entscheidId: folgegesuchEntscheidId
                        }
                    });
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    onChangeArbeitgeber(event: any) {
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

    onReset() {
        if (this.gesuchForm.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                this.gesuchForm.reset(this.mapToForm(this.gesuchData));
                this.isKontaktpersonSelected = this.isKontaktPersonSelected();
            });

            this.isKpersonCleared = false;
        }
    }

    setRequiredFields(statusCodeId) {
        const selectedOptionCode = this.facade.formUtilsService.getCodeByCodeId(this.statusOptions, statusCodeId);

        if (selectedOptionCode === AmmGeschaeftsstatusCode.GEPRUEFT) {
            this.clearValidatorsOnRequiredFields();

            this.gesuchForm.controls.eingangsdatum.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.isDateInFutureNgx, DateValidator.dateValidNgx]);
            this.gesuchForm.controls.ausbildungsvertragVom.setValidators([
                Validators.required,
                DateValidator.dateFormatNgx,
                DateValidator.isDateInFutureNgx,
                DateValidator.dateValidNgx
            ]);
            this.gesuchForm.controls.ausbildungsAls.setValidators(Validators.required);
            this.gesuchForm.controls.ausbildungVon.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            this.gesuchForm.controls.ausbildungBis.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            this.gesuchForm.controls.gesuchszeitraumVon.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            this.gesuchForm.controls.gesuchszeitraumBis.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            this.gesuchForm.controls.arbeitgeber.setValidators(Validators.required);
            this.gesuchForm.controls.faehigkeitsausweis.setValidators(Validators.required);

            this.updateValueAndValidityOnRequiredFields();
        } else {
            this.clearValidatorsOnRequiredFields();
            this.updateValueAndValidityOnRequiredFields();
        }
    }

    canDeactivate(): boolean {
        return this.gesuchForm.dirty;
    }

    setIsKpersonCleared() {
        this.isKpersonCleared = true;
    }

    /**
     * Set side navigation for this component
     *
     * @memberof GesuchComponent
     */
    setSideNavigation() {
        this.navigationService.showNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammEntscheidTypeCode), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.ammEntscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.AZ_GESUCH, {
            gfId: this.geschaeftsfallId,
            entscheidId: this.ammEntscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.AZ_KOSTEN, {
            gfId: this.geschaeftsfallId,
            entscheidId: this.ammEntscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.SPEZIELL_ENTSCHEID.replace(':type', this.ammEntscheidTypeCode), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.ammEntscheidId
        });
    }

    /**
     * A lifecycle hook that is called when the component is destroyed.
     * Place to Unsubscribe from Observables.
     *
     * @memberof GesuchComponent
     */

    ngOnDestroy() {
        super.ngOnDestroy();

        if (this.reloadSubscription) {
            this.reloadSubscription.unsubscribe();
        }

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        this.authService.removeOwnerPermissionContext();
        if (this.languageSubscription) {
            this.languageSubscription.unsubscribe();
        }

        if (!this.shouldKeepMessages) {
            this.fehlermeldungenService.closeMessage();
        }

        this.toolboxService.sendConfiguration([]);
        this.stesInfobarService.removeItemFromInfoPanel(this.infobartemp);
        this.stesInfobarService.sendLastUpdate({}, true);
    }

    private deactivateSpinnerAndScrollTop() {
        this.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    private updateValueAndValidityOnRequiredFields() {
        this.gesuchForm.controls.eingangsdatum.updateValueAndValidity();
        this.gesuchForm.controls.ausbildungsvertragVom.updateValueAndValidity();
        this.gesuchForm.controls.ausbildungsAls.updateValueAndValidity();
        this.gesuchForm.controls.ausbildungVon.updateValueAndValidity();
        this.gesuchForm.controls.ausbildungBis.updateValueAndValidity();
        this.gesuchForm.controls.gesuchszeitraumVon.updateValueAndValidity();
        this.gesuchForm.controls.gesuchszeitraumBis.updateValueAndValidity();
        this.gesuchForm.controls.arbeitgeber.updateValueAndValidity();
        this.gesuchForm.controls.faehigkeitsausweis.updateValueAndValidity();
    }

    private clearValidatorsOnRequiredFields() {
        this.gesuchForm.controls.eingangsdatum.clearValidators();
        this.gesuchForm.controls.ausbildungsvertragVom.clearValidators();
        this.gesuchForm.controls.ausbildungsAls.clearValidators();
        this.gesuchForm.controls.ausbildungVon.clearValidators();
        this.gesuchForm.controls.ausbildungBis.clearValidators();
        this.gesuchForm.controls.gesuchszeitraumVon.clearValidators();
        this.gesuchForm.controls.gesuchszeitraumBis.clearValidators();
        this.gesuchForm.controls.arbeitgeber.clearValidators();
        this.gesuchForm.controls.faehigkeitsausweis.clearValidators();

        // set default validators
        this.gesuchForm.controls.eingangsdatum.setValidators([DateValidator.dateFormatNgx, DateValidator.isDateInFutureNgx, DateValidator.dateValidNgx]);
        this.gesuchForm.controls.ausbildungsvertragVom.setValidators([DateValidator.dateFormatNgx, DateValidator.isDateInFutureNgx, DateValidator.dateValidNgx]);
        this.gesuchForm.controls.ausbildungVon.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        this.gesuchForm.controls.ausbildungBis.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        this.gesuchForm.controls.gesuchszeitraumVon.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        this.gesuchForm.controls.gesuchszeitraumBis.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
    }

    /**
     * We use this function to check if any fields should be disabled/hidden depending on
     * certain conditions.
     */
    private checkDisabledFields(gesuchData: AmmGesuchAzDTO) {
        const entscheidStatus = this.getOldestEntscheidStatusCode(gesuchData);

        this.isGesuchStatusGeprueft = this.checkGesuchStatus();

        this.isEntscheidFreigabebereitFreigegebenOderErsetzt = this.checkEntscheidStatus(entscheidStatus);

        this.disableRangeDatesVon();

        this.isKontaktpersonSelected = this.isKontaktPersonSelected();
    }

    private disableRangeDatesVon() {
        if (
            this.gesuchData.typIdObject.code !== GesuchstypAZCodeEnum.HAUPTGESUCH ||
            (this.gesuchData.typIdObject.code === GesuchstypAZCodeEnum.HAUPTGESUCH && (this.isGesuchStatusGeprueft || this.isEntscheidFreigabebereitFreigegebenOderErsetzt))
        ) {
            this.gesuchForm.controls.ausbildungVon.disable();
        } else {
            this.gesuchForm.controls.ausbildungVon.enable();
        }
        if (
            this.gesuchData.typIdObject.code === GesuchstypAZCodeEnum.HAUPTGESUCH ||
            (this.gesuchData.typIdObject.code !== GesuchstypAZCodeEnum.HAUPTGESUCH && (this.isGesuchStatusGeprueft || this.isEntscheidFreigabebereitFreigegebenOderErsetzt))
        ) {
            this.gesuchForm.controls.gesuchszeitraumVon.disable();
        } else {
            this.gesuchForm.controls.gesuchszeitraumVon.enable();
        }
    }

    private isKontaktPersonSelected(): boolean {
        return this.gesuchData.ammKontaktpersonObject && !!this.gesuchData.ammKontaktpersonObject.kontaktId;
    }

    private checkGesuchStatus(): boolean {
        return this.gesuchData.statusObject.code === AmmGeschaeftsstatusCode.GEPRUEFT;
    }

    private checkEntscheidStatus(entscheidStatus: any): boolean {
        return (
            entscheidStatus === AmmVierAugenStatusCode.ERSETZT ||
            entscheidStatus === AmmVierAugenStatusCode.FREIGEGEBEN ||
            entscheidStatus === AmmVierAugenStatusCode.FREIGABEBEREIT
        );
    }

    private checkFolgegesuchErstellen() {
        const entscheidStatusCode = this.getMostRecentEntscheidStatusCode();
        const entscheidTypeCode = this.getEntscheidTypeCode();
        const hasEnscheidNachfolger = this.checkEntscheidForNachfolger();
        const isEntscheidTypeGutgeheissen =
            entscheidTypeCode === AmmEntscheidCode.GUTGEHEISSEN ||
            entscheidTypeCode === AmmEntscheidCode.TEILWEISE_GUTGEHEISSEN ||
            entscheidTypeCode === AmmEntscheidCode.ABGEBROCHEN;
        const hasGeschaeftsfallNachfolger = this.checkGeschaeftsfallForNachfolger();
        const isGesuchBisBeforeAusbildungBis =
            this.facade.formUtilsService.parseDate(this.gesuchData.massnahmeBis) < this.facade.formUtilsService.parseDate(this.gesuchData.ausbildungBis);

        if (
            entscheidStatusCode === AmmVierAugenStatusCode.FREIGEGEBEN &&
            !hasEnscheidNachfolger &&
            isEntscheidTypeGutgeheissen &&
            !hasGeschaeftsfallNachfolger &&
            isGesuchBisBeforeAusbildungBis
        ) {
            this.primaryFolgegesuchErstellen = true;
        }
    }

    /**
     * The function gets the status of the last Entscheid
     */
    private getMostRecentEntscheidStatusCode() {
        let statusCode = null;
        const currentEntscheid = this.getEntscheid(this.gesuchData.ammGeschaeftsfallObject);

        if (currentEntscheid && this.gesuchData.ammGeschaeftsfallObject.allAmmEntscheid[0].statusObject) {
            statusCode = this.gesuchData.ammGeschaeftsfallObject.allAmmEntscheid[0].statusObject.code;
        }

        return statusCode;
    }

    private getEntscheidTypeCode() {
        let typeCode = null;
        const currentEntscheid = this.getEntscheid(this.gesuchData.ammGeschaeftsfallObject);

        if (currentEntscheid && this.gesuchData.ammGeschaeftsfallObject.allAmmEntscheid[0].entscheidArtObject) {
            typeCode = this.gesuchData.ammGeschaeftsfallObject.allAmmEntscheid[0].entscheidArtObject.code;
        }

        return typeCode;
    }

    private checkEntscheidForNachfolger(): boolean {
        let hasEnscheidNachfolger = false;
        const currentEntscheid = this.getEntscheid(this.gesuchData.ammGeschaeftsfallObject);

        if (currentEntscheid && this.gesuchData.ammGeschaeftsfallObject.allAmmEntscheid[0].nachfolgerId) {
            hasEnscheidNachfolger = true;
        }

        return hasEnscheidNachfolger;
    }

    private checkGeschaeftsfallForNachfolger(): boolean {
        let hasGeschaeftsfallNachfolger = false;

        if (this.gesuchData.ammGeschaeftsfallObject && this.gesuchData.ammGeschaeftsfallObject.nachfolgerId) {
            hasGeschaeftsfallNachfolger = true;
        }

        return hasGeschaeftsfallNachfolger;
    }

    private getEntscheid(gfObject: AmmStesGeschaeftsfallDTO): AmmEntscheidDTO {
        let entscheid;

        if (gfObject && gfObject.allAmmEntscheid && gfObject.allAmmEntscheid[0]) {
            entscheid = gfObject.allAmmEntscheid[0];
        }

        return entscheid;
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

    private checkHasNachfolgerOfSameType(gesuchData: AmmGesuchAzDTO): boolean {
        const currentGesuchTypeCode = gesuchData.typIdObject.code;
        const nachfolgerGesuchTypeCode = gesuchData.ammGeschaeftsfallObject.nachfolgerObject.ammGesuchAz.typIdObject.code;

        return currentGesuchTypeCode === nachfolgerGesuchTypeCode;
    }

    private initializeBearbeitungTokens(azGesuchData: AmmGesuchAzDTO) {
        const currentUser = this.authService.getLoggedUser();
        const benutzerstelleId = azGesuchData.ownerId ? azGesuchData.ownerId : currentUser.benutzerstelleId;

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
