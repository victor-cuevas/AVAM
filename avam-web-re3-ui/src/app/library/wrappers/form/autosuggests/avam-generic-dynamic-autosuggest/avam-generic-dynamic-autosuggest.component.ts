import { DbTranslateService } from '@shared/services/db-translate.service';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { AutosuggestTypesEnum } from '@shared/enums/autosuggest-types.enum';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';

@Component({
    selector: 'avam-generic-dynamic-autosuggest',
    templateUrl: './avam-generic-dynamic-autosuggest.component.html'
})
export class AvamGenericDynamicAutosuggestComponent implements OnInit {
    @Input() parentForm: FormGroup;
    @Input() controlArrayName: string;
    @Input() controlName: string;
    @Input() toolTip: string;
    @Input() componentLabel: any;
    @Input() placeholder: string;
    @Input() isDisabled: boolean;

    @Input() set readOnly(isReadOnly: boolean) {
        this.isReadOnly = isReadOnly;
    }

    /**
     * Value from AutosuggestTipesEnum to select the autosuggest to be showed.
     *
     * @type {AutosuggestTypesEnum}
     * @memberof AvamGenericDynamicAutosuggestComponent
     */
    @Input() autosuggestSelected: AutosuggestTypesEnum;

    /**
     * Benuzter token to send to AvamPersonalberaterAutosuggestComponent.
     *
     * @memberof AvamGenericDynamicAutosuggestComponent
     */
    @Input() benutzerSuchenTokens: {} = {};

    /**
     *BENUTZER_ALLE returns users without restrictions
     *BENUTZER returns authorized users (where token myVollzugsregionTyp = null) OR users from Vollzugsregion  (where token myVollzugsregionTyp != null) where restrictions apply
     *
     *to send to AvamPersonalberaterAutosuggestComponent.
     *
     * @type {BenutzerAutosuggestType}
     * @memberof AvamGenericDynamicAutosuggestComponent
     */
    @Input() type: BenutzerAutosuggestType;

    /**
     * Show filter to send to AvamPersonalberaterAutosuggestComponent.
     *
     * @type {boolean}
     * @memberof AvamGenericDynamicAutosuggestComponent
     */
    @Input() showFilter = false;

    /**
     * Show email button next to the field (for AvamPersonalberaterAutosuggesetComponent).
     *
     * @type {boolean}
     * @memberof AvamGenericDynamicAutosuggestComponent
     */
    @Input() showEmail = false;

    /**
     * Property which determines whether the SuchePlus supports search only in Avam or in both Avam and BUR
     *
     * @type {boolean}
     * @memberof AvamGenericDynamicAutosuggestComponent
     */
    @Input() isAvamOnly: boolean;

    /**
     * A property which indicates if the autosuggest is used as simple input.
     *
     * @type {boolean}
     * @memberof AvamGenericDynamicAutosuggestComponent
     */
    @Input() simpleInput: boolean;

    /**
     * The label of the SuchePlus Modal window.
     *
     * @type {string}
     * @memberof AvamGenericDynamicAutosuggestComponent
     */
    @Input() suchePlusLabel: string;

    /**
     * Stores the optional validators to create the new items with the same behavior.
     *
     * @ype {ValidatorFn}
     * @memberof AvamGenericDynamicAutosuggestComponent
     */
    @Input() optionalValidators: ValidatorFn;

    isReadOnly: boolean;

    readOnlyValues: string[];

    autosuggestEnum = AutosuggestTypesEnum;

    /**
     * Stores the Autosuggest FormArray, which is binded to the parentForm.controls[this.controlName] in ngOnInit()
     *
     * @private
     * @memberof AvamGenericDynamicAutosuggestComponent
     */
    private autosuggestArray: FormArray;

    /**
     * Stores the validators to create the new items with the same behavior.
     *
     * @private
     * @memberof AvamGenericDynamicAutosuggestComponent
     */
    private validators: ValidatorFn;

    constructor(private formBuilder: FormBuilder, private changeDetectorRef: ChangeDetectorRef, private dbTranslateService: DbTranslateService) {}

    ngOnInit() {
        if (this.parentForm.controls[this.controlArrayName].value.length > 0) {
            this.autosuggestArray = this.parentForm.controls[this.controlArrayName] as FormArray;
            const formGroup = this.autosuggestArray.controls[0] as FormGroup;
            this.validators = formGroup.controls[this.controlName].validator;

            this.formatReadonlyValues();
        }

        this.dbTranslateService.getEventEmitter().subscribe(this.formatReadonlyValues.bind(this));
    }

    /**
     * Adds a new empty item to the FormArray (this.autosuggestArray) and marks the form dirty.
     *
     * @memberof AvamGenericDynamicAutosuggestComponent
     */
    addItem(): void {
        this.autosuggestArray.push(this.formBuilder.group({ [this.controlName]: [null, this.optionalValidators || this.validators] }));
        this.changeDetectorRef.detectChanges();
        this.parentForm.markAsDirty();
    }

    /**
     * Removes the item from the FormArray (this.autosuggestArray), when the trash icon is clicked.
     * Also marks the form dirty.
     *
     * @memberof AvamGenericDynamicAutosuggestComponent
     */
    removeItem(indexToRemove: number) {
        this.autosuggestArray.removeAt(indexToRemove);
        if (indexToRemove === 0 && this.optionalValidators) {
            this.autosuggestArray.controls[0]['controls'][this.controlName].setValidators(this.validators);
            this.autosuggestArray.controls[0]['controls'][this.controlName].updateValueAndValidity();
        }
        this.changeDetectorRef.detectChanges();
        this.parentForm.markAsDirty();
    }

    private formatReadonlyValues() {
        this.readOnlyValues = this.autosuggestArray.value.map(control => {
            if (!control[this.controlName] || typeof control[this.controlName] === 'string') {
                return control[this.controlName];
            } else {
                return this.getReadonlyValue(control[this.controlName]);
            }
        });
    }

    private getReadonlyValue(object) {
        switch (this.autosuggestSelected) {
            case AutosuggestTypesEnum.PERSONALBERATER:
                return `${object.benutzerLogin} ${object.nachname} ${object.vorname} ${object.benuStelleCode}`;
            case AutosuggestTypesEnum.BRANCHE:
                return `${object.nogaCodeUp} / ${this.dbTranslateService.translate(object, 'textlang')}`;
            case AutosuggestTypesEnum.BERUFSGRUPPE:
                return `${this.dbTranslateService.translate(object, 'translatedBerufsGruppe')}`;
            default:
                return '';
        }
    }
}
