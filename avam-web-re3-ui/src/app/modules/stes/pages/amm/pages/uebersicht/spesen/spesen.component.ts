import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { AmmEntscheidDTO } from '@app/shared/models/dtos-generated/ammEntscheidDTO';
import { AmmKostenSpesenDTO } from '@app/shared/models/dtos-generated/ammKostenSpesenDTO';
import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { FormGroupDirective, FormGroup, FormBuilder } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { Subscription, forkJoin, Subject, iif } from 'rxjs';
import { AMMLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { TranslateService } from '@ngx-translate/core';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { AmmVierAugenStatusCode } from '@app/shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { ToolboxService } from '@app/shared';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ReloadHelper } from '@app/shared/helpers/reload.helper';
import { first } from 'rxjs/operators';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { FacadeService } from '@shared/services/facade.service';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';

@Component({
    selector: 'avam-spesen',
    templateUrl: './spesen.component.html',
    styleUrls: ['./spesen.component.scss'],
    providers: [ObliqueHelperService]
})
export class SpesenComponent extends AmmCloseableAbstract implements OnInit, OnDestroy, DeactivationGuarded {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('infobartemp') infobartemp: TemplateRef<any>;

    /**
     * Tracks the value and validity state of a group of FormControl instances.
     *
     * @memberof SpesenComponent
     */
    spesenForm: FormGroup;

    /**
     * Current component channel.
     *
     * @memberof SpesenComponent
     */
    channel = 'spesen-channel';

    /**
     *  Tracks the state of the form if it is submitted.
     *
     * @memberof SpesenComponent
     */
    submitted = false;

    spesenData: AmmKostenSpesenDTO;
    entscheidData: AmmEntscheidDTO;
    buchungData: AmmBuchungParamDTO;
    kostenId: number;
    geschaeftsfallId: number;
    entscheidId: number;
    ammMassnahmenType: string;
    minKosten = 0.05;

    privatverkehrOptions: any[] = [];
    oeffentlicherVerkehrOptions: any[] = [];
    billetartOptions: any[] = [];
    verpflegungDropdownOptions: any[] = [];
    isEntscheidStatusFreigabebereitFreigegebenOrErsetzt = false;
    basisNr: number;
    entscheidNr: number;

    buttons: Subject<any[]> = new Subject();
    ammButtonTypesEnum = AmmButtonsTypeEnum;
    observeClickActionSub: Subscription;
    langChangeSubscription: Subscription;
    reloadSubscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private obliqueHelper: ObliqueHelperService,
        protected router: Router,
        private spinnerService: SpinnerService,
        private ammDataService: AmmRestService,
        private stesDataRestService: StesDataRestService,
        private translateService: TranslateService,
        private stesInfobarService: AvamStesInfoBarService,
        private ammHelper: AmmHelper,
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
            this.setSideNavigation();
            this.getData();
        });

        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];

            this.route.queryParamMap.subscribe(param => {
                this.geschaeftsfallId = +param.get('gfId');
                this.entscheidId = param.get('entscheidId') ? +param.get('entscheidId') : null;
            });

            this.route.paramMap.subscribe(param => {
                this.ammMassnahmenType = param.get('type');
                this.ammEntscheidTypeCode = AmmMassnahmenCode[Object.keys(AmmMassnahmenCode).find(key => AmmMassnahmenCode[key] === this.ammMassnahmenType)];
            });
        });

        this.setSideNavigation();
        this.getData();

        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
            if (this.buchungData) {
                this.stesInfobarService.sendDataToInfobar({ title: this.configureInfobarTitle(this.facade.dbTranslateService.translateWithOrder(this.buchungData.titel, 'name')) });
            } else {
                this.stesInfobarService.sendDataToInfobar({ title: this.configureInfobarTitle() });
            }
        });

        this.spesenForm = this.createFormGroup();
        super.ngOnInit();
    }

    isOurLabel(message) {
        const ammLabels = [];

        ammLabels.push(
            this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_KURS),
            this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_AP),
            this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_BP),
            this.facade.dbTranslateService.instant(AMMLabels.KOLLEKTIV_KURS),
            this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_KURS_IN_ANGEBOT),
            this.facade.dbTranslateService.instant(AMMLabels.UEF),
            this.facade.dbTranslateService.instant(AMMLabels.KOLLEKTIV_AP),
            this.facade.dbTranslateService.instant(AMMLabels.PVB),
            this.facade.dbTranslateService.instant(AMMLabels.SEMO),
            this.facade.dbTranslateService.instant(AMMLabels.KOLLEKTIV_BP)
        );

        return ammLabels.includes(message.data.label);
    }

    isOurUrl(): boolean {
        return (
            this.isKollektivInURL() ||
            this.router.url.includes(AMMPaths.INDIVIDUELL_BUCHUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.BESCHREIBUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.INDIVIDUELL_DURCHFUHRUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.INDIVIDUELL_KOSTEN.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.BP_KOSTEN.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.SPESEN.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.BIM_BEM_ENTSCHEID.replace(':type', this.ammMassnahmenType))
        );
    }

    isKollektivInURL() {
        return (
            this.router.url.includes(AMMPaths.KOLLEKTIV_BUCHUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.BESCHREIBUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.KOLLEKTIV_DURCHFUHRUNG.replace(':type', this.ammMassnahmenType))
        );
    }
    /**
     * Create form group with formBuilder.
     *
     * @returns {FormGroup}
     * @memberof SpesenComponent
     */
    createFormGroup() {
        return this.formBuilder.group(
            {
                massnahmeDauer: null,
                reisekostenCheckbox: null,
                privatverkehr: null,
                fahrstrecke: [null, [NumberValidator.isPositiveInteger, NumberValidator.val131]],
                chfProKm: [null, NumberValidator.checkValueBetween0and99999],
                verpflegungCheckbox: null,
                verpflegungstage: [null, [NumberValidator.isPositiveInteger, NumberValidator.checkValueBetween0and99999]],
                verpflegungskosten: [null, NumberValidator.checkValueBetween0and99999],
                unterkunft: null,
                unterkunftstage: [null, [NumberValidator.isPositiveInteger, NumberValidator.checkValueBetween0and99999]],
                unterkunftskostenDetail: [null, NumberValidator.checkValueBetween0and99999],
                kantineCheckbox: null,
                verpflegungDropdown: null,
                oeffentlicherVerkehr: null,
                billetart: null,
                billetartKostenProTag: [null, NumberValidator.checkValueBetween0and99999],
                reisetage: [null, [NumberValidator.isPositiveInteger, NumberValidator.checkValueBetween0and99999]],
                reisekosten: [null, NumberValidator.checkValueBetween0and99999],
                halbtax: [null, NumberValidator.checkValueBetween0and99999],
                reisekostenSumme: null,
                fahrtkostenPrivat: null,
                reisekostenTotal: null,
                verpflegungskostenSumme: null,
                spesenSumme: null,
                unterkunftskostenSumme: null
            },
            {
                validators: [
                    NumberValidator.compareTwoNumbers('massnahmeDauer', 'verpflegungstage', 'val155'),
                    NumberValidator.compareTwoNumbers('massnahmeDauer', 'unterkunftstage', 'val155'),
                    NumberValidator.compareTwoNumbers('massnahmeDauer', 'reisetage', 'val155'),
                    NumberValidator.val156('unterkunftstage', 'reisetage', 'massnahmeDauer', 'val156')
                ]
            }
        );
    }

    getData() {
        this.spinnerService.activate(this.channel);
        forkJoin([
            this.ammDataService.getKostenSpesen(this.entscheidId),
            this.ammDataService.getAmmEntscheid(this.entscheidId),
            this.stesDataRestService.getCode(DomainEnum.VERPFLEGUNG),
            this.stesDataRestService.getCode(DomainEnum.BILLETART),
            this.stesDataRestService.getCode(DomainEnum.VERKEHRSMITTELOEFFENTLICH),
            this.stesDataRestService.getCode(DomainEnum.FAHRZEUG),
            this.ammDataService.getAmmBuchungParam(this.geschaeftsfallId, this.ammMassnahmenType, this.stesId)
        ]).subscribe(
            ([spesenResponse, entscheidResponse, verpflegungResponse, billetartResponse, oeffentlicherVerkehrResponse, privatverkehrResponse, buchungResponse]) => {
                this.buttons.next(null);
                this.verpflegungDropdownOptions = this.facade.formUtilsService.mapDropdownKurztext(verpflegungResponse);
                this.billetartOptions = this.facade.formUtilsService.mapDropdownKurztext(billetartResponse);
                this.oeffentlicherVerkehrOptions = this.facade.formUtilsService.mapDropdownKurztext(oeffentlicherVerkehrResponse);
                this.privatverkehrOptions = this.facade.formUtilsService.mapDropdownKurztext(privatverkehrResponse);
                if (spesenResponse.data) {
                    this.spesenData = spesenResponse.data;
                    this.kostenId = this.spesenData.ammKostenId;
                    if (this.kostenId) {
                        this.stesInfobarService.sendLastUpdate(this.spesenData);
                    }
                    this.ammDataService.getButtonsKostenSpesen(this.entscheidId).subscribe(btnResponse => {
                        this.buttons.next(btnResponse.data);
                    });
                    this.spesenForm.reset(this.mapToForm(this.spesenData));
                    this.ammHelper.setAdditionalAmmKostenErrors(spesenResponse.data);
                    this.showSystemMessage();
                }
                if (entscheidResponse.data) {
                    this.entscheidData = entscheidResponse.data;
                    this.isEntscheidStatusFreigabebereitFreigegebenOrErsetzt = this.checkIsEntscheidStatusFreigabebereitFreigegebenOrErsetzt(this.entscheidData.statusObject.code);
                }
                if (buchungResponse.data) {
                    this.buchungData = buchungResponse.data;
                    const buchungObject = this.ammHelper.getAmmBuchung(this.buchungData);
                    this.basisNr = buchungObject.ammGeschaeftsfallObject.basisNr;
                    this.entscheidNr = this.getEntscheidNr(buchungObject);
                    this.stesInfobarService.sendDataToInfobar({
                        title: this.configureInfobarTitle(this.facade.dbTranslateService.translateWithOrder(this.buchungData.titel, 'name'))
                    });
                    this.stesInfobarService.addItemToInfoPanel(this.infobartemp);
                }
                this.configureToolbox();
                this.spinnerService.deactivate(this.channel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.channel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    mapToForm(spesenData: AmmKostenSpesenDTO) {
        return {
            massnahmeDauer: spesenData.massnahmeDauer,
            reisekostenCheckbox: spesenData.reisekostenCheck,
            privatverkehr: spesenData.fahrzeugId ? spesenData.fahrzeugId : null,
            fahrstrecke: spesenData.fahrtstrecke ? spesenData.fahrtstrecke : null,
            chfProKm: spesenData.kmPauschale,
            verpflegungCheckbox: spesenData.verpflegungCheck,
            verpflegungstage: spesenData.verpflegungstage,
            verpflegungskosten: spesenData.verpflegungskosten,
            unterkunft: spesenData.unterkunftCheck,
            unterkunftstage: spesenData.unterkunftstage,
            unterkunftskostenDetail: spesenData.unterkunftskostenDetail,
            kantineCheckbox: spesenData.kantineCheck,
            verpflegungDropdown: spesenData.verpflegungId ? spesenData.verpflegungId : null,
            oeffentlicherVerkehr: spesenData.verkehrsmittelId ? spesenData.verkehrsmittelId : null,
            billetart: spesenData.billetartId ? spesenData.billetartId : null,
            billetartKostenProTag: spesenData.fahrtkostenOeffentlich,
            reisetage: spesenData.reisetage,
            reisekosten: spesenData.reisekosten,
            halbtax: spesenData.abonnementskosten,
            fahrtkostenPrivat: this.setDefaultZeto(spesenData.fahrtkostenPrivat),
            reisekostenSumme: this.setDefaultZeto(spesenData.reisekostenSumme),
            reisekostenTotal: this.setDefaultZeto(spesenData.reisekostenTotal),
            verpflegungskostenSumme: this.setDefaultZeto(spesenData.verpflegungskostenSumme),
            spesenSumme: this.setDefaultZeto(spesenData.spesenSumme),
            unterkunftskostenSumme: this.setDefaultZeto(spesenData.unterkunftskostenSumme)
        };
    }

    /**
     * Trigger onSave.
     *
     * @memberof SpesenComponent
     */
    onSave() {
        if (this.checkFormValid()) {
            this.spinnerService.activate(this.channel);

            const kostenToSave = this.mapToDTO();
            const update = this.ammDataService.updateKostenSpesen(kostenToSave);
            const create = this.ammDataService.createKostenSpesen(kostenToSave);

            iif(() => (this.spesenData.ammKostenId ? true : false), update, create).subscribe(
                response => {
                    this.buttons.next(null);

                    this.ammDataService.getButtonsKostenSpesen(this.entscheidId).subscribe(btnResponse => {
                        this.buttons.next(btnResponse.data);
                    });

                    if (response.data) {
                        this.spesenData = response.data;
                        this.kostenId = this.spesenData.ammKostenId;
                        this.spesenForm.reset(this.mapToForm(this.spesenData));
                        this.showMessageOnFahrtstreckeBilletart();
                        this.stesInfobarService.sendLastUpdate(this.spesenData);
                        this.facade.notificationService.success(this.translateService.instant('common.message.datengespeichert'));

                        this.ammHelper.setAdditionalAmmKostenErrors(response.data);
                        this.showSystemMessage();
                    } else {
                        this.facade.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                    }

                    this.configureToolbox();
                    this.deactivateSpinnerAndScrollTop();
                },
                () => {
                    this.spinnerService.deactivate(this.channel);
                    this.facade.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                    OrColumnLayoutUtils.scrollTop();
                }
            );
        }
    }

    mapToDTO() {
        const spesenDataToSave = { ...this.spesenData };

        spesenDataToSave.fahrtstrecke = this.spesenForm.controls.fahrstrecke.value ? this.spesenForm.controls.fahrstrecke.value : 0;
        spesenDataToSave.kmPauschale = this.spesenForm.controls.chfProKm.value;
        spesenDataToSave.verpflegungCheck = this.spesenForm.controls.verpflegungCheckbox.value;
        spesenDataToSave.verpflegungstage = this.spesenForm.controls.verpflegungstage.value;
        spesenDataToSave.verpflegungskosten = this.spesenForm.controls.verpflegungskosten.value ? this.spesenForm.controls.verpflegungskosten.value : null;
        spesenDataToSave.unterkunftCheck = this.spesenForm.controls.unterkunft.value;
        spesenDataToSave.unterkunftstage = this.spesenForm.controls.unterkunftstage.value;
        spesenDataToSave.unterkunftskostenDetail = this.spesenForm.controls.unterkunftskostenDetail.value ? this.spesenForm.controls.unterkunftskostenDetail.value : null;
        spesenDataToSave.unterkunftskosten = this.spesenForm.controls.unterkunftskostenDetail.value ? this.spesenForm.controls.unterkunftskostenDetail.value : null;
        spesenDataToSave.kantineCheck = this.spesenForm.controls.kantineCheckbox.value;
        spesenDataToSave.reisekostenCheck = this.spesenForm.controls.reisekostenCheckbox.value;
        spesenDataToSave.reisetage = this.spesenForm.controls.reisetage.value;
        spesenDataToSave.reisekosten = this.spesenForm.controls.reisekosten.value ? this.spesenForm.controls.reisekosten.value : null;
        spesenDataToSave.fahrtkostenOeffentlich = this.spesenForm.controls.billetartKostenProTag.value;
        spesenDataToSave.abonnementskosten = this.spesenForm.controls.halbtax.value;
        spesenDataToSave.fahrzeugObject = this.privatverkehrOptions.find(option => option.codeId === +this.spesenForm.controls.privatverkehr.value) as CodeDTO;
        spesenDataToSave.verkehrsmittelObject = this.oeffentlicherVerkehrOptions.find(option => option.codeId === +this.spesenForm.controls.oeffentlicherVerkehr.value) as CodeDTO;
        spesenDataToSave.billetartObject = this.billetartOptions.find(option => option.codeId === +this.spesenForm.controls.billetart.value) as CodeDTO;
        spesenDataToSave.verpflegungObject = this.verpflegungDropdownOptions.find(option => option.codeId === +this.spesenForm.controls.verpflegungDropdown.value) as CodeDTO;
        spesenDataToSave.systemMessages = null;

        return spesenDataToSave;
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));

        if (this.kostenId) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));
        }

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, ToolboxDataHelper.createForAmmGeschaeftsfall(+this.stesId, this.geschaeftsfallId));

        if (!this.observeClickActionSub) {
            this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.facade.openModalFensterService.openHistoryModal(this.kostenId.toString(), AvamCommonValueObjectsEnum.T_AMM_KOSTEN_SPESEN);
                }
            });
        }
    }

    onBerechnen() {
        if (this.checkFormValid()) {
            this.facade.fehlermeldungenService.closeMessage();
            this.spinnerService.activate(this.channel);

            this.ammDataService.berechnenKostenSpesen(this.mapToDTO()).subscribe(
                response => {
                    if (response.data) {
                        this.spesenData = response.data;
                        this.spesenForm.patchValue(this.mapToForm(this.spesenData));
                        this.showMessageOnFahrtstreckeBilletart();
                        this.ammHelper.setAdditionalAmmKostenErrors(response.data);
                        this.showSystemMessage();
                    }

                    this.deactivateSpinnerAndScrollTop();
                },
                () => {
                    this.deactivateSpinnerAndScrollTop();
                }
            );
        }
    }

    /**
     * Check for invalid fields.
     *
     * @memberof SpesenComponent
     */
    checkFormValid() {
        this.facade.fehlermeldungenService.closeMessage();
        const isValid = this.spesenForm.valid;

        if (!isValid) {
            this.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }

        return isValid;
    }

    onReset() {
        if (this.spesenForm.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.getData();
            });
        }
    }

    canDeactivate(): boolean {
        return this.spesenForm.dirty;
    }

    ngOnDestroy(): void {
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }

        if (this.reloadSubscription) {
            this.reloadSubscription.unsubscribe();
        }

        this.facade.fehlermeldungenService.closeMessage();
        this.stesInfobarService.removeItemFromInfoPanel(this.infobartemp);
        this.stesInfobarService.sendLastUpdate({}, true);
        this.facade.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    private setDefaultZeto(moneyAmount: number) {
        return moneyAmount ? moneyAmount : 0;
    }

    private deactivateSpinnerAndScrollTop() {
        this.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    private configureInfobarTitle(title?) {
        const massnahmenLabel = this.translateService.instant(AmmHelper.ammMassnahmenToLabel.find(e => e.code === this.ammMassnahmenType).label);
        const spesenTranslatedLabel = this.translateService.instant('amm.nutzung.subnavmenuitem.spesen');

        return `${massnahmenLabel} ${title} - ${spesenTranslatedLabel}`;
    }

    private getEntscheidNr(buchungObject): number {
        let entscheidNr: number;

        if (buchungObject && buchungObject.ammGeschaeftsfallObject && buchungObject.ammGeschaeftsfallObject.allAmmEntscheid) {
            buchungObject.ammGeschaeftsfallObject.allAmmEntscheid.forEach(entscheid => {
                if (entscheid.ammEntscheidId === this.entscheidId) {
                    entscheidNr = entscheid.entscheidNr;
                }
            });
        }

        return entscheidNr;
    }

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
        } else if (this.ammMassnahmenType === AmmMassnahmenCode.KURS) {
            this.showNavigationTreeRoute(AMMPaths.KOLLEKTIV_BUCHUNG);
            this.showNavigationTreeRoute(AMMPaths.BESCHREIBUNG);
            this.showNavigationTreeRoute(AMMPaths.KOLLEKTIV_DURCHFUHRUNG);
        } else if (
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
            this.showSideNavigationKosten();
        }
        this.showSideNavKursIndvImAngebot();
        this.showSideNavigationTeilnehmer();
        this.showNavigationTreeRoute(AMMPaths.SPESEN);
        this.showNavigationTreeRoute(AMMPaths.BIM_BEM_ENTSCHEID);
    }

    private showSideNavKursIndvImAngebot() {
        if (this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT) {
            this.showNavigationTreeRoute(AMMPaths.KURS_INDIV_IM_ANGEBOT_BUCHUNG);
            this.showNavigationTreeRoute(AMMPaths.KURS_INDIV_IM_ANGEBOT_BESCHREIBUNG);
            this.showNavigationTreeRoute(AMMPaths.KURS_INDIV_IM_ANGEBOT_DURCHFUEHRUNGSORT);
            this.showSideNavigationKosten();
        }
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
            entscheidId: this.entscheidId
        });
    }

    private checkIsEntscheidStatusFreigabebereit(entscheidStatus: any): boolean {
        return entscheidStatus === AmmVierAugenStatusCode.FREIGABEBEREIT;
    }

    private checkIsEntscheidStatusFreigabebereitFreigegebenOrErsetzt(entscheidStatus: any): boolean {
        const entscheidFreigabebereit = this.checkIsEntscheidStatusFreigabebereit(entscheidStatus);

        return entscheidFreigabebereit || entscheidStatus === AmmVierAugenStatusCode.FREIGEGEBEN || entscheidStatus === AmmVierAugenStatusCode.ERSETZT;
    }

    private showMessageOnFahrtstreckeBilletart() {
        if (+this.spesenData.fahrtkostenPrivat >= this.minKosten || +this.spesenForm.controls.billetartKostenProTag.value >= this.minKosten) {
            this.facade.fehlermeldungenService.showMessage('amm.nutzung.message.fahrt­stre­ckeBilletart', 'info');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    private showSystemMessage() {
        if (this.spesenData.systemMessages) {
            this.spesenData.systemMessages.forEach(message => {
                this.facade.fehlermeldungenService.showMessage(message, 'info');
                OrColumnLayoutUtils.scrollTop();
            });
        }
    }
}
