import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormArray, ValidatorFn, FormBuilder } from '@angular/forms';

@Component({
    selector: 'avam-dynamic-input',
    templateUrl: './avam-dynamic-input.component.html',
    styleUrls: ['./avam-dynamic-input.component.scss']
})
export class AvamDynamicInputComponent implements OnInit {
    @Input() parentForm: FormGroup;
    @Input() controlName: string;
    @Input() placeholder: string;
    @Input() label: string;
    @Input() set readOnly(isReadOnly: boolean) {
        this.isReadOnly = isReadOnly;
    }

    isReadOnly: boolean;

    private inputGroup: FormArray;

    private validators: ValidatorFn;

    constructor(private formBuilder: FormBuilder, private changeDetectorRef: ChangeDetectorRef) {}

    ngOnInit() {
        this.parentForm.statusChanges.subscribe(() => {
            this.inputGroup = this.parentForm.controls[this.controlName] as FormArray;

            if (this.inputGroup.value.length) {
                const formGroup: FormGroup = this.inputGroup.controls[0] as FormGroup;
                this.validators = formGroup.controls.inputControl.validator;
            }
        });
    }

    addItem(): void {
        this.inputGroup.push(this.formBuilder.group({ inputControl: [null, this.validators] }));
        this.changeDetectorRef.detectChanges();
        this.parentForm.markAsDirty();
    }

    removeItem(indexToRemove: number): void {
        this.inputGroup.removeAt(indexToRemove);
        this.changeDetectorRef.detectChanges();
        this.parentForm.markAsDirty();
    }
}
