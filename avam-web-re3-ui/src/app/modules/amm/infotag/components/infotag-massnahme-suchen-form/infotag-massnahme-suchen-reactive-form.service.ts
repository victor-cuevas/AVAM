import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DateValidator } from '@app/shared/validators/date-validator';
import { NumberValidator } from '@app/shared/validators/number-validator';

@Injectable()
export class InfotagMassnahmeSuchenReactiveFormsService {
    massnahmeSuchenForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.massnahmeSuchenForm = this.formBuilder.group(
            {
                strukturCategories: null,
                massnahmenNr: [null, NumberValidator.isPositiveInteger],
                titel: null,
                anbieter: null,
                massnahmenverantwortung: null,
                gueltigVon: ['', [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gueltigBis: ['', [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]]
            },
            {
                validators: DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201')
            }
        );
    }
}
