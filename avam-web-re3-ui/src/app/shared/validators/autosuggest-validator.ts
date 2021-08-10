import { AbstractControl, FormControl, ValidatorFn, ValidationErrors, Validators } from '@angular/forms';
import { ValidationConstants, AvamRegex } from './avam-regex';

export class AutosuggestValidator {
    static required(control: AbstractControl): { [key: string]: any } {
        if (control.value) {
            if (!control.value.inputElementOneValue || !control.value.inputElementTwoValue) {
                return { required: true };
            } else {
                return null;
            }
        }
        return { required: true };
    }

    static berufRequired(control: AbstractControl): { [key: string]: any } {
        if (control.value && control.value.chIscoBeruf) {
            return null;
        }
        return { required: true };
    }

    static valueOneNumericInput(fehlermledung: any): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value && control.value.inputElementOneValue) {
                const inputElementOneValue = control.value.inputElementOneValue;
                const inputElementOneString = typeof inputElementOneValue === 'number' ? String(inputElementOneValue) : inputElementOneValue;

                if (!inputElementOneString.match('^[0-9]*$')) {
                    fehlermledung[Object.keys(fehlermledung)[0]].value = inputElementOneString;

                    return fehlermledung;
                }
            }

            return null;
        };
    }

    static valueOneNumermicMax4DigitsInput(fehlermledung: any): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value) {
                const inputElementOneValue = +control.value;

                if (inputElementOneValue > 9999) {
                    return fehlermledung;
                }
            }
            return null;
        };
    }

    static valueGemeindeBfsInput(fehlermledung: any): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value && typeof control.value !== 'object') {
                const inputElementNumber = typeof control.value === 'number' ? control.value : Number(control.value);
                const inputElementString = typeof control.value === 'number' ? String(control.value) : control.value;

                if (!inputElementString.match('^[0-9]*$')) {
                    fehlermledung[Object.keys(fehlermledung)[0]].value = inputElementString;
                    return fehlermledung;
                }
                if (inputElementNumber > 9999) {
                    return fehlermledung;
                }
            }

            return null;
        };
    }

    static valueTextInput(fehlermledung: any): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value && control.value.target) {
                const textValue = control.value.target.value;

                if (!textValue.match(AvamRegex.common.textOnlyLetters)) {
                    return fehlermledung;
                }
            }

            return null;
        };
    }

    static val216: ValidatorFn = (control: any) => {
        const value = control.value;
        if (!value || value.code) {
            return null;
        }
        const notValid = { val216: { valid: false, value } };
        if (value.length !== 5) {
            return notValid;
        }
        if (!value.match(AvamRegex.common.val216)) {
            return notValid;
        }
        return null;
    };
}

export class UserValidator {
    /**
     * benutzer ungültig - NUR serverseitig und somit hier FALSCH, bitte löschen
     */
    static val212: ValidatorFn = (control: FormControl) => {
        const user = control.value;
        if (!user) {
            return null;
        }
        if (user.id === ValidationConstants.id.val212) {
            return { val212: { valid: false, value: user.id } };
        }
        return null;
    };

    /**
     * clientseitig
     */
    static val213frontend: ValidatorFn = (control: any) => {
        const value = control.value;
        if (!value) {
            return null;
        }
        if (value && !value.benutzerId && control.benutzerObject && control.benutzerObject.benutzerId === ValidationConstants.id.val212) {
            return { val213: { valid: false, value } };
        }
        return null;
    };

    static val214frontend: ValidatorFn = (control: any) => {
        const value = control.value;
        if (!value || value.code) {
            return null;
        }
        if (value && !value.benutzerstelleId && control.benutzerstelleObject && control.benutzerstelleObject.benutzerstelleId === ValidationConstants.id.val212) {
            return { val214: { valid: false, value } };
        }
        return null;
    };

    /**
     * NUR serverseitig!
     */
    static val052: ValidatorFn = (control: FormControl) => {
        const user = control.value;
        if (!user) {
            return null;
        }
        if (user.id === ValidationConstants.id.val052) {
            return { val052: { valid: false, value: user.id } };
        }
        return null;
    };

    static requiredGroupWhenFieldFilled(index: number, data: any): ValidatorFn {
        return (control: FormControl) => {
            const name = control.get('name');
            const vorname = control.get('vorname');
            const stelle = control.get('stelle');
            const isKontakt = data[index] === true;
            const isAnyFilled = control.value.name || control.value.vorname || control.value.stelle;
            if ((control.dirty && isAnyFilled) || isKontakt) {
                this.setValidatorsInGroup(name, control.value.name, isAnyFilled, isKontakt);
                this.setValidatorsInGroup(vorname, control.value.vorname, isAnyFilled, isKontakt);
                this.setValidatorsInGroup(stelle, control.value.stelle, isAnyFilled, isKontakt);
            } else {
                this.setValidatorsInGroup(name, null, false, false);
                this.setValidatorsInGroup(vorname, null, false, false);
                this.setValidatorsInGroup(stelle, null, false, false);
            }
            return null;
        };
    }

    private static setValidatorsInGroup(field: AbstractControl, value: any, isAnyFilled: boolean, isKontakt: boolean) {
        if (isAnyFilled) {
            // only filled field can be marked required
            if (value) {
                field.setValidators(Validators.required);
            } else {
                field.setValidators(null);
                field.markAsPristine();
            }
        } else if (isKontakt) {
            // mark all fileds required when all are empty only
            field.setValidators(Validators.required);
        } else {
            // no fields are mandatory if not a contact
            field.setValidators(null);
            field.markAsPristine();
        }
        field.updateValueAndValidity({ emitEvent: true, onlySelf: true });
    }
}
