import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NumberValidator } from '@app/shared/validators/number-validator';

@Injectable()
export class BudgetSuchenReactiveFormsService {
    budgetSuchenForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.budgetSuchenForm = this.createForm();
    }

    createForm(): FormGroup {
        return this.formBuilder.group({
            organisation: '',
            jahr: ['', [NumberValidator.isPositiveInteger, NumberValidator.val211, NumberValidator.val210(1900, 9999)]],
            version: ['', [NumberValidator.isPositiveInteger]],
            status: ''
        });
    }
}
