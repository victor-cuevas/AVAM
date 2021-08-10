import { Permissions } from '@shared/enums/permissions.enum';
import { DateValidator } from '@shared/validators/date-validator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeactivationGuarded } from '../../../../../../../../../shared/services/can-deactive-guard.service';
import { AmmGesuchEazDTO } from '../../../../../../../../../shared/models/dtos-generated/ammGesuchEazDTO';
import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FormGroupDirective, FormGroup, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { KontakteViewDTO } from '@app/shared/models/dtos-generated/kontakteViewDTO';
import { PhoneValidator } from '@app/shared/validators/phone-validator';
import { EmailValidator } from '@app/shared/validators/email-validator';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerService } from 'oblique-reactive';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { iif, forkJoin, Subject, Subscription } from 'rxjs';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { BaseResponseWrapperAmmGesuchEazDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmGesuchEazDTOWarningMessages';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { ToolboxService, GenericConfirmComponent } from '@app/shared';
import { AmmGeschaeftsstatusCode } from '@app/shared/enums/domain-code/amm-geschaeftsstatus-code.enum';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { AmmVierAugenStatusCode } from '@app/shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { AMMLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { ReloadHelper } from '@app/shared/helpers/reload.helper';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { DmsMetadatenKopierenModalComponent, DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';
import { first } from 'rxjs/operators';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-eaz-gesuch',
    templateUrl: './eaz-gesuch.component.html',
    styleUrls: ['./eaz-gesuch.component.scss'],
    providers: [ObliqueHelperService]
})
export class EazGesuchComponent extends AmmCloseableAbstract implements OnInit, OnDestroy, DeactivationGuarded {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('infobartemp') infobartemp: TemplateRef<any>;

    /**
     * Tracks the value and validity state of a group of FormControl instances.
     *
     * @memberof EazGesuchComponent
     */
    eazGesuchForm: FormGroup;

    /**
     * Current component channel.
     *
     * @memberof EazGesuchComponent
     */
    channel = 'eaz-gesuch-channel';

    /**
     *  Tracks the state of the form if it is submitted.
     *
     * @memberof EazGesuchComponent
     */
    submitted = false;

    /**
     * The variables checks if the Konktaktperson object is chosen from the modal window or not. If it is chosen
     * from the modal window the fields underneath are read-only if it isn't the fields are editable
     */
    isKontaktpersonSelected = true;

    eazGesuchData: AmmGesuchEazDTO;
    bearbeitungSuchenTokens: {};
    einarbeitungAlsSuchenTokens: {};
    unternehmendId: number;
    kontaktPersonObject: KontakteViewDTO;
    geschaeftsfallId: number;

    statusOptions: any[] = [];

    observeClickActionSub: Subscription;
    buttons: Subject<any[]> = new Subject();
    ammButtonsTypeEnum = AmmButtonsTypeEnum;
    shouldKeepMessages = false;
    isEntscheidFreigabebereitFreigegebenOderErsetzt = false;
    isGesuchStatusGeprueft = false;
    shouldDisableRangePicker = false;
    eazAmmEntscheidId: number;
    vorgaengerEntscheidId: number;
    nachfolgerEntscheidId: number;
    isKpersonCleared = false;

    reloadSubscription: Subscription;
    basisNr: any;

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;

    constructor(
        private obliqueHelper: ObliqueHelperService,
        private formBuilder: FormBuilder,
        private dataRestService: StesDataRestService,
        private route: ActivatedRoute,
        protected router: Router,
        private modalService: NgbModal,
        private ammDataService: AmmRestService,
        protected facade: FacadeService,
        private stesInfobarService: AvamStesInfoBarService,
        private ammHelper: AmmHelper,
        protected interactionService: StesComponentInteractionService
    ) {
        super(facade, router, interactionService);
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
        this.ammEntscheidTypeCode = AmmMassnahmenCode.EAZ;
    }

    ngOnInit() {
        this.reloadSubscription = ReloadHelper.enable(this.router, this.unsubscribe, () => {
            this.setSideNavigation();
            this.getData();
        });

        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesAmm.eazGesuchHeader' });
        this.obliqueHelper.ngForm = this.ngForm;
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.route.queryParamMap.subscribe(params => {
            this.geschaeftsfallId = params.get('gfId') ? +params.get('gfId') : null;
            this.eazAmmEntscheidId = params.get('entscheidId') ? +params.get('entscheidId') : null;
        });

        this.eazGesuchForm = this.createFormGroup();
        this.getData();
        this.configureToolbox();
        this.einarbeitungAlsSuchenTokens = {};

        super.ngOnInit();
    }

    isOurLabel(message) {
        return message.data.label === this.facade.dbTranslateService.instant(AMMLabels.EAZ);
    }

    isOurUrl(): boolean {
        return (
            this.router.url.includes(AMMPaths.EAZ_GESUCH) ||
            this.router.url.includes(AMMPaths.EAZ_KOSTEN) ||
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

        this.facade.toolboxService.sendConfiguration(
            toolboxConfig,
            this.channel,
            ToolboxDataHelper.createForAmm(
                DokumentVorlageActionDTO.TargetEntityEnum.EAZGESUCH,
                [VorlagenKategorie.AMM_GESUCH_EAZ],
                +this.stesId,
                this.geschaeftsfallId,
                null,
                this.eazAmmEntscheidId
            )
        );

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.openDmsCopyModal(this.geschaeftsfallId, +this.eazGesuchData.gesuchsNr);
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(+this.eazGesuchData.ammGesuchId, AvamCommonValueObjectsEnum.T_AMM_GESUCH_EAZ);
            }
        });
    }

    /**
     * Create form group with formBuilder.
     *
     * @returns {FormGroup}
     * @memberof EazGesuchComponent
     */
    createFormGroup() {
        return this.formBuilder.group(
            {
                eingangsdatum: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx, DateValidator.isDateInFutureNgx]],
                arbeitsvertragVom: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx, DateValidator.isDateInFutureNgx]],
                einarbeitungAls: null,
                einarbeitungVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                einarbeitungBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                bearbeitung: null,
                gesuchsNr: null,
                status: null,
                arbeitgeber: null,
                kontaktperson: null,
                name: null,
                vorname: null,
                telefon: [null, this.getTelefonValidator()],
                mobile: [null, this.getTelefonValidator()],
                fax: [null, this.getTelefonValidator()],
                email: [null, this.getEmailValidator()]
            },
            {
                validator: [
                    DateValidator.rangeBetweenDates('einarbeitungVon', 'einarbeitungBis', 'val202', false),
                    DateValidator.dateRange12M('einarbeitungVon', 'einarbeitungBis', 'val203')
                ]
            }
        );
    }

    /**
     * HTTP GET call.
     *
     * @memberof EazGesuchComponent
     */
    getData() {
        this.facade.spinnerService.activate(this.channel);
        const get = this.ammDataService.getGesuchEaz(this.stesId, this.geschaeftsfallId);
        const create = this.ammDataService.createGesuchEaz(this.stesId);
        forkJoin<CodeDTO[], BaseResponseWrapperAmmGesuchEazDTOWarningMessages>([
            this.dataRestService.getCode(DomainEnum.AMMGESCHAEFTSSTATUS),
            iif(() => (this.geschaeftsfallId ? true : false), get, create)
        ]).subscribe(
            ([statusOptions, eazGesuchResponse]) => {
                this.statusOptions = this.facade.formUtilsService.mapDropdownKurztext(statusOptions).filter(s => s.code !== AmmGeschaeftsstatusCode.PRUEFBEREIT);
                this.buttons.next(null);
                if (eazGesuchResponse.data) {
                    this.isKpersonCleared = false;
                    this.eazGesuchData = eazGesuchResponse.data;
                    this.initializeBearbeitungTokens(this.eazGesuchData);
                    this.eazAmmEntscheidId = this.ammHelper.getEntscheidId(this.eazGesuchData.ammGeschaeftsfallObject);
                    this.unternehmendId = this.eazGesuchData.ammGeschaeftsfallObject.unternehmenObject
                        ? this.eazGesuchData.ammGeschaeftsfallObject.unternehmenObject.unternehmenId
                        : null;
                    this.kontaktPersonObject = this.eazGesuchData.ammKontaktpersonObject;
                    this.basisNr = this.eazGesuchData.ammGeschaeftsfallObject.basisNr;
                    this.ammDataService.getButtonsAmmGesuch(this.stesId, this.eazGesuchData.ammGeschaeftsfallId).subscribe(btnResponse => {
                        this.buttons.next(btnResponse.data);
                    });
                    this.vorgaengerEntscheidId = this.ammHelper.getEntscheidId(this.eazGesuchData.ammGeschaeftsfallObject.vorgaengerObject);
                    this.nachfolgerEntscheidId = this.ammHelper.getEntscheidId(this.eazGesuchData.ammGeschaeftsfallObject.nachfolgerObject);
                    if (!this.geschaeftsfallId) {
                        this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                        this.shouldKeepMessages = true;
                        this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.EAZ_GESUCH}`], {
                            queryParams: {
                                gfId: this.eazGesuchData.ammGeschaeftsfallId,
                                entscheidId: this.eazAmmEntscheidId
                            }
                        });
                    } else {
                        this.shouldKeepMessages = false;
                    }
                    this.eazGesuchForm.setValue(this.mapToForm(this.eazGesuchData));
                    this.geschaeftsfallId = this.eazGesuchData.ammGeschaeftsfallId;
                    this.disableFields();
                    this.stesInfobarService.addItemToInfoPanel(this.infobartemp);
                    this.stesInfobarService.sendLastUpdate(this.eazGesuchData);
                    this.setSideNavigation();
                }
                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    mapToForm(data: AmmGesuchEazDTO) {
        const ammKontaktpersonObject = data.ammKontaktpersonObject;

        return {
            eingangsdatum: this.facade.formUtilsService.parseDate(data.eingangsdatum),
            arbeitsvertragVom: this.facade.formUtilsService.parseDate(data.arbeitsvertragVom),
            einarbeitungAls: data.einarbeitungAlsObject,
            einarbeitungVon: this.facade.formUtilsService.parseDate(data.massnahmeVon),
            einarbeitungBis: this.facade.formUtilsService.parseDate(data.massnahmeBis),
            bearbeitung: data.bearbeiterDetailObject,
            gesuchsNr: data.gesuchsNr,
            status: data.statusObject.codeId,
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

    /**
     * Map form object to backend.
     *
     * @memberof EazGesuchComponent
     */
    mapToDTO(): AmmGesuchEazDTO {
        const ammEazGesuchDataSave = { ...this.eazGesuchData };

        ammEazGesuchDataSave.eingangsdatum = this.facade.formUtilsService.parseDate(this.eazGesuchForm.controls.eingangsdatum.value);
        ammEazGesuchDataSave.arbeitsvertragVom = this.facade.formUtilsService.parseDate(this.eazGesuchForm.controls.arbeitsvertragVom.value);
        ammEazGesuchDataSave.einarbeitungAlsId = this.eazGesuchForm.controls.einarbeitungAls.value
            ? this.eazGesuchForm.controls.einarbeitungAls['berufAutosuggestObject'].berufId
            : null;
        ammEazGesuchDataSave.einarbeitungAlsObject = this.eazGesuchForm.controls.einarbeitungAls.value
            ? this.eazGesuchForm.controls.einarbeitungAls['berufAutosuggestObject']
            : null;
        ammEazGesuchDataSave.massnahmeVon = this.facade.formUtilsService.parseDate(this.eazGesuchForm.controls.einarbeitungVon.value);
        ammEazGesuchDataSave.massnahmeBis = this.facade.formUtilsService.parseDate(this.eazGesuchForm.controls.einarbeitungBis.value);
        ammEazGesuchDataSave.bearbeiterDetailObject = this.eazGesuchForm.controls.bearbeitung['benutzerObject'];
        ammEazGesuchDataSave.statusId = +this.eazGesuchForm.controls.status.value;
        ammEazGesuchDataSave.statusObject = this.statusOptions.find(option => option.codeId === +this.eazGesuchForm.controls.status.value) as CodeDTO;

        ammEazGesuchDataSave.ammGeschaeftsfallObject.unternehmenObject = {
            unternehmenId: this.eazGesuchForm.controls.arbeitgeber['unternehmenAutosuggestObject'].unternehmenId,
            name1: this.eazGesuchForm.controls.arbeitgeber['unternehmenAutosuggestObject'].name1
        };

        ammEazGesuchDataSave.ammKontaktpersonObject = this.ammHelper.initializeKperson(this.eazGesuchForm, this.eazGesuchData, this.kontaktPersonObject, this.isKpersonCleared);

        return ammEazGesuchDataSave;
    }

    setRequiredFields(statusCodeId) {
        const selectedOptionCode = this.facade.formUtilsService.getCodeByCodeId(this.statusOptions, statusCodeId);

        if (selectedOptionCode === AmmGeschaeftsstatusCode.GEPRUEFT) {
            this.eazGesuchForm.controls.eingangsdatum.setValidators([
                Validators.required,
                DateValidator.dateFormatNgx,
                DateValidator.dateValidNgx,
                DateValidator.isDateInFutureNgx
            ]);
            this.eazGesuchForm.controls.arbeitsvertragVom.setValidators([
                Validators.required,
                DateValidator.dateFormatNgx,
                DateValidator.dateValidNgx,
                DateValidator.isDateInFutureNgx
            ]);
            this.eazGesuchForm.controls.einarbeitungAls.setValidators(Validators.required);
            this.eazGesuchForm.controls.einarbeitungVon.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            this.eazGesuchForm.controls.einarbeitungBis.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            this.eazGesuchForm.controls.arbeitgeber.setValidators(Validators.required);

            this.updateValueAndValidityOnRequiredFields();
        } else {
            this.setDefaultValidatorsOnRequiredFields();
            this.updateValueAndValidityOnRequiredFields();
        }
    }

    updateValueAndValidityOnRequiredFields() {
        this.eazGesuchForm.controls.eingangsdatum.updateValueAndValidity();
        this.eazGesuchForm.controls.arbeitsvertragVom.updateValueAndValidity();
        this.eazGesuchForm.controls.einarbeitungAls.updateValueAndValidity();
        this.eazGesuchForm.controls.einarbeitungVon.updateValueAndValidity();
        this.eazGesuchForm.controls.einarbeitungBis.updateValueAndValidity();
        this.eazGesuchForm.controls.arbeitgeber.updateValueAndValidity();
    }

    setDefaultValidatorsOnRequiredFields() {
        this.eazGesuchForm.controls.eingangsdatum.setValidators([DateValidator.dateFormatNgx, DateValidator.isDateInFutureNgx, DateValidator.dateValidNgx]);
        this.eazGesuchForm.controls.arbeitsvertragVom.setValidators([DateValidator.dateFormatNgx, DateValidator.isDateInFutureNgx, DateValidator.dateValidNgx]);
        this.eazGesuchForm.controls.einarbeitungAls.clearValidators();
        this.eazGesuchForm.controls.einarbeitungVon.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        this.eazGesuchForm.controls.einarbeitungBis.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        this.eazGesuchForm.controls.arbeitgeber.clearValidators();
    }

    onKontaktpersonClear() {
        this.isKontaktpersonSelected = false;
        this.kontaktPersonObject = null;
        this.isKpersonCleared = true;
        this.eazGesuchForm.patchValue({
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
        this.eazGesuchForm.markAsDirty();
        this.eazGesuchForm.patchValue({
            name: kontaktperson.name,
            vorname: kontaktperson.vorname,
            telefon: kontaktperson.telefonNr,
            mobile: kontaktperson.mobileNr,
            fax: kontaktperson.telefaxNr,
            email: kontaktperson.email
        });
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
     * @memberof EazGesuchComponent
     */
    setSideNavigation() {
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammEntscheidTypeCode), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.eazAmmEntscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.EAZ_GESUCH, {
            gfId: this.geschaeftsfallId,
            entscheidId: this.eazAmmEntscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.EAZ_KOSTEN, {
            gfId: this.geschaeftsfallId,
            entscheidId: this.eazAmmEntscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.SPEZIELL_ENTSCHEID.replace(':type', this.ammEntscheidTypeCode), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.eazAmmEntscheidId
        });
    }

    /**
     * A lifecycle hook that is called when the component is destroyed.
     * Place to Unsubscribe from Observables.
     *
     * @memberof EazGesuchComponent
     */
    ngOnDestroy() {
        super.ngOnDestroy();

        if (this.reloadSubscription) {
            this.reloadSubscription.unsubscribe();
        }

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        if (!this.shouldKeepMessages) {
            this.facade.fehlermeldungenService.closeMessage();
        }

        this.facade.toolboxService.sendConfiguration([]);
        this.stesInfobarService.removeItemFromInfoPanel(this.infobartemp);
        this.stesInfobarService.sendLastUpdate({}, true);
        super.ngOnDestroy();
    }

    canDeactivate(): boolean {
        return this.eazGesuchForm.dirty;
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
        if (this.eazGesuchForm.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.eazGesuchForm.reset(this.mapToForm(this.eazGesuchData));
                this.isKontaktpersonSelected = this.isKontaktPersonSelected();
            });

            this.isKpersonCleared = false;
        }
    }

    /**
     * Submit form.
     *
     * @memberof EazGesuchComponent
     */
    onSubmit() {
        this.facade.fehlermeldungenService.closeMessage();
        this.submitted = true;

        if (this.eazGesuchForm.invalid) {
            this.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.onSave();
    }

    /**
     * Trigger onSave when form is valid.
     *
     * @memberof EazGesuchComponent
     */
    onSave() {
        this.facade.spinnerService.activate(this.channel);
        this.facade.fehlermeldungenService.closeMessage();

        this.ammDataService.updateGesuchEaz(this.stesId, this.facade.translateService.currentLang, this.mapToDTO()).subscribe(
            response => {
                this.buttons.next(null);
                this.ammDataService.getButtonsAmmGesuch(this.stesId, this.eazGesuchData.ammGeschaeftsfallId).subscribe(btnResponse => {
                    this.buttons.next(btnResponse.data);
                });

                if (response.data) {
                    this.isKpersonCleared = false;
                    this.eazGesuchData = response.data;

                    this.unternehmendId = this.eazGesuchData.ammGeschaeftsfallObject.unternehmenObject
                        ? this.eazGesuchData.ammGeschaeftsfallObject.unternehmenObject.unternehmenId
                        : null;

                    this.eazGesuchForm.reset(this.mapToForm(this.eazGesuchData));
                    this.disableFields();
                    this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                    this.stesInfobarService.sendLastUpdate(this.eazGesuchData);
                } else {
                    this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    /**
     * Triggered when Geschaeftsfall-Loeschen Button is clicked
     * Also redirects to the Geschaeftsfall of the vorgaenger, if there is one.
     * If not the tree table is loaded.
     *
     * @memberof EazGesuchComponent
     */
    onGeschaeftsfallLoeschen() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        this.ammDataService.geschaeftsfallLoeschen(this.stesId, this.geschaeftsfallId).subscribe(
            response => {
                if (response.data) {
                    this.eazGesuchForm.markAsPristine();
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));

                    const vorgaengerGeschaeftsfallId = this.eazGesuchData.ammGeschaeftsfallObject ? this.eazGesuchData.ammGeschaeftsfallObject.vorgaengerId : null;

                    if (vorgaengerGeschaeftsfallId) {
                        const vorgaengerEntscheidIdId = this.eazGesuchData.ammGeschaeftsfallObject
                            ? this.eazGesuchData.ammGeschaeftsfallObject.vorgaengerObject.allAmmEntscheid[0].ammEntscheidId
                            : null;

                        this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.EAZ_GESUCH}`], {
                            queryParams: {
                                gfId: vorgaengerGeschaeftsfallId,
                                entscheidId: vorgaengerEntscheidIdId
                            }
                        });
                    } else {
                        this.facade.navigationService.hideNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammEntscheidTypeCode));
                        this.cancel();
                    }
                } else {
                    this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgeloescht'));
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    /**
     * Triggered when Zuruecknehmen Button is clicked
     *
     * @memberof EazGesuchComponent
     */
    onGesuchZuruecknehmen() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        this.ammDataService.zuruecknehmenGesuchEaz(this.stesId, this.geschaeftsfallId).subscribe(
            response => {
                this.buttons.next(null);

                this.ammDataService.getButtonsAmmGesuch(this.stesId, this.eazGesuchData.ammGeschaeftsfallId).subscribe(btnResponse => {
                    this.buttons.next(btnResponse.data);
                });

                if (response.data) {
                    this.eazGesuchData = response.data;

                    this.unternehmendId = this.eazGesuchData.ammGeschaeftsfallObject.unternehmenObject
                        ? this.eazGesuchData.ammGeschaeftsfallObject.unternehmenObject.unternehmenId
                        : null;

                    this.eazGesuchForm.setValue(this.mapToForm(this.eazGesuchData));
                    this.disableFields();
                    this.stesInfobarService.sendLastUpdate(this.eazGesuchData);
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
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
     * @memberof EazGesuchComponent
     */
    onGeschaeftsfallErsetzen() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        this.ammDataService.geschaeftsfallErsetzen(this.stesId, this.geschaeftsfallId).subscribe(
            response => {
                if (response.data) {
                    const newGeschaeftsfallId = response.data;
                    let newAmmEntscheidId: number;

                    this.ammDataService.getGesuchEaz(this.stesId, newGeschaeftsfallId).subscribe(
                        gesuchResponse => {
                            if (gesuchResponse.data) {
                                newAmmEntscheidId = this.ammHelper.getEntscheidId(gesuchResponse.data.ammGeschaeftsfallObject);
                            }

                            this.facade.notificationService.success(this.facade.dbTranslateService.instant('amm.nutzung.feedback.geschaeftsfallersetzt'));

                            this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.EAZ_GESUCH}`], {
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
                    this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
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

    setIsKpersonCleared() {
        this.isKpersonCleared = true;
    }

    private deactivateSpinnerAndScrollTop() {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    /**
     * We use this function to check if any fields should be disabled/hidden depending on
     * certain conditions.
     */
    private disableFields() {
        this.setIsGesuchStatusGeprueft();
        const entscheidStatusCode = this.getOldestEntscheidStatusCode();
        this.setIsEntscheidFreigabebereitFreigegebenOderErsetzt(entscheidStatusCode);

        this.disableRangeDatepicker();

        this.isKontaktpersonSelected = this.isKontaktPersonSelected();
    }

    private disableRangeDatepicker() {
        if (this.isGesuchStatusGeprueft || this.isEntscheidFreigabebereitFreigegebenOderErsetzt) {
            this.shouldDisableRangePicker = true;
        } else {
            this.shouldDisableRangePicker = false;
        }
    }

    private setIsGesuchStatusGeprueft() {
        this.isGesuchStatusGeprueft = this.eazGesuchData.statusObject.code === AmmGeschaeftsstatusCode.GEPRUEFT;
    }

    private setIsEntscheidFreigabebereitFreigegebenOderErsetzt(entscheidStatusCode) {
        this.isEntscheidFreigabebereitFreigegebenOderErsetzt =
            entscheidStatusCode === AmmVierAugenStatusCode.ERSETZT ||
            entscheidStatusCode === AmmVierAugenStatusCode.FREIGEGEBEN ||
            entscheidStatusCode === AmmVierAugenStatusCode.FREIGABEBEREIT;
    }

    private isKontaktPersonSelected(): boolean {
        return this.eazGesuchData.ammKontaktpersonObject && !!this.eazGesuchData.ammKontaktpersonObject.kontaktId;
    }

    /**
     * The function gets the status of the very first Entscheid (The one that has no Vorgaenger)
     */
    private getOldestEntscheidStatusCode() {
        let statusCode = null;
        const allAmmEntscheidArray = this.eazGesuchData.ammGeschaeftsfallObject.allAmmEntscheid;
        const allAmmEntscheidArrayLastIndex = allAmmEntscheidArray.length - 1;

        if (
            this.eazGesuchData.ammGeschaeftsfallObject &&
            allAmmEntscheidArray &&
            allAmmEntscheidArray[allAmmEntscheidArrayLastIndex] &&
            allAmmEntscheidArray[allAmmEntscheidArrayLastIndex].statusObject
        ) {
            statusCode = allAmmEntscheidArray[allAmmEntscheidArrayLastIndex].statusObject.code;
        }

        return statusCode;
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

    private initializeBearbeitungTokens(eazGesuchData: AmmGesuchEazDTO) {
        const currentUser = this.facade.authenticationService.getLoggedUser();
        const benutzerstelleId = eazGesuchData.ownerId ? eazGesuchData.ownerId : currentUser.benutzerstelleId;

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
