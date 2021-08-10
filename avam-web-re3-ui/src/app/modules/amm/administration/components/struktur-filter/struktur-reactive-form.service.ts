import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateValidator } from '@app/shared/validators/date-validator';

@Injectable()
export class StrukturReactiveFormService {
    searchForm: FormGroup;
    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.searchForm = this.formBuilder.group({
            elementCategory: ['', Validators.required],
            date: ['', [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]]
        });
    }
}
