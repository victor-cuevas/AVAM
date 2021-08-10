import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmailValidator } from '@app/shared/validators/email-validator';
import { PhoneValidator } from '@app/shared/validators/phone-validator';

@Injectable()
export class InfotagMassnahmeBeschreibungReactiveFormsService {
    beschreibungForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.beschreibungForm = this.createForm();
    }

    createForm(): FormGroup {
        return this.formBuilder.group({
            erfassungssprache: '',
            //Mehrsprachig
            inhaltDe: '',
            inhaltFr: '',
            inhaltIt: '',
            methodikDe: '',
            methodikFr: '',
            methodikIt: '',
            massnahmenzielDe: '',
            massnahmenzielFr: '',
            massnahmenzielIt: '',
            //Anbieter
            name1: '',
            name2: '',
            name3: '',
            strasse: '',
            strasseNr: '',
            raum: '',
            plz: this.formBuilder.group({
                postleitzahl: '',
                ort: ''
            }),
            land: '',
            //Kontaktperson
            kontaktperson: '',
            name: '',
            vorname: '',
            telefon: ['', PhoneValidator.isValidFormatWarning],
            mobile: ['', PhoneValidator.isValidFormatWarning],
            fax: ['', PhoneValidator.isValidFormatWarning],
            email: ['', EmailValidator.isValidFormat],
            kontaktId: '',
            kontaktPersonObject: null
        });
    }
}
