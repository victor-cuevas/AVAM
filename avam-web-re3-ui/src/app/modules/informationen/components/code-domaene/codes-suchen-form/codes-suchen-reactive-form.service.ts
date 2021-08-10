import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Injectable()
export class CodesSuchenReactiveFormService {
    codeSuchenForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.codeSuchenForm = this.createForm();
    }

    createForm(): FormGroup {
        return this.formBuilder.group({
            bezeichnung: null,
            status: null,
            vollzugsregionType: null
        });
    }
}
