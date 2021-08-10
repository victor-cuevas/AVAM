import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeistungsvereinbarungDTO } from '@app/shared/models/dtos-generated/leistungsvereinbarungDTO';
import { DateValidator } from '@app/shared/validators/date-validator';

@Injectable()
export class RahmenvertragReactiveFormsService {
    rahmenvertragForm: FormGroup;
    constructor(private formBuilder: FormBuilder) {
        this.rahmenvertragForm = this.createForm();
    }
    createForm(): FormGroup {
        return this.formBuilder.group(
            {
                titel: null,
                bemerkung: null,
                gueltigDropdown: null,
                gueltigVon: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx, DateValidator.dateRangeBiggerCenturyNgx]],
                gueltigBis: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                massnahmentyp: [null, Validators.required],
                bearbeitungDurch: null,
                rahmenvertragNr: null,
                status: null,
                freigabeDurch: null,
                freigabedatum: null
            },
            {
                validators: DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201', true, true)
            }
        );
    }

    setAdditionalDateValidators(leistungsvereinbarungen: LeistungsvereinbarungDTO[]) {
        if (leistungsvereinbarungen && leistungsvereinbarungen.length > 0) {
            const earliestLeistungsvereinbarung = leistungsvereinbarungen.reduce((element, result) => {
                if (!result) {
                    return element;
                }
                return element.gueltigVon < result.gueltigVon ? element : result;
            });

            const latestLeistungsvereinbarung = leistungsvereinbarungen.reduce((element, result) => {
                if (!result) {
                    return element;
                }
                return element.gueltigVon > result.gueltigVon ? element : result;
            });

            this.rahmenvertragForm.controls.gueltigVon.setValidators([
                this.rahmenvertragForm.controls.gueltigVon.validator,
                DateValidator.checkDateSameOrAfter(earliestLeistungsvereinbarung.gueltigVon, 'val300')
            ]);
            this.rahmenvertragForm.controls.gueltigBis.setValidators([
                this.rahmenvertragForm.controls.gueltigBis.validator,
                DateValidator.checkDateSameOrBefore(latestLeistungsvereinbarung.gueltigBis, 'val301')
            ]);
        }
    }
}
