import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateValidator } from '@app/shared/validators/date-validator';
import { NumberValidator } from '@app/shared/validators/number-validator';

@Injectable()
export class TeilzahlungenSuchenReactiveFormService {
    teilzahlungenSuchenForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.teilzahlungenSuchenForm = this.formBuilder.group(
            {
                teilzahlungNr: [null, NumberValidator.isPositiveIntegerWithMaxLength(9)],
                titel: null,
                anbieter: null,
                gueltigVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gueltigBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                statusTeilzahlung: null
            },

            {
                validators: [DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201')]
            }
        );
    }

    noSearchCriteriaGiven(): boolean {
        return (
            !this.teilzahlungenSuchenForm.controls.teilzahlungNr.value &&
            !this.teilzahlungenSuchenForm.controls.titel.value &&
            !this.teilzahlungenSuchenForm.controls.anbieter.value &&
            !this.teilzahlungenSuchenForm.controls.statusTeilzahlung.value &&
            !this.isDateSelected()
        );
    }

    setDateValidators() {
        const controls = this.teilzahlungenSuchenForm.controls;

        if (controls.gueltigVon.value) {
            controls.gueltigBis.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        } else {
            controls.gueltigBis.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        }

        if (controls.gueltigBis.value) {
            controls.gueltigVon.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        } else {
            controls.gueltigVon.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        }

        this.updateValueAndValidity();
    }

    updateValueAndValidity() {
        this.teilzahlungenSuchenForm.controls.gueltigVon.updateValueAndValidity();
        this.teilzahlungenSuchenForm.controls.gueltigBis.updateValueAndValidity();
    }

    private isDateSelected(): boolean {
        return this.teilzahlungenSuchenForm.controls.gueltigVon.value || this.teilzahlungenSuchenForm.controls.gueltigBis.value;
    }
}
