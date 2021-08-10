import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';
import { DateValidator } from '@app/shared/validators/date-validator';

@Injectable()
export class DateRangeReactiveFormsService {
    searchForm: FormGroup;

    previousYear = new Date().getFullYear() - 1;

    constructor(private formBuilder: FormBuilder, private formUtils: FormUtilsService) {
        this.createForm();
    }

    createForm() {
        this.searchForm = this.formBuilder.group(
            {
                gueltigVon: [this.formUtils.parseDate(new Date(this.previousYear, 0, 1)), [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gueltigBis: [this.formUtils.parseDate(new Date(2099, 11, 31)), [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]]
            },
            {
                validators: DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201')
            }
        );
    }
}
