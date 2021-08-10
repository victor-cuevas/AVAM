import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { DateValidator } from '@app/shared/validators/date-validator';

@Injectable()
export class TeilzahlungswertSuchenReactiveFormService {
    teilzahlungswertSuchenForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.teilzahlungswertSuchenForm = this.createForm();
    }

    createForm(): FormGroup {
        return this.formBuilder.group(
            {
                teilzahlungswertNr: ['', NumberValidator.isPositiveIntegerWithMaxLength(9)],
                profilNr: ['', NumberValidator.isPositiveIntegerWithMaxLength(9)],
                anbieter: '',
                status: '',
                faelligVon: ['', [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                faelligBis: ['', [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                sucheAlleTeilzahlungswerte: '',
                sucheNurAktuelleTeilzahlungswerte: ''
            },
            {
                validators: [DateValidator.rangeBetweenDates('faelligVon', 'faelligBis', 'val201')]
            }
        );
    }
}
