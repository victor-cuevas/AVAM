import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { DateValidator } from '@app/shared/validators/date-validator';

@Injectable()
export class LeistungsvereinbarungSuchenReactiveFormsService {
    searchForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.searchForm = this.formBuilder.group(
            {
                leistungsvereinbarungNr: [null, NumberValidator.isPositiveInteger],
                titel: null,
                anbieterParam: null,
                gueltigVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gueltigBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                vertragswertNr: [null, NumberValidator.isPositiveInteger],
                profilNr: [null, NumberValidator.isPositiveInteger],
                statusId: null
            },
            {
                validators: DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201')
            }
        );
    }

    toggleEnabledInputs(leistungsvereinbarungNrValue: any, vertragswertNrValue: any, profilNrValue: any): boolean {
        let disableInputs = false;
        const controls = this.searchForm.controls;

        if (leistungsvereinbarungNrValue || vertragswertNrValue || profilNrValue) {
            disableInputs = true;
            controls.titel.disable();
            controls.statusId.disable();
            controls.gueltigVon.disable();
            controls.gueltigBis.disable();
        } else {
            disableInputs = false;
            controls.titel.enable();
            controls.statusId.enable();
            controls.gueltigVon.enable();
            controls.gueltigBis.enable();
            controls.leistungsvereinbarungNr.enable();
            controls.vertragswertNr.enable();
            controls.profilNr.enable();
        }

        if (leistungsvereinbarungNrValue) {
            controls.vertragswertNr.disable();
            controls.profilNr.disable();
        } else if (vertragswertNrValue) {
            controls.leistungsvereinbarungNr.disable();
            controls.profilNr.disable();
        } else if (profilNrValue) {
            controls.leistungsvereinbarungNr.disable();
            controls.vertragswertNr.disable();
        }

        return disableInputs;
    }
}
