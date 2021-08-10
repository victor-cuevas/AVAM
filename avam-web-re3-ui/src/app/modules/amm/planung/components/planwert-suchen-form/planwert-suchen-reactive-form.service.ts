import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { DateValidator } from '@app/shared/validators/date-validator';

@Injectable()
export class PlanwertSuchenReactiveFormService {
    planwertSuchenForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.planwertSuchenForm = this.formBuilder.group(
            {
                planwertId: [null, NumberValidator.isPositiveIntegerWithMaxLength(9)],
                gueltigVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gueltigBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                massnahmentypCodeUp: null,
                durchfuehrungsRegion: null,
                durchfuehrungsRegionText: null,
                anbieter: null
            },
            {
                validators: DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201')
            }
        );
    }
}
