import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms/src/model';
import { FormBuilder, Validators } from '@angular/forms';
import { DateValidator } from '@app/shared/validators/date-validator';

@Injectable()
export class AnbieterAbrechnungReactiveFormsService {
    abrechnungForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.abrechnungForm = this.createForm();
    }

    createForm(): FormGroup {
        return this.formBuilder.group({
            titel: ['', Validators.required],
            bemerkung: '',
            ausfuehrungsdatum: [
                '',
                [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx, DateValidator.isDateWithinRange(new Date(), new Date(2099, 11, 31), 'val292')]
            ],
            bearbeitungDurch: ['', Validators.required],
            abrechnungNr: '',
            status: '',
            freigabeDurch: '',
            freigabedatum: ''
        });
    }
}
