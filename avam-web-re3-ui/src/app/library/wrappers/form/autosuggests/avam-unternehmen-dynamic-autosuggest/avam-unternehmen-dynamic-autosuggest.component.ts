import { DbTranslateService } from '@shared/services/db-translate.service';
import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, AbstractControl, ValidatorFn } from '@angular/forms';

@Component({
    selector: 'avam-unternehmen-dynamic-autosuggest',
    templateUrl: './avam-unternehmen-dynamic-autosuggest.component.html',
    styleUrls: ['./avam-unternehmen-dynamic-autosuggest.component.scss']
})
export class AvamUnternehmenDynamicAutosuggestComponent implements OnInit {
    @Input() parentForm: FormGroup;
    @Input() controlName: any;
    @Input() placeholder: string;
    @Input() componentLabel: string;
    @Input() suchePlusLabel: string;
    @Input() isAvamOnly = false;
    @Input() set readOnly(isReadOnly: boolean) {
        this.isReadOnly = isReadOnly;
    }

    isReadOnly: boolean;

    readOnlyValues: string[];

    /**
     * Stores the Branche FormArray, which is binded to the parentForm.controls.branche in ngOnInit()
     *
     * @private
     * @memberof AvamBrancheDynamicAutosuggestComponent
     */
    private branchen: FormArray;

    /**
     * Stores the validators to create the new items with the same behavior.
     *
     * @private
     * @memberof AvamBrancheDynamicAutosuggestComponent
     */
    private validators: ValidatorFn;

    constructor(private formBuilder: FormBuilder, private changeDetectorRef: ChangeDetectorRef, private dbTranslateService: DbTranslateService) {}

    ngOnInit() {
        this.parentForm.statusChanges.subscribe(() => {
            if (this.parentForm.controls[this.controlName].value.length > 0) {
                this.branchen = this.parentForm.controls[this.controlName] as FormArray;
                const formGroup = this.branchen.controls[0] as FormGroup;
                this.validators = formGroup.controls.branche.validator;

                this.formatReadonlyValues();
            }
        });

        this.dbTranslateService.getEventEmitter().subscribe(this.formatReadonlyValues.bind(this));
    }

    /**
     * Adds a new empty item to the FormArray (this.branchen) and marks the form dirty.
     *
     * @memberof AvamBrancheDynamicAutosuggestComponent
     */
    addItem(): void {
        this.branchen.push(this.formBuilder.group({ branche: [null, this.validators] }));
        this.changeDetectorRef.detectChanges();
        this.parentForm.markAsDirty();
    }

    /**
     * Removes the item from the FormArray (this.branchen), when the trash icon is clicked.
     * Also marks the form dirty.
     *
     * @memberof AvamBrancheDynamicAutosuggestComponent
     */
    removeItem(indexToRemove: number) {
        this.branchen.removeAt(indexToRemove);
        this.changeDetectorRef.detectChanges();
        this.parentForm.markAsDirty();
    }

    private formatReadonlyValues() {
        this.readOnlyValues = this.branchen.value.map(branchen => {
            return !branchen.branche || typeof branchen.branche === 'string'
                ? branchen.branche
                : `${branchen.branche.nogaCodeUp} / ${this.dbTranslateService.translate(branchen.branche, 'textlang')}`;
        });
    }
}
