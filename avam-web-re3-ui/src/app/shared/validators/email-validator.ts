import { ValidatorFn, FormControl } from '@angular/forms';
import { AvamRegex } from './avam-regex';

export class EmailValidator {
    static isValidFormat: ValidatorFn = (control: FormControl) => {
        const email = control.value;

        if (!email) {
            return null;
        }

        const validChars = `[^\\s${AvamRegex.email.specialChars}]`;
        const atom = `${validChars}+`;
        const word = `(${atom}|${AvamRegex.email.quotedUser})`;
        const userPattern = new RegExp(`^${word}(\\.${word})*$`);
        const emailMatchingGroups = email.match(AvamRegex.email.emailPattern);

        if (!emailMatchingGroups) {
            return { emailformat: { valid: false, value: email } };
        }

        const user = emailMatchingGroups[1];
        const domain = emailMatchingGroups[2];

        if (!user.match(userPattern)) {
            return { emailformat: { valid: false, value: email } };
        }

        const IPArray = domain.match(AvamRegex.email.ipDomainPattern);

        if (IPArray) {
            for (let i = 1; i <= 4; i++) {
                if (IPArray[i] > 255) {
                    return { emailformat: { valid: false, value: email } };
                }
            }

            return null;
        }

        const atomPattern = new RegExp(`^${atom}$`);
        const domainArray = domain.split('.');
        const domainArrayLength = domainArray.length;

        for (let i = 0; i < domainArrayLength; i++) {
            if (domainArray[i].search(atomPattern) === -1) {
                return { emailformat: { valid: false, value: email } };
            }
        }

        if (domainArrayLength < 2) {
            return { emailformat: { valid: false, value: email } };
        }

        return null;
    };

    /**
     * VAL003
     * The validation checks if the email format is valid, if it is not a Warning is shown.
     */
    static isValidFormatWarning: ValidatorFn = (control: FormControl) => {
        const email = control.value;

        if (!email) {
            return null;
        }

        const validChars = `[^\\s${AvamRegex.email.specialChars}]`;
        const atom = `${validChars}+`;
        const word = `(${atom}|${AvamRegex.email.quotedUser})`;
        const userPattern = new RegExp(`^${word}(\\.${word})*$`);
        const emailMatchingGroups = email.match(AvamRegex.email.emailPattern);

        if (!emailMatchingGroups) {
            return { emailformat: { type: 'warning', valid: false, value: email } };
        }

        const user = emailMatchingGroups[1];
        const domain = emailMatchingGroups[2];

        if (!user.match(userPattern)) {
            return { emailformat: { type: 'warning', valid: false, value: email } };
        }

        const IPArray = domain.match(AvamRegex.email.ipDomainPattern);

        if (IPArray) {
            for (let i = 1; i <= 4; i++) {
                if (IPArray[i] > 255) {
                    return { emailformat: { type: 'warning', valid: false, value: email } };
                }
            }

            return null;
        }

        const atomPattern = new RegExp(`^${atom}$`);
        const domainArray = domain.split('.');
        const domainArrayLength = domainArray.length;

        for (let i = 0; i < domainArrayLength; i++) {
            if (domainArray[i].search(atomPattern) === -1) {
                return { emailformat: { type: 'warning', valid: false, value: email } };
            }
        }

        if (domainArrayLength < 2) {
            return { emailformat: { type: 'warning', valid: false, value: email } };
        }

        return null;
    };
}
