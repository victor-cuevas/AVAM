import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateValidator } from '@shared/validators/date-validator';
import { PersonenNrValidator } from '@shared/validators/personenNr-validator';

@Injectable()
export class BenutzerstelleErweiterteDatenReactiveFormsService {
    form: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.form = this.createForm();
    }

    private createForm(): FormGroup {
        return this.formBuilder.group(
            {
                arbeitssprache: [null, Validators.required],
                kanton: null,
                leiter: [null, Validators.required],
                ravAdresseStatistik: null,
                kundenIdPost: [null, PersonenNrValidator.val011],
                vsaa: null,
                scanStation: null,
                jobRoom: null,
                gueltigAb: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gueltigBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]]
            },
            {
                validators: [DateValidator.rangeBetweenDates('gueltigAb', 'gueltigBis', 'val201')]
            }
        );
    }
}
