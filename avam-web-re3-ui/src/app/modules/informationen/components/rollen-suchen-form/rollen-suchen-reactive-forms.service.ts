import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Injectable()
export class RollenSuchenReactiveFormsService {
    searchForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    reset(): void {
        this.searchForm.reset();
    }

    patch(value: { [key: string]: any }) {
        this.searchForm.patchValue(value);
    }

    private createForm(): void {
        this.searchForm = this.formBuilder.group({
            bezeichnung: null,
            vollzugsregionenTyp: null,
            benutzerstellenTyp: null,
            rollenId: null
        });
    }
}
