import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Injectable()
export class AnbieterZertifikateReactiveFormsService {
    zertifikateForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.zertifikateForm = this.createForm();
    }

    createForm(): FormGroup {
        return this.formBuilder.group({
            ergaenzendeAngaben: null
        });
    }
}
