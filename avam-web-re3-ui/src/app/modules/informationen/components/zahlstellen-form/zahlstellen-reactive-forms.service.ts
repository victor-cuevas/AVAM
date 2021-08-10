import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NumberValidator } from '@shared/validators/number-validator';
import { DateValidator } from '@shared/validators/date-validator';
import { PhoneValidator } from '@shared/validators/phone-validator';
import { EmailValidator } from '@shared/validators/email-validator';
import { TwoFieldsAutosuggestValidator } from '@shared/validators/two-fields-autosuggest-validator';


@Injectable({
    providedIn: 'root'
})
export class ZahlstellenReactiveFormsService {
    constructor(private formBuilder: FormBuilder) {}

    createForm() {
        return this.formBuilder.group(
            {
                alkNr: ['', [Validators.required, NumberValidator.containsTwoDigits]],
                zahlstellenNr: ['', [Validators.required, NumberValidator.containsThreeDigits]],
                kurznameDe: ['', Validators.required],
                kurznameFr: ['', Validators.required],
                kurznameIt: ['', Validators.required],
                alkTyp: '1',
                arbeitsSprache: 'D',
                blockiergrund: '',
                datumGueltigVon: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                datumGueltigBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                telefon: [null, PhoneValidator.isValidFormatWarning],
                fax: [null, PhoneValidator.isValidFormatWarning],
                email: [null, EmailValidator.isValidFormat],
                firmenname1: ['', Validators.required],
                firmenname2: '',
                firmenname3: '',
                strasse: '',
                postfach: [null, NumberValidator.isPositiveIntegerWithMaxLength(5)],
                postadresse: this.formBuilder.group(
                    {
                        postleitzahl: '',
                        ort: ''
                    },
                    {
                        validators: [TwoFieldsAutosuggestValidator.twoFieldCrossValidator('postleitzahl', 'ort')]
                    }
                ),
                standFirmenname1: ['', Validators.required],
                standFirmenname2: '',
                standFirmenname3: '',
                standortstrasse: '',
                standortadresse: this.formBuilder.group(
                    {
                        postleitzahl: '',
                        ort: ''
                    },
                    {
                        validators: [TwoFieldsAutosuggestValidator.twoFieldCrossValidator('postleitzahl', 'ort')]
                    }
                )
            },
            {
                validators: DateValidator.rangeBetweenDates('datumGueltigVon', 'datumGueltigBis', 'val201')
            }
        );
    }
}
