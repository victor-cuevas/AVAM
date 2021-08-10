import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, FormGroupDirective } from '@angular/forms';
import { SpinnerService } from 'oblique-reactive';
import { TranslateService } from '@ngx-translate/core';
import { AmmnutzungWizardService } from '@app/shared/components/new/avam-wizard/ammnutzung-wizard.service';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin, Subject, Observable } from 'rxjs';
import PrintHelper from '@app/shared/helpers/print.helper';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { AmmBeschreibungDTO } from '@app/shared/models/dtos-generated/ammBeschreibungDTO';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { CoreMultiselectInterface } from '@app/library/core/core-multiselect/core-multiselect.interface';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { AvamMultiselectTreeInterface } from '@app/library/wrappers/form/avam-multiselect-tree/avam-multiselect-tree.interface';
import { NogaDTO } from '@app/shared/models/dtos-generated/nogaDTO';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { ChIscoBerufDTO } from '@app/shared/models/dtos-generated/chIscoBerufDTO';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { BaseResponseWrapperCollectionIntegerWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperCollectionIntegerWarningMessages';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { AMMLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { RangeSliderValidator } from '@app/shared/validators/range-slider-validator';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { FacadeService } from '@shared/services/facade.service';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';

@Component({
    selector: 'avam-beschreibung',
    templateUrl: './beschreibung.component.html',
    styleUrls: ['./beschreibung.component.scss']
})
export class BeschreibungComponent extends AmmCloseableAbstract implements OnInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('infobarBasisNr') infobarBasisNr: TemplateRef<any>;

    /**
     * Tracks the value and validity state of a group of FormControl instances.
     *
     * @type {FormGroup}
     * @memberof BeschreibungComponent
     */
    beschreibungForm: FormGroup;

    /**
     * Current component channel.
     *
     * @memberof BeschreibungComponent
     */
    channel = 'BeschreibungChannel';

    ammMassnahmenType: string;
    geschaeftsfallId: number;
    isWizard: boolean;
    observeClickActionSub: Subscription;
    funktionOptions = [];
    funktionInitialCodeList: [] = [];
    problemfeldOptions: AvamMultiselectTreeInterface[] = [];
    spracheOptions: any[] = [];
    muendlichKenntnisseOptions: any[] = [];
    schriftlichKenntnisseOptions: any[] = [];
    mindestesAusbildungsniveauOptions: any[] = [];
    langChangeSubscription: Subscription;
    buchungData: AmmBuchungParamDTO;
    defaultParentEnding = '0';
    permissions: typeof Permissions = Permissions;
    ammButtonsTypeEnum = AmmButtonsTypeEnum;
    buttons: Subject<any[]> = new Subject();
    basisNr: any;

    isReadOnly = false;
    entscheidId: number;
    defaultMinAge = 16;
    defaultMaxAge = 65;
    massnahmeId = 0;
    isDefaultRangeValue = true;

    /**
     * Creates an instance of BeschreibungComponent.
     * @param {FormBuilder} formBuilder
     * @param {SpinnerService} spinnerService
     * @memberof BeschreibungComponent
     */
    constructor(
        private formBuilder: FormBuilder,
        private translateService: TranslateService,
        private wizardService: AmmnutzungWizardService,
        private route: ActivatedRoute,
        private dataRestService: StesDataRestService,
        private ammDataService: AmmRestService,
        private stesInfobarService: AvamStesInfoBarService,
        private ammHelper: AmmHelper,
        protected router: Router,
        protected interactionService: StesComponentInteractionService,
        protected facade: FacadeService
    ) {
        super(facade, router, interactionService);
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;

        const onSaveObs = new Observable<boolean>(subscriber => {
            this.onSave(() => {
                this.wizardService.stesId = this.stesId;
                this.wizardService.beschreibungFormValues = this.beschreibungForm.getRawValue();
                this.setBranchenAndBerufsfruppenInWizardService();
                this.updateBeurteilungskriterienParentNodes(this.beschreibungForm);
                subscriber.next(true);
            });
        });

        const onPreviousObs = new Observable<boolean>(subscriber => {
            this.facade.fehlermeldungenService.closeMessage();
            this.wizardService.beschreibungFormValues = this.beschreibungForm.getRawValue();
            this.setBranchenAndBerufsfruppenInWizardService();
            this.updateBeurteilungskriterienParentNodes(this.beschreibungForm);
            this.wizardService.stesId = this.stesId;
            subscriber.next(true);
            subscriber.complete();
        });

        this.wizardService.setOnNextStep(onSaveObs);

        this.wizardService.setOnPreviousStep(onPreviousObs);
    }

    /**
     * Init BeschreibungComponent
     *
     * @memberof BeschreibungComponent
     */
    ngOnInit() {
        this.beschreibungForm = this.createFormGroup();
        this.setBranchenUndBerufsgruppe();

        this.route.data.subscribe(data => {
            this.isWizard = data.wizard;
            this.subscribeToWizard();

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
                        this.getData();

                        this.showSideNavItems();
                        this.configureToolbox();
                    });
                });
            } else {
                this.route.parent.params.subscribe(params => {
                    this.stesId = params['stesId'];
                    this.ammMassnahmenType = params['type'];
                    this.ammEntscheidTypeCode = AmmMassnahmenCode[Object.keys(AmmMassnahmenCode).find(key => AmmMassnahmenCode[key] === this.ammMassnahmenType)];

                    this.route.paramMap.subscribe(param => {
                        this.geschaeftsfallId = parseInt(param.get('gfId'), 10);
                        this.getData();
                    });
                    this.configureToolbox();
                });
            }
        });

        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
            if (this.isWizard) {
                if (this.buchungData) {
                    this.stesInfobarService.sendDataToInfobar({ title: this.configureWizardInfobar(this.facade.dbTranslateService.translate(this.buchungData.titel, 'name')) });
                }
            } else {
                if (this.buchungData) {
                    this.stesInfobarService.sendDataToInfobar({ title: this.configureNonWizardInfobar(this.facade.dbTranslateService.translate(this.buchungData.titel, 'name')) });
                } else {
                    this.stesInfobarService.sendDataToInfobar({ title: this.configureNonWizardInfobar() });
                }
            }
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
        return true;
    }

    isLabelKursIndividuell(message: any): boolean {
        return (
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_KURS) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_AP) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_BP) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_KURS_IN_ANGEBOT)
        );
    }

    configureNonWizardInfobar(title?) {
        const massnahmeLabel = this.translateService.instant(AmmHelper.ammMassnahmenToLabel.find(e => e.code === this.ammMassnahmenType).label);
        const beschreibungTranslatedLabel = this.translateService.instant('amm.massnahmen.subnavmenuitem.beschreibung');
        if (title) {
            return `${massnahmeLabel} ${title} - ${beschreibungTranslatedLabel}`;
        } else {
            return `${massnahmeLabel} - ${beschreibungTranslatedLabel}`;
        }
    }

    configureWizardInfobar(title) {
        const massnahmeLabel = this.translateService.instant(this.wizardService.ammMassnahmenToLabel.find(e => e.code === this.ammMassnahmenType).label);
        const durchfuehrungTranslatedLabel = this.translateService.instant('amm.massnahmen.subnavmenuitem.beschreibung');
        const erfassen = this.translateService.instant('amm.nutzung.alttext.erfassen');

        return `${massnahmeLabel} ${title} ${erfassen} - ${durchfuehrungTranslatedLabel}`;
    }

    /**
     * Create form group with formBuilder.
     *
     * @returns {FormGroup}
     * @memberof BeschreibungComponent
     */
    createFormGroup(): FormGroup {
        return this.formBuilder.group(
            {
                inhalt: null,
                methodik: null,
                massnahmenZiel: null,
                abschluss: null,
                sprache: null,
                muendlichKenntnisse: null,
                schriftlichKenntnisse: null,
                mindestesAusbildungsniveau: null,
                mindestvoraussetzungSonstiges: null,
                rangeSlider: this.formBuilder.group({
                    altersgruppeVon: [this.defaultMinAge, [NumberValidator.isPositiveInteger, NumberValidator.checkValueBetween1and99]],
                    altersgruppeBis: [this.defaultMaxAge, [NumberValidator.isPositiveInteger, NumberValidator.checkValueBetween1and99]],
                    slider: ['']
                }),
                berufsgruppen: this.formBuilder.array([]),
                funktionList: null,
                branchen: this.formBuilder.array([]),
                problemfeldList: null
            },
            {
                validator: [RangeSliderValidator.areValuesInRangeBetween('rangeSlider', 'altersgruppeVon', 'altersgruppeBis', 'slider', 'val254')]
            }
        );
    }

    /**
     * HTTP GET call.
     *
     * @memberof BeschreibungComponent
     */
    getData() {
        this.wizardService.activateSpinnerAndDisableWizard(this.channel);
        forkJoin([
            this.dataRestService.getCode(DomainEnum.SPRACHE),
            this.dataRestService.getCode(DomainEnum.SPRACHKENNTNISSE),
            this.dataRestService.getActiveCodeByDomain(DomainEnum.AUSBILDUNGSNIVEAU),
            this.dataRestService.getCode(DomainEnum.BERUFSFUNKTION),
            this.dataRestService.getCode(DomainEnum.STESHANDLUNGSFELD),
            this.ammDataService.getBeschreibungAmmBuchungParam(this.geschaeftsfallId, this.ammMassnahmenType)
        ]).subscribe(
            ([sprache, muendlichKenntnisse, mindestesAusbildungsniveau, berufsfunktion, beurteilungskriterien, buchungParamData]) => {
                this.spracheOptions = this.facade.formUtilsService.mapDropdownKurztext(sprache);
                this.muendlichKenntnisseOptions = this.facade.formUtilsService.mapDropdownKurztext(muendlichKenntnisse);
                this.schriftlichKenntnisseOptions = this.facade.formUtilsService.mapDropdownKurztext(muendlichKenntnisse);
                this.mindestesAusbildungsniveauOptions = this.facade.formUtilsService.mapDropdownKurztext(mindestesAusbildungsniveau);
                this.problemfeldOptions = this.mapTreeOptions(beurteilungskriterien);
                this.buchungData = buchungParamData ? buchungParamData['data'] : null;
                this.funktionInitialCodeList = berufsfunktion;
                const buchungObj = this.ammHelper.getAmmBuchung(this.buchungData);
                if (buchungObj.ammGeschaeftsfallObject) {
                    this.basisNr = buchungObj.ammGeschaeftsfallObject.basisNr;
                }
                if (!this.isWizard) {
                    if (this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS) {
                        this.massnahmeId = this.buchungData.durchfuehrungsId;
                    } else {
                        this.massnahmeId = this.buchungData.beschaeftigungseinheitId;
                    }
                    this.ammDataService
                        .getAmmBuchungButtons(this.massnahmeId, this.ammMassnahmenType, this.stesId, this.geschaeftsfallId)
                        .subscribe((buttonRes: BaseResponseWrapperCollectionIntegerWarningMessages) => {
                            this.buttons.next(buttonRes.data);
                        });
                    this.isReadOnly = buchungObj.gesperrt || this.buchungData.beschreibungGesperrt;
                    this.isDefaultRangeValue = false;
                    this.stesInfobarService.sendLastUpdate(this.buchungData.beschreibungObject);
                    this.stesInfobarService.sendDataToInfobar({ title: this.configureNonWizardInfobar(this.facade.dbTranslateService.translate(this.buchungData.titel, 'name')) });
                    this.stesInfobarService.addItemToInfoPanel(this.infobarBasisNr);
                } else {
                    this.isDefaultRangeValue = !this.wizardService.beschreibungFirstEntry;
                    this.stesInfobarService.sendDataToInfobar({ title: this.configureWizardInfobar(this.facade.dbTranslateService.translate(this.buchungData.titel, 'name')) });
                }
                this.updateForm(this.buchungData);
                const beschreibungObjFromWizard = this.wizardService.beschreibungFormValues;
                if (this.isWizard && beschreibungObjFromWizard) {
                    this.beschreibungForm.patchValue(beschreibungObjFromWizard);
                    this.funktionOptions = this.setFunktionMultiselectOptions(this.funktionInitialCodeList, beschreibungObjFromWizard.funktionList).slice();
                    this.problemfeldOptions = this.getSelectedTreeOptions(this.problemfeldOptions, beschreibungObjFromWizard).slice();
                    this.beschreibungForm.controls.branchen = this.createBranchenFormArray(beschreibungObjFromWizard.branchen);
                    this.beschreibungForm.setControl('berufsgruppen', this.createBerufsgruppenFormArray(beschreibungObjFromWizard.berufsgruppen));
                }
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
     * @memberof BeschreibungComponent
     */
    mapToForm(data: AmmBeschreibungDTO) {
        return {
            inhalt: this.facade.dbTranslateService.translate(data, 'inhalt'),
            methodik: this.facade.dbTranslateService.translate(data, 'methodik'),
            massnahmenZiel: this.facade.dbTranslateService.translate(data, 'massnahmenZiel'),
            abschluss: this.facade.dbTranslateService.translate(data, 'abschluss'),
            sprache: data.spracheId,
            muendlichKenntnisse: data.muendlichKenntnisseId,
            schriftlichKenntnisse: data.schriftlichKenntnisseId,
            mindestesAusbildungsniveau: data.mindestesAusbildungsniveauId,
            mindestvoraussetzungSonstiges: this.facade.dbTranslateService.translate(data, 'mindestvoraussetzungSonstiges'),
            rangeSlider: {
                altersgruppeVon: this.isDefaultRangeValue ? this.defaultMinAge : String(data.altersgruppeVon),
                altersgruppeBis: this.isDefaultRangeValue ? this.defaultMaxAge : String(data.altersgruppeBis),
                slider: ['']
            }
        };
    }

    /**
     * Update form data.
     *
     * @memberof BeschreibungComponent
     */
    updateForm(response: AmmBuchungParamDTO) {
        if (response && response.beschreibungObject) {
            const beschreibungObj = response.beschreibungObject;
            this.beschreibungForm.setControl('branchen', this.createBranchenFormArray(beschreibungObj.brancheList));
            this.beschreibungForm.setControl('berufsgruppen', this.createBerufsgruppenFormArray(beschreibungObj.berufsgruppeList));
            this.funktionOptions = this.setFunktionMultiselectOptions(this.funktionInitialCodeList, beschreibungObj.funktionList).slice();
            this.problemfeldOptions = this.getSelectedTreeOptions(this.problemfeldOptions, beschreibungObj).slice();
            this.beschreibungForm.patchValue(this.mapToForm(beschreibungObj));
        }
    }

    createBranchenFormArray(branchen: NogaDTO[]) {
        if (branchen.length > 0) {
            return new FormArray(
                branchen.map(branche => {
                    const form = new FormGroup({ branche: new FormControl(null) });
                    form.controls.branche['branchAutosuggestObj'] = branche;
                    form.controls.branche.setValue(branche);
                    return form;
                })
            );
        } else {
            return new FormArray([new FormGroup({ branche: new FormControl(null) })]);
        }
    }

    createBerufsgruppenFormArray(berufe: ChIscoBerufDTO[]) {
        if (berufe.length > 0) {
            return new FormArray(
                berufe.map(beruf => {
                    const form = new FormGroup({ berufsgruppe: new FormControl(null) });
                    form.controls.berufsgruppe['berufsgruppeAutosuggestObject'] = beruf;
                    form.controls.berufsgruppe.setValue(beruf);
                    return form;
                })
            );
        } else {
            return new FormArray([new FormGroup({ berufsgruppe: new FormControl(null) })]);
        }
    }

    /**
     * Trigger onSave when form is valid.
     *
     * @memberof BeschreibungComponent
     */
    onSave(onDone?) {
        this.facade.fehlermeldungenService.closeMessage();
        this.wizardService.activateSpinnerAndDisableWizard(this.channel);
        if (this.beschreibungForm.valid) {
            const buchungParam = this.mapToDTO(this.beschreibungForm, this.buchungData);
            this.ammDataService.updateBeschreibungAmmBuchungParam(buchungParam, this.ammMassnahmenType, this.stesId, this.translateService.currentLang).subscribe(
                buchungData => {
                    if (buchungData.data) {
                        this.wizardService.beschreibungFirstEntry = true;
                        this.isDefaultRangeValue = !this.wizardService.beschreibungFirstEntry;
                        this.buchungData = buchungData.data;
                        this.updateForm(buchungData.data);
                        this.wizardService.gfId = this.ammHelper.getAmmBuchung(buchungData.data).ammGeschaeftsfallId;
                        if (!this.isWizard) {
                            this.stesInfobarService.sendLastUpdate(this.buchungData.beschreibungObject);
                            this.beschreibungForm.markAsPristine();
                            this.facade.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                        }

                        if (onDone) {
                            onDone();
                        }
                    }

                    this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
                },
                () => {
                    this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
                    this.facade.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                }
            );
        } else {
            this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
            this.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    /**
     * Reset form.
     *
     * @memberof BeschreibungComponent
     */
    onReset() {
        if (this.beschreibungForm.dirty || this.beschreibungForm.controls.branchen.dirty) {
            let beschreibungObj;
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                if (this.wizardService.beschreibungFormValues) {
                    beschreibungObj = this.wizardService.beschreibungFormValues;
                    this.beschreibungForm.reset(beschreibungObj);
                    this.beschreibungForm.controls.branchen = this.createBranchenFormArray(beschreibungObj.branchen);
                    this.beschreibungForm.setControl('berufsgruppen', this.createBerufsgruppenFormArray(beschreibungObj.berufsgruppen));
                    this.funktionOptions = this.setFunktionMultiselectOptions(this.funktionInitialCodeList, beschreibungObj.funktionList).slice();
                    this.problemfeldOptions = this.getSelectedTreeOptions(this.problemfeldOptions, beschreibungObj).slice();
                } else {
                    beschreibungObj = this.buchungData.beschreibungObject;
                    this.beschreibungForm.reset(this.mapToForm(beschreibungObj));
                    this.beschreibungForm.controls.branchen = this.createBranchenFormArray(beschreibungObj.brancheList);
                    this.beschreibungForm.setControl('berufsgruppen', this.createBerufsgruppenFormArray(beschreibungObj.berufsgruppeList));
                    this.funktionOptions = this.setFunktionMultiselectOptions(this.funktionInitialCodeList, beschreibungObj.funktionList).slice();
                    this.problemfeldOptions = this.getSelectedTreeOptions(this.problemfeldOptions, beschreibungObj).slice();
                }
            });
        }
    }

    /**
     * A lifecycle hook that is called when the component is destroyed.
     * Place to Unsubscribe from Observables.
     *
     * @memberof BeschreibungComponent
     */
    ngOnDestroy(): void {
        this.facade.toolboxService.sendConfiguration([]);
        this.observeClickActionSub.unsubscribe();
        this.langChangeSubscription.unsubscribe();

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
     * @memberof BeschreibungComponent
     */
    canDeactivate() {
        return this.beschreibungForm.dirty || this.beschreibungForm.controls.branchen.dirty;
    }

    cancel() {
        this.ammHelper.navigateAmmUebersicht(this.stesId);
    }

    next() {
        this.wizardService.moveNext();
    }

    setBranchenAndBerufsfruppenInWizardService() {
        this.wizardService.beschreibungFormValues.branchen = [];
        this.wizardService.beschreibungFormValues.berufsgruppen = [];
        this.wizardService.beschreibungFormValues.branchen = (this.beschreibungForm.controls.branchen as FormArray).controls
            .filter(branch => (branch as FormGroup).controls.branche['branchAutosuggestObj'])
            .map(branch => (branch as FormGroup).controls.branche['branchAutosuggestObj']);
        this.wizardService.beschreibungFormValues.berufsgruppen = (this.beschreibungForm.controls.berufsgruppen as FormArray).controls
            .filter(berufsgruppe => (berufsgruppe as FormGroup).controls.berufsgruppe['berufsgruppeAutosuggestObject'])
            .map(berufsgruppe => (berufsgruppe as FormGroup).controls.berufsgruppe['berufsgruppeAutosuggestObject']);
    }

    back() {
        this.wizardService.beschreibungFirstEntry = true;
        this.wizardService.movePrev();
    }

    private mapToDTO(form: FormGroup, buchungData: AmmBuchungParamDTO): AmmBuchungParamDTO {
        this.updateBeurteilungskriterienParentNodes(form);

        const buchungDataCopy: AmmBuchungParamDTO = JSON.parse(JSON.stringify(this.buchungData));
        const ammBeschreibungDTO = { ...buchungData.beschreibungObject };

        ammBeschreibungDTO.inhaltDe = form.controls.inhalt.value;
        ammBeschreibungDTO.inhaltFr = form.controls.inhalt.value;
        ammBeschreibungDTO.inhaltIt = form.controls.inhalt.value;

        ammBeschreibungDTO.methodikDe = form.controls.methodik.value;
        ammBeschreibungDTO.methodikFr = form.controls.methodik.value;
        ammBeschreibungDTO.methodikIt = form.controls.methodik.value;

        ammBeschreibungDTO.massnahmenZielDe = form.controls.massnahmenZiel.value;
        ammBeschreibungDTO.massnahmenZielFr = form.controls.massnahmenZiel.value;
        ammBeschreibungDTO.massnahmenZielIt = form.controls.massnahmenZiel.value;

        ammBeschreibungDTO.abschlussDe = form.controls.abschluss.value;
        ammBeschreibungDTO.abschlussFr = form.controls.abschluss.value;
        ammBeschreibungDTO.abschlussIt = form.controls.abschluss.value;

        ammBeschreibungDTO.spracheId = form.controls.sprache.value;
        ammBeschreibungDTO.spracheObject = this.spracheOptions.find(option => option.codeId === form.controls.sprache.value) as CodeDTO;

        ammBeschreibungDTO.muendlichKenntnisseId = form.controls.muendlichKenntnisse.value;
        ammBeschreibungDTO.muendlichKenntnisseObject = this.muendlichKenntnisseOptions.find(option => option.codeId === form.controls.muendlichKenntnisse.value) as CodeDTO;

        ammBeschreibungDTO.schriftlichKenntnisseId = form.controls.schriftlichKenntnisse.value;
        ammBeschreibungDTO.schriftlichKenntnisseObject = this.schriftlichKenntnisseOptions.find(option => option.codeId === form.controls.schriftlichKenntnisse.value) as CodeDTO;

        ammBeschreibungDTO.mindestesAusbildungsniveauId = form.controls.mindestesAusbildungsniveau.value;
        ammBeschreibungDTO.mindestesAusbildungsniveauObject = this.mindestesAusbildungsniveauOptions.find(
            option => option.codeId === form.controls.mindestesAusbildungsniveau.value
        ) as CodeDTO;

        ammBeschreibungDTO.mindestvoraussetzungSonstigesDe = form.controls.mindestvoraussetzungSonstiges.value;
        ammBeschreibungDTO.mindestvoraussetzungSonstigesFr = form.controls.mindestvoraussetzungSonstiges.value;
        ammBeschreibungDTO.mindestvoraussetzungSonstigesIt = form.controls.mindestvoraussetzungSonstiges.value;

        const rangeSliderGroup = form.controls.rangeSlider.value;

        ammBeschreibungDTO.altersgruppeVon = rangeSliderGroup.altersgruppeVon;
        ammBeschreibungDTO.altersgruppeBis = rangeSliderGroup.altersgruppeBis;

        ammBeschreibungDTO.berufsgruppeList = (form.controls.berufsgruppen as FormArray).controls.map(
            berufsgruppe => (berufsgruppe as FormGroup).controls.berufsgruppe['berufsgruppeAutosuggestObject']
        );

        ammBeschreibungDTO.funktionList = this.setFunktionList(this.funktionInitialCodeList, form.controls.funktionList.value).slice();
        ammBeschreibungDTO.brancheList = (form.controls.branchen as FormArray).controls.map(branch => (branch as FormGroup).controls.branche['branchAutosuggestObj']);
        ammBeschreibungDTO.problemfeldList = this.filterProblemFeldList(form.controls.problemfeldList.value);

        buchungDataCopy.beschreibungObject = ammBeschreibungDTO;

        return buchungDataCopy;
    }

    /**
     * This method loops around the Beurteilungskriterien (problemfeldList) in the Form to find parent nodes which have all of their children selected.
     * These parents are then also marked as selected because this logic is not present in the avam-multiselect-tree component.
     * This allows these parent nodes to remain selected on loading of the data.
     * To be used before mapToDTO logic and/or before saving the Form values in a wizard.
     */
    private updateBeurteilungskriterienParentNodes(form: FormGroup) {
        const problemFeldList = form.controls.problemfeldList.value;
        problemFeldList.forEach(element => {
            if (element.isParent && element.children.every(child => child.value)) {
                element.value = true;
            }
        });
    }

    private subscribeToWizard() {
        if (this.isWizard) {
            this.wizardService.isDirty.beschreibung = this.beschreibungForm.dirty;
            this.beschreibungForm.valueChanges.subscribe(value => {
                this.wizardService.isDirty.beschreibung = this.beschreibungForm.dirty;
            });
        }
    }

    private setBranchenUndBerufsgruppe() {
        this.beschreibungForm.setControl('branchen', this.formBuilder.array([this.formBuilder.group({ branche: null })]));
        this.beschreibungForm.setControl('berufsgruppen', this.formBuilder.array([this.formBuilder.group({ berufsgruppe: null })]));
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        if (this.isWizard) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        } else {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));

            if (
                this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS ||
                this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT ||
                this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_BP ||
                this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_AP
            ) {
                toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));
            }

            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));
        }

        this.facade.toolboxService.sendConfiguration(
            toolboxConfig,
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
                this.openHistoryModal(this.buchungData.beschreibungObject.ammBeschreibungId, AvamCommonValueObjectsEnum.T_AMM_BESCHREIBUNG);
            }
        });
    }

    private openHistoryModal(objId: number, objType: string) {
        this.facade.openModalFensterService.openHistoryModal(objId.toString(), objType);
    }

    private openDmsCopyModal(geschaeftsfallId: number, buchungNr: number) {
        this.facade.openModalFensterService.openDmsCopyModal(DmsMetadatenContext.DMS_CONTEXT_STES_AMM, geschaeftsfallId.toString(), buchungNr.toString());
    }

    /**
     * This method loops around the initial codeDTOs for the Funktion MultiSelect and matchs agains the selected values from the Multiselect Component,
     * to fill a list of the original DTOs that can be saved.
     */
    private setFunktionList(funktionInitialCodeList: CodeDTO[], selectedFunktionen: CoreMultiselectInterface[]) {
        const result: CodeDTO[] = [];
        funktionInitialCodeList.forEach(element => {
            if (selectedFunktionen && selectedFunktionen.some(el => el.value && Number(el.id) === element.codeId)) {
                result.push(element);
            }
        });
        return result;
    }

    /**
     *
     * @param savedData represents the data that is either saved in the DB or in the Wizard Service
     *
     * The method maps the saved data agains the initial values of the Multiselect Component to return the options in a viable for the component way.
     *
     */
    private setFunktionMultiselectOptions(funktionInitialCodeList: CodeDTO[], savedFunktionen: any[]): CoreMultiselectInterface[] {
        const mappedOptions = funktionInitialCodeList.map(this.mapMultiselect);
        mappedOptions.forEach(element => {
            if (savedFunktionen.some(el => (el.id === element.id && el.value) || el.codeId === element.id)) {
                element.value = true;
            }
        });
        return mappedOptions;
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

    private mapTreeOptions(initialOptions: CodeDTO[]) {
        const problemfeldOptionsMapped = [];

        initialOptions.forEach(element => {
            if (element.code.charAt(1) === this.defaultParentEnding) {
                const group = element.code.charAt(0);
                problemfeldOptionsMapped.push({
                    id: element.codeId,
                    value: false,
                    textDe: element.textDe,
                    textFr: element.textFr,
                    textIt: element.textIt,
                    code: element.code,
                    children: this.getChildren(initialOptions, group, element.codeId)
                });
            }
        });

        return problemfeldOptionsMapped;
    }

    private getChildren(initialOptions, group, parentId) {
        const children = [];

        initialOptions.forEach(element => {
            if (element.code.charAt(1) !== this.defaultParentEnding && element.code.charAt(0) === group) {
                children.push({
                    id: element.codeId,
                    value: false,
                    textDe: element.textDe,
                    textFr: element.textFr,
                    textIt: element.textIt,
                    code: element.code,
                    parentId
                });
            }
        });

        return children;
    }

    private getSelectedTreeOptions(problemfeldOptions, beschreibungObject) {
        if (beschreibungObject && beschreibungObject.problemfeldList) {
            this.mapSelectedOptions(problemfeldOptions, beschreibungObject.problemfeldList);
        }

        return problemfeldOptions;
    }

    private mapSelectedOptions(items, selected) {
        if (items && items.length > 0) {
            items.forEach(i => {
                if (selected.some(e => e.code === i.code && (e.value || e.codeId))) {
                    i.value = true;
                } else {
                    i.value = false;
                }
                this.mapSelectedOptions(i.children, selected);
            });
        }
    }

    /**
     * This Functions removes the parents from the list and formats the elements of the array in the right form
     */
    private filterProblemFeldList(problemFeldList) {
        const filteredAndMapped: CodeDTO[] = [];
        problemFeldList.forEach(element => {
            if (element.value) {
                const mo = {
                    codeId: element.id,
                    textDe: element.textDe,
                    textIt: element.textIt,
                    textFr: element.textFr,
                    code: element.code
                };
                filteredAndMapped.push(mo);
            }
        });

        return filteredAndMapped;
    }

    private showSideNavItems() {
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });

        this.showSideNavigationBuchung();

        if (this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT) {
            this.facade.navigationService.showNavigationTreeRoute(AMMPaths.KURS_INDIV_IM_ANGEBOT_BESCHREIBUNG.replace(':type', this.ammMassnahmenType), {
                gfId: this.geschaeftsfallId,
                entscheidId: this.entscheidId
            });
        } else {
            this.facade.navigationService.showNavigationTreeRoute(AMMPaths.BESCHREIBUNG.replace(':type', this.ammMassnahmenType), {
                gfId: this.geschaeftsfallId,
                entscheidId: this.entscheidId
            });
        }

        this.showSideNavigationDurchfuehrung();

        this.showSideNavTeilnemherplaetze();

        if (this.ammMassnahmenType === AmmMassnahmenCode.KURS) {
            this.facade.navigationService.showNavigationTreeRoute(AMMPaths.TEILNEHMERWARTELISTE.replace(':type', this.ammMassnahmenType), {
                gfId: this.geschaeftsfallId,
                entscheidId: this.entscheidId
            });
        }

        if (this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS || this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT) {
            this.facade.navigationService.showNavigationTreeRoute(AMMPaths.INDIVIDUELL_KOSTEN.replace(':type', this.ammMassnahmenType), {
                gfId: this.geschaeftsfallId,
                entscheidId: this.entscheidId
            });
        } else if (this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_BP || this.ammMassnahmenType === AmmMassnahmenCode.BP) {
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

    private showSideNavTeilnemherplaetze() {
        if (
            this.ammMassnahmenType === AmmMassnahmenCode.PVB ||
            this.ammMassnahmenType === AmmMassnahmenCode.SEMO ||
            this.ammMassnahmenType === AmmMassnahmenCode.BP ||
            this.ammMassnahmenType === AmmMassnahmenCode.AP ||
            this.ammMassnahmenType === AmmMassnahmenCode.UEF
        ) {
            this.facade.navigationService.showNavigationTreeRoute(AMMPaths.TEILNEHMERPLAETZE.replace(':type', this.ammMassnahmenType), {
                gfId: this.geschaeftsfallId,
                entscheidId: this.entscheidId
            });
        }
    }

    private showSideNavigationBuchung() {
        switch (this.ammMassnahmenType) {
            case AmmMassnahmenCode.KURS:
                this.facade.navigationService.showNavigationTreeRoute(AMMPaths.KOLLEKTIV_BUCHUNG.replace(':type', this.ammMassnahmenType), {
                    gfId: this.geschaeftsfallId,
                    entscheidId: this.entscheidId
                });
                break;
            case AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT:
                this.facade.navigationService.showNavigationTreeRoute(AMMPaths.KURS_INDIV_IM_ANGEBOT_BUCHUNG.replace(':type', this.ammMassnahmenType), {
                    gfId: this.geschaeftsfallId,
                    entscheidId: this.entscheidId
                });
                break;
            case AmmMassnahmenCode.PVB:
            case AmmMassnahmenCode.SEMO:
            case AmmMassnahmenCode.BP:
            case AmmMassnahmenCode.AP:
            case AmmMassnahmenCode.UEF:
                this.facade.navigationService.showNavigationTreeRoute(AMMPaths.PSAK_BUCHUNG.replace(':type', this.ammMassnahmenType), {
                    gfId: this.geschaeftsfallId,
                    entscheidId: this.entscheidId
                });
                break;
            default:
                this.facade.navigationService.showNavigationTreeRoute(AMMPaths.INDIVIDUELL_BUCHUNG.replace(':type', this.ammMassnahmenType), {
                    gfId: this.geschaeftsfallId,
                    entscheidId: this.entscheidId
                });
        }
    }

    private showSideNavigationDurchfuehrung() {
        switch (this.ammMassnahmenType) {
            case AmmMassnahmenCode.KURS:
            case AmmMassnahmenCode.PVB:
            case AmmMassnahmenCode.SEMO:
            case AmmMassnahmenCode.BP:
            case AmmMassnahmenCode.AP:
            case AmmMassnahmenCode.UEF:
                this.facade.navigationService.showNavigationTreeRoute(AMMPaths.KOLLEKTIV_DURCHFUHRUNG.replace(':type', this.ammMassnahmenType), {
                    gfId: this.geschaeftsfallId,
                    entscheidId: this.entscheidId
                });
                break;
            case AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT:
                this.facade.navigationService.showNavigationTreeRoute(AMMPaths.KURS_INDIV_IM_ANGEBOT_DURCHFUEHRUNGSORT.replace(':type', this.ammMassnahmenType), {
                    gfId: this.geschaeftsfallId,
                    entscheidId: this.entscheidId
                });
                break;
            default:
                this.facade.navigationService.showNavigationTreeRoute(AMMPaths.INDIVIDUELL_DURCHFUHRUNG.replace(':type', this.ammMassnahmenType), {
                    gfId: this.geschaeftsfallId,
                    entscheidId: this.entscheidId
                });
        }
    }
}
