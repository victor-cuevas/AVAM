import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { CoreMultiselectInterface } from '@app/library/core/core-multiselect/core-multiselect.interface';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { ChIscoBerufDTO } from '@app/shared/models/dtos-generated/chIscoBerufDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { NogaDTO } from '@app/shared/models/dtos-generated/nogaDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { SpinnerService } from 'oblique-reactive';
import { forkJoin } from 'rxjs';
import { AngebotsdatenPageData } from '../../angebotsdaten-sichten.component';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-angebotsdaten-beschreibung',
    templateUrl: './angebotsdaten-beschreibung.component.html',
    styleUrls: ['./angebotsdaten-beschreibung.component.scss']
})
export class AngebotsdatenBeschreibungComponent implements OnInit {
    @Input() ammBuchung: AmmBuchungParamDTO;
    @Input() massnahmenType: string;
    @Input() pageData: AngebotsdatenPageData;
    @Input() spinnerChannel: string;

    massnahmenTypes: typeof AmmMassnahmenCode = AmmMassnahmenCode;

    angebotsatenBeschreibungForm: FormGroup;
    spracheOptions: CodeDTO[] = [];
    muendlichKenntnisseOptions: CodeDTO[] = [];
    schriftlichKenntnisseOptions: CodeDTO[] = [];
    mindestesAusbildungsniveauOptions: CodeDTO[] = [];
    funktionOptions: CodeDTO[] = [];
    problemfeldOptions: CodeDTO[] = [];
    unternehmenName: string;
    burNr: number;
    status: string;
    unternehmenLabel: string;

    defaultParentEnding = '0';
    defaultMinAge = 16;
    defaultMaxAge = 65;

    constructor(
        private formBuilder: FormBuilder,
        private dataRestService: StesDataRestService,
        private dbTranslateService: DbTranslateService,
        private spinnerService: SpinnerService,
        private facade: FacadeService
    ) {}

    ngOnInit() {
        this.angebotsatenBeschreibungForm = this.createFormGroup();
        this.getData();
        this.getUnternehmenLabel();
        if (this.ammBuchung.unternehmenObject) {
            this.unternehmenName = this.getUnternehmenName();
            this.burNr = this.getBurNr();
            this.status = this.getStatus();
        }
    }

    getUnternehmenLabel() {
        if (this.massnahmenType === this.massnahmenTypes.AP || this.massnahmenType === this.massnahmenTypes.BP) {
            this.unternehmenLabel = 'amm.massnahmen.label.arbeitgeber';
        } else {
            this.unternehmenLabel = 'amm.massnahmen.label.anbieter';
        }
    }

    getStatus(): string {
        if (this.ammBuchung.unternehmenObject.statusObject) {
            return `${this.dbTranslateService.translateWithOrder(this.ammBuchung.unternehmenObject.statusObject, 'text')}`;
        }
        return null;
    }

    getBurNr(): number {
        return this.ammBuchung.unternehmenObject.provBurNr ? this.ammBuchung.unternehmenObject.provBurNr : this.ammBuchung.unternehmenObject.burNummer;
    }

    getUnternehmenName(): string {
        const name1 = this.ammBuchung.unternehmenObject.name1 ? this.ammBuchung.unternehmenObject.name1 : '';
        const name2 = this.ammBuchung.unternehmenObject.name2 ? this.ammBuchung.unternehmenObject.name2 : '';
        const name3 = this.ammBuchung.unternehmenObject.name3 ? this.ammBuchung.unternehmenObject.name3 : '';
        return `${name1} ${name2} ${name3}`;
    }

    createFormGroup(): FormGroup {
        return this.formBuilder.group({
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
                altersgruppeVon: this.defaultMinAge,
                altersgruppeBis: this.defaultMaxAge,
                slider: ['']
            }),
            berufsgruppen: this.formBuilder.array([]),
            funktionList: null,
            branchen: this.formBuilder.array([]),
            problemfeldList: null
        });
    }

    getData() {
        this.spinnerService.activate(this.spinnerChannel);
        forkJoin([
            this.dataRestService.getCode(DomainEnum.BERUFSFUNKTION),
            this.dataRestService.getCode(DomainEnum.STESHANDLUNGSFELD),
            this.dataRestService.getCode(DomainEnum.SPRACHE),
            this.dataRestService.getCode(DomainEnum.SPRACHKENNTNISSE),
            this.dataRestService.getCode(DomainEnum.AUSBILDUNGSNIVEAU)
        ]).subscribe(
            ([berufsfunktion, beurteilungskriterien, sprache, kenntnisse, ausbildungsNiveau]) => {
                this.problemfeldOptions = this.mapTreeOptions(beurteilungskriterien);
                this.problemfeldOptions = this.getSelectedTreeOptions(this.problemfeldOptions, this.ammBuchung.beschreibungObject).slice();

                this.funktionOptions = this.setFunktionMultiselectOptions(berufsfunktion, this.ammBuchung.beschreibungObject.funktionList).slice();
                this.spracheOptions = this.facade.formUtilsService.mapDropdownKurztext(sprache);
                this.muendlichKenntnisseOptions = this.facade.formUtilsService.mapDropdownKurztext(kenntnisse);
                this.schriftlichKenntnisseOptions = this.facade.formUtilsService.mapDropdownKurztext(kenntnisse);
                this.mindestesAusbildungsniveauOptions = this.facade.formUtilsService.mapDropdownKurztext(ausbildungsNiveau);
                this.angebotsatenBeschreibungForm.controls.branchen = this.createBranchenFormArray(this.ammBuchung.beschreibungObject.brancheList);
                this.angebotsatenBeschreibungForm.setControl('berufsgruppen', this.createBerufsgruppenFormArray(this.ammBuchung.beschreibungObject.berufsgruppeList));

                this.angebotsatenBeschreibungForm.patchValue(this.mapToForm());
                this.spinnerService.deactivate(this.spinnerChannel);
            },
            () => {
                this.spinnerService.deactivate(this.spinnerChannel);
            }
        );
    }

    mapToForm() {
        return {
            inhalt: this.dbTranslateService.translateWithOrder(this.ammBuchung.beschreibungObject, 'inhalt'),
            methodik: this.dbTranslateService.translateWithOrder(this.ammBuchung.beschreibungObject, 'methodik'),
            massnahmenZiel: this.dbTranslateService.translateWithOrder(this.ammBuchung.beschreibungObject, 'massnahmenZiel'),
            abschluss: this.dbTranslateService.translateWithOrder(this.ammBuchung.beschreibungObject, 'abschluss'),

            sprache: this.ammBuchung.beschreibungObject.spracheId,
            muendlichKenntnisse: this.ammBuchung.beschreibungObject.muendlichKenntnisseId,
            schriftlichKenntnisse: this.ammBuchung.beschreibungObject.schriftlichKenntnisseId,
            mindestesAusbildungsniveau: this.ammBuchung.beschreibungObject.mindestesAusbildungsniveauId,
            mindestvoraussetzungSonstiges: this.dbTranslateService.translateWithOrder(this.ammBuchung.beschreibungObject, 'mindestvoraussetzungSonstiges'),

            rangeSlider: {
                altersgruppeVon: this.ammBuchung.beschreibungObject.altersgruppeVon ? String(this.ammBuchung.beschreibungObject.altersgruppeVon) : '',
                altersgruppeBis: this.ammBuchung.beschreibungObject.altersgruppeBis ? String(this.ammBuchung.beschreibungObject.altersgruppeBis) : '',
                slider: ['']
            }
        };
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

    mapTreeOptions(initialOptions: CodeDTO[]) {
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

    getChildren(initialOptions, group, parentId) {
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

    getSelectedTreeOptions(problemfeldOptions, beschreibungObject) {
        if (beschreibungObject && beschreibungObject.problemfeldList) {
            this.mapSelectedOptions(problemfeldOptions, beschreibungObject.problemfeldList);
        }
        return problemfeldOptions;
    }

    mapSelectedOptions(items, selected) {
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

    setFunktionMultiselectOptions(funktionInitialCodeList: CodeDTO[], savedFunktionen: any[]): CoreMultiselectInterface[] {
        const mappedOptions = funktionInitialCodeList.map(this.mapMultiselect);

        if (savedFunktionen.length < 1) {
            mappedOptions[0].value = true;
        }

        mappedOptions.forEach(element => {
            if (savedFunktionen.some(el => (el.id === element.id && el.value) || el.codeId === element.id)) {
                element.value = true;
            }
        });
        return mappedOptions;
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

    mapMultiselect = element => {
        return {
            id: element.codeId,
            textDe: element.textDe,
            textIt: element.textIt,
            textFr: element.textFr,
            value: false
        };
    };
}
