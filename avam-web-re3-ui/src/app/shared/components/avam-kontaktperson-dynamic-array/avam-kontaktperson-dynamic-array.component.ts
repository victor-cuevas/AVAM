import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, ValidatorFn } from '@angular/forms';

@Component({
    selector: 'avam-kontaktperson-dynamic-array',
    templateUrl: './avam-kontaktperson-dynamic-array.component.html',
    styleUrls: ['./avam-kontaktperson-dynamic-array.component.scss']
})
export class AvamKontaktpersonDynamicArrayComponent implements OnInit {
    @Input() parentForm: FormGroup;
    @Input() controlArrayName: string;
    @Input() controlName: string;

    @Input() isDisabled: boolean;
    @Input() unternehmenId: number;
    @Input() placeholder: string;
    @Input() showEmail: boolean;

    @Input() set readOnly(isReadOnly: boolean) {
        this.isReadOnly = isReadOnly;
    }

    /**
     * Stores the optional validators to create the new items with the same behavior.
     *
     * @ype {ValidatorFn}
     * @memberof AvamKontaktpersonDynamicArrayComponent
     */
    @Input() optionalValidators: ValidatorFn;

    @Output() onItemAdded: EventEmitter<any> = new EventEmitter();
    @Output() onItemRemoved: EventEmitter<any> = new EventEmitter();

    isReadOnly: boolean;
    rows: any;
    loaded = false;

    kontaktpersonen: FormArray;

    private validators: ValidatorFn;

    constructor(private formBuilder: FormBuilder) {}

    ngOnInit() {
        if (this.parentForm.controls[this.controlArrayName].value.length > 0) {
            this.kontaktpersonen = this.parentForm.controls[this.controlArrayName] as FormArray;
            const formGroup = this.kontaktpersonen.controls[0] as FormGroup;
            this.validators = formGroup.controls[this.controlName].validator;
        }
    }

    /**
     * Adds a new empty item to the FormArray (this.kontaktpersonen) and marks the form dirty.
     *
     * @memberof AvamKontaktpersonDynamicArrayComponent
     */
    addItem(): void {
        this.kontaktpersonen.push(
            this.formBuilder.group({
                [this.controlName]: [null, this.optionalValidators || this.validators]
            })
        );

        this.parentForm.markAsDirty();
        this.onItemAdded.emit();
    }

    /**
     * Removes the item from the FormArray (this.kontaktpersonen), when the trash icon is clicked.
     * Also marks the form dirty.
     *
     * @memberof AvamKontaktpersonDynamicArrayComponent
     */
    removeItem(indexToRemove: number) {
        this.kontaktpersonen.removeAt(indexToRemove);
        if (indexToRemove === 0 && this.optionalValidators) {
            this.kontaktpersonen.controls[0]['controls'][this.controlName].setValidators(this.validators);
            this.kontaktpersonen.controls[0]['controls'][this.controlName].updateValueAndValidity();
        }
        this.parentForm.markAsDirty();
        this.onItemRemoved.emit();
    }

    /**
     *  Marks the form dirty when we have selected a new Kontaktperson from the modal.
     *
     * @memberof AvamKontaktpersonDynamicArrayComponent
     */
    onKontaktpersonSelected() {
        this.parentForm.markAsDirty();
    }

    /**
     *  Marks the form dirty when we have cleared an entry with the clear button.
     *
     * @memberof AvamKontaktpersonDynamicArrayComponent
     */
    onKontaktpersonCleared() {
        this.parentForm.markAsDirty();
    }
}
