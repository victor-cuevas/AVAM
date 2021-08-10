import { FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export class AmmValidators {
    /**
     * The function sets if the checkboxes are required or not. If atleast one of the checkboxes has value of "true" all of the checkboxes are not required.
     * Original text from SUC : Wenn die Checkboxen angezeigt werden, dann sind sie Pflichtfeld(er), das heisst, mindestens 1 der 14 Checkboxen muss aktiviert sein.
     */
    static requiredWeekDays(morningsName: string, afternoonsName: string, dropdownName: string, weekplanCodeId: string): ValidatorFn {
        return (control: FormGroup): ValidationErrors | null => {
            let removeValidators = false;
            const mornings = (control.get(morningsName) as FormArray).controls;
            const afternoons = (control.get(afternoonsName) as FormArray).controls;
            const dropdownCodeId = control.get(dropdownName).value;
            const morningsResult = mornings.find(day => Boolean(day.value) === true);
            const afternoonsResult = afternoons.find(day => Boolean(day.value) === true);

            removeValidators = !!morningsResult || !!afternoonsResult;
            if (!removeValidators && dropdownCodeId === weekplanCodeId) {
                mornings.forEach(dayControl => {
                    dayControl.setErrors({ required: true });
                });
                afternoons.forEach(dayControl => {
                    dayControl.setErrors({ required: true });
                });
            } else {
                mornings.forEach(dayControl => {
                    AmmValidators.cleanValidators(dayControl);
                });
                afternoons.forEach(dayControl => {
                    AmmValidators.cleanValidators(dayControl);
                });
            }
            return null;
        };
    }

    static employmentCheck(morningsName: string, afternoonsName: string, sliderName: string): ValidatorFn {
        return (control: FormControl) => {
            const vormittags = (control.get(morningsName) as FormArray).controls;
            const nachmittags = (control.get(afternoonsName) as FormArray).controls;
            let halfDayCount = 0;
            const beschaeftigungsgrad = control.get(sliderName);

            vormittags.forEach(vDay => {
                if (Boolean(vDay.value) === true) {
                    halfDayCount++;
                }
            });

            nachmittags.forEach(nDay => {
                if (Boolean(nDay.value) === true) {
                    halfDayCount++;
                }
            });

            const shouldEvaluate = halfDayCount * 10 !== +beschaeftigungsgrad.value;

            if (shouldEvaluate && beschaeftigungsgrad.value) {
                const toErrors = { ...beschaeftigungsgrad.errors };
                toErrors['val290'] = { type: 'warning', valid: true, value: 'test' };
                beschaeftigungsgrad.setErrors(toErrors);
            } else {
                if (beschaeftigungsgrad.errors) {
                    beschaeftigungsgrad.setErrors({ ...beschaeftigungsgrad.errors });
                } else {
                    beschaeftigungsgrad.setErrors(null);
                }
            }
            return null;
        };
    }

    static val289(sliderName: string, sliderMaxName: string): ValidatorFn {
        return (control: FormControl) => {
            const beschaeftigungsgrad = control.get(sliderName);
            const beschaeftigungsgradMax = control.get(sliderMaxName);
            const hasValue = beschaeftigungsgrad.value && beschaeftigungsgradMax.value;
            const isLarger = beschaeftigungsgrad.value > beschaeftigungsgradMax.value;

            if (hasValue && isLarger) {
                const toErrors = { ...beschaeftigungsgrad.errors };
                toErrors['val289'] = { type: 'warning', valid: true, value: 'test' };
                beschaeftigungsgrad.setErrors(toErrors);
                beschaeftigungsgrad.markAsTouched();
                beschaeftigungsgrad.markAsDirty();
            } else {
                if (beschaeftigungsgrad.errors) {
                    beschaeftigungsgrad.setErrors({ ...beschaeftigungsgrad.errors });
                } else {
                    beschaeftigungsgrad.setErrors(null);
                }
            }
            return null;
        };
    }

    static check289and290(morningsName: string, afternoonsName: string, sliderName: string, sliderMaxName: string): ValidatorFn {
        return (control: FormControl) => {
            const vormittags = (control.get(morningsName) as FormArray).controls;
            const nachmittags = (control.get(afternoonsName) as FormArray).controls;
            let halfDayCount = vormittags.reduce((res, vDay) => (Boolean(vDay.value) === true ? res + 1 : res), 0);
            const beschaeftigungsgrad = control.get(sliderName);

            halfDayCount = nachmittags.reduce((res, nDay) => (Boolean(nDay.value) === true ? res + 1 : res), halfDayCount);

            const shouldEvaluate = halfDayCount * 10 !== +beschaeftigungsgrad.value;

            const beschaeftigungsgradMax = control.get(sliderMaxName);
            const hasValue = beschaeftigungsgrad.value && beschaeftigungsgradMax.value;
            const isLarger = beschaeftigungsgrad.value > beschaeftigungsgradMax.value;
            const invalid290 = shouldEvaluate && (beschaeftigungsgrad.value as boolean);
            const invalid289 = hasValue && (isLarger as boolean);

            if (invalid290 && invalid289) {
                const toErrors = { ...beschaeftigungsgrad.errors };
                toErrors['val290'] = { type: 'warning', valid: true, value: 'test' };
                toErrors['val289'] = { type: 'warning', valid: true, value: 'test' };
                beschaeftigungsgrad.setErrors(toErrors);
                beschaeftigungsgrad.markAsTouched();
            } else if (invalid289) {
                const toErrors = { ...beschaeftigungsgrad.errors };
                toErrors['val289'] = { type: 'warning', valid: true, value: 'test' };
                beschaeftigungsgrad.setErrors(toErrors);
                beschaeftigungsgrad.markAsTouched();
            } else if (invalid290) {
                const toErrors = { ...beschaeftigungsgrad.errors };
                toErrors['val290'] = { type: 'warning', valid: true, value: 'test' };
                beschaeftigungsgrad.setErrors(toErrors);
                beschaeftigungsgrad.markAsTouched();
            } else {
                if (beschaeftigungsgrad.errors) {
                    beschaeftigungsgrad.setErrors({ ...beschaeftigungsgrad.errors });
                } else {
                    beschaeftigungsgrad.setErrors(null);
                }
            }
            return null;
        };
    }

    static val309(vormittagsControlName: string, nachmittagsControlName: string, beschaeftigungsgradControlName: string): ValidatorFn {
        return (control: FormControl) => {
            const vormittags = (control.get(vormittagsControlName) as FormArray).controls;
            const nachmittags = (control.get(nachmittagsControlName) as FormArray).controls;
            let halfDayCount = vormittags.reduce((res, vDay) => (Boolean(vDay.value) === true ? res + 1 : res), 0);
            const beschaeftigungsgrad = control.get(beschaeftigungsgradControlName);

            halfDayCount = nachmittags.reduce((res, nDay) => (Boolean(nDay.value) === true ? res + 1 : res), halfDayCount);
            const isValid = +beschaeftigungsgrad.value <= halfDayCount * 10;

            const displayWarning = !isValid && (beschaeftigungsgrad.value as boolean);

            if (displayWarning) {
                const toErrors = { ...beschaeftigungsgrad.errors };
                toErrors['val309'] = { type: 'warning', valid: true, value: 'test' };
                beschaeftigungsgrad.setErrors(toErrors);
                beschaeftigungsgrad.markAsTouched();
            } else {
                if (beschaeftigungsgrad.errors) {
                    beschaeftigungsgrad.setErrors({ ...beschaeftigungsgrad.errors });
                } else {
                    beschaeftigungsgrad.setErrors(null);
                }
            }
            return null;
        };
    }

    static atLeastOneRequired(...ctrlNames: string[]): ValidatorFn {
        return (formGroup: FormGroup): ValidationErrors | null => {
            const controls = formGroup.controls;

            const atLeastOne = ctrlNames.some((ctrl: string) => controls[ctrl].value);

            if (!atLeastOne) {
                ctrlNames.forEach((ctrl: string) => {
                    controls[ctrl].setErrors({ required: true });
                });
            } else {
                ctrlNames.forEach((ctrl: string) => {
                    AmmValidators.cleanValidators(controls[ctrl]);
                });
            }

            return null;
        };
    }

    static atLeastOneRequiredWithMoreThenOneValidator(...ctrlNames: string[]): ValidatorFn {
        return (formGroup: FormGroup): ValidationErrors | null => {
            const controls = formGroup.controls;

            const atLeastOne = ctrlNames.some((ctrl: string) => controls[ctrl].value);

            if (!atLeastOne) {
                ctrlNames.forEach((ctrl: string) => {
                    controls[ctrl].setErrors({ required: true });
                });
            } else {
                ctrlNames.forEach((ctrl: string) => {
                    AmmValidators.cleanValidatorsWithMoreThenOneValidator(controls[ctrl]);
                });
            }

            return null;
        };
    }

    private static cleanValidators(dayControl) {
        if (dayControl.errors) {
            dayControl.setErrors(null);
            dayControl.markAsUntouched();
            dayControl.markAsPristine();
            dayControl.updateValueAndValidity();
        }
    }

    private static cleanValidatorsWithMoreThenOneValidator(dayControl) {
        if (dayControl.errors) {
            const notRequiredErrors = {};
            for (const error in dayControl.errors) {
                if (error !== 'required') {
                    notRequiredErrors[error] = dayControl.errors[error];
                }
            }
            if (Object.keys(notRequiredErrors).length) {
                dayControl.setErrors(notRequiredErrors);
                dayControl.updateValueAndValidity({ onlySelf: true });
            } else {
                dayControl.setErrors(null);
                dayControl.markAsUntouched();
                dayControl.markAsPristine();
                dayControl.updateValueAndValidity({ onlySelf: true });
            }
        }
    }
}
