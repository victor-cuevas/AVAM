import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AvamPlzAutosuggestComponent } from '@app/library/wrappers/form/autosuggests/avam-plz-autosuggest/avam-plz-autosuggest.component';

const isStringOrANumber = (value: any) => {
    return typeof value === 'string' || typeof value === 'number';
};

const getProperValue = (event: any): any => {
    if (!event) {
        return null;
    }

    return event.target ? event.target.value : event;
};

const hasValue = (control: AbstractControl, key: string): any => {
    const value: any = getProperValue(control.value);

    return value && (isStringOrANumber(value) || value[key]);
};

const anyFieldHasValue = (plzPostleitzahl, controlOnePostleitzahl, plzOrt, controlOneOrt, postfachPostleitzahl, controlTwoPostleitzahl, postfachOrt, controlTwoOrt): boolean => {
    return (
        hasValue(plzPostleitzahl, controlOnePostleitzahl) ||
        hasValue(plzOrt, controlOneOrt) ||
        hasValue(postfachPostleitzahl, controlTwoPostleitzahl) ||
        hasValue(postfachOrt, controlTwoOrt)
    );
};

const handleForeignCompanyErrors = (
    plzPostleitzahl,
    controlOnePostleitzahl,
    plzOrt,
    controlOneOrt,
    postfachPostleitzahl,
    controlTwoPostleitzahl,
    postfachOrt,
    controlTwoOrt
): void => {
    if (hasValue(plzPostleitzahl, controlOnePostleitzahl) && !hasValue(plzOrt, controlOneOrt)) {
        plzOrt.setErrors({ required: true });
    } else if (!hasValue(plzPostleitzahl, controlOnePostleitzahl) && hasValue(plzOrt, controlOneOrt)) {
        plzPostleitzahl.setErrors({ required: true });
    }
    if (hasValue(postfachPostleitzahl, controlTwoPostleitzahl) && !hasValue(postfachOrt, controlTwoOrt)) {
        postfachOrt.setErrors({ required: true });
    } else if (!hasValue(postfachPostleitzahl, controlTwoPostleitzahl) && hasValue(postfachOrt, controlTwoOrt)) {
        postfachPostleitzahl.setErrors({ required: true });
    }
};

export class TwoFieldsAutosuggestValidator {
    static autosuggestRequired(field: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const isValueExists: boolean = control.value && (typeof control.value === 'string' || typeof control.value === 'number' || control.value[field]);
            return isValueExists ? null : { required: true };
        };
    }

    static valueOneNumericInput(fehlermledung: any): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null;
            }

            if (
                ((typeof control.value === 'string' || typeof control.value === 'number') && !control.value.toString().match('^[0-9]*$')) ||
                (control.value.postleitzahl && !control.value.postleitzahl.toString().match('^[0-9]*$'))
            ) {
                fehlermledung[Object.keys(fehlermledung)[0]].value = control.value.toString();

                return fehlermledung;
            }

            return null;
        };
    }

    static plzCrossValidator(
        controlOne: string,
        controlTwo: string,
        controlOnePostleitzahl: string,
        controlOneOrt: string,
        controlTwoPostleitzahl: string,
        controlTwoOrt: string
    ): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const plz: AbstractControl = control.get(controlOne);
            const postfach: AbstractControl = control.get(controlTwo);

            const plzPostleitzahl: AbstractControl = plz.get(controlOnePostleitzahl);
            const plzOrt: AbstractControl = plz.get(controlOneOrt);

            const postfachPostleitzahl: AbstractControl = postfach.get(controlTwoPostleitzahl);
            const postfachOrt: AbstractControl = postfach.get(controlTwoOrt);

            if (
                hasValue(plzPostleitzahl, controlOnePostleitzahl) ||
                hasValue(plzOrt, controlOneOrt) ||
                hasValue(postfachPostleitzahl, controlTwoPostleitzahl) ||
                hasValue(postfachOrt, controlTwoOrt)
            ) {
                plzPostleitzahl.setErrors(null);
                plzOrt.setErrors(null);

                postfachPostleitzahl.setErrors(null);
                postfachOrt.setErrors(null);
                return null;
            }

            plzPostleitzahl.setErrors({ required: true });
            plzOrt.setErrors({ required: true });

            postfachPostleitzahl.setErrors({ required: true });
            postfachOrt.setErrors({ required: true });

            return null;
        };
    }

    static plzPlzAuslandCrossValidator(
        controlOne: string,
        controlTwo: string,
        controlOnePostleitzahl: string,
        controlOneOrt: string,
        controlTwoPostleitzahl: string,
        controlTwoOrt: string,
        landAutosuggest: AvamPlzAutosuggestComponent
    ): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const plz: AbstractControl = control.get(controlOne);
            const postfach: AbstractControl = control.get(controlTwo);

            const plzPostleitzahl: AbstractControl = plz.get(controlOnePostleitzahl);
            const plzOrt: AbstractControl = plz.get(controlOneOrt);

            const postfachPostleitzahl: AbstractControl = postfach.get(controlTwoPostleitzahl);
            const postfachOrt: AbstractControl = postfach.get(controlTwoOrt);

            if (landAutosuggest.simpleInput) {
                if (anyFieldHasValue(plzPostleitzahl, controlOnePostleitzahl, plzOrt, controlOneOrt, postfachPostleitzahl, controlTwoPostleitzahl, postfachOrt, controlTwoOrt)) {
                    plzPostleitzahl.setErrors(this.handleExistingErrors(plzPostleitzahl));
                    plzOrt.setErrors(this.handleExistingErrors(plzOrt));
                    postfachPostleitzahl.setErrors(this.handleExistingErrors(postfachPostleitzahl));
                    postfachOrt.setErrors(this.handleExistingErrors(postfachOrt));
                    handleForeignCompanyErrors(
                        plzPostleitzahl,
                        controlOnePostleitzahl,
                        plzOrt,
                        controlOneOrt,
                        postfachPostleitzahl,
                        controlTwoPostleitzahl,
                        postfachOrt,
                        controlTwoOrt
                    );
                    return null;
                }
                plzPostleitzahl.setErrors({ required: true });
                plzOrt.setErrors({ required: true });

                postfachPostleitzahl.setErrors({ required: true });
                postfachOrt.setErrors({ required: true });

                return null;
            } else {
                if (anyFieldHasValue(plzPostleitzahl, controlOnePostleitzahl, plzOrt, controlOneOrt, postfachPostleitzahl, controlTwoPostleitzahl, postfachOrt, controlTwoOrt)) {
                    plzPostleitzahl.setErrors(this.handleExistingErrors(plzPostleitzahl));
                    plzOrt.setErrors(this.handleExistingErrors(plzOrt));
                    postfachPostleitzahl.setErrors(this.handleExistingErrors(postfachPostleitzahl));
                    postfachOrt.setErrors(this.handleExistingErrors(postfachOrt));
                    return null;
                }

                plzPostleitzahl.setErrors({ required: true });
                plzOrt.setErrors({ required: true });

                postfachPostleitzahl.setErrors({ required: true });
                postfachOrt.setErrors({ required: true });

                return null;
            }
        };
    }

    static inputMinLength(minLength: number, field = ''): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = getProperValue(control.value);
            if (!!value) {
                const realValue = value && isStringOrANumber(value) ? control.value.toString() : value[field];
                const initialLength = realValue.length;
                const finalLength = realValue.replace(/\*/g, '').length;
                return (finalLength !== initialLength && finalLength < minLength) || (realValue && finalLength < minLength)
                    ? { minlength: { requiredLength: minLength, actualLength: realValue.length } }
                    : null;
            }
            return null;
        };
    }

    /**
     * Custom validator for two AUTOSUGGEST fields that either one or the other has to have a value. Should be used on the form group and not single form control.
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
                    const notRequiredErrors = {};
                    for (const error in controlOne.errors) {
                        if (error !== 'required') {
                            notRequiredErrors[error] = controlOne.errors[error];
                        }
                    }
                    controlOne.setErrors(notRequiredErrors);
                } else {
                    controlOne.setErrors(null);
                }
                controlTwo.setErrors(null);
                return null;
            }
            controlOne.setErrors({ required: true });
            controlTwo.setErrors({ required: true });
            return null;
        };
    }

    static inputMaxLength(maxLength: number, field = ''): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = getProperValue(control.value);
            if (!!value) {
                const realValue = value && isStringOrANumber(value) ? control.value.toString() : value[field];
                const length = realValue.length;
                return (length !== length && length > maxLength) || (realValue && length > maxLength)
                    ? { maxlength: { requiredLength: maxLength, actualLength: realValue.length } }
                    : null;
            }
            return null;
        };
    }

    private static handleExistingErrors(control: AbstractControl) {
        const notRequiredErrors = {};
        for (const error in control.errors) {
            if (error !== 'required') {
                notRequiredErrors[error] = control.errors[error];
            }
        }
        return Object.keys(notRequiredErrors).length ? notRequiredErrors : null;
    }
}
