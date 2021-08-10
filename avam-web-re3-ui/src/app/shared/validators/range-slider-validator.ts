import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

const clearVal = (errorObject: ValidationErrors | null, messageKey: string) => {
    if (!errorObject) {
        return null;
    }

    const outputObject: ValidationErrors = Object.assign({}, errorObject);

    delete outputObject[messageKey];

    return Object.keys(outputObject).length ? outputObject : null;
};

export class RangeSliderValidator {
    /**
     * VAL254
     * The validation checks that the bis is equal to or larger than von
     */
    static areValuesInRangeBetween(parentFormName: string, fromControlName: string, toControlName: string, rangeSliderControlName: string, messageKey: string): ValidatorFn {
        return (control: AbstractControl) => {
            const parentForm: AbstractControl = control.get(parentFormName);
            const fromControl: AbstractControl = parentForm.get(fromControlName);
            const toControl: AbstractControl = parentForm.get(toControlName);
            const sliderControl: AbstractControl = parentForm.get(rangeSliderControlName);

            if (fromControl.value === null || fromControl.value === undefined || toControl.value === null || toControl.value === undefined) {
                return null;
            }

            if (parseInt(fromControl.value, 0) > parseInt(toControl.value, 0)) {
                sliderControl.markAsDirty();
                sliderControl.setErrors({ [messageKey]: { valid: false }, ...sliderControl.errors });

                fromControl.markAsDirty();
                fromControl.setErrors({ ...fromControl.errors });

                toControl.markAsDirty();
                toControl.setErrors({ ...toControl.errors });

                return { [messageKey]: { valid: false } };
            }

            sliderControl.setErrors(clearVal(sliderControl.errors, messageKey));
            fromControl.setErrors(clearVal(fromControl.errors, messageKey));
            toControl.setErrors(clearVal(toControl.errors, messageKey));

            return null;
        };
    }
}
