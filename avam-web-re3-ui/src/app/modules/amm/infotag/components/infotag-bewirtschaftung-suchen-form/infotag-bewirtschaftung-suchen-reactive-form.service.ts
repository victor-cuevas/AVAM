import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DateValidator } from '@app/shared/validators/date-validator';
import { NumberValidator } from '@app/shared/validators/number-validator';

@Injectable()
export class InfotagBewirtschaftungSuchenReactiveFormsService {
    infotagSuchenForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.infotagSuchenForm = this.formBuilder.group(
            {
                strukturCategories: null,
                durchfuehrungsNr: [null, NumberValidator.isPositiveInteger],
                titel: null,
                anbieter: null,
                durchfuehrungVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                durchfuehrungBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                plz: this.formBuilder.group({
                    postleitzahl: null,
                    ort: null
                })
            },
            {
                validators: DateValidator.rangeBetweenDates('durchfuehrungVon', 'durchfuehrungBis', 'val201')
            }
        );
    }
}
