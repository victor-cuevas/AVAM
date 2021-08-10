import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { DbTranslateService } from '@app/shared/services/db-translate.service';

@Component({
    selector: 'avam-dropdown-array',
    templateUrl: './dropdown-array.component.html',
    styleUrls: ['./dropdown-array.component.scss']
})
export class DropdownArrayComponent implements OnInit {
    @Input() selectedLabel: string;
    @Input() parentForm: FormGroup;
    @Input() formArray: string;
    @Input() dropDownOptions = [];
    @Input() idPrefix: string;
    @Input() inputClass: string;
    @Input() isDisabled: boolean;
    @Input() readOnly = false;

    array: FormArray;
    values: number[] = [null];

    constructor(private formBuilder: FormBuilder, private dbTranslateService: DbTranslateService) {}

    ngOnInit() {
        if (!this.parentForm) {
            throw new Error('Please provide FormGroup "parentForm" as input for this component!');
        }
        if (!this.formArray) {
            throw new Error('Please provide FormArray "formArray" as input for this component!');
        }

        this.array = this.parentForm.get(this.formArray) as FormArray;
        this.array.push(this.createDropdown());
    }

    onAddDropdown() {
        this.array.push(this.createDropdown());
        this.array.markAsDirty();
        this.values.push(null);
    }

    createDropdown(): FormControl {
        return this.formBuilder.control('');
    }

    onRemoveDropdown(index: number) {
        this.array.removeAt(index);
        this.array.markAsDirty();
        this.values.splice(index, 1);
    }

    change(value: number, index: number) {
        this.values[index] = value;
    }

    getReadOnlyValue(index: number): string {
        const selected = this.dropDownOptions.find(option => option.value === this.values[index]);
        return selected ? this.dbTranslateService.translate(selected, 'label') : null;
    }
}
