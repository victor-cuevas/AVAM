import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AvamRegex } from './avam-regex';

const isStringOrANumber = (value: any) => {
    return typeof value === 'string' || typeof value === 'number';
};

const getProperValue = (event: any): any => {
    if (!event) {
        return null;
    }

    return event.target ? event.target.value : event;
};

const hasValue = (control: AbstractControl, key: string): boolean => {
    const value: any = getProperValue(control.value);

    return value && (isStringOrANumber(value) || value[key]);
};
export class TextValidator {
    static validateTextWithAsterisk(error: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            const value = control.value;
            let errorMessage = {};
            errorMessage[error] = { valid: false, value };
            if (value) {
                if (!value.match(AvamRegex.common.textWithAsterisk)) {
                    return errorMessage;
                }
            }

            return null;
        };
    }

    /**
     * Custom validator for two fields that either one or the other has to have a value. Should be used on the form group and not single form control.
     * @param controlOneName string - name for the first control
     * @param controlTwoName string - name for the second control
     * @param shouldKeepFirstControlErrors boolean - Optional. False if you don't want to keep any errors on the first control
     */
    static twoFieldCrossValidator(controlOneName: string, controlTwoName: string, shouldKeepFirstControlErrors = true): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const controlOne: AbstractControl = control.get(controlOneName);
            const controlTwo: AbstractControl = control.get(controlTwoName);
            if (hasValue(controlOne, controlOneName) || hasValue(controlTwo, controlTwoName)) {
                if (shouldKeepFirstControlErrors && controlOne.errors) {
                    this.addErrorsToControl(controlOne);
                } else {
                    controlOne.setErrors(null);
                }
                controlTwo.setErrors(null);
                if (hasValue(controlOne, controlOneName) && !hasValue(controlTwo, controlTwoName)) {
                    controlTwo.patchValue(null, { emitEvent: false, onlySelf: true });
                } else if (hasValue(controlTwo, controlTwoName) && !hasValue(controlOne, controlOneName)) {
                    controlOne.patchValue(null, { emitEvent: false, onlySelf: true });
                }
                return null;
            }
            controlOne.setErrors({ required: true });
            controlTwo.setErrors({ required: true });
            return null;
        };
    }

    private static addErrorsToControl(controlOne: AbstractControl) {
        const notRequiredErrors = {};
        for (const error in controlOne.errors) {
            if (error !== 'required') {
                notRequiredErrors[error] = controlOne.errors[error];
            }
        }
        controlOne.setErrors(notRequiredErrors);
    }
}
