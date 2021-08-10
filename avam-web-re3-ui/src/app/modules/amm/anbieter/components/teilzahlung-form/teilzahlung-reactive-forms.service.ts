import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DateValidator } from '@app/shared/validators/date-validator';
import { AvamPersonalberaterAutosuggestComponent } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';

@Injectable()
export class TeilzahlungReactiveFormsService {
    tzform: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.tzform = this.createForm();
    }

    /**
     * Create the form group with the VALs
     *
     * @memberof TeilzahlungReactiveFormsService
     */
    createForm(): FormGroup {
        return this.formBuilder.group({
            titel: ['', Validators.required],
            bemerkung: '',
            ausfuehrungsdatum: [
                null,
                [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx, DateValidator.isDateWithinRange(new Date(), new Date(2099, 11, 31), 'val292')]
            ],
            bearbeitungDurch: null,
            teilzahlungsNr: null,
            status: null,
            freigabeDurch: null,
            freigabedatum: null
        });
    }
}
