import { ValidatorFn, FormGroup } from '@angular/forms';

export class CheckboxValidator {
    static required(minRequired): ValidatorFn {
        return function validate(formGroup: FormGroup) {
            let checked = 0;
            Object.keys(formGroup.controls).forEach(key => {
                const control = formGroup.controls[key];
                if (control.value === true) {
                    checked++;
                }
            });
            if (checked < minRequired) {
                Object.keys(formGroup.controls).forEach(key => {
                    const control = formGroup.controls[key];
                    if (formGroup.touched) {
                        control.markAsTouched();
                        control.markAsDirty();
                    }
                    // Workaround for Oblique required triangle mark. Last required checkbox doesn't show up if NO checkbox is selected by default
                    setTimeout(() => {
                        control.setErrors({ required: true });
                    });
                });
                return {
                    invalid: true
                };
            }
            Object.keys(formGroup.controls).forEach(key => {
                const control = formGroup.controls[key];
                setTimeout(() => {
                    control.setErrors(null);
                });
            });

            return null;
        };
    }
}
