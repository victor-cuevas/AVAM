import { FormGroup, FormBuilder } from '@angular/forms';
import { Injectable } from '@angular/core';
import { DateValidator } from '@app/shared/validators/date-validator';

@Injectable()
export class AbrechnungswertGrunddatenReactiveFormsService {
    grunddatenForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.grunddatenForm = this.createForm();
    }

    createForm(): FormGroup {
        return this.formBuilder.group({
            gueltig: '',
            eingangam: ['', [DateValidator.isDateInFutureNgx, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            geprueft: ['', [DateValidator.isDateInFutureNgx, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            pruefungDurch: '',
            bemerkung: '',
            abrechnungswertNr: '',
            abrechnungNr: null,
            status: '',
            transferAlk: '',
            abrechnung: null
        });
    }
}
