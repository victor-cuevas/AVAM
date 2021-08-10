import { FormGroup, FormBuilder } from '@angular/forms';
import { Injectable } from '@angular/core';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { DateValidator } from '@app/shared/validators/date-validator';

@Injectable()
export class AbrechnungenSuchenReactiveFormService {
    abrechnungSuchenForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.abrechnungSuchenForm = this.createForm();
    }

    createForm(): FormGroup {
        return this.formBuilder.group(
            {
                abrechnungNr: ['', NumberValidator.isPositiveIntegerWithMaxLength(9)],
                titel: '',
                anbieter: '',
                ausfuehrungsdatumVon: ['', [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                ausfuehrungsdatumBis: ['', [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                status: ''
            },
            {
                validators: [DateValidator.rangeBetweenDates('ausfuehrungsdatumVon', 'ausfuehrungsdatumBis', 'val201')]
            }
        );
    }
}
