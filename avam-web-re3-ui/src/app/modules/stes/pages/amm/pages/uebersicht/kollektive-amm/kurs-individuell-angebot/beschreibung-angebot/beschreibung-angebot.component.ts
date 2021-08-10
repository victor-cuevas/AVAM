import { MassnahmeBuchenWizardService } from '@app/shared/components/new/avam-wizard/massnahme-buchen-wizard.service';
import { AvamMultiselectTreeInterface } from '@app/library/wrappers/form/avam-multiselect-tree/avam-multiselect-tree.interface';
import { RangeSliderValidator } from '@app/shared/validators/range-slider-validator';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { FormGroupDirective, FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { AmmBeschreibungDTO } from '@app/shared/models/dtos-generated/ammBeschreibungDTO';
import { SpinnerService } from 'oblique-reactive';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { CoreMultiselectInterface } from '@app/library/core/core-multiselect/core-multiselect.interface';
import { ToolboxService, RoboHelpService } from '@app/shared';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import PrintHelper from '@app/shared/helpers/print.helper';
import { NogaDTO } from '@app/shared/models/dtos-generated/nogaDTO';
import { ChIscoBerufDTO } from '@app/shared/models/dtos-generated/chIscoBerufDTO';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { forkJoin, Subscription, Observable } from 'rxjs';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { ActivatedRoute } from '@angular/router';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-beschreibung-angebot',
    templateUrl: './beschreibung-angebot.component.html',
    providers: [ObliqueHelperService]
})
export class BeschreibungAngebotComponent implements OnInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    beschreibungForm: FormGroup;
    buchungData: AmmBuchungParamDTO;

    spracheOptions: any[] = [];
    muendlichKenntnisseOptions: any[] = [];
    schriftlichKenntnisseOptions: any[] = [];
    mindestesAusbildungsniveauOptions: any[] = [];
    funktionOptions = [];
    problemfeldOptions: AvamMultiselectTreeInterface[] = [];
    isReadOnly = false;
    isWizard: boolean;

    channel = 'BeschreibungAngebotChannel';
    defaultMinAge = 16;
    defaultMaxAge = 65;
    defaultParentEnding = '0';
    funktionInitialCodeList: [] = [];

    observeClickActionSub: Subscription;
    langChangeSubscription: Subscription;
    permissions: typeof Permissions = Permissions;

    get geschaeftsfallId() {
        return this.wizardService.gfId;
    }

    get massnahmeTyp() {
        return this.wizardService.getMassnahmeCode();
    }

    get stesId() {
        return this.wizardService.getStesId();
    }

    get massnahmeId() {
        return this.wizardService.getMassnahmeId();
    }

    constructor(
        private formBuilder: FormBuilder,
        private obliqueHelper: ObliqueHelperService,
        private wizardService: MassnahmeBuchenWizardService,
        private dataRestService: StesDataRestService,
        private ammDataService: AmmRestService,
        private translateService: TranslateService,
        private stesInfobarService: AvamStesInfoBarService,
        private roboHelpService: RoboHelpService,
        private route: ActivatedRoute,
        private ammHelper: AmmHelper,
        private facade: FacadeService
    ) {
        ToolboxService.CHANNEL = this.channel;
        SpinnerService.CHANNEL = this.channel;

        const onSaveObs = new Observable<boolean>(subscriber => {
            this.onSave(() => {
                this.wizardService.notFirstEntry = true;
                this.wizardService.beschreibungFormValues = this.beschreibungForm.getRawValue();
                this.setBranchenAndBerufsfruppenInWizardService();
                this.updateBeurteilungskriterienParentNodes();
                subscriber.next(true);
            });
        });

        const onPreviousObs = new Observable<boolean>(subscriber => {
            this.facade.fehlermeldungenService.closeMessage();
            this.wizardService.beschreibungFormValues = this.beschreibungForm.getRawValue();
            this.setBranchenAndBerufsfruppenInWizardService();
            this.updateBeurteilungskriterienParentNodes();
            subscriber.next(true);
            subscriber.complete();
        });

        this.wizardService.setOnNextStep(onSaveObs);
        this.wizardService.setOnPreviousStep(onPreviousObs);
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.beschreibungForm = this.createFormGroup();
        this.setBranchenUndBerufsgruppe();
        this.subscribeWizardToFormChanges();

        this.route.data.subscribe(data => {
            this.isWizard = data.wizard;
        });

        this.getData();
        this.configureToolbox();

        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
            this.stesInfobarService.sendDataToInfobar({ title: this.getUeberschrift() });
        });
    }

    getUeberschrift(): string {
        const wizardBezeichnung = this.translateService.instant('amm.massnahmen.label.massnahmeBuchen');
        const beschreibung = this.translateService.instant('common.label.beschreibung');
        const massnahmenLabel = this.translateService.instant(AmmHelper.ammMassnahmenToLabel.find(e => e.code === this.massnahmeTyp).label);
        const title = this.facade.dbTranslateService.translateWithOrder(this.buchungData.titel, 'name');
        const erfassenTranslatedLabel = this.translateService.instant('amm.nutzung.alttext.erfassen');

        return `${wizardBezeichnung} - ${beschreibung} ${massnahmenLabel} ${title} ${erfassenTranslatedLabel}`;
    }

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

    getData() {
        this.activateSpinner();

        forkJoin([
            //NOSONAR
            this.dataRestService.getCode(DomainEnum.SPRACHE),
            this.dataRestService.getCode(DomainEnum.SPRACHKENNTNISSE),
            this.dataRestService.getActiveCodeByDomain(DomainEnum.AUSBILDUNGSNIVEAU),
            this.dataRestService.getCode(DomainEnum.BERUFSFUNKTION),
            this.dataRestService.getCode(DomainEnum.STESHANDLUNGSFELD),
            this.ammDataService.getBeschreibungAmmBuchungParam(this.geschaeftsfallId, this.massnahmeTyp)
        ]).subscribe(
            ([sprache, muendlichKenntnisse, mindestesAusbildungsniveau, berufsfunktion, beurteilungskriterien, buchungParamData]) => {
                this.spracheOptions = this.facade.formUtilsService.mapDropdownKurztext(sprache);
                this.muendlichKenntnisseOptions = this.facade.formUtilsService.mapDropdownKurztext(muendlichKenntnisse);
                this.schriftlichKenntnisseOptions = this.facade.formUtilsService.mapDropdownKurztext(muendlichKenntnisse);
                this.mindestesAusbildungsniveauOptions = this.facade.formUtilsService.mapDropdownKurztext(mindestesAusbildungsniveau);

                this.problemfeldOptions = this.mapTreeOptions(beurteilungskriterien);

                if (buchungParamData.data) {
                    this.buchungData = buchungParamData.data;
                    this.stesInfobarService.sendDataToInfobar({ title: this.getUeberschrift() });
                }

                this.funktionInitialCodeList = berufsfunktion;
                const beschreibungObj = this.buchungData.beschreibungObject;
                this.funktionOptions = this.setFunktionMultiselectOptions(this.funktionInitialCodeList, beschreibungObj.funktionList).slice();

                this.updateForm(this.buchungData);

                const beschreibungObjFromWizard = this.wizardService.beschreibungFormValues;
                if (beschreibungObjFromWizard) {
                    this.beschreibungForm.patchValue(beschreibungObjFromWizard);
                    this.updateBranchenBerufsgruppenAndOptions(
                        beschreibungObjFromWizard.branchen,
                        beschreibungObjFromWizard.berufsgruppen,
                        beschreibungObjFromWizard.funktionList,
                        beschreibungObjFromWizard
                    );
                }

                this.deactivateSpinner();
            },
            () => {
                this.deactivateSpinner();
            }
        );
    }

    updateForm(buchungParamData: AmmBuchungParamDTO) {
        if (buchungParamData && buchungParamData.beschreibungObject) {
            const beschreibungObj = buchungParamData.beschreibungObject;
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

    cancelWizard() {
        this.ammHelper.navigateAmmUebersicht(this.stesId);
    }

    next() {
        this.wizardService.moveNext();
    }

    onSave(onDone?) {
        const buchungData = this.mapToDTO();
        this.facade.fehlermeldungenService.closeMessage();
        if (this.beschreibungForm.valid) {
            this.activateSpinner();
            this.ammDataService.updateBeschreibungAmmBuchungParam(buchungData, this.massnahmeTyp, this.stesId.toString(), this.translateService.currentLang).subscribe(
                response => {
                    if (response.data) {
                        if (onDone) {
                            onDone();
                        }

                        this.deactivateSpinner();
                    }
                },
                () => {
                    this.deactivateSpinner();
                }
            );
        }
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, ToolboxDataHelper.createForAmmGeschaeftsfall(+this.stesId, this.geschaeftsfallId), false);

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
            if (this.isWizard && action.message.action === ToolboxActionEnum.HELP) {
                this.roboHelpService.help(StesFormNumberEnum.BESCHREIBUNG_AMM_ERFASSEN);
            }
        });
    }

    back() {
        this.wizardService.movePrev();
    }

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
                altersgruppeVon: data.altersgruppeVon ? String(data.altersgruppeVon) : this.defaultMinAge,
                altersgruppeBis: data.altersgruppeVon ? String(data.altersgruppeBis) : this.defaultMaxAge,
                slider: ['']
            }
        };
    }

    onReset() {
        if (this.canDeactivate()) {
            let beschreibungObj;
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                if (this.wizardService.beschreibungFormValues) {
                    beschreibungObj = this.wizardService.beschreibungFormValues;
                    this.beschreibungForm.reset(beschreibungObj);
                    this.updateBranchenBerufsgruppenAndOptions(beschreibungObj.branchen, beschreibungObj.berufsgruppen, beschreibungObj.funktionList, beschreibungObj);
                } else {
                    beschreibungObj = this.buchungData.beschreibungObject;
                    this.beschreibungForm.reset(this.mapToForm(beschreibungObj));
                    this.updateBranchenBerufsgruppenAndOptions(beschreibungObj.brancheList, beschreibungObj.berufsgruppeList, beschreibungObj.funktionList, beschreibungObj);
                }
            });
        }
    }

    canDeactivate() {
        return this.beschreibungForm.dirty || this.beschreibungForm.controls.branchen.dirty;
    }

    ngOnDestroy() {
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        if (!this.isWizard) {
            this.facade.fehlermeldungenService.closeMessage();
        }
    }

    private updateBranchenBerufsgruppenAndOptions(branchen: NogaDTO[], berufsgruppen: ChIscoBerufDTO[], funktionList: any[], beschreibungObj: any) {
        this.beschreibungForm.controls.branchen = this.createBranchenFormArray(branchen);
        this.beschreibungForm.setControl('berufsgruppen', this.createBerufsgruppenFormArray(berufsgruppen));
        this.funktionOptions = this.setFunktionMultiselectOptions(this.funktionInitialCodeList, funktionList).slice();
        this.problemfeldOptions = this.getSelectedTreeOptions(this.problemfeldOptions, beschreibungObj).slice();
    }

    private activateSpinner() {
        if (this.isWizard) {
            this.wizardService.activateSpinnerAndDisableWizard(this.channel);
        } else {
            this.facade.spinnerService.activate(this.channel);
        }
    }

    private deactivateSpinner() {
        if (this.isWizard) {
            this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
        } else {
            this.deactivateSpinnerAndScrollTop();
        }
    }

    private deactivateSpinnerAndScrollTop() {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    private subscribeWizardToFormChanges() {
        this.wizardService.isDirty.beschreibung = this.beschreibungForm.dirty;
        this.beschreibungForm.valueChanges.subscribe(value => {
            this.wizardService.isDirty.beschreibung = this.beschreibungForm.dirty;
        });
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

    private setBranchenUndBerufsgruppe() {
        this.beschreibungForm.setControl('branchen', this.formBuilder.array([this.formBuilder.group({ branche: null })]));
        this.beschreibungForm.setControl('berufsgruppen', this.formBuilder.array([this.formBuilder.group({ berufsgruppe: null })]));
    }

    private setBranchenAndBerufsfruppenInWizardService() {
        this.wizardService.beschreibungFormValues.branchen = [];
        this.wizardService.beschreibungFormValues.berufsgruppen = [];
        this.wizardService.beschreibungFormValues.branchen = (this.beschreibungForm.controls.branchen as FormArray).controls
            .filter(branch => (branch as FormGroup).controls.branche['branchAutosuggestObj'])
            .map(branch => (branch as FormGroup).controls.branche['branchAutosuggestObj']);
        this.wizardService.beschreibungFormValues.berufsgruppen = (this.beschreibungForm.controls.berufsgruppen as FormArray).controls
            .filter(berufsgruppe => (berufsgruppe as FormGroup).controls.berufsgruppe['berufsgruppeAutosuggestObject'])
            .map(berufsgruppe => (berufsgruppe as FormGroup).controls.berufsgruppe['berufsgruppeAutosuggestObject']);
    }

    private mapToDTO(): AmmBuchungParamDTO {
        this.updateBeurteilungskriterienParentNodes();
        const buchungDataCopy: AmmBuchungParamDTO = JSON.parse(JSON.stringify(this.buchungData));
        const ammBeschreibungDTO = { ...this.buchungData.beschreibungObject };
        ammBeschreibungDTO.inhaltDe = this.beschreibungForm.controls.inhalt.value;
        ammBeschreibungDTO.inhaltFr = this.beschreibungForm.controls.inhalt.value;
        ammBeschreibungDTO.inhaltIt = this.beschreibungForm.controls.inhalt.value;
        ammBeschreibungDTO.methodikDe = this.beschreibungForm.controls.methodik.value;
        ammBeschreibungDTO.methodikFr = this.beschreibungForm.controls.methodik.value;
        ammBeschreibungDTO.methodikIt = this.beschreibungForm.controls.methodik.value;
        ammBeschreibungDTO.massnahmenZielDe = this.beschreibungForm.controls.massnahmenZiel.value;
        ammBeschreibungDTO.massnahmenZielFr = this.beschreibungForm.controls.massnahmenZiel.value;
        ammBeschreibungDTO.massnahmenZielIt = this.beschreibungForm.controls.massnahmenZiel.value;
        ammBeschreibungDTO.abschlussDe = this.beschreibungForm.controls.abschluss.value;
        ammBeschreibungDTO.abschlussFr = this.beschreibungForm.controls.abschluss.value;
        ammBeschreibungDTO.abschlussIt = this.beschreibungForm.controls.abschluss.value;
        ammBeschreibungDTO.spracheId = this.beschreibungForm.controls.sprache.value;
        ammBeschreibungDTO.spracheObject = this.spracheOptions.find(option => option.codeId === this.beschreibungForm.controls.sprache.value) as CodeDTO;
        ammBeschreibungDTO.muendlichKenntnisseId = this.beschreibungForm.controls.muendlichKenntnisse.value;
        ammBeschreibungDTO.muendlichKenntnisseObject = this.muendlichKenntnisseOptions.find(
            option => option.codeId === this.beschreibungForm.controls.muendlichKenntnisse.value
        ) as CodeDTO;
        ammBeschreibungDTO.schriftlichKenntnisseId = this.beschreibungForm.controls.schriftlichKenntnisse.value;
        ammBeschreibungDTO.schriftlichKenntnisseObject = this.schriftlichKenntnisseOptions.find(
            option => option.codeId === this.beschreibungForm.controls.schriftlichKenntnisse.value
        ) as CodeDTO;
        ammBeschreibungDTO.mindestesAusbildungsniveauId = this.beschreibungForm.controls.mindestesAusbildungsniveau.value;
        ammBeschreibungDTO.mindestesAusbildungsniveauObject = this.mindestesAusbildungsniveauOptions.find(
            option => option.codeId === this.beschreibungForm.controls.mindestesAusbildungsniveau.value
        ) as CodeDTO;
        ammBeschreibungDTO.mindestvoraussetzungSonstigesDe = this.beschreibungForm.controls.mindestvoraussetzungSonstiges.value;
        ammBeschreibungDTO.mindestvoraussetzungSonstigesFr = this.beschreibungForm.controls.mindestvoraussetzungSonstiges.value;
        ammBeschreibungDTO.mindestvoraussetzungSonstigesIt = this.beschreibungForm.controls.mindestvoraussetzungSonstiges.value;
        const rangeSliderGroup = this.beschreibungForm.controls.rangeSlider.value;
        ammBeschreibungDTO.altersgruppeVon = rangeSliderGroup.altersgruppeVon;
        ammBeschreibungDTO.altersgruppeBis = rangeSliderGroup.altersgruppeBis;
        ammBeschreibungDTO.berufsgruppeList = (this.beschreibungForm.controls.berufsgruppen as FormArray).controls
            .map(berufsgruppe => (berufsgruppe as FormGroup).controls.berufsgruppe['berufsgruppeAutosuggestObject'])
            .filter(berufsgruppe => berufsgruppe.berufsArtDe !== null);
        ammBeschreibungDTO.funktionList = this.setFunktionList(this.funktionInitialCodeList, this.beschreibungForm.controls.funktionList.value).slice();
        ammBeschreibungDTO.brancheList = (this.beschreibungForm.controls.branchen as FormArray).controls
            .map(branch => (branch as FormGroup).controls.branche['branchAutosuggestObj'])
            .filter(branch => branch.textlangDe !== null);
        ammBeschreibungDTO.problemfeldList = this.filterProblemFeldList(this.beschreibungForm.controls.problemfeldList.value);
        buchungDataCopy.beschreibungObject = ammBeschreibungDTO;
        return buchungDataCopy;
    }

    /**
     * This method loops around the Beurteilungskriterien (problemfeldList) in the Form to find parent nodes which have all of their children selected.
     * These parents are then also marked as selected because this logic is not present in the avam-multiselect-tree component.
     * This allows these parent nodes to remain selected on loading of the data.
     * To be used before mapToDTO logic and/or before saving the Form values in a wizard.
     */
    private updateBeurteilungskriterienParentNodes() {
        const problemFeldList = this.beschreibungForm.controls.problemfeldList.value;
        problemFeldList.forEach(element => {
            if (element.isParent && element.children.every(child => child.value)) {
                element.value = true;
            }
        });
    }

    /**
     * This method loops around the initial codeDTOs for the Funktion MultiSelect and matches against the selected values from the Multiselect Component,
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
     * This function removes the parents from the list and formats the elements of the array in the right form
     */
    private filterProblemFeldList(problemFeldList) {
        const filterdAndMapped: CodeDTO[] = [];
        problemFeldList.forEach(element => {
            if (element.value) {
                const mo = {
                    codeId: element.id,
                    textDe: element.textDe,
                    textIt: element.textIt,
                    textFr: element.textFr,
                    code: element.code
                };
                filterdAndMapped.push(mo);
            }
        });

        return filterdAndMapped;
    }
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
}
