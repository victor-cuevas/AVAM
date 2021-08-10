import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { DateValidator } from '@app/shared/validators/date-validator';

@Injectable()
export class BewMassnahmeKostenReactiveForms {
    searchForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.searchForm = this.formBuilder.group(
            {
                kurskosten: [null, NumberValidator.checkValueBetween0and99999],
                materialkosten: [null, NumberValidator.checkValueBetween0and99999],
                pruefungskosten: [null, NumberValidator.checkValueBetween0and99999],
                kurskostenAn: null,
                materialkostenAn: null,
                pruefungskostenAn: null,
                pruefungsinstitution: null,
                anzahlTeilnehmerMax: [null, [NumberValidator.val131, NumberValidator.isPositiveInteger]],
                anzahlKurstage: [null, [NumberValidator.val131, NumberValidator.isPositiveInteger]],
                anzahlLektionen: [null, [NumberValidator.val131, NumberValidator.isPositiveInteger]],
                kurskostenTotal: null,
                kostenProTag: null,
                kostenProLektion: null,
                gueltigVon: null,
                gueltigBis: null
            },
            {
                validators: [NumberValidator.checkDaysMoreThanLessons('anzahlKurstage', 'anzahlLektionen'), DateValidator.val186('gueltigVon', 'gueltigBis', 'anzahlKurstage')]
            }
        );
    }
}
