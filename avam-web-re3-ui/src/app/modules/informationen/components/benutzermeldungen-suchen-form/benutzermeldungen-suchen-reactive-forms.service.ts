import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DateValidator } from '@shared/validators/date-validator';

@Injectable()
export class BenutzermeldungenSuchenReactiveFormsService {
    searchForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    private createForm(): void {
        this.searchForm = this.formBuilder.group(
            {
                meldungstyp: null,
                status: null,
                name: null,
                vorname: null,
                gemeldetVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gemeldetBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                kanton: null,
                benutzerstellenVon: null,
                benutzerstellenBis: null
            },
            { validator: DateValidator.rangeBetweenDates('gemeldetVon', 'gemeldetBis', 'val201') }
        );
    }
}
