import { FormGroup, FormBuilder } from '@angular/forms';
import { Injectable } from '@angular/core';
import { DateValidator } from '@app/shared/validators/date-validator';
import { NumberValidator } from '@app/shared/validators/number-validator';

@Injectable()
export class VertragswertSuchenReactiveFormsService {
    searchForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.searchForm = this.formBuilder.group(
            {
                vertragswertNr: [null, NumberValidator.isPositiveInteger],
                profilNummer: [null, NumberValidator.isPositiveInteger],
                anbieterParam: null,
                gueltigVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gueltigBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                leistungsvereinbarungStatusId: null,
                nurAktuelleVertragswerte: null
            },
            {
                validators: DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201')
            }
        );
    }

    toggleEnabledInputs(vertragswertNrValue: any, profilNrValue: any): boolean {
        let disableInputs = false;
        const controls = this.searchForm.controls;

        if (vertragswertNrValue || profilNrValue) {
            disableInputs = true;
            controls.gueltigVon.disable();
            controls.gueltigBis.disable();
            controls.nurAktuelleVertragswerte.disable();
            controls.leistungsvereinbarungStatusId.disable();
        } else {
            disableInputs = false;
            controls.nurAktuelleVertragswerte.enable();
            controls.leistungsvereinbarungStatusId.enable();
            controls.gueltigVon.enable();
            controls.gueltigBis.enable();
            controls.vertragswertNr.enable();
            controls.profilNummer.enable();
        }

        if (vertragswertNrValue) {
            controls.profilNummer.disable();
        } else if (profilNrValue) {
            controls.vertragswertNr.disable();
        }

        return disableInputs;
    }
}
