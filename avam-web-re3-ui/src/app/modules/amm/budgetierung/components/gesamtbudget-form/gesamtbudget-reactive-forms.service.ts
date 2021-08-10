import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Injectable()
export class GesamtbudgetReactiveFormsService {
    budgetForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.budgetForm = this.createForm();
    }

    createForm(): FormGroup {
        return this.formBuilder.group({
            bemerkung: '',
            bearbeitungDurch: ['', Validators.required],
            status: ['', Validators.required],
            freigabeDurch: '',
            freigabeDatum: ''
        });
    }
}
