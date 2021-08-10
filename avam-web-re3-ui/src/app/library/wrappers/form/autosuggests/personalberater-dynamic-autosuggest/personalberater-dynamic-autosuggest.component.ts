import { Component, OnInit, AfterViewInit, Input, ChangeDetectorRef, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormGroup, FormArray, ValidatorFn, FormBuilder, AbstractControl } from '@angular/forms';
import { BenutzerAutosuggestType } from '../avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';

@Component({
    selector: 'avam-personalberater-dynamic-autosuggest',
    templateUrl: './personalberater-dynamic-autosuggest.component.html',
    styleUrls: ['./personalberater-dynamic-autosuggest.component.scss']
})
export class PersonalberaterDynamicAutosuggestComponent implements OnInit, AfterViewInit {
    @Input() parentForm: FormGroup;
    @Input() checkedRadioButtonControlName: string;
    @Input() placeholder: string;
    @Input() hasRadioButtons = false;
    @Input() autoFocus = false;
    @Input() benutzerSuchenTokens = {};
    @Input() set readOnly(state: boolean) {
        this.isReadOnly = state;
    }

    @ViewChildren('radiobuttons') radioButtons: QueryList<ElementRef<HTMLInputElement>>;

    initialCheckedRadioButton = 0;

    isReadOnly: boolean;

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;

    /**
     * Stores the Personalberatern FormArray, which is binded to the parentForm.controls.placeholder in ngOnInit()
     *
     * @private
     * @memberof PersonalberaterDynamicAutosuggestComponent
     */
    private personalberatern: FormArray;

    /**
     * Stores the validators to create the new items with the same behavior
     *
     * @private
     * @memberof PersonalberaterDynamicAutosuggestComponent
     */
    private validators: ValidatorFn;

    constructor(private formBuilder: FormBuilder, private changeDetectorRef: ChangeDetectorRef) {}

    ngOnInit() {
        this.parentForm.statusChanges.subscribe(() => {
            this.personalberatern = this.parentForm.controls.personalberatern as FormArray;

            if (this.personalberatern.value.length) {
                const formGroup: FormGroup = this.personalberatern.controls[0] as FormGroup;
                this.validators = formGroup.controls.personalberater.validator;
            }
        });
    }

    ngAfterViewInit() {
        if (!this.hasRadioButtons) {
            return;
        }

        const radioButtonsArray: ElementRef<HTMLInputElement>[] = this.radioButtons.toArray();
        const defaultRadioButton: ElementRef<HTMLInputElement> = radioButtonsArray[this.initialCheckedRadioButton];

        if (defaultRadioButton) {
            defaultRadioButton.nativeElement.click();
            this.clickRadioButton(this.initialCheckedRadioButton);
        }
    }

    /**
     * Adds a new empty item to the FormArray (this.personalberatern) and marks the form as dirty.
     *
     * @memberof PersonalberaterDynamicAutosuggestComponent
     */
    addItem(): void {
        this.personalberatern.push(this.formBuilder.group({ personalberater: [null, this.validators] }));
        this.changeDetectorRef.detectChanges();
        this.parentForm.markAsDirty();
    }

    /**
     * @param indexToRemove
     *
     * Remove item from the FormArray (this.personalberatern) on the provided indexToRemove.
     * Also marks the form as dirty.
     */
    removeItem(indexToRemove: number): void {
        this.parentForm.markAsDirty();

        if (this.personalberatern.controls.length === 1) {
            const lastFormGroup: FormGroup = this.personalberatern.controls[0] as FormGroup;
            const lastControl: AbstractControl = lastFormGroup.controls.personalberater;

            lastControl.setValue(null);

            return;
        }

        this.personalberatern.removeAt(indexToRemove);

        if (this.hasRadioButtons) {
            this.changeRadioButtonOnRemoveItem(indexToRemove);
        }

        this.changeDetectorRef.detectChanges();
    }

    /**
     * @param index
     *
     * Click radio button at some index.
     * Then assign the new index value to the radio buttons control
     */
    clickRadioButton(index: number) {
        if (!this.checkedRadioButtonControlName || !this.parentForm.controls[this.checkedRadioButtonControlName]) {
            return;
        }

        this.parentForm.controls[this.checkedRadioButtonControlName].setValue(index);
    }

    /**
     * @param indexToRemove
     *
     * While remove itms from the array determine how to change the radio buttons control index value
     */
    changeRadioButtonOnRemoveItem(indexToRemove: number) {
        if (!this.checkedRadioButtonControlName || !this.parentForm.controls[this.checkedRadioButtonControlName]) {
            return;
        }

        const radioButtonsControl: AbstractControl = this.parentForm.controls[this.checkedRadioButtonControlName];

        if (radioButtonsControl.value === indexToRemove) {
            radioButtonsControl.setValue(null);
        }

        if (indexToRemove < radioButtonsControl.value) {
            radioButtonsControl.setValue(radioButtonsControl.value - 1);
        }
    }
}
