import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { DateValidator } from '@app/shared/validators/date-validator';

@Injectable()
export class TeilzahlungswertReactiveFormsService {
    teilzahlungswert: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.teilzahlungswert = this.formBuilder.group({
            vertragswertchf: null,
            chf: [null, [Validators.required, NumberValidator.isNumberInRange(0, 999999999.95, 'val299', true)]],
            faelligAm: [null, [Validators.required, DateValidator.val083, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            gueltig: null,
            bemerkung: null,
            teilzahlungswertNr: null,
            teilzahlungsNr: null,
            status: null,
            transferAlk: null,
            freigegebeneAbrechnung: null,
            selectedTeilzahlung: null
        });
    }
}
