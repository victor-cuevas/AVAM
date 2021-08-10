import { FormControl, ValidatorFn} from '@angular/forms';
import { AvamRegex } from './avam-regex';

export const passwordValidator: ValidatorFn = (control: FormControl) => {
    const pwd = control.value;
    if (!pwd){
        return null;
    }
    if (!pwd.match(AvamRegex.common.passwordFormat)) {
        return { val021: { valid: false, value: pwd } };
    }
    return null;
};
