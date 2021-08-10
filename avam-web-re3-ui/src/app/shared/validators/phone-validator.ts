import { FormControl, ValidatorFn } from '@angular/forms';

/**
 * Val002
 */
export class PhoneValidator {
    // Values from Allgemeine Validierungen Excel
    static readonly regexInternat = new RegExp('^\\+(\\d+) (\\d+) (\\d[0-9 ]*)$');
    static readonly regexNational = new RegExp('^(\\d+) (\\d[0-9 ]*)$');

    static isValidFormat: ValidatorFn = (control: FormControl) => {
        const number = control.value;

        if (!number) {
            return null;
        }

        if (number.match(PhoneValidator.regexInternat)) {
            return null;
        }

        if (number.match(PhoneValidator.regexNational)) {
            return null;
        }

        return { telefonformat: { valid: false, value: number } };
    };

    /**
     * Val002
     * The validation checks if the a phone number format is valid, if it is not a Warning is shown.
     */
    static isValidFormatWarning: ValidatorFn = (control: FormControl) => {
        const number = control.value;

        if (number && !number.match(PhoneValidator.regexInternat) && !number.match(PhoneValidator.regexNational)) {
            return { telefonformat: { type: 'warning', valid: false, value: control.value } };
        }

        return null;
    };
}
