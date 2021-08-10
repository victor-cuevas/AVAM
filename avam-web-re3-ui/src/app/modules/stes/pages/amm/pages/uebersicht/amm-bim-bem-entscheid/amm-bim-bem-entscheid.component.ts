import { Permissions } from '@app/shared/enums/permissions.enum';
import { TransferALKCodeEnum } from '@app/shared/enums/domain-code/transfer-alk-code.enum';
import { AmmEntscheidDTO } from '@app/shared/models/dtos-generated/ammEntscheidDTO';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { SpinnerService } from 'oblique-reactive';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { forkJoin, Observable, Subject, Subscription } from 'rxjs';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { AmmEntscheidCode } from '@app/shared/enums/domain-code/amm-entscheid-code.enum';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AmmVierAugenStatusCode } from '@app/shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { DateValidator } from '@app/shared/validators/date-validator';
import { AmmEntscheidAuflagenDTO } from '@app/shared/models/dtos-generated/ammEntscheidAuflagenDTO';
import { AmmEntscheidBemerkungDTO } from '@app/shared/models/dtos-generated/ammEntscheidBemerkungDTO';
import { AmmEntscheidGruendeDTO } from '@app/shared/models/dtos-generated/ammEntscheidGruendeDTO';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { AMMLabels } from '@shared/enums/stes-routing-labels.enum';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { AmmEntscheidTypCode } from '@app/shared/enums/domain-code/amm-entscheid-typ.code.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { AmmGeldgeberCode } from '@app/shared/enums/domain-code/amm-geldgeber-code.enum';
import { AmmFinanzierungsquelleCode } from '@app/shared/enums/domain-code/amm-finanzierungsquelle-code.enum';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { GenericConfirmComponent } from '@app/shared';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { FacadeService } from '@shared/services/facade.service';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';

@Component({
    selector: 'avam-bim-bem-entscheid',
    templateUrl: './amm-bim-bem-entscheid.component.html',
    styleUrls: ['./amm-bim-bem-entscheid.component.scss'],
    providers: [ObliqueHelperService]
})
export class AmmBimBemEntscheidComponent extends AmmCloseableAbstract implements OnInit, OnDestroy, DeactivationGuarded {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('infobartemp') infobartemp: TemplateRef<any>;

    /**
     * Tracks the value and validity state of a group of FormControl instances.
     *
     * @memberof AmmBimBemEntscheidComponent
     */
    bimBemEntscheidForm: FormGroup;

    /**
     * Current component channel.
     *
     * @memberof AmmBimBemEntscheidComponent
     */
    channel = 'bim-bem-entscheid-channel';

    /**
     *  Tracks the state of the form if it is submitted.
     *
     * @memberof AmmBimBemEntscheidComponent
     */
    submitted = false;

    bimBemEntscheidData: AmmEntscheidDTO;
    displayDatepicker = false;
    bimBemEntscheidId: number;
    geschaeftsfallId: number;
    languageSubscription: Subscription;
    observeClickActionSub: Subscription;
    isGeldgeberReadonly = false;
    isGeldgeberArbeitslosenversicherung = false;

    statusOptions: any[] = [];
    allStatusOptions: any[] = [];
    freigabeDurchSuchenTokens: {};
    entscheidungDurchSuchenTokens: {};
    geldgeberOptions: any[] = [];
    finanzierungsquelleOptions: any[] = [];
    entscheidartOptions: any[] = [];
    entscheidartOptionsAll: any[] = [];
    auflageMultiselectOptions = [];
    begruendungMultiselectOptions = [];
    ergaenzendeAngabenMultiselectOptions = [];
    alkOptions: any[] = [];
    entscheidTypOptions: any[] = [];

    auflageMultiselectOptionsBE = [];
    ergaenzendeAngabenMultiselectOptionsBE = [];
    begruendungMultiselectOptionsBE = [];

    buttons: Subject<any[]> = new Subject();
    ammButtonsTypeEnum = AmmButtonsTypeEnum;

    isEntscheidStatusFreigabebereitFreigegebenOrErsetzt = false;
    isBimBemEntscheidTypeBP: boolean;
    isBimBemEntscheidTypeKursIndividuell: boolean;
    isGesuchstypUdV: boolean;
    vorgaengerEntscheidId: number;
    nachfolgerEntscheidId: number;
    vorgaengerGeschaeftsfallId: number;
    nachfolgerGeschaeftsfallId: number;

    defaultBeschaeftigungsgrad = 100;
    reloadSubscription: Subscription;
    basisNr: number;
    displayBeschaeftigungsgrad: boolean;
    displayVermittlungsfaehigkeit: boolean;
    ammMassnahmenType: string;

    vermittlungsfaehigkeitOptions: any[] = [
        {
            value: true,
            labelFr: 'libéré',
            labelIt: 'esonerato',
            labelDe: 'befreit'
        },
        {
            value: false,
            labelFr: 'non libéré',
            labelIt: 'non esonerato',
            labelDe: 'nicht befreit'
        }
    ];
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;
    dokumentVorlageMap = {
        [AmmMassnahmenCode.AP]: { targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.APENTSCHEID, category: VorlagenKategorie.AMM_ENTSCHEID_AP },
        [AmmMassnahmenCode.INDIVIDUELL_AP]: { targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.APINDENTSCHEID, category: VorlagenKategorie.AMM_ENTSCHEID_AP_IND },
        [AmmMassnahmenCode.BP]: { targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.BPENTSCHEID, category: VorlagenKategorie.AMM_ENTSCHEID_BP },
        [AmmMassnahmenCode.INDIVIDUELL_BP]: { targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.BPINDENTSCHEID, category: VorlagenKategorie.AMM_ENTSCHEID_BP_IND },
        [AmmMassnahmenCode.KURS]: { targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.KURSENTSCHEID, category: VorlagenKategorie.AMM_ENTSCHEID_KURS },
        [AmmMassnahmenCode.INDIVIDUELL_KURS]: {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.KURSINDENTSCHEID,
            category: VorlagenKategorie.AMM_ENTSCHEID_KURS_IND
        },
        [AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT]: {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.KURSINDIAENTSCHEID,
            category: VorlagenKategorie.AMM_ENTSCHEID_KURS_IND
        },
        [AmmMassnahmenCode.UEF]: { targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.UEFENTSCHEID, category: VorlagenKategorie.AMM_ENTSCHEID_UEF },
        [AmmMassnahmenCode.PVB]: { targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.PVBENTSCHEID, category: VorlagenKategorie.AMM_ENTSCHEID_PVB },
        [AmmMassnahmenCode.SEMO]: { targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.SEMOENTSCHEID, category: VorlagenKategorie.AMM_ENTSCHEID_SEMO }
    };

    constructor(
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private dataRestService: StesDataRestService,
        private obliqueHelper: ObliqueHelperService,
        private modalService: NgbModal,
        protected facade: FacadeService,
        protected router: Router,
        private ammDataService: AmmRestService,
        private stesInfobarService: AvamStesInfoBarService,
        protected interactionService: StesComponentInteractionService
    ) {
        super(facade, router, interactionService);
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;

        this.reloadSubscription = ReloadHelper.enable(this.router, this.unsubscribe, () => {
            this.setSideNavigation();
            this.getData();
        });

        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.route.paramMap.subscribe(params => {
            this.ammMassnahmenType = params.get('type');
            // angular does not support reverse mapping for string enums
            this.ammEntscheidTypeCode = AmmMassnahmenCode[Object.keys(AmmMassnahmenCode).find(key => AmmMassnahmenCode[key] === this.ammMassnahmenType)];
        });

        this.route.queryParamMap.subscribe(params => {
            this.geschaeftsfallId = params.get('gfId') ? +params.get('gfId') : null;
            this.bimBemEntscheidId = params.get('entscheidId') ? +params.get('entscheidId') : null;
            this.isBimBemEntscheidTypeBP = this.checkBimBemEntscheidTypeBP();
            this.isBimBemEntscheidTypeKursIndividuell = this.checkBimBemEntscheidTypeKursIndividuell();
            this.displayBeschaeftigungsgrad = this.checkDisplayBeschaeftigungsgrad();
            this.displayVermittlungsfaehigkeit = this.checkDisplayVermittlungsfaehigkeit();
        });

        this.setSideNavigation();
        this.bimBemEntscheidForm = this.createFormGroup();
        this.getData();

        this.languageSubscription = this.facade.dbTranslateService.getEventEmitter().subscribe(() => {
            this.patchValue();
            this.setUeberschrift();
        });
        super.ngOnInit();
    }

    isOurLabel(message) {
        return (
            this.isLabelKursIndividuell(message) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.KOLLEKTIV_KURS) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.UEF) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.KOLLEKTIV_AP) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.PVB) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.SEMO) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.KOLLEKTIV_BP)
        );
    }

    isOurUrl(): boolean {
        return (
            this.router.url.includes(AMMPaths.INDIVIDUELL_BUCHUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.BESCHREIBUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.INDIVIDUELL_DURCHFUHRUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.KOLLEKTIV_BUCHUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.KOLLEKTIV_DURCHFUHRUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.INDIVIDUELL_KOSTEN.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.SPESEN.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.BIM_BEM_ENTSCHEID.replace(':type', this.ammMassnahmenType))
        );
    }

    isLabelKursIndividuell(message: any): boolean {
        return (
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_KURS) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_AP) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_BP) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_KURS_IN_ANGEBOT)
        );
    }

    /**
     * HTTP GET call.
     *
     * @memberof AmmBimBemEntscheidComponent
     */
    getData() {
        this.facade.spinnerService.activate(this.channel);
        forkJoin([
            this.ammDataService.getAmmEntscheidTypen(this.ammMassnahmenType),
            this.ammDataService.getAmmEntscheidArten(this.ammMassnahmenType, this.bimBemEntscheidId),
            this.dataRestService.getCode(DomainEnum.INSTITUTION),
            this.dataRestService.getCode(DomainEnum.FINANZIERUNGSQUELLE),
            this.dataRestService.getCode(DomainEnum.VIERAUGENSTATUS),
            this.dataRestService.getCode(DomainEnum.AMMENTSCHEIDAUFLAGE),
            this.dataRestService.getCode(DomainEnum.AMMENTSCHEIDBEMERKUNG),
            this.dataRestService.getCode(DomainEnum.TRANSFER_ALK),
            this.ammDataService.getAmmEntscheid(this.bimBemEntscheidId)
        ]).subscribe(
            ([
                entscheidTypOptions,
                entscheidartOptions,
                geldgeberOptions,
                finanzierungsquelleOptions,
                statusOptions,
                auflageMultiselectOptions,
                ergaenzendeAngabenMultiselectOptions,
                alkOptions,
                resEntscheid
            ]) => {
                this.entscheidTypOptions = entscheidTypOptions.data ? this.facade.formUtilsService.mapDropdownKurztext(entscheidTypOptions.data) : null;
                this.entscheidartOptions = entscheidartOptions.data ? this.facade.formUtilsService.mapDropdownKurztext(entscheidartOptions.data) : null;
                this.entscheidartOptionsAll = entscheidartOptions.data ? this.facade.formUtilsService.mapDropdownKurztext(entscheidartOptions.data) : null;
                this.geldgeberOptions = this.facade.formUtilsService.mapDropdown(geldgeberOptions);
                this.finanzierungsquelleOptions = this.facade.formUtilsService.mapDropdownKurztext(finanzierungsquelleOptions);
                this.allStatusOptions = this.facade.formUtilsService.mapDropdownKurztext(statusOptions);
                this.statusOptions = this.allStatusOptions.slice();
                this.alkOptions = alkOptions;
                this.buttons.next(null);
                if (resEntscheid.data) {
                    this.bimBemEntscheidData = resEntscheid.data;
                    this.initializeBenutzerTokens(this.bimBemEntscheidData);
                    this.basisNr = this.bimBemEntscheidData.ammGeschaeftsfallObject.basisNr;
                    this.stesInfobarService.sendLastUpdate(this.bimBemEntscheidData);
                    this.ammDataService.getButtonsAmmEntscheid(this.bimBemEntscheidData.ammEntscheidId).subscribe(btnResponse => {
                        this.buttons.next(btnResponse.data);
                    });
                    this.vorgaengerEntscheidId = this.bimBemEntscheidData.vorgaengerId;
                    this.nachfolgerEntscheidId = this.bimBemEntscheidData.nachfolgerId;
                    this.vorgaengerGeschaeftsfallId = this.bimBemEntscheidData.vorgaengerObject ? this.bimBemEntscheidData.vorgaengerObject.ammGeschaeftsfallId : null;
                    this.nachfolgerGeschaeftsfallId = this.bimBemEntscheidData.nachfolgerObject ? this.bimBemEntscheidData.nachfolgerObject.ammGeschaeftsfallId : null;
                    this.auflageMultiselectOptionsBE = auflageMultiselectOptions;
                    this.ergaenzendeAngabenMultiselectOptionsBE = ergaenzendeAngabenMultiselectOptions;
                    this.stesInfobarService.addItemToInfoPanel(this.infobartemp);
                    this.prepareMaske();
                }
                this.configureToolbox();
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
     * @memberof AmmBimBemEntscheidComponent
     */
    onSubmit() {
        this.facade.fehlermeldungenService.closeMessage();
        this.submitted = true;

        if (this.bimBemEntscheidForm.invalid) {
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
     * @memberof AmmBimBemEntscheidComponent
     */
    onSave() {
        this.executeHttpMethod(this.ammDataService.updateAmmEntscheid(this.mapToDTO()));
    }

    /**
     * Map data from backend to form object.
     *
     * @memberof AmmBimBemEntscheidComponent
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
            ausrichtungszeitraum: data.ammKosten ? this.facade.formUtilsService.formatNumber(data.ammKosten.ausrichtungszeitraumInMonaten, 1) : null,
            geldgeber: data.geldgeberId ? data.geldgeberId : null,
            finanzierungsquelle: data.finanzierungsquelleId ? data.finanzierungsquelleId : null,
            vermittlungsfaehigkeit: data.vermittlungFaehigkeit,
            abbruchdatum: this.facade.formUtilsService.parseDate(data.abbruchdatum),
            ammEntscheidTyp: data.entscheidTypId,
            entscheidart: data.entscheidArtId,
            auflage: null,
            begruendung: null,
            ergaenzendeAngaben: null
        };
    }

    /**
     * Map form object to backend.
     *
     * @memberof AmmBimBemEntscheidComponent
     */
    mapToDTO(): AmmEntscheidDTO {
        const bimBemEntscheidDataToSave = { ...this.bimBemEntscheidData };

        bimBemEntscheidDataToSave.entscheidTypId = +this.bimBemEntscheidForm.controls.ammEntscheidTyp.value;
        bimBemEntscheidDataToSave.entscheidTypObject = this.entscheidTypOptions.find(
            option => option.codeId === +this.bimBemEntscheidForm.controls.ammEntscheidTyp.value
        ) as CodeDTO;
        bimBemEntscheidDataToSave.statusId = +this.bimBemEntscheidForm.controls.status.value;
        bimBemEntscheidDataToSave.statusObject = this.statusOptions.find(option => option.codeId === +this.bimBemEntscheidForm.controls.status.value) as CodeDTO;
        bimBemEntscheidDataToSave.entscheidungDurchDetailObject = this.bimBemEntscheidForm.controls.entscheidungDurch.value
            ? this.bimBemEntscheidForm.controls.entscheidungDurch['benutzerObject']
            : null;
        bimBemEntscheidDataToSave.entscheidungDurchDetailId = this.bimBemEntscheidForm.controls.entscheidungDurch.value
            ? this.bimBemEntscheidForm.controls.entscheidungDurch['benutzerObject'].benutzerDetailId
            : null;
        bimBemEntscheidDataToSave.freigabeDurchDetailObject = this.bimBemEntscheidForm.controls.freigabeDurch.value
            ? this.bimBemEntscheidForm.controls.freigabeDurch['benutzerObject']
            : null;
        bimBemEntscheidDataToSave.freigabeDurchDetailId = this.bimBemEntscheidForm.controls.freigabeDurch.value
            ? this.bimBemEntscheidForm.controls.freigabeDurch['benutzerObject'].benutzerDetailId
            : null;
        bimBemEntscheidDataToSave.freigabedatum = this.bimBemEntscheidForm.controls.freigabedatum.value;
        bimBemEntscheidDataToSave.geldgeberId = +this.bimBemEntscheidForm.controls.geldgeber.value;
        bimBemEntscheidDataToSave.geldgeberObject = this.geldgeberOptions.find(option => option.codeId === +this.bimBemEntscheidForm.controls.geldgeber.value) as CodeDTO;
        bimBemEntscheidDataToSave.finanzierungsquelleId = +this.bimBemEntscheidForm.controls.finanzierungsquelle.value;
        bimBemEntscheidDataToSave.finanzierungsquelleObject = this.finanzierungsquelleOptions.find(
            option => option.codeId === +this.bimBemEntscheidForm.controls.finanzierungsquelle.value
        ) as CodeDTO;
        bimBemEntscheidDataToSave.vermittlungFaehigkeit = this.bimBemEntscheidForm.controls.vermittlungsfaehigkeit.value;
        bimBemEntscheidDataToSave.abbruchdatum = this.bimBemEntscheidForm.controls.abbruchdatum.value;
        bimBemEntscheidDataToSave.entscheidArtId = +this.bimBemEntscheidForm.controls.entscheidart.value;
        bimBemEntscheidDataToSave.entscheidArtObject = this.entscheidartOptions.find(option => option.codeId === +this.bimBemEntscheidForm.controls.entscheidart.value) as CodeDTO;
        bimBemEntscheidDataToSave.auflagen = this.prepareAuflagenValueToSave(this.bimBemEntscheidForm.controls.auflage.value, this.auflageMultiselectOptionsBE);
        bimBemEntscheidDataToSave.bemerkungen = this.prepareBemerkungenValueToSave(
            this.bimBemEntscheidForm.controls.ergaenzendeAngaben.value,
            this.ergaenzendeAngabenMultiselectOptionsBE
        );
        bimBemEntscheidDataToSave.gruende = this.prepareGruendeValueToSave(this.bimBemEntscheidForm.controls.begruendung.value, this.begruendungMultiselectOptionsBE);

        return bimBemEntscheidDataToSave;
    }

    /**
     * Create form group with formBuilder.
     *
     * @returns {FormGroup}
     * @memberof AmmBimBemEntscheidComponent
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
            ausrichtungszeitraum: null,
            geldgeber: null,
            vermittlungsfaehigkeit: [null, Validators.required],
            abbruchdatum: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            ammEntscheidTyp: [null, Validators.required],
            entscheidart: [null, Validators.required],
            auflage: null,
            begruendung: null,
            ergaenzendeAngaben: null,
            finanzierungsquelle: null
        });
    }

    onEntscheidartChange(selectedArtOptionId) {
        //BSP81 display abbruchdatum datepicker
        const selectedArtCode = this.facade.formUtilsService.getCodeByCodeId(this.entscheidartOptions, selectedArtOptionId);
        this.displayDatepicker =
            selectedArtCode === AmmEntscheidCode.WIDERRUFEN || selectedArtCode === AmmEntscheidCode.ZURUECKGEZOGEN || selectedArtCode === AmmEntscheidCode.ABGEBROCHEN;

        if (this.displayDatepicker) {
            this.bimBemEntscheidForm.controls.abbruchdatum.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            this.bimBemEntscheidForm.controls.abbruchdatum.updateValueAndValidity();
        } else {
            this.bimBemEntscheidForm.controls.abbruchdatum.reset();
            this.bimBemEntscheidForm.controls.abbruchdatum.clearValidators();
            this.bimBemEntscheidForm.controls.abbruchdatum.updateValueAndValidity();
        }

        if (selectedArtOptionId) {
            //BSP18 set Begruendung multiselect options
            const selectedArtOption = this.entscheidartOptions.find(element => element.codeId === +selectedArtOptionId);
            this.setBegruendungMultiselectOptions(selectedArtOption, true);
        }

        this.setGeldgeberRequired();
    }

    onEntscheidStatusChange() {
        this.setGeldgeberRequired();
    }

    // Change Request CRAMRE3-1407
    onGeldgeberChange(selectedGeldgeberOptionId) {
        const selectedGeldgeberOptionCode = this.facade.formUtilsService.getCodeByCodeId(this.geldgeberOptions, selectedGeldgeberOptionId);

        // BSP 101
        if (selectedGeldgeberOptionCode === AmmGeldgeberCode.ARBEITSLOSENVERSICHERUNG) {
            this.isGeldgeberArbeitslosenversicherung = true;
            this.bimBemEntscheidForm.controls.finanzierungsquelle.setValidators(Validators.required);
            this.bimBemEntscheidForm.controls.finanzierungsquelle.updateValueAndValidity();

            if (!this.bimBemEntscheidForm.controls.finanzierungsquelle.value) {
                const defaultFinanzierungsquelle = this.finanzierungsquelleOptions.find(fquelle => fquelle.code === AmmFinanzierungsquelleCode.ORDENTLICH);
                this.bimBemEntscheidForm.controls.finanzierungsquelle.setValue(defaultFinanzierungsquelle.codeId);
            }
        } else {
            // BSP 102
            this.isGeldgeberArbeitslosenversicherung = false;
            this.bimBemEntscheidForm.controls.finanzierungsquelle.clearValidators();
            this.bimBemEntscheidForm.controls.finanzierungsquelle.updateValueAndValidity();
            this.bimBemEntscheidForm.controls.finanzierungsquelle.reset();
        }
    }

    setGeldgeberRequired() {
        const statusSelectedOptionCode = this.facade.formUtilsService.getCodeByCodeId(this.statusOptions, this.bimBemEntscheidForm.controls.status.value);
        const artSelectedOptionCode = this.facade.formUtilsService.getCodeByCodeId(this.entscheidartOptions, this.bimBemEntscheidForm.controls.entscheidart.value);

        const isStatusFreigabebereit = statusSelectedOptionCode === AmmVierAugenStatusCode.FREIGABEBEREIT;
        const isArtGutgeheissenTeilweiseGutgeheissenAbgebrochenAngewiesen =
            artSelectedOptionCode === AmmEntscheidCode.GUTGEHEISSEN ||
            artSelectedOptionCode === AmmEntscheidCode.TEILWEISE_GUTGEHEISSEN ||
            artSelectedOptionCode === AmmEntscheidCode.ABGEBROCHEN ||
            artSelectedOptionCode === AmmEntscheidCode.ANGEWIESEN;

        if (isStatusFreigabebereit && isArtGutgeheissenTeilweiseGutgeheissenAbgebrochenAngewiesen) {
            this.bimBemEntscheidForm.controls.geldgeber.setValidators(Validators.required);
            this.bimBemEntscheidForm.controls.geldgeber.updateValueAndValidity();
        } else {
            this.bimBemEntscheidForm.controls.geldgeber.clearValidators();
            this.bimBemEntscheidForm.controls.geldgeber.updateValueAndValidity();
        }
    }

    onEntscheidTypChange(entscheidTypId) {
        const entscheidTypCode = this.facade.formUtilsService.getCodeByCodeId(this.entscheidTypOptions, entscheidTypId);

        if (entscheidTypCode === AmmEntscheidTypCode.VERFUEGUNG) {
            this.entscheidartOptions = this.entscheidartOptionsAll.filter(o => o.code !== AmmEntscheidCode.ANGEWIESEN);
        } else if (entscheidTypCode === AmmEntscheidTypCode.ZUWEISUNG_ZUR_AMM || entscheidTypCode === AmmEntscheidTypCode.ZUWEISUNG_ZUM_VORSTELLUNGSGESPRAECH) {
            this.entscheidartOptions = this.entscheidartOptionsAll.filter(
                o =>
                    o.code !== AmmEntscheidCode.GUTGEHEISSEN &&
                    o.code !== AmmEntscheidCode.TEILWEISE_GUTGEHEISSEN &&
                    o.code !== AmmEntscheidCode.ABGEWIESEN &&
                    o.code !== AmmEntscheidCode.NICHT_EINGETRETEN
            );
        }

        if (this.entscheidartOptions && this.entscheidartOptions.length > 0 && this.entscheidartOptions[0]) {
            this.bimBemEntscheidForm.controls.entscheidart.setValue(this.entscheidartOptions[0].value);
        }
    }

    onReset() {
        if (this.bimBemEntscheidForm.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.bimBemEntscheidForm.reset(this.mapToForm(this.bimBemEntscheidData));
                this.setAuflageMultiselectOptions(this.auflageMultiselectOptionsBE, this.bimBemEntscheidData.auflagen);
                this.setBegruendungMultiselectOptions(this.bimBemEntscheidData.entscheidArtObject);
                this.setErgaenzendeAngabenMultiselectOptions(this.ergaenzendeAngabenMultiselectOptionsBE, this.bimBemEntscheidData.bemerkungen);
                this.setAbbruchdatum();
            });
        }
    }

    onFreigeben() {
        this.executeHttpMethod(this.ammDataService.freigebenAmmEntscheid(this.bimBemEntscheidId), this.getGeldgeberSuccessMessage());
    }

    onUeberarbeiten() {
        this.executeHttpMethod(this.ammDataService.ueberarbeitenAmmEntscheid(this.bimBemEntscheidId));
    }

    onZuruecknehmen() {
        this.executeHttpMethod(this.ammDataService.zuruecknehmenAmmEntscheid(this.bimBemEntscheidId));
    }

    openModalLoeschen() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.onAmmEntscheidLoeschen();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    onAmmEntscheidLoeschen() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        this.ammDataService.loeschenAmmEntscheid(this.bimBemEntscheidId).subscribe(
            response => {
                if (response.data) {
                    this.bimBemEntscheidForm.markAsPristine();
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));
                    this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.BIM_BEM_ENTSCHEID.replace(':type', this.ammMassnahmenType)}`], {
                        queryParams: {
                            gfId: this.geschaeftsfallId,
                            entscheidId: this.bimBemEntscheidData.vorgaengerId
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

        this.ammDataService.ersetzenAmmEntscheid(this.bimBemEntscheidId).subscribe(
            response => {
                if (response.data) {
                    const newEntscheidId = response.data;
                    this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.BIM_BEM_ENTSCHEID.replace(':type', this.ammMassnahmenType)}`], {
                        queryParams: {
                            gfId: this.geschaeftsfallId,
                            entscheidId: newEntscheidId
                        }
                    });

                    this.facade.notificationService.success(this.facade.translateService.instant('amm.nutzung.feedback.entscheidersetzt'));
                    this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                } else {
                    this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
                this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
            }
        );
    }

    prepareMaske() {
        this.bimBemEntscheidForm.reset(this.mapToForm(this.bimBemEntscheidData));

        this.isEntscheidStatusFreigabebereitFreigegebenOrErsetzt = this.checkIsEntscheidStatusFreigabebereitFreigegebenOrErsetzt(this.bimBemEntscheidData.statusObject.code);
        this.setStatusOptions(this.allStatusOptions, this.bimBemEntscheidData);
        this.setAuflageMultiselectOptions(this.auflageMultiselectOptionsBE, this.bimBemEntscheidData.auflagen);
        this.setErgaenzendeAngabenMultiselectOptions(this.ergaenzendeAngabenMultiselectOptionsBE, this.bimBemEntscheidData.bemerkungen);
        this.setAbbruchdatum();

        this.setUeberschrift();

        this.isGeldgeberReadonly = this.isEntscheidStatusFreigabebereitFreigegebenOrErsetzt || this.hasEntscheidVorgaenger(this.bimBemEntscheidData);
        this.stesInfobarService.sendLastUpdate(this.bimBemEntscheidData);
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));

        if (this.bimBemEntscheidData.statusObject.code !== AmmVierAugenStatusCode.ERSETZT) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true));
        }

        this.facade.toolboxService.sendConfiguration(
            toolboxConfig,
            this.channel,
            ToolboxDataHelper.createForAmm(
                this.dokumentVorlageMap[this.ammMassnahmenType].targetEntity,
                [VorlagenKategorie.AMM_ENTSCHEID_ALLGEMEIN, this.dokumentVorlageMap[this.ammMassnahmenType].category],
                +this.stesId,
                this.geschaeftsfallId,
                null,
                this.bimBemEntscheidId
            )
        );

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.openDmsCopyModal(this.bimBemEntscheidData.ammGeschaeftsfallId, this.bimBemEntscheidData.entscheidNr);
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(this.bimBemEntscheidData.ammEntscheidId, AvamCommonValueObjectsEnum.T_AMM_ENTSCHEID);
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

    hasEntscheidVorgaenger(bimBemEntscheidData): boolean {
        return bimBemEntscheidData ? !!bimBemEntscheidData.vorgaengerId : false;
    }

    canDeactivate(): boolean {
        return this.bimBemEntscheidForm.dirty;
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
        super.ngOnDestroy();
    }

    private getGeldgeberSuccessMessage() {
        const selectedGeldgeberOptionCode = this.facade.formUtilsService.getCodeByCodeId(this.geldgeberOptions, this.bimBemEntscheidForm.controls.geldgeber.value);
        if (selectedGeldgeberOptionCode === AmmGeldgeberCode.ARBEITSLOSENVERSICHERUNG) {
            return 'amm.nutzung.feedback.entscheidfreigegeben';
        } else {
            return 'amm.nutzung.feedback.entscheidfreigegebenspeichern';
        }
    }

    private deactivateSpinnerAndScrollTop() {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    /**
     * Set side navigation for this component
     *
     * @memberof AmmBimBemEntscheidComponent
     */
    private setSideNavigation() {
        this.showNavigationTreeRoute(AMMPaths.AMM_GENERAL);
        if (
            this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS ||
            this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_AP ||
            this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_BP
        ) {
            this.showNavigationTreeRoute(AMMPaths.INDIVIDUELL_BUCHUNG);
            this.showNavigationTreeRoute(AMMPaths.BESCHREIBUNG);
            this.showNavigationTreeRoute(AMMPaths.INDIVIDUELL_DURCHFUHRUNG);
            this.showSideNavigationKosten();
        } else if (this.ammMassnahmenType === AmmMassnahmenCode.KURS || this.ammMassnahmenType === AmmMassnahmenCode.AP || this.ammMassnahmenType === AmmMassnahmenCode.BP) {
            this.showNavigationTreeRoute(AMMPaths.KOLLEKTIV_BUCHUNG);
            this.showNavigationTreeRoute(AMMPaths.BESCHREIBUNG);
            this.showNavigationTreeRoute(AMMPaths.KOLLEKTIV_DURCHFUHRUNG);
        } else if (this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT) {
            this.showNavigationTreeRoute(AMMPaths.KURS_INDIV_IM_ANGEBOT_BUCHUNG);
            this.showNavigationTreeRoute(AMMPaths.KURS_INDIV_IM_ANGEBOT_BESCHREIBUNG);
            this.showNavigationTreeRoute(AMMPaths.KURS_INDIV_IM_ANGEBOT_DURCHFUEHRUNGSORT);
            this.showSideNavigationKosten();
        }
        this.setSideNavPsAk();
        this.showSideNavigationTeilnehmer();
        this.showNavigationTreeRoute(AMMPaths.SPESEN);
        this.showNavigationTreeRoute(AMMPaths.BIM_BEM_ENTSCHEID);
    }

    private setSideNavPsAk() {
        if (
            this.ammMassnahmenType === AmmMassnahmenCode.PVB ||
            this.ammMassnahmenType === AmmMassnahmenCode.SEMO ||
            this.ammMassnahmenType === AmmMassnahmenCode.BP ||
            this.ammMassnahmenType === AmmMassnahmenCode.AP ||
            this.ammMassnahmenType === AmmMassnahmenCode.UEF
        ) {
            this.showNavigationTreeRoute(AMMPaths.PSAK_BUCHUNG);
            this.showNavigationTreeRoute(AMMPaths.BESCHREIBUNG);
            this.showNavigationTreeRoute(AMMPaths.KOLLEKTIV_DURCHFUHRUNG);
            this.showNavigationTreeRoute(AMMPaths.TEILNEHMERPLAETZE);
        }
        this.showSideNavigationKosten();
    }

    private showSideNavigationKosten() {
        if (this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS || this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT) {
            this.showNavigationTreeRoute(AMMPaths.INDIVIDUELL_KOSTEN);
        } else if (this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_BP || this.ammMassnahmenType === AmmMassnahmenCode.BP) {
            this.showNavigationTreeRoute(AMMPaths.BP_KOSTEN);
        }
    }

    private showSideNavigationTeilnehmer() {
        if (this.ammMassnahmenType === AmmMassnahmenCode.KURS) {
            this.showNavigationTreeRoute(AMMPaths.TEILNEHMERWARTELISTE);
        } else if (this.ammMassnahmenType === AmmMassnahmenCode.AP || this.ammMassnahmenType === AmmMassnahmenCode.BP) {
            this.showNavigationTreeRoute(AMMPaths.TEILNEHMERPLAETZE);
        }
    }

    private showNavigationTreeRoute(path) {
        this.facade.navigationService.showNavigationTreeRoute(path.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.bimBemEntscheidId
        });
    }

    private executeHttpMethod = (httpMethod: Observable<any>, notificationMessage = 'common.message.datengespeichert') => {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        httpMethod.subscribe(
            response => {
                this.buttons.next(null);
                this.ammDataService.getButtonsAmmEntscheid(this.bimBemEntscheidId).subscribe(btnResponse => {
                    this.buttons.next(btnResponse.data);
                });

                if (response.data) {
                    this.bimBemEntscheidData = response.data;

                    this.facade.notificationService.success(this.facade.translateService.instant(notificationMessage));
                    this.prepareMaske();
                } else {
                    this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
                this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
            }
        );
    };

    private initializeBenutzerTokens(bimBemEntscheidData: AmmEntscheidDTO) {
        const currentUser = this.facade.authenticationService.getLoggedUser();
        const benutzerstelleId = bimBemEntscheidData.ownerId ? bimBemEntscheidData.ownerId : currentUser.benutzerstelleId;
        let berechtigung = Permissions.AMM_NUTZUNG_MASSNAHME_KOLLEKTIV_FREIGEBEN;

        if (
            this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS ||
            this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_AP ||
            this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_BP
        ) {
            berechtigung = Permissions.AMM_NUTZUNG_MASSNAHME_FREIGEBEN;
        }

        if (currentUser) {
            this.freigabeDurchSuchenTokens = {
                berechtigung,
                myBenutzerstelleId: benutzerstelleId,
                stati: DomainEnum.BENUTZER_STATUS_AKTIV,
                benutzerstelleId
            };
            this.entscheidungDurchSuchenTokens = {
                berechtigung: Permissions.AMM_NUTZUNG_MASSNAHME_ENTSCHEIDEN,
                myBenutzerstelleId: benutzerstelleId,
                stati: DomainEnum.BENUTZER_STATUS_AKTIV,
                benutzerstelleId
            };
        }
    }

    private patchValue() {
        if (this.bimBemEntscheidData && !this.bimBemEntscheidData.transferALKDatum) {
            this.bimBemEntscheidForm.patchValue({ transferAlk: this.facade.translateService.instant('amm.zahlungen.message.keinedatenuebermittelt') });
        }
    }

    private setBegruendungMultiselectOptions(entscheidArtObject: any, onEntscheidArtSelect = false) {
        this.facade.spinnerService.activate(this.channel);

        this.ammDataService.getAmmEntscheidGruende(this.ammMassnahmenType, entscheidArtObject.code).subscribe(
            begruendungMultiselectResponse => {
                if (begruendungMultiselectResponse.data) {
                    this.begruendungMultiselectOptionsBE = begruendungMultiselectResponse.data;
                    const mappedOptions = begruendungMultiselectResponse.data.map(this.mapMultiselect);

                    mappedOptions.forEach(element => {
                        if (this.bimBemEntscheidData.gruende.some(el => el.grundId === element.id)) {
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

    private setAbbruchdatum() {
        if (this.bimBemEntscheidData && this.bimBemEntscheidData.abbruchdatum) {
            this.bimBemEntscheidForm.controls.abbruchdatum.setValue(this.facade.formUtilsService.parseDate(this.bimBemEntscheidData.abbruchdatum));
        }
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

    private setStatusOptions(allStatusOptions, bimBemEntscheidData: AmmEntscheidDTO) {
        if (bimBemEntscheidData.statusObject.code === AmmVierAugenStatusCode.INUEBERARBEITUNG) {
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
                    ammEntscheidId: this.bimBemEntscheidId,
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
                    ammEntscheidId: this.bimBemEntscheidId,
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
                    ammEntscheidId: this.bimBemEntscheidId,
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

    private checkBimBemEntscheidTypeBP(): boolean {
        return this.ammMassnahmenType === AmmMassnahmenCode.BP || this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_BP;
    }

    private checkBimBemEntscheidTypeKursIndividuell(): boolean {
        return this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT || this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS;
    }

    private checkDisplayBeschaeftigungsgrad(): boolean {
        return (
            this.ammMassnahmenType === AmmMassnahmenCode.AP ||
            this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_AP ||
            this.ammMassnahmenType === AmmMassnahmenCode.BP ||
            this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_BP ||
            this.ammMassnahmenType === AmmMassnahmenCode.UEF ||
            this.ammMassnahmenType === AmmMassnahmenCode.PVB ||
            this.ammMassnahmenType === AmmMassnahmenCode.SEMO
        );
    }

    private checkDisplayVermittlungsfaehigkeit(): boolean {
        return (
            this.ammMassnahmenType === AmmMassnahmenCode.KURS ||
            this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT ||
            this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS ||
            this.ammMassnahmenType === AmmMassnahmenCode.AP ||
            this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_AP ||
            this.ammMassnahmenType === AmmMassnahmenCode.UEF
        );
    }

    private setUeberschrift() {
        const ammMassnahmenTypeText = this.facade.translateService.instant(AmmHelper.ammMassnahmenToLabel.find(e => e.code === this.ammMassnahmenType).label);
        const ueberschrift = `${ammMassnahmenTypeText} ${this.bimBemEntscheidData.massnahmenTitel} - ${this.facade.dbTranslateService.instant('amm.nutzung.label.entscheid')}`;
        this.stesInfobarService.sendDataToInfobar({ title: ueberschrift });
    }
}
