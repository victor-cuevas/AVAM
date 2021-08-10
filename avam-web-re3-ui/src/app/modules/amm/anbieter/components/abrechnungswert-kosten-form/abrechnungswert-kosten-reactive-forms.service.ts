import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateValidator } from '@app/shared/validators/date-validator';
import { NumberValidator } from '@app/shared/validators/number-validator';

@Injectable()
export class AbrechnungswertKostenReactiveFormsService {
    kostenForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.kostenForm = this.createForm();
    }

    createForm(): FormGroup {
        return this.formBuilder.group({
            gesamtKosten: ['', [Validators.required, NumberValidator.isNumberInRange(0, 999999999.95, 'val299', true)]],
            nichtAnrechenbareKosten: ['', NumberValidator.isNumberInRange(0, 999999999.95, 'val299', true)],
            projektrelKosten: '',
            umsatz: ['', NumberValidator.isNumberInRange(0, 999999999.95, 'val299', true)],
            anrechenbareKosten: '',
            awAnzahlTeilnehmer: '',
            awAnzahlTeilnehmerTage: '',
            anzahlDfe: '',
            alvRelevant: '',
            summeTeilzahlungswerte: '',
            saldoALV: '',
            faelligAm: ['', [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]]
        });
    }
}
