import { FormControl, ValidatorFn} from '@angular/forms';
import { AvamRegex } from './avam-regex';

export class StesIdValidator {
    static val057: ValidatorFn = (control: FormControl) => {
        if (control.value !== null && control.value !== '') {
            const stesID = String(control.value).trim();
            if (!stesID.match(AvamRegex.common.val057)) {
                return {val057: {valid: false, value: stesID}};
            }
        }
        return null;
    };
}
