import { Component, OnInit, Input, ViewChildren, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { ErweiterteSucheDTO } from '@app/shared/models/dtos/erweiterte-suche-dto.interface';
import { ErweiterteSucheIdLabelDTO } from '@app/shared/models/dtos/erweiterte-suche-id-label-dto.interface';
import { Subject, Subscription } from 'rxjs';
import { StesSearchRestService } from '@app/core/http/stes-search-rest.service';

@Component({
    selector: 'avam-erweiterte-suche',
    templateUrl: './erweiterte-suche.component.html',
    styleUrls: ['./erweiterte-suche.component.scss'],
    providers: [ObliqueHelperService]
})
export class ErweiterteSucheComponent implements OnInit {
    @Input() arrayName: string;
    @Input() parentForm: FormGroup;
    @Input() contextId: string;
    @Input() unternehmensType: string;
    @Input() isDisabled = false;
    @Output() onClick: EventEmitter<any> = new EventEmitter();

    @ViewChildren('ngForm') ngForm: any;

    extraCriteriaLoaded: Subject<ErweiterteSucheDTO> = new Subject();

    get criteria(): FormArray {
        return this.parentForm.get(this.arrayName) as FormArray;
    }

    /** Pushing or removing elements should always happen for both arrays at the same time! */
    staticChildrenParents: string[] = [];
    staticChildrenOptions: any[][] = [];

    /** Pushing or removing elements should always happen for both arrays at the same time! */
    staticComparatorParents: string[] = [];
    staticComparatorOptions: any[][] = [];

    /** Pushing or removing elements should always happen for both arrays at the same time! */
    staticGrandChildParents: string[] = [];
    staticGrandChildOptions: any[][] = [];

    staticParentOptions: any[] = [];

    selectedChildrenOptions = [];
    selectedComparatorOptions = [];
    selectedGrandChildOptions = [];
    isEWSDropdown = [];

    dataServiceSub: Subscription;

    constructor(private formBuilder: FormBuilder, private obliqueHelperService: ObliqueHelperService, private dataService: StesSearchRestService) {}

    ngOnInit() {
        this.obliqueHelperService.ngForm = this.ngForm;
        this.loadExtraCriteria();
    }

    onAddExtraCriteria(): void {
        this.criteria.push(this.buildExtraCriteriaInput());
        this.onClick.emit();
    }

    onRemoveExtraCriteria(index: number): void {
        this.criteria.removeAt(index);
        this.selectedChildrenOptions.splice(index, 1);
        this.selectedComparatorOptions.splice(index, 1);
        this.selectedGrandChildOptions.splice(index, 1);
        this.isEWSDropdown.splice(index, 1);
    }

    buildExtraCriteriaInput() {
        return this.formBuilder.group({
            searchLevel1: [''],
            searchFieldId: [''],
            searchLevel3: [''],
            comparatorId: [''],
            searchFreeText: [''],
            searchValue: ['']
        });
    }

    buildExtraCriteriaOutput() {
        return {
            searchFieldId: '',
            comparatorId: '',
            searchValue: ''
        };
    }

    reloadChildrenOptions(parentId: string, index: number) {
        this.selectedChildrenOptions[index] = [];
        this.selectedComparatorOptions[index] = [];
        this.selectedGrandChildOptions[index] = [];
        for (let childIndex = 0; childIndex < this.staticChildrenOptions.length; childIndex++) {
            const child = this.staticChildrenOptions[childIndex];
            const childsParentId = this.staticChildrenParents[childIndex];

            if (childsParentId === parentId) {
                this.selectedChildrenOptions[index] = child;

                (this.getExtraCriteria()[index] as FormGroup).controls.searchFieldId.setValue(this.selectedChildrenOptions[index][0].codeId);
                this.reloadComparatorsAndGrandChildOptions(child[0].codeId, index);
            }
        }
    }

    reloadComparatorsAndGrandChildOptions(childId: string, index: number) {
        this.selectedComparatorOptions[index] = [];
        this.selectedGrandChildOptions[index] = [];
        for (let comparatorIndex = 0; comparatorIndex < this.staticComparatorOptions.length; comparatorIndex++) {
            const comparator = this.staticComparatorOptions[comparatorIndex];
            const comparatorParentId = this.staticComparatorParents[comparatorIndex];
            if (comparatorParentId === childId) {
                this.selectedComparatorOptions[index] = comparator;

                (this.getExtraCriteria()[index] as FormGroup).controls.comparatorId.setValue(this.selectedComparatorOptions[index][0].codeId);
            }
        }
        for (let grandChildIndex = 0; grandChildIndex < this.staticGrandChildOptions.length; grandChildIndex++) {
            const grandChild = this.staticGrandChildOptions[grandChildIndex];
            const grandChildsParentId = this.staticGrandChildParents[grandChildIndex];
            if (grandChildsParentId === childId) {
                this.selectedGrandChildOptions[index] = grandChild;
                if (grandChild.length > 0) {
                    (this.getExtraCriteria()[index] as FormGroup).controls.searchLevel3.setValue(this.selectedGrandChildOptions[index][0].codeId);
                }
                this.isEWSDropdown[index] = grandChild.length > 0;
            }
        }
    }

    getExtraCriteria() {
        return this.criteria.controls;
    }

    loadExtraCriteria(): void {
        this.dataServiceSub = this.dataService.getExtraCriteriaForAktionen(this.contextId).subscribe((data: ErweiterteSucheDTO) => {
            this.staticParentOptions = data.fieldGroupIdLabelBeans ? data.fieldGroupIdLabelBeans.map(this.customPropertyMapperTranslationKey) : [];
            for (const parentField of data.fieldGroupIdLabelBeans) {
                this.staticChildrenOptions.push(parentField.children ? parentField.children.map(this.customPropertyMapperTranslationKey) : []);
                this.staticChildrenParents.push(parentField.id);
                for (const childField of parentField.children) {
                    const comparatorData: ErweiterteSucheIdLabelDTO[] = this.getEWSQualifier(data, childField.dataTypeDate, childField.dataTypeDecimal, childField.dataTypeText);
                    this.staticComparatorOptions.push(comparatorData ? comparatorData.map(this.customPropertyMapperTranslationKey) : []);
                    this.staticComparatorParents.push(childField.id);
                    this.staticGrandChildOptions.push(childField.children ? childField.children.map(this.customPropertyMapper) : []);
                    this.staticGrandChildParents.push(childField.id);
                }
            }
            this.extraCriteriaLoaded.next(data);
        });
    }

    getEWSQualifier(data: ErweiterteSucheDTO, typeDate: boolean, typeDecimal: boolean, typeText: boolean): ErweiterteSucheIdLabelDTO[] {
        if (typeDate || typeDecimal) {
            return data.numberComparatorIdLabelBeans;
        } else if (typeText) {
            return data.stringComparatorIdLabelBeans;
        } else {
            return data.idComparatorIdLabelBeans;
        }
    }

    onReset(): void {
        let i = this.criteria.length;
        while (i > 0) {
            this.onRemoveExtraCriteria(--i);
        }
    }

    prepareEnhancedCriteriaForm(): void {
        this.getExtraCriteria().forEach((extraComponent, idx) => {
            if (extraComponent.get('searchLevel3').value) {
                this.criteria[idx] = {
                    searchFieldId: extraComponent.get('searchFieldId').value,
                    comparatorId: extraComponent.get('comparatorId').value,
                    searchValue: extraComponent.get('searchLevel3').value
                };
            } else if (extraComponent.get('searchFreeText').value) {
                this.criteria[idx] = {
                    searchFieldId: extraComponent.get('searchFieldId').value,
                    comparatorId: extraComponent.get('comparatorId').value,
                    searchValue: extraComponent.get('searchFreeText').value
                };
            } else {
                this.criteria[idx] = {
                    searchFieldId: extraComponent.get('searchFieldId').value,
                    comparatorId: extraComponent.get('comparatorId').value,
                    searchValue: null
                };
            }
        });
    }

    private customPropertyMapperTranslationKey = (element: ErweiterteSucheIdLabelDTO) => {
        return {
            value: element.id,
            code: element.id,
            codeId: element.id,
            labelKey:
                element.label === 'erweitertesuche.label.unternehmensdaten' && this.unternehmensType
                    ? `erweitertesuche.label.unternehmensdaten.${this.unternehmensType}`
                    : element.label
        };
    };

    private customPropertyMapper = (element: ErweiterteSucheIdLabelDTO) => {
        return {
            value: element.id,
            code: element.id,
            codeId: element.id,
            labelFr: element.labelFr,
            labelIt: element.labelIt,
            labelDe: element.labelDe
        };
    };
}
