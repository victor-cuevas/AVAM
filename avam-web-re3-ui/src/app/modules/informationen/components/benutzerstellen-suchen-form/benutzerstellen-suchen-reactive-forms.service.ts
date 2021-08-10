import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AutosuggestValidator } from '@shared/validators/autosuggest-validator';
import { StatusEnum } from '@shared/classes/fixed-codes';

@Injectable()
export class BenutzerstellenSuchenReactiveFormsService {
    searchForm: FormGroup;
    private static readonly STATUS_DEFAULT_VAL = StatusEnum.AKTIV.toString();

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.searchForm = this.formBuilder.group({
            status: null,
            benutzerstelleName: null,
            strasse: null,
            strasseNr: null,
            postleitzahl: null,
            ort: null,
            kanton: null,
            benutzerstellenASVon: [null, AutosuggestValidator.val216],
            benutzerstellenASBis: [null, AutosuggestValidator.val216],
            benutzerstelleTyp: null,
            vollzugsregionenAS: null,
            vollzugsregionType: null
        });
    }

    setDefaultValues(): void {
        this.searchForm.reset();
        this.searchForm.controls.status.setValue(BenutzerstellenSuchenReactiveFormsService.STATUS_DEFAULT_VAL);
    }
}
