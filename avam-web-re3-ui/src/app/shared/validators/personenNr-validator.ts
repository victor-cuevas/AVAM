import { FormControl, ValidatorFn} from '@angular/forms';
import { AvamRegex } from './avam-regex';

export class PersonenNrValidator {
    static val011: ValidatorFn = (control: FormControl) => {
        if (control.value !== null && control.value !== '') {
            const personenNr = String(control.value).trim();
            if (!personenNr.match(AvamRegex.common.val011)) {
                return {val011: {valid: false, value: personenNr}};
            }
        }
        return null;
    };
}
