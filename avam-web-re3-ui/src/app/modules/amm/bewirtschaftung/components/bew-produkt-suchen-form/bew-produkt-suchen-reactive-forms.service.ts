import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { DateValidator } from '@app/shared/validators/date-validator';

@Injectable()
export class BewProduktSuchenReactiveFormsService {
    searchForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.searchForm = this.formBuilder.group(
            {
                strukturelementId: null,
                strukturelementText: null,
                elementkategorieId: null,
                produktId: [null, NumberValidator.isPositiveInteger],
                titel: null,
                lamCode: null,
                anbieterParam: null,
                produktVerantwortung: null,
                zulassungsTyp: [null, Validators.required],
                gueltigVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gueltigBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]]
            },
            {
                validators: DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201')
            }
        );
    }

    isOnlyZulassungstypSet(): boolean {
        return (
            !this.isMassnahmenartSelected() &&
            !this.searchForm.controls.produktId.value &&
            !this.searchForm.controls.titel.value &&
            !this.searchForm.controls.lamCode.value &&
            !this.searchForm.controls.anbieterParam.value &&
            !this.searchForm.controls.produktVerantwortung.value &&
            !this.searchForm.controls.gueltigVon.value &&
            !this.searchForm.controls.gueltigBis.value
        );
    }

    isMassnahmenartSelected(): boolean {
        return this.searchForm.controls.strukturelementId.value || this.searchForm.controls.strukturelementText.value || this.searchForm.controls.elementkategorieId.value;
    }
}
