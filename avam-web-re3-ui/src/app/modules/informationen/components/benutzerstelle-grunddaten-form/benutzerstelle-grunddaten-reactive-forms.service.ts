import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TwoFieldsAutosuggestValidator } from '@shared/validators/two-fields-autosuggest-validator';
import { EmailValidator } from '@shared/validators/email-validator';
import { PhoneValidator } from '@shared/validators/phone-validator';
import { NumberValidator } from '@shared/validators/number-validator';
import { AutosuggestValidator } from '@shared/validators/autosuggest-validator';

@Injectable()
export class BenutzerstelleGrunddatenReactiveFormsService {
    form: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.form = this.createForm();
    }

    private createForm(): FormGroup {
        return this.formBuilder.group({
            benutzerstelleId: [null, [Validators.required, AutosuggestValidator.val216]],
            benutzerstelleTyp: [null, Validators.required],
            benutzerstellePostD: [null, Validators.required],
            benutzerstellePostF: [null, Validators.required],
            benutzerstellePostI: [null, Validators.required],
            postadresseD: this.createAdsressGroup(true),
            postadresseF: this.createAdsressGroup(true),
            postadresseI: this.createAdsressGroup(true),
            benutzerstelleStandortD: [null, Validators.required],
            benutzerstelleStandortF: [null, Validators.required],
            benutzerstelleStandortI: [null, Validators.required],
            standortadresseD: this.createAdsressGroup(false),
            standortadresseF: this.createAdsressGroup(false),
            standortadresseI: this.createAdsressGroup(false),
            telefon: [null, PhoneValidator.isValidFormatWarning],
            fax: [null, PhoneValidator.isValidFormatWarning],
            email: [null, EmailValidator.isValidFormat]
        });
    }

    private createAdsressGroup(hasPostfach: boolean): FormGroup {
        const fg = this.formBuilder.group({
            strasse: null,
            strasseNr: null,
            plz: this.formBuilder.group({
                postleitzahl: [null, TwoFieldsAutosuggestValidator.autosuggestRequired('postleitzahl')],
                ort: [null, TwoFieldsAutosuggestValidator.autosuggestRequired('ort')]
            })
        });
        if (hasPostfach) {
            fg.addControl('postfach', new FormControl(null, NumberValidator.isPositiveInteger));
        }

        return fg;
    }
}
