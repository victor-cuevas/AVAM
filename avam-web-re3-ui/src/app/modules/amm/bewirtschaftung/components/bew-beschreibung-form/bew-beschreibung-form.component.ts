import { FacadeService } from '@shared/services/facade.service';
import { Component, OnInit, Input, SimpleChanges, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormGroup, FormArray, FormControl, FormGroupDirective } from '@angular/forms';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import { AmmBeschreibungDTO } from '@dtos/ammBeschreibungDTO';
import { ChIscoBerufDTO } from '@dtos/chIscoBerufDTO';
import { CoreMultiselectInterface } from '@app/library/core/core-multiselect/core-multiselect.interface';
import { CodeDTO } from '@dtos/codeDTO';
import { NogaDTO } from '@dtos/nogaDTO';
import { SpracheEnum } from '@app/shared/enums/sprache.enum';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { BewBeschreibungHandlerService } from './bew-beschreibung-handler.service';
import { BewBeschreibungReactiveFormsService } from './bew-beschreibung-reactive-forms.service';
import { BewBeschreibungFormModeService } from './bew-beschreibung-form-mode.service';

@Component({
    selector: 'avam-bew-beschreibung-form',
    templateUrl: './bew-beschreibung-form.component.html',
    providers: [BewBeschreibungHandlerService, BewBeschreibungReactiveFormsService, BewBeschreibungFormModeService]
})
export class BewBeschreibungFormComponent implements OnInit, OnChanges, OnDestroy {
    @Input('beschreibungData') beschreibungData = null;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    public formGroup: FormGroup;
    public modeSubscription: Subscription;
    public erfassungsspracheOptions: any[];
    public spracheOptions: any[];
    public muendlichOptions: any[];
    public schriftlichOptions: any[];
    public ausbildungsniveauOptions: any[];
    public funktionOptions: any[];
    public funktionInitialCodeList: [] = [];
    public beurteilungskriterienOptions: any[];
    public displayGermanElements = false;
    public displayFrenchElements = false;
    public displayItalianElements = false;
    public isIndividuelleAmm: boolean;
    public currentFormMode: FormModeEnum;
    public isReadonly: boolean;

    constructor(
        private router: ActivatedRoute,
        private handler: BewBeschreibungHandlerService,
        private obliqueHelper: ObliqueHelperService,
        private facade: FacadeService,
        public formMode: BewBeschreibungFormModeService
    ) {
        this.formGroup = handler.reactiveForms.beschreibungForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.router.data.subscribe(data => {
            this.formMode.changeMode(data.mode);
        });

        this.modeSubscription = this.formMode.mode$.subscribe(currentMode => {
            this.currentFormMode = currentMode;
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.beschreibungData.currentValue) {
            this.mapData();

            if (this.beschreibungData.beschreibungDto) {
                this.formGroup.reset(this.mapToForm(this.beschreibungData.beschreibungDto));
                this.formGroup.setControl('branchen', this.createBranchenFormArray(this.beschreibungData.beschreibungDto.brancheList));
                this.formGroup.setControl('berufsgruppen', this.createBerufsgruppenFormArray(this.beschreibungData.beschreibungDto.berufsgruppeList));
                this.isIndividuelleAmm = !!this.beschreibungData.isIndividuelleAmm;
                this.isReadonly = this.isIndividuelleAmm && this.currentFormMode === FormModeEnum.EDIT;
            }
        }
    }

    mapData() {
        this.erfassungsspracheOptions = this.handler.mapErfassungsspracheOptions(this.beschreibungData.erfassungsspracheOptions);
        this.spracheOptions = this.handler.mapDropdown(this.beschreibungData.spracheOptions);
        this.muendlichOptions = this.handler.mapDropdown(this.beschreibungData.muendlichOptions);
        this.schriftlichOptions = this.handler.mapDropdown(this.beschreibungData.schriftlichOptions);
        this.ausbildungsniveauOptions = this.handler.mapDropdown(this.beschreibungData.ausbildungsniveauOptions);
        this.funktionInitialCodeList = this.beschreibungData.funktionInitialCodeList;
        this.funktionOptions = this.handler.mapMultiselect(this.beschreibungData.funktionInitialCodeList);
        this.beurteilungskriterienOptions = this.handler.mapTreeOptions(this.beschreibungData.beurteilungskriterienOptions);
    }

    mapToForm(beschreibungDTO: AmmBeschreibungDTO) {
        return {
            erfassungssprache: this.beschreibungData.erfassungsspracheIdBeschreibungState
                ? this.beschreibungData.erfassungsspracheIdBeschreibungState
                : this.facade.formUtilsService.getCodeIdByCode(this.erfassungsspracheOptions, this.facade.translateService.currentLang.toUpperCase()),
            inhaltDe: beschreibungDTO.inhaltDe,
            inhaltFr: beschreibungDTO.inhaltFr,
            inhaltIt: beschreibungDTO.inhaltIt,
            methodikDe: beschreibungDTO.methodikDe,
            methodikFr: beschreibungDTO.methodikFr,
            methodikIt: beschreibungDTO.methodikIt,
            massnahmenzielDe: beschreibungDTO.massnahmenZielDe,
            massnahmenzielFr: beschreibungDTO.massnahmenZielFr,
            massnahmenzielIt: beschreibungDTO.massnahmenZielIt,
            abschlussDe: beschreibungDTO.abschlussDe,
            abschlussFr: beschreibungDTO.abschlussFr,
            abschlussIt: beschreibungDTO.abschlussIt,
            sonstigesDe: beschreibungDTO.mindestvoraussetzungSonstigesDe,
            sonstigesFr: beschreibungDTO.mindestvoraussetzungSonstigesFr,
            sonstigesIt: beschreibungDTO.mindestvoraussetzungSonstigesIt,
            sprache: beschreibungDTO.spracheId,
            muendlich: beschreibungDTO.muendlichKenntnisseId,
            schriftlich: beschreibungDTO.schriftlichKenntnisseId,
            ausbildungsniveau: beschreibungDTO.mindestesAusbildungsniveauId,
            rangeSlider: {
                // Set default values only when we create a produkt and is a first entry
                // all other should not inherit values
                altersgruppeVon:
                    this.beschreibungData.isFirstEntry && this.beschreibungData.isProduktBeschreibung ? this.handler.reactiveForms.defaultMinAge : beschreibungDTO.altersgruppeVon,
                altersgruppeBis:
                    this.beschreibungData.isFirstEntry && this.beschreibungData.isProduktBeschreibung ? this.handler.reactiveForms.defaultMaxAge : beschreibungDTO.altersgruppeBis,
                slider: ['']
            },
            berufsgruppen: [],
            funktionen: this.setFunktionMultiselectOptions(this.funktionOptions, beschreibungDTO.funktionList).slice(),
            branchen: [],
            beurteilungskriterien: this.getSelectedTreeOptions(this.beurteilungskriterienOptions, beschreibungDTO).slice()
        };
    }

    mapToDTO(ammBeschreibungDTO: AmmBeschreibungDTO): AmmBeschreibungDTO {
        const dtoToSave: AmmBeschreibungDTO = { ...ammBeschreibungDTO };

        dtoToSave.inhaltDe = this.formGroup.controls.inhaltDe.value;
        dtoToSave.inhaltFr = this.formGroup.controls.inhaltFr.value;
        dtoToSave.inhaltIt = this.formGroup.controls.inhaltIt.value;
        dtoToSave.methodikDe = this.formGroup.controls.methodikDe.value;
        dtoToSave.methodikFr = this.formGroup.controls.methodikFr.value;
        dtoToSave.methodikIt = this.formGroup.controls.methodikIt.value;
        dtoToSave.massnahmenZielDe = this.formGroup.controls.massnahmenzielDe.value;
        dtoToSave.massnahmenZielFr = this.formGroup.controls.massnahmenzielFr.value;
        dtoToSave.massnahmenZielIt = this.formGroup.controls.massnahmenzielIt.value;
        dtoToSave.abschlussDe = this.formGroup.controls.abschlussDe.value;
        dtoToSave.abschlussFr = this.formGroup.controls.abschlussFr.value;
        dtoToSave.abschlussIt = this.formGroup.controls.abschlussIt.value;
        dtoToSave.mindestvoraussetzungSonstigesDe = this.formGroup.controls.sonstigesDe.value;
        dtoToSave.mindestvoraussetzungSonstigesFr = this.formGroup.controls.sonstigesFr.value;
        dtoToSave.mindestvoraussetzungSonstigesIt = this.formGroup.controls.sonstigesIt.value;
        dtoToSave.spracheId = this.formGroup.controls.sprache.value;
        dtoToSave.spracheObject = this.spracheOptions.find(option => option.codeId === this.formGroup.controls.sprache.value) as CodeDTO;
        dtoToSave.muendlichKenntnisseId = this.formGroup.controls.muendlich.value;
        dtoToSave.muendlichKenntnisseObject = this.muendlichOptions.find(option => option.codeId === this.formGroup.controls.muendlich.value) as CodeDTO;
        dtoToSave.schriftlichKenntnisseId = this.formGroup.controls.schriftlich.value;
        dtoToSave.schriftlichKenntnisseObject = this.schriftlichOptions.find(option => option.codeId === this.formGroup.controls.schriftlich.value) as CodeDTO;
        dtoToSave.mindestesAusbildungsniveauId = this.formGroup.controls.ausbildungsniveau.value;
        dtoToSave.mindestesAusbildungsniveauObject = this.ausbildungsniveauOptions.find(option => option.codeId === this.formGroup.controls.ausbildungsniveau.value) as CodeDTO;

        const rangeSliderGroup = this.formGroup.controls.rangeSlider.value;
        dtoToSave.altersgruppeVon = rangeSliderGroup.altersgruppeVon;
        dtoToSave.altersgruppeBis = rangeSliderGroup.altersgruppeBis;

        dtoToSave.berufsgruppeList = (this.formGroup.controls.berufsgruppen as FormArray).controls.map(
            berufsgruppe => (berufsgruppe as FormGroup).controls.berufsgruppe['berufsgruppeAutosuggestObject']
        );

        dtoToSave.funktionList = this.setFunktionList(this.funktionInitialCodeList, this.formGroup.controls.funktionen.value).slice();
        dtoToSave.brancheList = (this.formGroup.controls.branchen as FormArray).controls.map(branch => (branch as FormGroup).controls.branche['branchAutosuggestObj']);
        dtoToSave.problemfeldList = this.filterProblemFeldList(this.formGroup.controls.beurteilungskriterien.value);

        return dtoToSave;
    }

    onLanguageDropdownChange(selectedLangCodeId) {
        if (selectedLangCodeId) {
            const selectedLangCode = this.facade.formUtilsService.getCodeByCodeId(this.erfassungsspracheOptions, selectedLangCodeId);

            this.displayGermanElements = selectedLangCode === SpracheEnum.DEUTSCH;
            this.displayFrenchElements = selectedLangCode === SpracheEnum.FRANZOESISCH;
            this.displayItalianElements = selectedLangCode === SpracheEnum.ITALIENISCH;
        }
    }

    reset() {
        if (this.formGroup.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.beurteilungskriterienOptions = this.handler.mapTreeOptions(this.beschreibungData.beurteilungskriterienOptions);
                this.formGroup.reset(this.mapToForm(this.beschreibungData.beschreibungDto));
                this.formGroup.setControl('branchen', this.createBranchenFormArray(this.beschreibungData.beschreibungDto.brancheList));
                this.formGroup.setControl('berufsgruppen', this.createBerufsgruppenFormArray(this.beschreibungData.beschreibungDto.berufsgruppeList));
            });
        }
    }

    ngOnDestroy() {
        this.modeSubscription.unsubscribe();
    }

    private createBerufsgruppenFormArray(berufe: ChIscoBerufDTO[]) {
        if (berufe && berufe.length > 0) {
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

    private setFunktionMultiselectOptions(funktionInitialCodeList: CoreMultiselectInterface[], savedFunktionen: any[]): CoreMultiselectInterface[] {
        funktionInitialCodeList.forEach(element => {
            if (savedFunktionen.some(el => (el.id === element.id && el.value) || el.codeId === element.id)) {
                element.value = true;
            } else {
                element.value = false;
            }
        });

        return funktionInitialCodeList;
    }

    private createBranchenFormArray(branchen: NogaDTO[]) {
        if (branchen && branchen.length > 0) {
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

    private setFunktionList(funktionInitialCodeList: CodeDTO[], selectedFunktionen: CoreMultiselectInterface[]) {
        const result: CodeDTO[] = [];

        funktionInitialCodeList.forEach(element => {
            if (selectedFunktionen && selectedFunktionen.some(el => el.value && Number(el.id) === element.codeId)) {
                result.push(element);
            }
        });

        return result;
    }

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
}
