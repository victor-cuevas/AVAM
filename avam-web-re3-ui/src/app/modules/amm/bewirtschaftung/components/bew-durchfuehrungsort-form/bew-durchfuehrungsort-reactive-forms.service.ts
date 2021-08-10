import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PhoneValidator } from '@app/shared/validators/phone-validator';
import { EmailValidator } from '@app/shared/validators/email-validator';

@Injectable()
export class BewDurchfuehrungsortReactiveFormsService {
    durchfuehrungsortForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.durchfuehrungsortForm = this.formBuilder.group({
            uGName1: '',
            uGName2: '',
            uGName3: '',
            strasse: '',
            strasseNr: '',
            raum: '',
            plz: this.formBuilder.group({
                postleitzahl: null,
                ort: null
            }),
            land: null,
            ergaenzendeAngaben: '',
            kontaktperson: null,
            name: '',
            vorname: '',
            telefon: ['', PhoneValidator.isValidFormatWarning],
            mobile: ['', PhoneValidator.isValidFormatWarning],
            fax: ['', PhoneValidator.isValidFormatWarning],
            email: ['', EmailValidator.isValidFormat]
        });
    }
}
