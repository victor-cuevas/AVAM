import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DateValidator } from '@app/shared/validators/date-validator';
import { NumberValidator } from '@app/shared/validators/number-validator';

@Injectable()
export class RahmenvertragSuchenReactiveFormsService {
    searchForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.searchForm = this.formBuilder.group(
            {
                rahmenvertragNr: [null, NumberValidator.isPositiveInteger],
                titel: null,
                anbieterParam: null,
                gueltigDropdown: null,
                gueltigVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gueltigBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                massnahmentypDropdown: null,
                stautusDropdown: null
            },
            {
                validators: DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201')
            }
        );
    }
}
