import { Permissions } from '@shared/enums/permissions.enum';
import { TransferALKCodeEnum } from '@app/shared/enums/domain-code/transfer-alk-code.enum';
import { AmmEntscheidDTO } from '@app/shared/models/dtos-generated/ammEntscheidDTO';
import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { FormGroup, FormGroupDirective, FormBuilder, Validators } from '@angular/forms';
import { SpinnerService } from 'oblique-reactive';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { Subscription, forkJoin, Observable, Subject } from 'rxjs';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { TranslateService } from '@ngx-translate/core';
import { AmmEntscheidCode } from '@app/shared/enums/domain-code/amm-entscheid-code.enum';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AmmVierAugenStatusCode } from '@app/shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { DateValidator } from '@app/shared/validators/date-validator';
import { AmmEntscheidAuflagenDTO } from '@app/shared/models/dtos-generated/ammEntscheidAuflagenDTO';
import { AmmEntscheidBemerkungDTO } from '@app/shared/models/dtos-generated/ammEntscheidBemerkungDTO';
import { AmmEntscheidGruendeDTO } from '@app/shared/models/dtos-generated/ammEntscheidGruendeDTO';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { AmmGesuchstypFseCodeEnum } from '@app/shared/enums/domain-code/amm-gesuchstyp-fse-code.enum';
import { AMMLabels } from '@shared/enums/stes-routing-labels.enum';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AmmGeldgeberCode } from '@app/shared/enums/domain-code/amm-geldgeber-code.enum';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { FacadeService } from '@shared/services/facade.service';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';

@Component({
    selector: 'avam-amm-entscheid',
    templateUrl: './amm-speziell-entscheid.component.html',
    styleUrls: ['./amm-speziell-entscheid.component.scss'],
    providers: [ObliqueHelperService]
})
export class AmmSpeziellEntscheidComponent extends AmmCloseableAbstract implements OnInit, OnDestroy, DeactivationGuarded {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('infobartemp') infobartemp: TemplateRef<any>;

    /**
     * Tracks the value and validity state of a group of FormControl instances.
     *
     * @memberof AmmSpeziellEntscheidComponent
     */
    ammEntscheidForm: FormGroup;

    /**
     * Current component channel.
     *
     * @memberof AmmSpeziellEntscheidComponent
     */
    channel = 'speziell-entscheid-channel';

    /**
     *  Tracks the state of the form if it is submitted.
     *
     * @memberof AmmSpeziellEntscheidComponent
     */
    submitted = false;

    ammEntscheidData: AmmEntscheidDTO;
    displayDatepicker = false;
    ammEntscheidId: number;
    geschaeftsfallId: number;
    languageSubscription: Subscription;
    observeClickActionSub: Subscription;
    isGeldgeberReadonly = false;

    statusOptions: any[] = [];
    allStatusOptions: any[] = [];
    freigabeDurchSuchenTokens: {};
    entscheidungDurchSuchenTokens: {};
    geldgeberOptions: any[] = [];
    entscheidartOptions: any[] = [];
    auflageMultiselectOptions = [];
    begruendungMultiselectOptions = [];
    ergaenzendeAngabenMultiselectOptions = [];
    alkOptions: any[] = [];

    auflageMultiselectOptionsBE = [];
    ergaenzendeAngabenMultiselectOptionsBE = [];
    begruendungMultiselectOptionsBE = [];

    buttons: Subject<any[]> = new Subject();
    ammButtonsTypeEnum = AmmButtonsTypeEnum;

    isEntscheidStatusFreigabebereitFreigegebenOrErsetzt = false;
    ammEntscheidTypeKurzText: string;
    isAmmEntscheidTypeFse: boolean;
    isAmmEntscheidTypeEaz: boolean;
    isGesuchstypUdV: boolean;
    vorgaengerEntscheidId: number;
    nachfolgerEntscheidId: number;
    vorgaengerGeschaeftsfallId: number;
    nachfolgerGeschaeftsfallId: number;

    defaultBeschaeftigungsgrad = 100;
    reloadSubscription: Subscription;
    basisNr: number;

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;

    constructor(
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private dataRestService: StesDataRestService,
        private translateService: TranslateService,
        private obliqueHelper: ObliqueHelperService,
        protected router: Router,
        private ammDataService: AmmRestService,
        private stesInfobarService: AvamStesInfoBarService,
        protected interactionService: StesComponentInteractionService,
        protected facade: FacadeService
    ) {
        super(facade, router, interactionService);
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;

        this.reloadSubscription = ReloadHelper.enable(this.router, this.unsubscribe, () => {
            this.getData();
        });

        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.route.params.subscribe(params => {
            this.ammEntscheidTypeCode = params['type'];
            this.ammEntscheidTypeKurzText = Object.keys(AmmMassnahmenCode).find(key => AmmMassnahmenCode[key] === this.ammEntscheidTypeCode);
            this.setUeberschrift();
        });

        this.route.queryParamMap.subscribe(params => {
            this.geschaeftsfallId = params.get('gfId') ? +params.get('gfId') : null;
            this.ammEntscheidId = params.get('entscheidId') ? +params.get('entscheidId') : null;
            this.isAmmEntscheidTypeFse = this.checkAmmEntscheidTypeFse();
            this.isAmmEntscheidTypeEaz = this.checkAmmEntscheidTypeEaz();
        });

        this.ammEntscheidForm = this.createFormGroup();
        this.getData();

        this.languageSubscription = this.facade.dbTranslateService.getEventEmitter().subscribe(() => {
            this.patchValue();
            this.setUeberschrift();
        });

        super.ngOnInit();
    }

    isOurLabel(message) {
        return (
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.AZ) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.EAZ) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.FSE) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.PEWO)
        );
    }

    isOurUrl(): boolean {
        return (
            this.router.url.includes(AMMPaths[`${this.ammEntscheidTypeKurzText}_GESUCH`]) ||
            this.router.url.includes(AMMPaths[`${this.ammEntscheidTypeKurzText}_KOSTEN`]) ||
            this.router.url.includes(AMMPaths.SPEZIELL_ENTSCHEID.replace(':type', this.ammEntscheidTypeCode))
        );
    }

    /**
     * HTTP GET call.
     *
     * @memberof AmmSpeziellEntscheidComponent
     */
    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin([
            //NOSONAR
            this.ammDataService.getAmmEntscheidArten(this.ammEntscheidTypeCode, this.ammEntscheidId),
            this.dataRestService.getCode(DomainEnum.INSTITUTION),
            this.dataRestService.getCode(DomainEnum.VIERAUGENSTATUS),
            this.dataRestService.getCode(DomainEnum.AMMENTSCHEIDAUFLAGE),
            this.dataRestService.getCode(DomainEnum.AMMENTSCHEIDBEMERKUNG),
            this.dataRestService.getCode(DomainEnum.TRANSFER_ALK),
            this.ammDataService.getAmmEntscheid(this.ammEntscheidId)
        ]).subscribe(
            ([entscheidartOptions, geldgeberOptions, statusOptions, auflageMultiselectOptions, ergaenzendeAngabenMultiselectOptions, alkOptions, resEntscheid]) => {
                this.geldgeberOptions = this.facade.formUtilsService.mapDropdown(geldgeberOptions);
                this.allStatusOptions = this.facade.formUtilsService.mapDropdownKurztext(statusOptions);
                this.statusOptions = this.allStatusOptions.slice();
                this.entscheidartOptions = entscheidartOptions.data ? this.facade.formUtilsService.mapDropdownKurztext(entscheidartOptions.data) : null;
                this.alkOptions = alkOptions;
                this.buttons.next(null);

                if (resEntscheid.data) {
                    this.ammEntscheidData = resEntscheid.data;
                    this.initializeBenutzerTokens(this.ammEntscheidData);
                    this.basisNr = this.ammEntscheidData.ammGeschaeftsfallObject.basisNr;
                    this.ammDataService.getButtonsAmmEntscheid(this.ammEntscheidData.ammEntscheidId).subscribe(btnResponse => {
                        this.buttons.next(btnResponse.data);
                    });

                    this.vorgaengerEntscheidId = this.ammEntscheidData.vorgaengerId;
                    this.nachfolgerEntscheidId = this.ammEntscheidData.nachfolgerId;
                    this.vorgaengerGeschaeftsfallId = this.ammEntscheidData.vorgaengerObject ? this.ammEntscheidData.vorgaengerObject.ammGeschaeftsfallId : null;
                    this.nachfolgerGeschaeftsfallId = this.ammEntscheidData.nachfolgerObject ? this.ammEntscheidData.nachfolgerObject.ammGeschaeftsfallId : null;

                    this.auflageMultiselectOptionsBE = auflageMultiselectOptions;
                    this.ergaenzendeAngabenMultiselectOptionsBE = ergaenzendeAngabenMultiselectOptions;

                    this.stesInfobarService.addItemToInfoPanel(this.infobartemp);
                    this.prepareMaske();
                }

                this.configureToolbox();
                this.setSideNavigation();
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
     * @memberof AmmSpeziellEntscheidComponent
     */
    onSubmit() {
        this.facade.fehlermeldungenService.closeMessage();
        this.submitted = true;

        if (this.ammEntscheidForm.invalid) {
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
     * @memberof AmmSpeziellEntscheidComponent
     */
    onSave() {
        this.executeHttpMethod(this.ammDataService.updateAmmEntscheid(this.mapToDTO()));
    }

    /**
     * Map data from backend to form object.
     *
     * @memberof AmmSpeziellEntscheidComponent
     */
    mapToForm(data: AmmEntscheidDTO) {
        return {
            ammEntscheidNr: data.entscheidNr,
            status: data.statusId,
            entscheidungDurch: data.entscheidungDurchDetailObject,
            freigabeDurch: data.freigabeDurchDetailObject,
            freigabedatum: this.facade.formUtilsService.parseDate(data.freigabedatum),
            transferAlk: this.setTransferAlk(data.transferALK, data.transferALKDatum),
            ausrichtungVon: data.ammKosten ? this.facade.formUtilsService.parseDate(data.ammKosten.ausrichtungVon) : this.facade.formUtilsService.parseDate(data.ammVon),
            ausrichtungBis: data.ammKosten ? this.facade.formUtilsService.parseDate(data.ammKosten.ausrichtungBis) : this.facade.formUtilsService.parseDate(data.ammBis),
            geldgeber: data.geldgeberId ? data.geldgeberId : null,
            abbruchdatum: this.facade.formUtilsService.parseDate(data.abbruchdatum),
            ammEntscheidTyp: this.facade.dbTranslateService.translate(data.entscheidTypObject, 'text'),
            entscheidart: data.entscheidArtId,
            auflage: null,
            begruendung: null,
            ergaenzendeAngaben: null,
            anzahlarbeitstage: data.ammKostenFse ? data.ammKostenFse.anzahlArbeitstage : null,
            beschaeftigungsgrad: data.ammKostenEaz ? data.ammKostenEaz.beschaeftigungsGrad : this.defaultBeschaeftigungsgrad
        };
    }

    /**
     * Map form object to backend.
     *
     * @memberof AmmSpeziellEntscheidComponent
     */
    mapToDTO(): AmmEntscheidDTO {
        const ammEntscheidDataToSave = { ...this.ammEntscheidData };

        ammEntscheidDataToSave.statusId = +this.ammEntscheidForm.controls.status.value;
        ammEntscheidDataToSave.statusObject = this.statusOptions.find(option => option.codeId === +this.ammEntscheidForm.controls.status.value) as CodeDTO;
        ammEntscheidDataToSave.entscheidungDurchDetailObject = this.ammEntscheidForm.controls.entscheidungDurch.value
            ? this.ammEntscheidForm.controls.entscheidungDurch['benutzerObject']
            : null;
        ammEntscheidDataToSave.entscheidungDurchDetailId = this.ammEntscheidForm.controls.entscheidungDurch.value
            ? this.ammEntscheidForm.controls.entscheidungDurch['benutzerObject'].benutzerDetailId
            : null;
        ammEntscheidDataToSave.freigabeDurchDetailObject = this.ammEntscheidForm.controls.freigabeDurch.value
            ? this.ammEntscheidForm.controls.freigabeDurch['benutzerObject']
            : null;
        ammEntscheidDataToSave.freigabeDurchDetailId = this.ammEntscheidForm.controls.freigabeDurch.value
            ? this.ammEntscheidForm.controls.freigabeDurch['benutzerObject'].benutzerDetailId
            : null;
        ammEntscheidDataToSave.freigabedatum = this.ammEntscheidForm.controls.freigabedatum.value;
        ammEntscheidDataToSave.geldgeberId = +this.ammEntscheidForm.controls.geldgeber.value;
        ammEntscheidDataToSave.geldgeberObject = this.geldgeberOptions.find(option => option.codeId === +this.ammEntscheidForm.controls.geldgeber.value) as CodeDTO;
        ammEntscheidDataToSave.abbruchdatum = this.ammEntscheidForm.controls.abbruchdatum.value;
        ammEntscheidDataToSave.entscheidArtId = +this.ammEntscheidForm.controls.entscheidart.value;
        ammEntscheidDataToSave.entscheidArtObject = this.entscheidartOptions.find(option => option.codeId === +this.ammEntscheidForm.controls.entscheidart.value) as CodeDTO;
        ammEntscheidDataToSave.auflagen = this.prepareAuflagenValueToSave(this.ammEntscheidForm.controls.auflage.value, this.auflageMultiselectOptionsBE);
        ammEntscheidDataToSave.bemerkungen = this.prepareBemerkungenValueToSave(
            this.ammEntscheidForm.controls.ergaenzendeAngaben.value,
            this.ergaenzendeAngabenMultiselectOptionsBE
        );
        ammEntscheidDataToSave.gruende = this.prepareGruendeValueToSave(this.ammEntscheidForm.controls.begruendung.value, this.begruendungMultiselectOptionsBE);

        return ammEntscheidDataToSave;
    }

    /**
     * Create form group with formBuilder.
     *
     * @returns {FormGroup}
     * @memberof AmmSpeziellEntscheidComponent
     */
    createFormGroup() {
        return this.formBuilder.group({
            ammEntscheidNr: null,
            status: [null, Validators.required],
            entscheidungDurch: null,
            freigabeDurch: null,
            freigabedatum: null,
            transferAlk: null,
            ausrichtungVon: null,
            ausrichtungBis: null,
            geldgeber: null,
            abbruchdatum: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            ammEntscheidTyp: null,
            entscheidart: [null, Validators.required],
            auflage: null,
            begruendung: null,
            ergaenzendeAngaben: null,
            anzahlarbeitstage: null,
            beschaeftigungsgrad: null
        });
    }

    onEntscheidartChange(selectedartOptionId) {
        //BSP81 display abbruchdatum datepicker
        const selectedArtCode = this.facade.formUtilsService.getCodeByCodeId(this.entscheidartOptions, selectedartOptionId);
        this.displayDatepicker =
            selectedArtCode === AmmEntscheidCode.WIDERRUFEN || selectedArtCode === AmmEntscheidCode.ZURUECKGEZOGEN || selectedArtCode === AmmEntscheidCode.ABGEBROCHEN;

        if (this.displayDatepicker) {
            this.ammEntscheidForm.controls.abbruchdatum.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            this.ammEntscheidForm.controls.abbruchdatum.updateValueAndValidity();
        } else {
            this.ammEntscheidForm.controls.abbruchdatum.reset();
            this.ammEntscheidForm.controls.abbruchdatum.clearValidators();
            this.ammEntscheidForm.controls.abbruchdatum.updateValueAndValidity();
        }

        if (selectedartOptionId) {
            //BSP18 set Begruendung multiselect options
            const selectedartOption = this.entscheidartOptions.find(element => element.codeId === +selectedartOptionId);
            this.setBegruendungMultiselectOptions(selectedartOption);
        }

        this.setGeldgeberRequired();
    }

    onEntscheidStatusChange() {
        this.setGeldgeberRequired();
    }

    setGeldgeberRequired() {
        const statusSelectedOptionCode = this.facade.formUtilsService.getCodeByCodeId(this.statusOptions, this.ammEntscheidForm.controls.status.value);
        const artSelectedOptionCode = this.facade.formUtilsService.getCodeByCodeId(this.entscheidartOptions, this.ammEntscheidForm.controls.entscheidart.value);

        const isStatusFreigabebereit = statusSelectedOptionCode === AmmVierAugenStatusCode.FREIGABEBEREIT;
        const isArtGutgeheissenTeilweiseGutgeheissenAbgebrochen =
            artSelectedOptionCode === AmmEntscheidCode.GUTGEHEISSEN ||
            artSelectedOptionCode === AmmEntscheidCode.TEILWEISE_GUTGEHEISSEN ||
            artSelectedOptionCode === AmmEntscheidCode.ABGEBROCHEN;

        if (isStatusFreigabebereit && isArtGutgeheissenTeilweiseGutgeheissenAbgebrochen) {
            this.ammEntscheidForm.controls.geldgeber.setValidators(Validators.required);
            this.ammEntscheidForm.controls.geldgeber.updateValueAndValidity();
        } else {
            this.ammEntscheidForm.controls.geldgeber.clearValidators();
            this.ammEntscheidForm.controls.geldgeber.updateValueAndValidity();
        }
    }

    onReset() {
        if (this.ammEntscheidForm.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.ammEntscheidForm.reset(this.mapToForm(this.ammEntscheidData));
                this.setAuflageMultiselectOptions(this.auflageMultiselectOptionsBE, this.ammEntscheidData.auflagen);
                this.setBegruendungMultiselectOptions(this.ammEntscheidData.entscheidArtObject);
                this.setErgaenzendeAngabenMultiselectOptions(this.ergaenzendeAngabenMultiselectOptionsBE, this.ammEntscheidData.bemerkungen);
            });
        }
    }

    onFreigeben() {
        this.executeHttpMethod(this.ammDataService.freigebenAmmEntscheid(this.ammEntscheidId), this.getGeldgeberSuccessMessage());
    }

    getGeldgeberSuccessMessage() {
        const selectedGeldgeberOptionCode = this.facade.formUtilsService.getCodeByCodeId(this.geldgeberOptions, this.ammEntscheidForm.controls.geldgeber.value);
        if (selectedGeldgeberOptionCode === AmmGeldgeberCode.ARBEITSLOSENVERSICHERUNG) {
            return 'amm.nutzung.feedback.entscheidfreigegeben';
        } else {
            return 'amm.nutzung.feedback.entscheidfreigegebenspeichern';
        }
    }

    onUeberarbeiten() {
        this.executeHttpMethod(this.ammDataService.ueberarbeitenAmmEntscheid(this.ammEntscheidId));
    }

    onZuruecknehmen() {
        this.executeHttpMethod(this.ammDataService.zuruecknehmenAmmEntscheid(this.ammEntscheidId));
    }

    openModalLoeschen() {
        this.facade.openModalFensterService.deleteModal(() => {
            this.onAmmEntscheidLoeschen();
        });
    }

    onAmmEntscheidLoeschen() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        this.ammDataService.loeschenAmmEntscheid(this.ammEntscheidId).subscribe(
            response => {
                if (response.data) {
                    this.ammEntscheidForm.markAsPristine();
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));
                    this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.SPEZIELL_ENTSCHEID.replace(':type', this.ammEntscheidTypeCode)}`], {
                        queryParams: {
                            gfId: this.geschaeftsfallId,
                            entscheidId: this.ammEntscheidData.vorgaengerId
                        }
                    });
                } else {
                    this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgeloescht'));
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
                this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgeloescht'));
            }
        );
    }

    onErsetzen() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        this.ammDataService.ersetzenAmmEntscheid(this.ammEntscheidId).subscribe(
            response => {
                if (response.data) {
                    const newEntscheidId = response.data;
                    this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.SPEZIELL_ENTSCHEID.replace(':type', this.ammEntscheidTypeCode)}`], {
                        queryParams: {
                            gfId: this.geschaeftsfallId,
                            entscheidId: newEntscheidId
                        }
                    });

                    this.facade.notificationService.success(this.translateService.instant('amm.nutzung.feedback.entscheidersetzt'));
                    this.facade.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                } else {
                    this.facade.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
                this.facade.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
            }
        );
    }

    prepareMaske() {
        this.ammEntscheidForm.reset(this.mapToForm(this.ammEntscheidData));

        this.isEntscheidStatusFreigabebereitFreigegebenOrErsetzt = this.checkIsEntscheidStatusFreigabebereitFreigegebenOrErsetzt(this.ammEntscheidData.statusObject.code);
        this.setStatusOptions(this.allStatusOptions, this.ammEntscheidData);
        this.setAuflageMultiselectOptions(this.auflageMultiselectOptionsBE, this.ammEntscheidData.auflagen);
        this.setErgaenzendeAngabenMultiselectOptions(this.ergaenzendeAngabenMultiselectOptionsBE, this.ammEntscheidData.bemerkungen);
        if (this.ammEntscheidTypeCode === AmmMassnahmenCode.FSE) {
            this.isGesuchstypUdV = this.checkGesuchstypUebernahmeDesVerlustrisikos();
        }

        this.isGeldgeberReadonly = this.isEntscheidStatusFreigabebereitFreigegebenOrErsetzt || this.hasEntscheidVorgaenger(this.ammEntscheidData);
        this.stesInfobarService.sendLastUpdate(this.ammEntscheidData);
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));

        if (this.ammEntscheidData.statusObject.code !== AmmVierAugenStatusCode.ERSETZT) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true));
        }

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.prepareToolboxData());

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.openDmsCopyModal(this.ammEntscheidData.ammGeschaeftsfallId, this.ammEntscheidData.entscheidNr);
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(this.ammEntscheidData.ammEntscheidId, AvamCommonValueObjectsEnum.T_AMM_ENTSCHEID);
            }
        });
    }

    prepareToolboxData(): DokumentVorlageToolboxData {
        let targetEntity: DokumentVorlageActionDTO.TargetEntityEnum = null;
        const categories: VorlagenKategorie[] = [VorlagenKategorie.AMM_ENTSCHEID_ALLGEMEIN];

        switch (this.ammEntscheidTypeCode) {
            case AmmMassnahmenCode.AZ:
                targetEntity = DokumentVorlageActionDTO.TargetEntityEnum.AZENTSCHEID;
                categories.push(VorlagenKategorie.AMM_ENTSCHEID_AZ);
                break;
            case AmmMassnahmenCode.EAZ:
                targetEntity = DokumentVorlageActionDTO.TargetEntityEnum.EAZENTSCHEID;
                categories.push(VorlagenKategorie.AMM_ENTSCHEID_EAZ);
                break;
            case AmmMassnahmenCode.PEWO:
                targetEntity = DokumentVorlageActionDTO.TargetEntityEnum.PEWOENTSCHEID;
                categories.push(VorlagenKategorie.AMM_ENTSCHEID_PEWO);
                break;
            case AmmMassnahmenCode.FSE:
                targetEntity = DokumentVorlageActionDTO.TargetEntityEnum.FSEENTSCHEID;
                categories.push(VorlagenKategorie.AMM_ENTSCHEID_FSE);
                break;
            default:
                break;
        }

        return ToolboxDataHelper.createForAmm(targetEntity, categories, +this.stesId, this.ammEntscheidData.ammGeschaeftsfallId, null, this.ammEntscheidId);
    }

    openDmsCopyModal(geschaeftsfallId: number, gesuchNr: number) {
        this.facade.openModalFensterService.openDmsCopyModal(DmsMetadatenContext.DMS_CONTEXT_STES_AMM, geschaeftsfallId.toString(), gesuchNr.toString());
    }

    openHistoryModal(objId: number, objType: string) {
        this.facade.openModalFensterService.openHistoryModal(objId.toString(), objType);
    }

    hasEntscheidVorgaenger(ammEntscheidData): boolean {
        return ammEntscheidData ? !!ammEntscheidData.vorgaengerId : false;
    }

    /**
     * Set side navigation for this component
     *
     * @memberof AmmSpeziellEntscheidComponent
     */
    setSideNavigation() {
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammEntscheidTypeCode), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.ammEntscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths[`${this.ammEntscheidTypeKurzText}_GESUCH`], {
            gfId: this.geschaeftsfallId,
            entscheidId: this.ammEntscheidId
        });
        //BSP23
        if (!this.isGesuchstypUdV) {
            this.facade.navigationService.showNavigationTreeRoute(AMMPaths[`${this.ammEntscheidTypeKurzText}_KOSTEN`], {
                gfId: this.geschaeftsfallId,
                entscheidId: this.ammEntscheidId
            });
        }
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.SPEZIELL_ENTSCHEID.replace(':type', this.ammEntscheidTypeCode), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.ammEntscheidId
        });
    }

    canDeactivate(): boolean {
        return this.ammEntscheidForm.dirty;
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();

        if (this.reloadSubscription) {
            this.reloadSubscription.unsubscribe();
        }

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        if (this.languageSubscription) {
            this.languageSubscription.unsubscribe();
        }

        this.facade.fehlermeldungenService.closeMessage();

        this.facade.toolboxService.sendConfiguration([]);
        this.stesInfobarService.removeItemFromInfoPanel(this.infobartemp);
        this.stesInfobarService.sendLastUpdate({}, true);
    }

    private deactivateSpinnerAndScrollTop() {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    private executeHttpMethod = (httpMethod: Observable<any>, notificationMessage = 'common.message.datengespeichert') => {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        httpMethod.subscribe(
            response => {
                this.buttons.next(null);
                this.ammDataService.getButtonsAmmEntscheid(this.ammEntscheidId).subscribe(btnResponse => {
                    this.buttons.next(btnResponse.data);
                });

                if (response.data) {
                    this.ammEntscheidData = response.data;

                    this.facade.notificationService.success(this.translateService.instant(notificationMessage));
                    this.prepareMaske();
                } else {
                    this.facade.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
                this.facade.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
            }
        );
    };

    private initializeBenutzerTokens(speziellEntscheidData: AmmEntscheidDTO) {
        const currentUser = this.facade.authenticationService.getLoggedUser();
        const benutzerstelleId = speziellEntscheidData.ownerId ? speziellEntscheidData.ownerId : currentUser.benutzerstelleId;

        if (currentUser) {
            this.freigabeDurchSuchenTokens = {
                benutzerstelleId,
                berechtigung: Permissions.AMM_NUTZUNG_MASSNAHME_FREIGEBEN,
                myBenutzerstelleId: benutzerstelleId,
                stati: DomainEnum.BENUTZER_STATUS_AKTIV
            };

            this.entscheidungDurchSuchenTokens = {
                benutzerstelleId,
                berechtigung: Permissions.AMM_NUTZUNG_MASSNAHME_ENTSCHEIDEN,
                myBenutzerstelleId: benutzerstelleId,
                stati: DomainEnum.BENUTZER_STATUS_AKTIV
            };
        }
    }

    private patchValue() {
        if (this.ammEntscheidData && this.ammEntscheidData.entscheidTypObject) {
            this.ammEntscheidForm.patchValue({ ammEntscheidTyp: this.facade.dbTranslateService.translate(this.ammEntscheidData.entscheidTypObject, 'text') });
        }

        if (this.ammEntscheidData && !this.ammEntscheidData.transferALKDatum) {
            this.ammEntscheidForm.patchValue({ transferAlk: this.translateService.instant('amm.zahlungen.message.keinedatenuebermittelt') });
        }
    }

    private setBegruendungMultiselectOptions(entscheidArtObject: any) {
        this.facade.spinnerService.activate(this.channel);

        this.ammDataService.getAmmEntscheidGruende(this.ammEntscheidTypeCode, entscheidArtObject.code).subscribe(
            begruendungMultiselectResponse => {
                if (begruendungMultiselectResponse.data) {
                    this.begruendungMultiselectOptionsBE = begruendungMultiselectResponse.data;
                    const mappedOptions = begruendungMultiselectResponse.data.map(this.mapMultiselect);

                    mappedOptions.forEach(element => {
                        if (this.ammEntscheidData.gruende.some(el => el.grundId === element.id)) {
                            element.value = true;
                        }
                    });

                    this.begruendungMultiselectOptions = mappedOptions;
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    private mapMultiselect = element => {
        return {
            id: element.codeId,
            textDe: element.kurzTextDe,
            textIt: element.kurzTextIt,
            textFr: element.kurzTextFr,
            value: false
        };
    };

    private setAuflageMultiselectOptions(auflageMultiselectOptions: any, auflagenBe: any) {
        const mappedOptions = auflageMultiselectOptions.map(this.mapMultiselect);

        mappedOptions.forEach(element => {
            if (auflagenBe.some(el => el.auflageId === element.id)) {
                element.value = true;
            }
        });

        this.auflageMultiselectOptions = mappedOptions;
    }

    private setErgaenzendeAngabenMultiselectOptions(ergaenzendeAngabenMultiselectOptions: any, bemerkungenBe: any) {
        const mappedOptions = ergaenzendeAngabenMultiselectOptions.map(this.mapMultiselect);

        mappedOptions.forEach(element => {
            if (bemerkungenBe.some(el => el.bemerkungId === element.id)) {
                element.value = true;
            }
        });

        this.ergaenzendeAngabenMultiselectOptions = mappedOptions;
    }

    private setStatusOptions(allStatusOptions, ammEntscheidData: AmmEntscheidDTO) {
        if (ammEntscheidData.statusObject.code === AmmVierAugenStatusCode.INUEBERARBEITUNG) {
            this.statusOptions = allStatusOptions.filter(
                option =>
                    option.code === AmmVierAugenStatusCode.FREIGABEBEREIT ||
                    option.code === AmmVierAugenStatusCode.PENDENT ||
                    option.code === AmmVierAugenStatusCode.INUEBERARBEITUNG
            );
        } else if (!this.isEntscheidStatusFreigabebereitFreigegebenOrErsetzt) {
            this.statusOptions = allStatusOptions.filter(option => option.code === AmmVierAugenStatusCode.FREIGABEBEREIT || option.code === AmmVierAugenStatusCode.PENDENT);
        } else {
            this.statusOptions = this.allStatusOptions.slice();
        }
    }

    private checkIsEntscheidStatusFreigabebereit(entscheidStatus: any): boolean {
        return entscheidStatus === AmmVierAugenStatusCode.FREIGABEBEREIT;
    }

    private checkIsEntscheidStatusFreigabebereitFreigegebenOrErsetzt(entscheidStatus: any): boolean {
        const entscheidFreigabebereit = this.checkIsEntscheidStatusFreigabebereit(entscheidStatus);

        return entscheidFreigabebereit || entscheidStatus === AmmVierAugenStatusCode.FREIGEGEBEN || entscheidStatus === AmmVierAugenStatusCode.ERSETZT;
    }

    private prepareAuflagenValueToSave(auflagenValueForm, auflagenOptionsBE) {
        const auflagen: AmmEntscheidAuflagenDTO[] = [];

        auflagenOptionsBE.filter((element, index) => {
            if (auflagenValueForm.some(el => el.value && el.id === element.codeId)) {
                const ammEntscheidAuflagenDTO: AmmEntscheidAuflagenDTO = {
                    auflageId: element.codeId,
                    ammEntscheidId: this.ammEntscheidId,
                    auflageObject: element,
                    index
                };

                auflagen.push(ammEntscheidAuflagenDTO);
            }
        });

        return auflagen;
    }

    private prepareBemerkungenValueToSave(bemerkungenValueForm, bemerkungenOptionsBE) {
        const bemerkungen: AmmEntscheidBemerkungDTO[] = [];

        bemerkungenOptionsBE.filter((element, index) => {
            if (bemerkungenValueForm.some(el => el.value && el.id === element.codeId)) {
                const ammEntscheidBemerkungDTO: AmmEntscheidBemerkungDTO = {
                    bemerkungId: element.codeId,
                    ammEntscheidId: this.ammEntscheidId,
                    bemerkungObject: element,
                    index
                };

                bemerkungen.push(ammEntscheidBemerkungDTO);
            }
        });

        return bemerkungen;
    }

    private prepareGruendeValueToSave(gruendeValueForm, gruendeOptionsBE) {
        const gruende: AmmEntscheidGruendeDTO[] = [];

        gruendeOptionsBE.filter((element, index) => {
            if (gruendeValueForm.some(el => el.value && el.id === element.codeId)) {
                const ammEntscheidGruendeDTO: AmmEntscheidGruendeDTO = {
                    grundId: element.codeId,
                    ammEntscheidId: this.ammEntscheidId,
                    grundObject: element,
                    index
                };

                gruende.push(ammEntscheidGruendeDTO);
            }
        });

        return gruende;
    }

    private setTransferAlk(transferALKcode: number, transferALKDatum: Date): string {
        const codeObj = this.alkOptions.find(element => +element.code === transferALKcode);
        let alkText = `${this.facade.dbTranslateService.translate(codeObj, 'kurzText')} `;

        if (transferALKcode === TransferALKCodeEnum.DATEN_UEBERMITTELT_AM) {
            alkText += this.facade.formUtilsService.formatDateNgx(transferALKDatum, 'DD.MM.YYYY');
        }

        return alkText;
    }

    private checkAmmEntscheidTypeFse(): boolean {
        return this.ammEntscheidTypeCode === AmmMassnahmenCode.FSE;
    }

    private checkAmmEntscheidTypeEaz(): boolean {
        return this.ammEntscheidTypeCode === AmmMassnahmenCode.EAZ;
    }

    private setUeberschrift() {
        let ueberschrift: string;

        switch (this.ammEntscheidTypeCode) {
            case AmmMassnahmenCode.AZ:
                ueberschrift = `${this.facade.dbTranslateService.instant('stes.subnavmenuitem.stesAmm.azEntscheidHeader')}`;
                break;
            case AmmMassnahmenCode.EAZ:
                ueberschrift = `${this.facade.dbTranslateService.instant('stes.subnavmenuitem.stesAmm.eazEntscheidHeader')}`;
                break;
            case AmmMassnahmenCode.FSE:
                ueberschrift = `${this.facade.dbTranslateService.instant('stes.subnavmenuitem.stesAmm.fseEntscheidHeader')}`;
                break;
            case AmmMassnahmenCode.PEWO:
                ueberschrift = `${this.facade.dbTranslateService.instant('stes.subnavmenuitem.stesAmm.pewoEntscheidHeader')}`;
                break;
        }

        this.stesInfobarService.sendDataToInfobar({ title: ueberschrift });
    }

    private checkGesuchstypUebernahmeDesVerlustrisikos(): boolean {
        return this.ammEntscheidData.ammGeschaeftsfallObject.ammGesuchFse.typIdObject.code === AmmGesuchstypFseCodeEnum.UEBERNAHMEDESVERLUSTRISIKOS;
    }
}
