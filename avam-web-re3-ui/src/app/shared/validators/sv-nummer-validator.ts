import { AbstractControl } from '@angular/forms';
import { AvamRegex } from './avam-regex';

export class SvNummerValidator {
    static svNummberValid(control: AbstractControl): { [key: string]: any } {
        if (control.value !== null && control.value !== '') {
            const number = String(control.value).trim();
            if (!number.match(AvamRegex.common.positiveNr)) {
                return { invalidSvNummer: { valid: false, value: control.value } };
            }
            if (number.length !== 13) {
                return { invalidSvNummer: { valid: false, value: control.value } };
            }
            let sum = 0;
            const length = number.length;
            for (let i = length - 2; -1 < i; i--) {
                const digit = Number(number[i]);
                sum += digit * 2 * (i % 2) + digit;
            }
            if ((sum + Number(number[length - 1])) % 10 === 0) {
                return null;
            }
            return { invalidSvNummer: { valid: false, value: control.value } };
        }
        return null;
    }
}
