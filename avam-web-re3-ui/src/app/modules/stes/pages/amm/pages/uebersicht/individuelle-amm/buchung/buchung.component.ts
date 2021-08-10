import { AmmRestService } from '@app/core/http/amm-rest.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { AvamPersonalberaterAutosuggestComponent } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormGroupDirective, FormArray } from '@angular/forms';
import { SpinnerService } from 'oblique-reactive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from 'src/app/shared/services/toolbox.service';
import { Subscription, forkJoin, iif, Subject, Observable } from 'rxjs';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { ActivatedRoute, Router } from '@angular/router';
import PrintHelper from '@app/shared/helpers/print.helper';
import { takeUntil, first } from 'rxjs/operators';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { AmmGeschaeftsstatusCode } from '@app/shared/enums/domain-code/amm-geschaeftsstatus-code.enum';
import { VerfuegbarkeitAMMCodeEnum } from '@app/shared/enums/domain-code/verfuegbarkeit-amm-code.enum';
import { DateValidator } from '@app/shared/validators/date-validator';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { AmmnutzungWizardService } from '@app/shared/components/new/avam-wizard/ammnutzung-wizard.service';
import { AmmMassnahmenCode, getMassnahmenStrukturElCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { BaseResponseWrapperAmmBuchungParamDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmBuchungParamDTOWarningMessages';

import { AmmVierAugenStatusCode } from '@app/shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { ToolboxConfig } from '@app/shared/components/toolbox/toolbox-config';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { DmsMetadatenKopierenModalComponent, DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { ZeitplanDTO } from '@app/shared/models/dtos-generated/zeitplanDTO';
import { AmmStesGeschaeftsfallDTO } from '@app/shared/models/dtos-generated/ammStesGeschaeftsfallDTO';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { BaseResponseWrapperCollectionIntegerWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperCollectionIntegerWarningMessages';
import { StrukturElementType, MassnahmenQueryParams, NodeData } from '@app/shared/components/massnahmenart-waehlen-modal/massnahmenart-tree-models';
import { BaseResponseWrapperLongWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperLongWarningMessages';
import { MultiLanguageParamDTO } from '@app/shared/models/dtos-generated/multiLanguageParamDTO';
import { BaseResponseWrapperListCodeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListCodeDTOWarningMessages';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { AMMLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { AmmBuchungSessionDTO } from '@app/shared/models/dtos-generated/ammBuchungSessionDTO';
import { AmmBuchungPraktikumsstelleDTO } from '@app/shared/models/dtos-generated/ammBuchungPraktikumsstelleDTO';
import { AmmBuchungArbeitsplatzkategorieDTO } from '@app/shared/models/dtos-generated/ammBuchungArbeitsplatzkategorieDTO';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { AmmValidators } from '@app/shared/validators/amm-validators';
import { ReloadHelper } from '@app/shared/helpers/reload.helper';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { GenericConfirmComponent } from '@app/shared';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { FacadeService } from '@shared/services/facade.service';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';

@Component({
    selector: 'avam-buchung',
    templateUrl: './buchung.component.html',
    styleUrls: ['./buchung.component.scss'],
    providers: [ObliqueHelperService]
})
export class BuchungComponent extends AmmCloseableAbstract implements OnInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('bearbeitung') bearbeitung: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('infobarBasisNr') infobarBasisNr: TemplateRef<any>;

    /**
     * Tracks the value and validity state of a group of FormControl instances.
     *
     * @type {FormGroup}
     * @memberof BuchungComponent
     */
    buchungForm: FormGroup;

    toolboxConfig: ToolboxConfiguration[] = [];

    /**
     * Current component channel.
     *
     * @memberof BuchungComponent
     */
    channel = 'BuchungChannel';
    clearCheckboxes = true;
    zustimmungLamDisabled = true;
    amtsstelleDisabled = true;

    massnahmenverantwortungSuchenTokens: {};
    bearbeiterSuchenTokens: {};

    verfuegbarkeitOptions: CodeDTO[] = [];
    buchungsStatusOptions: CodeDTO[] = [];
    buchungsStatusOptionsUnmapped: any[] = [];
    yesNoOptions: CodeDTO[] = [];
    observeClickActionSub: Subscription;
    geschaeftsfallId: number;
    ammMassnahmenType: string;
    ammMassnahmenTypes = AmmMassnahmenCode;
    isWizard = true;
    permissions: typeof Permissions = Permissions;
    isBuchungStatusGeprueft: boolean;
    isEntscheidStatusPendentOrInUeberarbeitung;
    buchungData: AmmBuchungParamDTO;
    isKonktantpersonNull: boolean;
    isBuchungStatusPendent: boolean;
    latestEtschiedStatusIsFreigegeben: boolean;
    gfHasNachfolgerId: number;
    buttons: Subject<any[]> = new Subject();
    ammButtonsTypeEnum = AmmButtonsTypeEnum;
    vorgaengerGFId: number;
    vorgaengerBuchungNr: number;
    vorgaengerEntscheidId: number;
    nachfolgerGFId: number;
    nachFolgerBuchungNr: number;
    nachfolgerEntscheidId: number;
    langChangeSubscription: Subscription;
    reloadSubscription: Subscription;
    buttonSubscription: Subscription;
    amtstelleTextSubscription: Subscription;
    entscheidId: number;
    massnahmeId = 0;

    massnahmenAmtsstelleQueryParams: MassnahmenQueryParams = { type: StrukturElementType.AMTSSTELLE, elementKategorieId: '0', ausgleichstelleInfo: true };
    massnahmenAusgleichstelleQueryParams: MassnahmenQueryParams = { type: StrukturElementType.AUSGLEICHSSTELLE };

    // The following two properties are used for tooltips in the avam-input-modal component.
    // If they are not initialized, the tooltips are coming up on mouse click but not on mouse hover as expected.
    // If the problem is later solved in the core component, the initialization can be safely removed.
    selectedAmtsstellePath: MultiLanguageParamDTO = { nameDe: ' ', nameFr: ' ', nameIt: ' ' };
    selectedAusgleichstellePath: MultiLanguageParamDTO = { nameDe: ' ', nameFr: ' ', nameIt: ' ' };
    disabledValueBewirtschafter = true;
    isBuchungReadOnly = false;
    amtsstellePath: MultiLanguageParamDTO;
    ausgleichsstellePath: MultiLanguageParamDTO;
    basisNr: any;
    isMassnahmeApBp: boolean;
    isMassnahmeKurs: boolean;

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;
    selectedAusgleichstelleElementName: MultiLanguageParamDTO;
    selectedAmtsstelleElementName: MultiLanguageParamDTO;

    /**
     * Creates an instance of BuchungComponent.
     * @param {FormBuilder} formBuilder
     * @param {SpinnerService} spinnerService
     * @memberof BuchungComponent
     */
    constructor(
        private formBuilder: FormBuilder,
        protected readonly modalService: NgbModal,
        private route: ActivatedRoute,
        protected router: Router,
        private dataService: StesDataRestService,
        private ammDataService: AmmRestService,
        private obliqueHelper: ObliqueHelperService,
        protected facade: FacadeService,
        private wizardService: AmmnutzungWizardService,
        private stesInfobarService: AvamStesInfoBarService,
        private ammHelper: AmmHelper,
        protected interactionService: StesComponentInteractionService
    ) {
        super(facade, router, interactionService);
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;

        const onSaveObs = new Observable<boolean>(subscriber => {
            if (!this.buchungForm.controls.benutzer.value) {
                this.bearbeitung.appendCurrentUser();
            }
            this.onSave(() => {
                this.checkChangedAnbieter();
                this.wizardService.stesId = this.stesId;
                this.wizardService.notFirstEntry = true;
                this.wizardService.lastAnbieterId = this.buchungData && this.buchungData.unternehmenObject && this.buchungData.unternehmenObject.unternehmenId;
                subscriber.next(true);
            });
        });

        this.wizardService.setOnNextStep(onSaveObs);
    }

    /**
     * Init BuchungComponent
     *
     * @memberof BuchungComponent
     */
    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.buchungForm = this.createForm();
        this.subscribeToWizard();
        this.subscribeToRoute();

        this.configureToolbox();
        this.addValidators();

        this.langChangeSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.buchungForm.controls.amtsstelleText.setValue(this.facade.dbTranslateService.translate(this.selectedAmtsstellePath, 'name'));
            this.buchungForm.controls.ausgleichsstelleText.setValue(this.facade.dbTranslateService.translate(this.selectedAusgleichstellePath, 'name'));

            if (this.isWizard) {
                this.stesInfobarService.sendDataToInfobar({ title: this.configureWizardInfobar() });
            } else {
                if (this.buchungData) {
                    this.stesInfobarService.sendDataToInfobar({ title: this.configureNonWizardInfobar(this.facade.dbTranslateService.translate(this.buchungData.titel, 'name')) });
                } else {
                    this.stesInfobarService.sendDataToInfobar({ title: this.configureNonWizardInfobar() });
                }
            }
        });

        this.buchungForm.controls.amtsstelleId.valueChanges.subscribe(value => {
            this.massnahmenAusgleichstelleQueryParams.amtsstellenId = value;
        });

        this.buchungForm.controls.durchfuehrungVon.valueChanges.subscribe(value => {
            this.massnahmenAusgleichstelleQueryParams.anzeigeDatum = value ? value : new Date();
            this.massnahmenAmtsstelleQueryParams.anzeigeDatum = value ? value : new Date();
        });

        this.buchungForm.controls.buchungsStatus.valueChanges.subscribe(value => {
            if (this.getStatusCode(value) === AmmGeschaeftsstatusCode.GEPRUEFT) {
                this.buchungForm.controls.ausgleichsstelleText.setValidators(Validators.required);
                this.buchungForm.controls.ausgleichsstelleText.updateValueAndValidity();
            } else {
                this.buchungForm.controls.ausgleichsstelleText.clearValidators();
                this.buchungForm.controls.ausgleichsstelleText.updateValueAndValidity();
            }
        });
        super.ngOnInit();
    }

    private subscribeToRoute() {
        this.route.data.subscribe(data => {
            this.isWizard = data.wizard;
            if (!this.isWizard) {
                this.route.parent.params.subscribe(params => {
                    this.stesId = params['stesId'];

                    this.route.queryParamMap.subscribe(param => {
                        this.geschaeftsfallId = +param.get('gfId');
                        this.entscheidId = param.get('entscheidId') ? +param.get('entscheidId') : null;
                    });

                    this.route.paramMap.subscribe(param => {
                        this.ammMassnahmenType = param.get('type');
                        this.ammEntscheidTypeCode = AmmMassnahmenCode[Object.keys(AmmMassnahmenCode).find(key => AmmMassnahmenCode[key] === this.ammMassnahmenType)];
                        this.determineMassnahmeType(this.ammMassnahmenType);
                        this.updateFormNumber();
                        this.getData();
                        this.showSideNavItems();
                    });
                });

                this.reloadSubscription = ReloadHelper.enable(this.router, this.unsubscribe, () => {
                    this.showSideNavItems();
                    this.getData();
                    this.determineMassnahmeType(this.ammMassnahmenType);
                    this.updateFormNumber();
                });
            } else {
                this.route.parent.params.subscribe(params => {
                    this.stesId = params['stesId'];
                    this.ammMassnahmenType = params['type'];
                    this.determineMassnahmeType(this.ammMassnahmenType);
                    this.updateFormNumber();
                    this.route.paramMap.subscribe(param => {
                        this.geschaeftsfallId = parseInt(param.get('gfId'), 10);
                        this.getData();
                    });
                });
            }
        });
    }

    configureNonWizardInfobar(title?) {
        const massnahmeLabel = this.facade.translateService.instant(this.wizardService.ammMassnahmenToLabel.find(e => e.code === this.ammMassnahmenType).label);
        const durchfuehrungTranslatedLabel = this.facade.translateService.instant('amm.massnahmen.subnavmenuitem.grunddatenbuchung');

        if (title) {
            return `${massnahmeLabel} ${title} - ${durchfuehrungTranslatedLabel}`;
        } else {
            return `${massnahmeLabel} - ${durchfuehrungTranslatedLabel}`;
        }
    }

    configureWizardInfobar() {
        const massnahmeLabel = this.facade.translateService.instant(this.wizardService.ammMassnahmenToLabel.find(e => e.code === this.ammMassnahmenType).label);
        const durchfuehrungTranslatedLabel = this.facade.translateService.instant('amm.massnahmen.subnavmenuitem.grunddatenbuchung');
        const erfassen = this.facade.translateService.instant('amm.nutzung.alttext.erfassen');

        return `${massnahmeLabel} ${erfassen} - ${durchfuehrungTranslatedLabel}`;
    }

    isOurLabel(message) {
        return (
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_KURS) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_AP) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_BP)
        );
    }

    isOurUrl(): boolean {
        return true;
    }

    /**
     * Create form group with formBuilder.
     *
     * @returns {FormGroup}
     * @memberof BuchungComponent
     */
    createForm(): FormGroup {
        return this.formBuilder.group(
            {
                titel: [null, Validators.required],
                ergaenzendeAngaben: null,
                durchfuehrungsNr: null,
                durchfuehrungVon: [null, [Validators.required, DateValidator.dateValidNgx, DateValidator.dateFormatNgx]],
                durchfuehrungBis: [null, [Validators.required, DateValidator.dateValidNgx, DateValidator.dateFormatNgx]],
                amtsstelleId: null,
                amtsstelleText: [null, Validators.required],
                ausgleichsstelleId: null,
                ausgleichsstelleText: null,
                unternehmen: [null, Validators.required],
                verantwortlichePerson: [null, Validators.required], // custom validation, at least one
                buchungsNr: null,
                vorgaenger: null,
                nachfolger: null,
                buchungsStatus: [null, Validators.required],
                zustimmungLam: null,
                gesuchseingang: null,
                anzahlKurstage: null,

                anzahlLektionen: null,
                verfuegbarkeit: [null, Validators.required],
                wochenTagges: null,
                vormittags: new FormArray([
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false)
                ]),
                nachmittags: new FormArray([
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false)
                ]),
                kurszeiten: null,
                benutzer: [null],
                beruftaetigkeit: null,
                beschaeftigungsgrad: null
            },
            {
                validators: [
                    DateValidator.rangeBetweenDates('durchfuehrungVon', 'durchfuehrungBis', 'val201'),
                    DateValidator.val186('durchfuehrungVon', 'durchfuehrungBis', 'anzahlKurstage'),
                    DateValidator.checkPeriodGreaterThan12('durchfuehrungVon', 'durchfuehrungBis'),
                    NumberValidator.checkDaysMoreThanLessons('anzahlKurstage', 'anzahlLektionen')
                ]
            }
        );
    }

    /**
     * HTTP GET call.
     *
     * @memberof BuchungComponent
     */
    getData() {
        this.wizardService.activateSpinnerAndDisableWizard(this.channel);
        const ammMassnahmenStukturElCode = getMassnahmenStrukturElCode(this.ammMassnahmenType);

        forkJoin<BaseResponseWrapperListCodeDTOWarningMessages, CodeDTO[], BaseResponseWrapperLongWarningMessages, BaseResponseWrapperAmmBuchungParamDTOWarningMessages, CodeDTO[]>(
            //NOSONAR
            [
                this.ammDataService.getBuchungsStati(this.geschaeftsfallId, this.ammMassnahmenType),
                this.dataService.getCode(DomainEnum.VERFUEGBARKEITAMM),
                this.ammDataService.getGesetzlicherTypId(ammMassnahmenStukturElCode),
                this.ammDataService.getAmmBuchungParam(this.geschaeftsfallId, this.ammMassnahmenType, this.stesId),
                this.dataService.getFixedCode(DomainEnum.YES_NO_OPTIONS)
            ]
        )
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                ([status, verf, gesetzlicherTyp, buchungData, yesNoLabels]) => {
                    this.buchungsStatusOptionsUnmapped = status.data;

                    if (this.isWizard) {
                        this.buchungsStatusOptionsUnmapped = this.buchungsStatusOptionsUnmapped.filter(option => option.code === AmmGeschaeftsstatusCode.PENDENT);
                    }
                    this.buchungsStatusOptions = this.facade.formUtilsService.mapDropdownKurztext(this.buchungsStatusOptionsUnmapped);
                    this.verfuegbarkeitOptions = this.getVerfuegbarkeitOptions(verf);
                    this.yesNoOptions = this.facade.formUtilsService.mapDropdownKurztext(yesNoLabels);
                    this.massnahmenAmtsstelleQueryParams.rootId = gesetzlicherTyp.data ? gesetzlicherTyp.data : null;

                    this.buchungForm.setValidators([
                        this.buchungForm.validator,
                        AmmValidators.requiredWeekDays(
                            'vormittags',
                            'nachmittags',
                            'verfuegbarkeit',
                            this.facade.formUtilsService.getCodeIdByCode(this.verfuegbarkeitOptions, VerfuegbarkeitAMMCodeEnum.WOCHENPLAN)
                        ),
                        AmmValidators.employmentCheck('vormittags', 'nachmittags', 'beschaeftigungsgrad')
                    ]);

                    if (buchungData.data) {
                        this.fillData(buchungData);
                    }
                },
                () => {
                    this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
                }
            );
    }

    private fillData(buchungData) {
        this.updateForm(buchungData.data);
        this.checkDisabledFields(this.buchungData);

        const buchungObj = this.ammHelper.getAmmBuchung(this.buchungData);
        if (buchungObj.ammGeschaeftsfallObject) {
            this.basisNr = buchungObj.ammGeschaeftsfallObject.basisNr;
        }

        this.setPersonalBeraterSuchenTokens(buchungObj);

        const additionalData = [this.setAmtstelleTexts()];

        if (!this.isWizard) {
            additionalData.push(this.setButtons());
            if (this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS) {
                this.massnahmeId = this.buchungData.durchfuehrungsId;
            } else {
                this.massnahmeId = this.buchungData.beschaeftigungseinheitId;
            }

            const dokumentVorlageToolboxData = ToolboxDataHelper.createForBuchung(+this.stesId, this.geschaeftsfallId, this.massnahmeId, this.ammMassnahmenType, this.entscheidId);
            this.facade.toolboxService.sendConfiguration(this.toolboxConfig, this.channel, dokumentVorlageToolboxData);

            this.stesInfobarService.sendLastUpdate(buchungObj);

            this.stesInfobarService.sendDataToInfobar({ title: this.configureNonWizardInfobar(this.facade.dbTranslateService.translate(this.buchungData.titel, 'name')) });
            this.stesInfobarService.addItemToInfoPanel(this.infobarBasisNr);
        } else {
            this.stesInfobarService.sendDataToInfobar({ title: this.configureWizardInfobar() });

            if (!this.wizardService.notFirstEntry) {
                this.setDefaultValues();
            }
        }

        forkJoin(additionalData).subscribe(
            ([amtsstelleText, buttons]) => {},
            () => {
                this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
            },
            () => {
                this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
            }
        );
    }

    /**
     * Map data from backend to form object.
     *
     * @memberof BuchungComponent
     */
    mapToForm(data: AmmBuchungParamDTO) {
        this.clearCheckboxes = false;
        const buchungObject = this.ammHelper.getAmmBuchung(data);
        let beschaeftigungsgrad = null;
        let buchungsNr = null;
        let gesuchseingang = null;

        if (buchungObject) {
            beschaeftigungsgrad = buchungObject['beschaeftigungsgrad'];
            buchungsNr = buchungObject.buchungsNr;
            gesuchseingang = this.facade.formUtilsService.parseDate(buchungObject['gesuchseingang']);
        }
        return {
            titel: this.facade.dbTranslateService.translate(data.titel, 'name'),
            ergaenzendeAngaben: this.facade.dbTranslateService.translate(data.ergaenzendeAngaben, 'name'),
            durchfuehrungsNr: data.durchfuehrungsId,
            durchfuehrungVon: this.facade.formUtilsService.parseDate(data.durchfuehrungVon),
            durchfuehrungBis: this.facade.formUtilsService.parseDate(data.durchfuehrungBis),
            amtsstelleId: data.amtsstelleId,
            ausgleichsstelleId: data.ausgleichsstelleId,
            unternehmen: data.unternehmenObject,
            verantwortlichePerson: data.benutzerDetailDTO,
            buchungsNr,
            buchungsStatus: this.facade.formUtilsService.getCodeIdByCode(this.buchungsStatusOptionsUnmapped, buchungObject.statusObject.code),
            zustimmungLam: this.setZustimmungLam(data),
            gesuchseingang,
            anzahlKurstage: data.anzahlKurstage,
            anzahlLektionen: data.anzahlLektionen,
            verfuegbarkeit: data.zeitplanObject ? (data.zeitplanObject.verfuegbarkeitObject ? data.zeitplanObject.verfuegbarkeitObject.codeId.toString() : null) : null,
            vormittags: this.setVormittags(data.zeitplanObject),
            nachmittags: this.setNachmittags(data.zeitplanObject),
            kurszeiten: data.zeitplanObject ? this.facade.dbTranslateService.translate(data.zeitplanObject, 'arbeitszeit') : null,
            benutzer: buchungObject.benutzerDetailDTO,
            beruftaetigkeit: data.berufId !== 0 ? data.taetigkeit : null,
            beschaeftigungsgrad
        };
    }

    /**
     * Map form object to backend.
     *
     * @memberof BuchungComponent
     */
    mapToDTO(): AmmBuchungParamDTO {
        const buchungData: AmmBuchungParamDTO = JSON.parse(JSON.stringify(this.buchungData));
        const buchungObject = this.ammHelper.getAmmBuchung(buchungData);
        const unternehmen = this.buchungForm.controls.unternehmen['unternehmenAutosuggestObject'];
        buchungData.titel = { nameDe: this.buchungForm.controls.titel.value, nameFr: this.buchungForm.controls.titel.value, nameIt: this.buchungForm.controls.titel.value };
        buchungData.ergaenzendeAngaben = {
            nameDe: this.buchungForm.controls.ergaenzendeAngaben.value,
            nameFr: this.buchungForm.controls.ergaenzendeAngaben.value,
            nameIt: this.buchungForm.controls.ergaenzendeAngaben.value
        };
        buchungData.durchfuehrungsId = this.buchungForm.controls.durchfuehrungsNr.value;
        buchungData.durchfuehrungVon = this.facade.formUtilsService.parseDate(this.buchungForm.controls.durchfuehrungVon.value);
        buchungData.durchfuehrungBis = this.facade.formUtilsService.parseDate(this.buchungForm.controls.durchfuehrungBis.value);
        buchungObject.buchungVon = this.buchungForm.controls.durchfuehrungVon.value;
        buchungObject.buchungBis = this.buchungForm.controls.durchfuehrungBis.value;
        if (buchungObject.hasOwnProperty('beschaeftigungsgrad')) {
            buchungObject['beschaeftigungsgrad'] = this.buchungForm.controls.beschaeftigungsgrad.value;
        }
        buchungData.amtsstelleId = this.buchungForm.controls.amtsstelleId.value;
        buchungData.amtsstelleText = this.buchungForm.controls.amtsstelleText.value;
        buchungData.ausgleichsstelleId = this.buchungForm.controls.ausgleichsstelleId.value;
        buchungData.ausgleichsstelleText = this.buchungForm.controls.ausgleichsstelleText.value;
        buchungData.benutzerDetailDTO = this.buchungForm.controls.verantwortlichePerson['benutzerObject'];
        buchungObject.benutzerDetailDTO = this.buchungForm.controls.benutzer['benutzerObject'];
        // These are set in RE2, not implemented in RE3, might cause potention problems
        // buchungObject.ownerId = 523;
        //buchungObject['warteliste'] = false;
        buchungData.unternehmenObject = { unternehmenId: unternehmen.unternehmenId, name1: unternehmen.name1 };
        buchungObject.buchungsNr = this.buchungForm.controls.buchungsNr.value;
        buchungObject.statusId = this.buchungForm.controls.buchungsStatus.value;
        buchungObject.statusObject.codeId = this.buchungForm.controls.buchungsStatus.value;
        buchungObject.statusObject.code = this.getStatusCode(this.buchungForm.controls.buchungsStatus.value);
        buchungObject['gesuchseingang'] = this.facade.formUtilsService.parseDate(this.buchungForm.controls.gesuchseingang.value);
        buchungData.zustimmungLam = this.buchungForm.controls.zustimmungLam.value !== '' ? !!+this.buchungForm.controls.zustimmungLam.value : null;
        buchungData.anzahlKurstage = this.buchungForm.controls.anzahlKurstage.value;
        buchungObject['anzahlKurstage'] = this.buchungForm.controls.anzahlKurstage.value;
        buchungObject['anzahlLektionen'] = this.buchungForm.controls.anzahlLektionen.value;
        buchungData.anzahlLektionen = Number(this.buchungForm.controls.anzahlLektionen.value);
        this.setZeitplanObject(buchungData);
        buchungData.berufId = this.buchungForm.controls.beruftaetigkeit['berufAutosuggestObject'].berufId;
        buchungData.taetigkeit = this.buchungForm.controls.beruftaetigkeit['berufAutosuggestObject'];
        return buchungData;
    }

    private setZeitplanObject(buchungData: AmmBuchungParamDTO) {
        buchungData.zeitplanObject.arbeitszeitDe = this.buchungForm.controls.kurszeiten.value;
        buchungData.zeitplanObject.arbeitszeitFr = this.buchungForm.controls.kurszeiten.value;
        buchungData.zeitplanObject.arbeitszeitIt = this.buchungForm.controls.kurszeiten.value;
        buchungData.zeitplanObject.verfuegbarkeitObject.codeId = this.buchungForm.controls.verfuegbarkeit.value;
        buchungData.zeitplanObject.verfuegbarkeitObject.code = this.facade.formUtilsService.getCodeByCodeId(
            this.verfuegbarkeitOptions,
            this.buchungForm.controls.verfuegbarkeit.value
        );
        buchungData.zeitplanObject.moV = this.buchungForm.controls.vormittags.value[0];
        buchungData.zeitplanObject.diV = this.buchungForm.controls.vormittags.value[1];
        buchungData.zeitplanObject.miV = this.buchungForm.controls.vormittags.value[2];
        buchungData.zeitplanObject.doV = this.buchungForm.controls.vormittags.value[3];
        buchungData.zeitplanObject.frV = this.buchungForm.controls.vormittags.value[4];
        buchungData.zeitplanObject.saV = this.buchungForm.controls.vormittags.value[5];
        buchungData.zeitplanObject.soV = this.buchungForm.controls.vormittags.value[6];
        buchungData.zeitplanObject.moN = this.buchungForm.controls.nachmittags.value[0];
        buchungData.zeitplanObject.diN = this.buchungForm.controls.nachmittags.value[1];
        buchungData.zeitplanObject.miN = this.buchungForm.controls.nachmittags.value[2];
        buchungData.zeitplanObject.doN = this.buchungForm.controls.nachmittags.value[3];
        buchungData.zeitplanObject.frN = this.buchungForm.controls.nachmittags.value[4];
        buchungData.zeitplanObject.saN = this.buchungForm.controls.nachmittags.value[5];
        buchungData.zeitplanObject.soN = this.buchungForm.controls.nachmittags.value[6];
    }

    addValidators() {
        if (this.isMassnahmeApBp) {
            this.buchungForm.controls.beschaeftigungsgrad.setValidators([NumberValidator.checkValueBetween1and100, NumberValidator.isPositiveInteger, Validators.required]);
        }
        if (this.isMassnahmeKurs) {
            this.buchungForm.controls.anzahlKurstage.setValidators([Validators.required, NumberValidator.isPositiveInteger, NumberValidator.val131]);
            this.buchungForm.controls.gesuchseingang.setValidators([DateValidator.isDateInFutureNgx, DateValidator.dateValidNgx, DateValidator.dateFormatNgx]);
            this.buchungForm.controls.anzahlLektionen.setValidators([NumberValidator.isPositiveInteger, NumberValidator.val131]);
        }
    }

    setVormittags(zeitplanObject: ZeitplanDTO) {
        return [zeitplanObject.moV, zeitplanObject.diV, zeitplanObject.miV, zeitplanObject.doV, zeitplanObject.frV, zeitplanObject.saV, zeitplanObject.soV];
    }

    setNachmittags(zeitplanObject: ZeitplanDTO) {
        return [zeitplanObject.moN, zeitplanObject.diN, zeitplanObject.miN, zeitplanObject.doN, zeitplanObject.frN, zeitplanObject.saN, zeitplanObject.soN];
    }

    setZustimmungLam(data: AmmBuchungParamDTO) {
        return data.zustimmungLam !== null ? +data.zustimmungLam : '';
    }

    /**
     * Update form data.
     *
     * @memberof BuchungComponent
     */
    updateForm(buchungData: AmmBuchungParamDTO) {
        if (buchungData) {
            this.buchungData = buchungData;
            this.buchungForm.reset(this.mapToForm(buchungData));
            this.setNachfolgerAndVorgaenger();
            const buchungObject = this.ammHelper.getAmmBuchung(buchungData);
            this.disabledValueBewirtschafter = buchungObject.teilweiseGesperrt;
            this.isBuchungReadOnly = buchungObject.gesperrt;
        }
    }

    /**
     * Trigger onSave when form is valid.
     *
     * @memberof BuchungComponent
     */
    onSave(onDone?) {
        if (!this.buchungForm.controls.benutzer.value) {
            this.bearbeitung.appendCurrentUser();
        }
        const buchungParam = this.mapToDTO();
        this.facade.fehlermeldungenService.closeMessage();
        if (this.buchungForm.valid) {
            const currentLanguage = this.facade.translateService.currentLang;
            const saveBpAp = this.ammDataService.saveBpApIndividuel(buchungParam, this.ammMassnahmenType, this.massnahmeId, this.stesId, this.geschaeftsfallId, currentLanguage);
            const saveIndvKurs = this.ammDataService.saveKursIndividuel(
                buchungParam,
                this.ammMassnahmenType,
                this.massnahmeId,
                this.stesId,
                this.geschaeftsfallId,
                currentLanguage
            );
            this.wizardService.activateSpinnerAndDisableWizard(this.channel);
            iif(() => this.isMassnahmeKurs, saveIndvKurs, saveBpAp).subscribe(
                buchungData => {
                    if (buchungData.data) {
                        this.buttons.next(null);
                        const buchungObject = this.ammHelper.getAmmBuchung(buchungData.data);
                        this.updateForm(buchungData.data);
                        this.wizardService.gfId = buchungObject.ammGeschaeftsfallId;
                        if (!this.isWizard) {
                            this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                            this.stesInfobarService.sendLastUpdate(buchungObject);
                            forkJoin([this.setAmtstelleTexts(), this.setStatus(), this.setButtons()]).subscribe(
                                ([amtsstelleText, status, buttons]) => {
                                    this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
                                },
                                () => {
                                    this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
                                }
                            );
                        } else {
                            this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
                        }
                        if (onDone) {
                            onDone();
                        }
                    } else {
                        this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
                    }
                },
                () => {
                    this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
                    this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                }
            );
        } else {
            this.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    /**
     * Reset form.
     *
     * @memberof BuchungComponent
     */
    onReset() {
        if (this.buchungForm.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();

                this.buchungForm.reset(this.mapToForm(this.buchungData));
                this.setSelectedAmtsstelleAusgleichsstelle({ amtsstellePath: this.amtsstellePath, ausgleichstellePath: this.ausgleichsstellePath });
                this.setAmtsstelleAusgleichstelleText({
                    selectedAmtsstelle: this.amtsstellePath,
                    selectedAusgleichstelle: this.ausgleichsstellePath
                });

                if (this.isWizard && !this.wizardService.notFirstEntry) {
                    this.setDefaultValues();
                }
            });
        }
    }

    /**
     * A lifecycle hook that is called when the component is destroyed.
     * Place to Unsubscribe from Observables.
     *
     * @memberof BuchungComponent
     */
    ngOnDestroy(): void {
        this.facade.toolboxService.sendConfiguration([]);

        this.manualUnsubscribe();

        if (!this.isWizard) {
            this.stesInfobarService.removeItemFromInfoPanel(this.infobarBasisNr);
            this.stesInfobarService.sendLastUpdate({}, true);
            this.facade.fehlermeldungenService.closeMessage();
        }

        super.ngOnDestroy();
    }

    /**
     * Check if form is dirty and notifiy DeactivationGuard.
     *
     * @memberof BuchungComponent
     */
    canDeactivate() {
        return this.buchungForm.dirty;
    }

    configureToolbox() {
        if (this.isWizard) {
            this.toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
            this.toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        } else {
            this.toolboxConfig = ToolboxConfig.getAmmBearbeitenConfig();
        }

        this.facade.toolboxService.sendConfiguration(
            this.toolboxConfig,
            this.channel,
            ToolboxDataHelper.createForAmmGeschaeftsfall(+this.stesId, this.geschaeftsfallId),
            !this.isWizard
        );

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            const buchungObject = this.ammHelper.getAmmBuchung(this.buchungData);

            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.openDmsCopyModal(this.geschaeftsfallId, +buchungObject.ammBuchungId);
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                const objType =
                    this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS
                        ? AvamCommonValueObjectsEnum.T_AMM_BUCHUNGSESSION
                        : AvamCommonValueObjectsEnum.T_AMM_BUCHUNGPRAKTIKUMSSTELLE;

                this.openHistoryModal(buchungObject.ammBuchungId, objType);
            }
        });
    }

    openHistoryModal(objId: number, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId.toString();
        comp.type = objType;
    }

    openDmsCopyModal(geschaeftsfallId: number, buchungNr: number) {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;

        comp.context = DmsMetadatenContext.DMS_CONTEXT_STES_AMM;
        comp.id = geschaeftsfallId.toString();
        comp.nr = buchungNr.toString();
    }

    openModal(content, windowClass?: string) {
        const options: any = { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' };

        if (!!windowClass) {
            options.windowClass = windowClass;
        }
        this.modalService.open(content, options);
    }

    cancel() {
        this.ammHelper.navigateAmmUebersicht(this.stesId);
    }

    next() {
        this.wizardService.moveNext();
    }

    checkChangedAnbieter() {
        if (
            this.wizardService.lastAnbieterId &&
            this.wizardService.lastAnbieterId !== (this.buchungData && this.buchungData.unternehmenObject && this.buchungData.unternehmenObject.unternehmenId)
        ) {
            let newDurchfuehrungFormValues;
            const durchfuehrungsortFormValues = this.wizardService.durchfuehrungsortFormValues;

            if (durchfuehrungsortFormValues) {
                if (durchfuehrungsortFormValues.kontaktId) {
                    newDurchfuehrungFormValues = { ergaenzendeAngaben: durchfuehrungsortFormValues.ergaenzendeAngaben };
                } else {
                    newDurchfuehrungFormValues = {
                        ...this.buchungData.dfOrtObject,
                        ergaenzendeAngaben: durchfuehrungsortFormValues.ergaenzendeAngaben,
                        vorname: durchfuehrungsortFormValues.vorname,
                        name: durchfuehrungsortFormValues.name,
                        telefon: durchfuehrungsortFormValues.telefon,
                        mobile: durchfuehrungsortFormValues.mobile,
                        fax: durchfuehrungsortFormValues.fax,
                        email: durchfuehrungsortFormValues.email
                    };
                }
            }

            this.wizardService.durchfuehrungsortFormValues = newDurchfuehrungFormValues;
        }
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
     * Triggered when Geschaeftsfall-Loeschen Button is clicked
     * Also redirects to the Geschaeftsfall of the vorgaenger, if there is one.
     * If not the tree table is loaded.
     *
     * @memberof BuchungComponent
     */
    onGeschaeftsfallLoeschen() {
        this.facade.fehlermeldungenService.closeMessage();
        this.wizardService.activateSpinnerAndDisableWizard(this.channel);
        this.ammDataService.geschaeftsfallLoeschen(this.stesId, this.geschaeftsfallId).subscribe(
            response => {
                if (response.data) {
                    this.buchungForm.markAsPristine();
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));

                    const vorgaenger = this.getVorgaengerObject();

                    if (vorgaenger) {
                        this.navigateToGeschaeftfall(vorgaenger.ammGeschaeftsfallId, this.ammHelper.getEntscheidId(vorgaenger));
                    } else {
                        this.facade.navigationService.hideNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammMassnahmenType));
                        this.router.navigate([`stes/details/${this.stesId}/amm/uebersicht`]);
                    }
                } else {
                    this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgeloescht'));
                }

                this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
            },
            () => {
                this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
            }
        );
    }

    /**
     * Triggered when Geschäftsfall ersetzen Button is clicked
     *
     * @memberof BuchungComponent
     */
    onGeschaeftsfallErsetzen() {
        this.facade.fehlermeldungenService.closeMessage();
        this.wizardService.activateSpinnerAndDisableWizard(this.channel);

        this.ammDataService.buchungErsetzen(this.geschaeftsfallId.toString()).subscribe(
            response => {
                if (response.data) {
                    const newGeschaeftsfallId = response.data.geschaeftsfallId;
                    if (newGeschaeftsfallId !== +this.geschaeftsfallId) {
                        this.facade.notificationService.success(this.facade.dbTranslateService.instant('amm.nutzung.feedback.buchungersetzt'));
                        this.navigateToGeschaeftfall(newGeschaeftsfallId, response.data.entscheidId);
                    } else {
                        this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
                    }
                } else {
                    this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
                }

                this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
            },
            error => {
                this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
                this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
            }
        );
    }

    navigateToGeschaeftfall(geschaeftfallId: number, entscheidId: number) {
        this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.INDIVIDUELL_BUCHUNG.replace(':type', this.ammMassnahmenType)}`], {
            queryParams: {
                gfId: geschaeftfallId,
                entscheidId
            }
        });
    }

    public zuruecknehmen() {
        this.facade.fehlermeldungenService.closeMessage();
        this.wizardService.activateSpinnerAndDisableWizard(this.channel);
        this.buttons.next(null);

        this.ammDataService.zuruecknehmenBuchung(this.geschaeftsfallId, this.ammMassnahmenType, this.facade.translateService.currentLang).subscribe(
            () => {
                this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
                this.getData();
            },
            () => {
                this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
            }
        );
    }

    selectMassnahmenart(element: NodeData) {
        this.setSelectedAmtsstelleAusgleichsstelle({
            amtsstellePath: element.amtsstellePath,
            ausgleichstellePath: element.ausgleichstellePath
        });

        this.setAmtsstelleAusgleichstelleIds({
            strukturelementId: element.strukturelementId,
            mappingAusgleichstelleId: element.mappingAusgleichstelleId
        });

        this.setAmtsstelleAusgleichstelleText({
            selectedAmtsstelle: element.amtsstellePath,
            selectedAusgleichstelle: element.ausgleichstellePath
        });

        this.buchungForm.markAsDirty();
    }

    selectAusgleichsstelle(element: NodeData) {
        this.selectedAusgleichstellePath = element.amtsstellePath;
        this.setAusgleichstelleId(element.strukturelementId);
        this.setAusgleichstelleText(element.amtsstellePath);
        this.buchungForm.markAsDirty();
    }

    private setAmtsstelleAusgleichstelleIds(data: { strukturelementId: number; mappingAusgleichstelleId: number }) {
        const controlAmtsstelleId = this.buchungForm.controls.amtsstelleId as FormControl;
        controlAmtsstelleId.setValue(data.strukturelementId);

        this.setAusgleichstelleId(data.mappingAusgleichstelleId);
    }

    private setAusgleichstelleId(data: number) {
        const controlAusgleichsstelleId = this.buchungForm.controls.ausgleichsstelleId as FormControl;
        controlAusgleichsstelleId.setValue(data);
    }

    private setAmtsstelleAusgleichstelleText(data: { selectedAmtsstelle: MultiLanguageParamDTO; selectedAusgleichstelle: MultiLanguageParamDTO }) {
        const controlAmtsstelleText = this.buchungForm.controls.amtsstelleText as FormControl;
        controlAmtsstelleText.setValue(this.facade.dbTranslateService.translate(this.facade.formUtilsService.extractElementNameFromPath(data.selectedAmtsstelle), 'name'));

        this.setAusgleichstelleText(data.selectedAusgleichstelle);
    }

    private setAusgleichstelleText(data: MultiLanguageParamDTO) {
        const controlAusgleichsstelleText = this.buchungForm.controls.ausgleichsstelleText as FormControl;
        controlAusgleichsstelleText.setValue(this.facade.dbTranslateService.translate(this.facade.formUtilsService.extractElementNameFromPath(data), 'name'));
    }

    private setSelectedAmtsstelleAusgleichsstelle(element: { amtsstellePath: MultiLanguageParamDTO; ausgleichstellePath: MultiLanguageParamDTO }) {
        this.selectedAmtsstellePath = element.amtsstellePath;
        this.selectedAusgleichstellePath = element.ausgleichstellePath;
        this.selectedAmtsstelleElementName = this.facade.formUtilsService.extractElementNameFromPath(element.amtsstellePath);
        this.selectedAusgleichstelleElementName = this.facade.formUtilsService.extractElementNameFromPath(element.ausgleichstellePath);
    }

    private subscribeToWizard() {
        if (this.isWizard) {
            this.wizardService.isDirty.buchung = this.buchungForm.dirty;
            this.buchungForm.valueChanges.subscribe(value => {
                this.wizardService.isDirty.buchung = this.buchungForm.dirty;
            });
        }
    }

    /**
     * The function gets the status of the very first Entscheid (The one that has no Vorgaenger)
     */
    private getOldestEntscheidStatusCode(data: any) {
        let statusCode = null;

        if (data && data.ammGeschaeftsfallObject && data.ammGeschaeftsfallObject.allAmmEntscheid) {
            const allAmmEnscheid = data.ammGeschaeftsfallObject.allAmmEntscheid;
            const allAmmEntscheidLastElementIndex = allAmmEnscheid.length - 1;

            if (allAmmEnscheid[allAmmEntscheidLastElementIndex] && allAmmEnscheid[allAmmEntscheidLastElementIndex].statusObject) {
                statusCode = allAmmEnscheid[allAmmEntscheidLastElementIndex].statusObject.code;
            }
        }

        return statusCode;
    }

    /**
     * The function gets the status of the last Etnschied
     */
    private getLatestEtschiedStatusCode(data: any) {
        let statusCode = null;

        if (data && data.ammGeschaeftsfallObject && data.ammGeschaeftsfallObject.allAmmEntscheid) {
            const allAmmEnscheid = data.ammGeschaeftsfallObject.allAmmEntscheid;

            if (allAmmEnscheid[0] && allAmmEnscheid[0].statusObject) {
                statusCode = allAmmEnscheid[0].statusObject.code;
            }
        }

        return statusCode;
    }

    /**
     * We use this function to check if any fields should be disabled/hidden depending on
     * certain conditions.
     */
    private checkDisabledFields(data: AmmBuchungParamDTO) {
        const buchungObject = this.ammHelper.getAmmBuchung(data);
        const oldestEntscheidStatus = this.getOldestEntscheidStatusCode(buchungObject);
        const latestEtschiedStatus = this.getLatestEtschiedStatusCode(buchungObject);

        if (data.statusObject) {
            this.isBuchungStatusGeprueft = data.statusObject.code === AmmGeschaeftsstatusCode.GEPRUEFT;
            this.isBuchungStatusPendent = data.statusObject.code === AmmGeschaeftsstatusCode.PENDENT;
        }
        this.latestEtschiedStatusIsFreigegeben = latestEtschiedStatus === AmmVierAugenStatusCode.FREIGEGEBEN;
        this.gfHasNachfolgerId = buchungObject.ammGeschaeftsfallObject ? buchungObject.ammGeschaeftsfallObject.nachfolgerId : null;
        this.isEntscheidStatusPendentOrInUeberarbeitung =
            oldestEntscheidStatus !== AmmVierAugenStatusCode.ERSETZT &&
            oldestEntscheidStatus !== AmmVierAugenStatusCode.FREIGEGEBEN &&
            oldestEntscheidStatus !== AmmVierAugenStatusCode.FREIGABEBEREIT;

        this.isKonktantpersonNull = data.kontaktpersonOriginalObject === null;
    }

    private setDefaultValues() {
        this.bearbeitung.appendCurrentUser();
        this.buchungForm.controls.buchungsStatus.setValue(this.facade.formUtilsService.getCodeIdByCode(this.buchungsStatusOptionsUnmapped, AmmGeschaeftsstatusCode.PENDENT));
        this.buchungForm.controls.verfuegbarkeit.setValue(this.facade.formUtilsService.getCodeIdByCode(this.verfuegbarkeitOptions, VerfuegbarkeitAMMCodeEnum.VOLLZEIT));
    }

    private getVerfuegbarkeitOptions(options: CodeDTO[]) {
        let mappedOptions = this.facade.formUtilsService.mapDropdownKurztext(options);

        if (this.isMassnahmeApBp) {
            mappedOptions = mappedOptions.filter(option => option.code !== VerfuegbarkeitAMMCodeEnum.UNTERSCHIEDLICH);
        }

        return mappedOptions;
    }

    private showSideNavItems() {
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.INDIVIDUELL_BUCHUNG.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.BESCHREIBUNG.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.INDIVIDUELL_DURCHFUHRUNG.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });

        if (this.isMassnahmeKurs) {
            this.facade.navigationService.showNavigationTreeRoute(AMMPaths.INDIVIDUELL_KOSTEN.replace(':type', this.ammMassnahmenType), {
                gfId: this.geschaeftsfallId,
                entscheidId: this.entscheidId
            });
        } else if (this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_BP) {
            this.facade.navigationService.showNavigationTreeRoute(AMMPaths.BP_KOSTEN.replace(':type', this.ammMassnahmenType), {
                gfId: this.geschaeftsfallId,
                entscheidId: this.entscheidId
            });
        }

        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.SPESEN.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.BIM_BEM_ENTSCHEID.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
    }

    private getNachfolgerObject(): AmmStesGeschaeftsfallDTO {
        const buchungObject = this.ammHelper.getAmmBuchung(this.buchungData);

        return buchungObject && buchungObject.ammGeschaeftsfallObject && buchungObject.ammGeschaeftsfallObject.nachfolgerObject
            ? buchungObject.ammGeschaeftsfallObject.nachfolgerObject
            : null;
    }

    private getVorgaengerObject(): AmmStesGeschaeftsfallDTO {
        const buchungObject = this.ammHelper.getAmmBuchung(this.buchungData);

        return buchungObject && buchungObject.ammGeschaeftsfallObject && buchungObject.ammGeschaeftsfallObject.vorgaengerObject
            ? buchungObject.ammGeschaeftsfallObject.vorgaengerObject
            : null;
    }

    private setNachfolgerAndVorgaenger() {
        this.setNachFolger();
        this.setVorgaenger();
    }

    private setVorgaenger() {
        const vorgaengerObj = this.getVorgaengerObject();
        if (vorgaengerObj) {
            const vorgaengerBuchung = vorgaengerObj.ammBuchungSession || vorgaengerObj.ammBuchungPraktikumsstelle || vorgaengerObj.ammBuchungArbeitsplatzkategorie;

            this.vorgaengerBuchungNr = vorgaengerBuchung.buchungsNr;
            this.vorgaengerGFId = vorgaengerObj.ammGeschaeftsfallId;
            this.vorgaengerEntscheidId = this.ammHelper.getEntscheidId(vorgaengerObj);
        } else {
            this.vorgaengerBuchungNr = null;
            this.vorgaengerGFId = null;
        }
    }

    private updateFormNumber() {
        const num = this.isMassnahmeKurs ? StesFormNumberEnum.KURS_INDIVIDUELL_BUCHUNG : StesFormNumberEnum.AP_BP_BUCHUNG;
        this.facade.messageBus.buildAndSend('footer-infos.formNumber', { formNumber: num });
    }

    private setNachFolger() {
        const nachFolgerObj = this.getNachfolgerObject();

        if (nachFolgerObj) {
            const nachFolgerBuchung = nachFolgerObj.ammBuchungSession || nachFolgerObj.ammBuchungPraktikumsstelle || nachFolgerObj.ammBuchungArbeitsplatzkategorie;

            this.nachFolgerBuchungNr = nachFolgerBuchung.buchungsNr;
            this.nachfolgerGFId = nachFolgerObj.ammGeschaeftsfallId;
            this.nachfolgerEntscheidId = this.ammHelper.getEntscheidId(nachFolgerObj);
        } else {
            this.nachFolgerBuchungNr = null;
            this.nachfolgerGFId = null;
        }
    }

    private getStatusCode(codeId: string) {
        return this.facade.formUtilsService.getCodeByCodeId(this.buchungsStatusOptions, codeId);
    }

    private setPersonalBeraterSuchenTokens(buchungObj: AmmBuchungSessionDTO | AmmBuchungPraktikumsstelleDTO | AmmBuchungArbeitsplatzkategorieDTO) {
        const currentUser = this.facade.authenticationService.getLoggedUser();
        const benutzerstelleId = buchungObj.ownerId ? buchungObj.ownerId : currentUser.benutzerstelleId;

        if (currentUser) {
            this.massnahmenverantwortungSuchenTokens = {
                berechtigung: Permissions.AMM_NUTZUNG_MASSNAHME_BEWIRTSCHAFTEN,
                myBenutzerstelleId: benutzerstelleId,
                stati: DomainEnum.BENUTZER_STATUS_AKTIV,
                benutzerstelleId
            };
            this.bearbeiterSuchenTokens = {
                berechtigung: Permissions.AMM_NUTZUNG_BUCHUNG_BEARBEITEN,
                myBenutzerstelleId: benutzerstelleId,
                stati: DomainEnum.BENUTZER_STATUS_AKTIV,
                benutzerstelleId
            };
        }
    }

    private determineMassnahmeType(massnahmeType: string) {
        this.isMassnahmeApBp = massnahmeType === this.ammMassnahmenTypes.INDIVIDUELL_BP || massnahmeType === this.ammMassnahmenTypes.INDIVIDUELL_AP;
        this.isMassnahmeKurs = massnahmeType === this.ammMassnahmenTypes.INDIVIDUELL_KURS;
    }

    private setButtons() {
        return new Observable(sub => {
            this.ammDataService.getAmmBuchungButtons(this.massnahmeId, this.ammMassnahmenType, this.stesId, this.geschaeftsfallId).subscribe(
                (buttonRes: BaseResponseWrapperCollectionIntegerWarningMessages) => {
                    this.buttons.next(buttonRes.data);
                    sub.next(true);
                },
                () => {
                    sub.error();
                },
                () => {
                    sub.complete();
                }
            );
        });
    }

    private setStatus() {
        return new Observable(sub => {
            this.ammDataService.getBuchungsStati(this.geschaeftsfallId, this.ammMassnahmenType).subscribe(
                response => {
                    this.buchungsStatusOptionsUnmapped = response.data;
                    this.buchungsStatusOptions = this.facade.formUtilsService.mapDropdownKurztext(response.data);
                    sub.next(true);
                },
                () => {
                    sub.error();
                },
                () => {
                    sub.complete();
                }
            );
        });
    }

    private setAmtstelleTexts() {
        return new Observable(sub => {
            forkJoin([
                this.ammDataService.getStrukturElementPath(this.buchungData.amtsstelleId),
                this.ammDataService.getStrukturElementPath(this.buchungData.ausgleichsstelleId)
            ]).subscribe(
                ([amtsstelle, ausgleichsstelle]) => {
                    this.setSelectedAmtsstelleAusgleichsstelle({
                        amtsstellePath: amtsstelle.data,
                        ausgleichstellePath: ausgleichsstelle.data
                    });
                    this.setAmtsstelleAusgleichstelleText({
                        selectedAmtsstelle: this.selectedAmtsstelleElementName,
                        selectedAusgleichstelle: this.selectedAusgleichstelleElementName
                    });

                    this.amtsstellePath = amtsstelle.data;
                    this.ausgleichsstellePath = ausgleichsstelle.data;
                    sub.next(true);
                },
                () => {
                    sub.error();
                },
                () => {
                    sub.complete();
                }
            );
        });
    }

    private manualUnsubscribe() {
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }

        if (this.reloadSubscription) {
            this.reloadSubscription.unsubscribe();
        }

        if (this.amtstelleTextSubscription) {
            this.amtstelleTextSubscription.unsubscribe();
        }

        if (this.buttonSubscription) {
            this.buttonSubscription.unsubscribe();
        }
    }
}
