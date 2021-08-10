import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Injectable()
export class SchlagwortSuchenReactiveFormService {
    schlagwortSuchenForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.schlagwortSuchenForm = this.createForm();
    }

    createForm(): FormGroup {
        return this.formBuilder.group({
            status: null,
            schlagwort: null,
            verantwortlich: null,
            verfuegbarIn: null
        });
    }
}
