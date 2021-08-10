import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DateValidator } from '@app/shared/validators/date-validator';
import { NumberValidator } from '@app/shared/validators/number-validator';

@Injectable()
export class AbrechnungswertSuchenReactiveFormService {
    abrechnungswertSuchenForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.abrechnungswertSuchenForm = this.createForm();
    }

    createForm(): FormGroup {
        return this.formBuilder.group(
            {
                abrechnungswertNr: ['', NumberValidator.isPositiveIntegerWithMaxLength(9)],
                profilNr: ['', NumberValidator.isPositiveIntegerWithMaxLength(9)],
                anbieter: '',
                status: '',
                faelligVon: ['', [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                faelligBis: ['', [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                sucheAlleAbrechnungswerte: '',
                sucheNurAktuelleAbrechnungswerte: ''
            },
            {
                validators: [DateValidator.rangeBetweenDates('faelligVon', 'faelligBis', 'val201')]
            }
        );
    }
}
