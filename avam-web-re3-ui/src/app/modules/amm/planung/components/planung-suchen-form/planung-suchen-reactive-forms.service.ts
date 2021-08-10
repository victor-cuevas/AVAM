import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateValidator } from '@app/shared/validators/date-validator';

@Injectable()
export class PlanungSuchenReactiveFormService {
    planungSuchenForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.planungSuchenForm = this.formBuilder.group({
            planungAb: [null, [Validators.required, DateValidator.dateFormatMonthYearNgx, DateValidator.dateValidMonthYearNgx, DateValidator.yearInRange]],
            massnahmeartStruktur: null,
            massnahmetyp: null,
            produktmassnahmenverantwortung: null,
            planungstyp: null,
            durchfuehrungsRegion: null,
            durchfuehrungsRegionText: null,
            anbieter: null
        });
    }
}
