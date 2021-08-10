import { AbstractControl, ValidatorFn, FormControl, ValidationErrors } from '@angular/forms';
import { AvamRegex } from './avam-regex';

export class NumberValidator {
    /**
     * VAL009
     * The validation checks for a positive integer number.
     */
    static isPositiveInteger(control: AbstractControl): { [key: string]: any } {
        const testedValue = control.value;

        if (!Number.isInteger(Number(testedValue))) {
            return { val009: { valid: false, value: testedValue } };
        }

        if (testedValue !== null && testedValue !== '') {
            if (typeof testedValue === 'string') {
                if (
                    isNaN(Number(testedValue.charAt(testedValue.length - 1))) ||
                    testedValue.charAt(testedValue.length - 1) === ' ' ||
                    testedValue.indexOf('.') !== -1 ||
                    NumberValidator.isExponential(testedValue)
                ) {
                    return { val009: { valid: false, value: testedValue } };
                }
            }

            if (testedValue < 0) {
                return { val009: { valid: false, value: testedValue } };
            }
        }

        return null;
    }

    static isPositiveIntegerWithMaxLength(maxLength: number): { [key: string]: any } {
        return (control: AbstractControl): ValidationErrors | null => {
            const testedValue = control.value;

            if (testedValue === null || testedValue === undefined) {
                return null;
            }

            if (!Number.isInteger(Number(testedValue))) {
                return { val009: { valid: false, value: testedValue } };
            }

            if (testedValue !== '') {
                const testedValueStr = String(testedValue);
                const lastCharacter = testedValueStr.charAt(testedValueStr.length - 1);

                if (isNaN(Number(lastCharacter)) || lastCharacter === ' ') {
                    return { val009: { valid: false, value: testedValue } };
                }

                if (testedValue < 0) {
                    return { val009: { valid: false, value: testedValue } };
                }

                if (testedValueStr.length > maxLength) {
                    return { maxlength: { valid: false, requiredLength: maxLength } };
                }
            }
            return null;
        };
    }

    static isValidPercentage(control: AbstractControl): { [key: string]: any } {
        const testedValue = control.value;
        if (!Number.isInteger(Number(testedValue))) {
            return { val116: { valid: false, value: testedValue } };
        }

        if (testedValue !== null && testedValue !== '') {
            if (isNaN(testedValue)) {
                return { val116: { valid: false, value: testedValue } };
            }

            if (testedValue < 1) {
                return { val116: { valid: false, value: testedValue } };
            }
            if (testedValue > 100) {
                return { val116: { valid: false, value: testedValue } };
            }
        }

        return null;
    }

    static val010: ValidatorFn = (control: FormControl) => {
        if (control.value !== null && control.value !== '') {
            const stellenNr = String(control.value).trim();
            if (!stellenNr.match(AvamRegex.common.val010)) {
                return { val010: { valid: false, value: stellenNr } };
            }
        }
        return null;
    };

    static val103: ValidatorFn = (control: FormControl) => {
        if (!NumberValidator.isPositiveInteger(control) && +control.value > 60) {
            return { val103: { valid: false, value: control } };
        }
        return null;
    };

    /**
     * VAL131
     * The validation checks if the value is between 1 and 9999.
     */
    static val131: ValidatorFn = (control: FormControl) => {
        if (control.value) {
            if (+control.value >= 1 && +control.value <= 9999) {
                return null;
            }
            return { val131: { valid: false, value: control.value } };
        }
        return null;
    };

    /**
     * VAL306
     * The validation checks if the value is between 0 and 9999 inclusive.
     */
    static val306: ValidatorFn = (control: FormControl) => {
        if (control.value) {
            if (+control.value >= 0 && +control.value <= 9999) {
                return null;
            }

            return { val306: { valid: false } };
        }

        return null;
    };

    /**
     * @param from number - min value
     * @param to number - max value
     * @param errorKey string - name of error to show from i18n
     * @param shouldAcceptDecimal boolean - when true the validation will also check if the value of the control has a valid decimal part with two numbers after the floating point.
     * The validation checks if the number is in a given interval.
     */
    static isNumberInRange(from: number, to: number, errorKey: string, shouldAcceptDecimal?: boolean): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean } | null => {
            const value = control.value;
            const errorMessageObj = {};

            if (isNaN(value)) {
                errorMessageObj[errorKey] = true;
                return errorMessageObj;
            }

            if (value !== null && value !== undefined && value !== '' && (+value < from || +value > to)) {
                errorMessageObj[errorKey] = true;
                return errorMessageObj;
            }

            if (value && shouldAcceptDecimal) {
                const re = /^(-?[0-9]+(\.{1}[0-9]{2})?)$/;

                if (!String(control.value).match(re)) {
                    errorMessageObj[errorKey] = true;
                    return errorMessageObj;
                }
            }

            return null;
        };
    }

    /**
     * VAL183
     * @param days
     * @param lessons
     * The validation checks if the number of days is greater than the number of lessons.
     */
    static checkDaysMoreThanLessons(days: any, lessons: any): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            const daysValue = c.get(days).value;
            const lessonsValue = c.get(lessons).value;
            if (daysValue && lessonsValue) {
                if (+daysValue > +lessonsValue) {
                    const toErrors = { ...c.get(lessons).errors, val183: { type: 'warning', value: lessonsValue } };
                    c.get(lessons).setErrors(toErrors);
                } else {
                    if (c.get(lessons).errors) {
                        c.get(lessons).setErrors({ ...c.get(lessons).errors });
                    } else {
                        c.get(lessons).setErrors(null);
                    }
                }
            }
            return null;
        };
    }

    /**
     * VAL210
     * The validation checks if the value is in the given range from <= value <= to.
     */
    static val210(from: number, to: number): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean } | null => {
            const value = +control.value;

            if (value && (value < from || value > to)) {
                return { val210: true };
            }

            return null;
        };
    }

    /**
     * VAL211
     * The validation checks if the value is bigger(or equal) than 1900.
     */
    static val211: ValidatorFn = (control: FormControl): { [key: string]: boolean } | null => {
        const value = +control.value;

        if (value && value < 1900) {
            return { val211: true };
        }

        return null;
    };

    /**
     * VAL253
     * The validation checks if the value is between 1 and 99.
     */
    static checkValueBetween1and99: ValidatorFn = (control: FormControl) => {
        if (control.value === '' || control.value === null || control.value === undefined) {
            return null;
        }

        const value = Number(control.value);
        if (!isNaN(value)) {
            if (value >= 1 && value <= 99) {
                return null;
            }

            return { val253: { valid: false, value } };
        }
        return null;
    };

    /**
     * VAL073
     * The validation checks if the value contains a number with 9 digits.
     */
    static checkValueConsistsOnNineNumbers: ValidatorFn = (control: FormControl) => {
        if (!control.value || control.value === '' || (!!control.value && !isNaN(control.value) && control.value.length === 9)) {
            return null;
        }

        return { val073: { valid: false, value: control.value } };
    };

    /**
     * VAL254
     * @param from string - name of from control
     * @param to string - name of to control
     * @param errorKey string - name of error to show from i18n
     *
     * The validator checks if the from number is greater than the to number.
     * For range slider use RangeSliderValidator.areValuesInRangeBetween
     */
    static rangeBetweenNumbers(from: string, to: string, errorKey: string): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            const fromValue = c.get(from).value;
            const toValue = c.get(to).value;

            if (fromValue && toValue && +toValue < +fromValue) {
                const toErrors = { ...c.get(to).errors };
                toErrors[errorKey] = true;
                c.get(to).setErrors(toErrors);
                c.get(to).markAsDirty();

                return { invalid: true };
            } else {
                if (c.get(to).errors) {
                    delete c.get(to).errors[errorKey];
                    if (this.isEmptyObj(c.get(to).errors)) {
                        c.get(to).setErrors(null);
                        c.get(to).updateValueAndValidity();
                    }
                }

                return null;
            }
        };
    }

    /**
     * VAL267
     */
    static checkValueBetween0and99999: ValidatorFn = (control: FormControl) => {
        if (control.value) {
            const controlNumericValue = control.value;

            if (controlNumericValue >= 0.0 && controlNumericValue < 100000) {
                return null;
            }

            return { val267: { valid: false, value: control.value } };
        }

        return null;
    };

    /**
     * VAL268
     */
    static checkValueBetween1and99999: ValidatorFn = (control: FormControl) => {
        if (control.value) {
            if (control.value >= 1.0 && control.value < 100000) {
                return null;
            }

            return { val268: { valid: false, value: control.value } };
        }

        return null;
    };

    /**
     * VAL116
     * The validation checks if the value is between 1 and 100.
     */
    static checkValueBetween1and100: ValidatorFn = (control: FormControl) => {
        if (control.value) {
            if (control.value >= 1 && control.value <= 100) {
                return null;
            }

            return { val116: { valid: false, value: control.value } };
        }

        return null;
    };

    /**
     * Compares if second number is greater or equal to first number. Then a warning message is displayed.
     * Covers VAL155, VAL181, VAL182
     * @param firstNumberControlName
     * @param secondNumberControlName
     * @param message - the key from the json files containing the warning message
     */
    static compareTwoNumbers(firstNumberControlName, secondNumberControlName, message): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            const firstNumberValue = parseInt(c.get(firstNumberControlName).value, 10);
            const secondNumberValue = parseInt(c.get(secondNumberControlName).value, 10);

            // covers cases where number could be 0
            if (firstNumberValue !== null && firstNumberValue !== undefined && secondNumberValue !== null && secondNumberValue !== undefined) {
                if (secondNumberValue > firstNumberValue) {
                    const toErrors = { ...c.get(secondNumberControlName).errors };
                    toErrors[message] = { type: 'warning' };
                    c.get(secondNumberControlName).setErrors(toErrors);
                } else {
                    if (c.get(secondNumberControlName).errors) {
                        this.clearError(c, secondNumberControlName, message);
                    } else {
                        c.get(secondNumberControlName).setErrors(null);
                    }

                    return null;
                }
            }

            return null;
        };
    }

    /**
     * Compares if the sum of first number and second number is greater or than third number. Then a warning message is displayed.
     * @param firstNumberControlName
     * @param secondNumberControlName
     * @param thirdNumberControlName
     * @param message - the key from the json files containing the warning message
     */
    static val156(firstNumberControlName, secondNumberControlName, thirdNumberControlName, message): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            const firstNumberValue = +c.get(firstNumberControlName).value;
            const secondNumberValue = +c.get(secondNumberControlName).value;
            const thirdNumberValue = +c.get(thirdNumberControlName).value;

            // covers cases where third number could be 0
            if (firstNumberValue && secondNumberValue && thirdNumberValue !== null && thirdNumberValue !== undefined) {
                if (firstNumberValue + secondNumberValue > thirdNumberValue) {
                    const toErrors = { ...c.get(secondNumberControlName).errors };
                    toErrors[message] = { type: 'warning' };
                    c.get(secondNumberControlName).setErrors(toErrors);
                    c.get(firstNumberControlName).setErrors(toErrors);
                } else {
                    if (c.get(secondNumberControlName).errors) {
                        c.get(secondNumberControlName).setErrors({ ...c.get(secondNumberControlName).errors });
                    } else {
                        c.get(secondNumberControlName).setErrors(null);
                    }

                    if (c.get(firstNumberControlName).errors) {
                        c.get(firstNumberControlName).setErrors({ ...c.get(firstNumberControlName).errors });
                    } else {
                        c.get(firstNumberControlName).setErrors(null);
                    }

                    return null;
                }
            }

            return null;
        };
    }

    /**
     * VAL285
     * The validation checks if the input is a number from 25 to 100. If canBeEmpty is true than
     * the input can also be an empty string.
     */
    static val285(canBeEmpty: boolean): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const controlValue = +control.value;

            if (canBeEmpty) {
                if ((controlValue < 25 || controlValue > 100) && control.value !== '') {
                    return { val285: true };
                }
            } else {
                if (controlValue < 25 || controlValue > 100) {
                    return { val285: true };
                }
            }

            return null;
        };
    }

    static containsNineDigits(control: AbstractControl): { [key: string]: any } {
        return NumberValidator.containsNDigits(control, 9, 'val020');
    }

    static containsEightDigits(control: AbstractControl): { [key: string]: any } {
        return NumberValidator.containsNDigits(control, 8, 'val011');
    }

    static containsTwoDigits(control: AbstractControl): { [key: string]: any } {
        return NumberValidator.containsNDigits(control, 2, 'val074');
    }

    static containsThreeDigits(control: AbstractControl): { [key: string]: any } {
        return NumberValidator.containsNDigits(control, 3, 'val075');
    }

    /**
     * @param from number - min value
     * @param to number - max value
     * @param messageKey string - name of message to show from i18n
     * @param messageType string - type of the message to show.
     * @param shouldValidateFrom boolean - in case we need to avoid lower limit validation.
     * The validation checks if the number is in a given interval.
     */
    static isNumberWithinRage(from: number, to: number, messageKey: string, messageType = 'error', shouldValidateFrom = true): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean } | null => {
            const value = +control.value;
            const errorMessageObj = {};

            if (typeof value === 'number' && ((shouldValidateFrom && value < from) || value > to)) {
                errorMessageObj[messageKey] = { 0: from, type: messageType };
                return errorMessageObj;
            }

            return null;
        };
    }

    private static containsNDigits(control: AbstractControl, digits: number, msg: string) {
        const testedValue = control.value;
        let digitsLength = 0;

        if (testedValue) {
            testedValue.split('').forEach(char => {
                if (!isNaN(char)) {
                    digitsLength++;
                }
            });

            if (digitsLength !== digits) {
                const errorresult = {};
                errorresult[msg] = { valid: false, value: testedValue };
                return errorresult;
            }
        }
        return null;
    }

    private static isEmptyObj(obj: any): boolean {
        for (const name in obj) {
            if (obj.hasOwnProperty(name)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if a number string represents an exponential number
     * @param val: string
     */
    private static isExponential(val: string): boolean {
        if (val.indexOf('e') !== -1 || val.indexOf('E') !== -1) {
            return true;
        }

        return false;
    }

    private static clearError(c: AbstractControl, controlName: string, errorKey: string) {
        if (c.get(controlName).errors) {
            delete c.get(controlName).errors[errorKey];

            if (this.isEmptyObj(c.get(controlName).errors)) {
                c.get(controlName).setErrors(null);
                c.get(controlName).updateValueAndValidity();
            } else {
                c.get(controlName).setErrors(c.get(controlName).errors);
            }
        }
    }
}
