import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateValidator } from '@app/shared/validators/date-validator';
import { NumberValidator } from '@app/shared/validators/number-validator';

@Injectable()
export class BewPlanwertReactiveFormsService {
    planwertForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.planwertForm = this.formBuilder.group(
            {
                budgetposition: null,
                gueltigVon: null,
                gueltigBis: null,
                ergaenzendeAngaben: null,
                planwertNr: null,
                preismodellTypDropdown: null,
                preismodellDropdown: null,
                preismodellInput: [null, NumberValidator.isNumberInRange(1, 999999999, 'val319', false)],
                chfPreismodel: [null, [Validators.required, NumberValidator.isNumberInRange(0.05, 999999999.95, 'val320', true)]],

                tntagePreismodelRow1: [null, [Validators.required, NumberValidator.isNumberInRange(1, 999999999, 'val319', false), NumberValidator.isPositiveInteger]],
                tntagePreismodelRow2: [null, Validators.required],

                tnPreismodelRow1: [null, [Validators.required, NumberValidator.isNumberInRange(1, 999999999, 'val319', false), NumberValidator.isPositiveInteger]],
                tnPreismodelRow2: [null, Validators.required],

                dePreismodel: [null, [NumberValidator.isNumberInRange(1, 9999, 'val321', false), NumberValidator.isPositiveInteger]],
                lektionenPreismodel: [null, [NumberValidator.isNumberInRange(1, 9999, 'val321', false), NumberValidator.isPositiveInteger]]
            },
            {
                validators: [DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201')]
            }
        );
    }
}
