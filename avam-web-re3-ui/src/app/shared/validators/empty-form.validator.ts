import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AvamComponentsTableComponent } from '@app/library/wrappers/form/avam-components-table/avam-components-table.component';

export const emptyFormValidator = (skipFields: string[], message: any, array?: string): ValidatorFn => {
    return (control: AbstractControl) => {
        const form = control.value;
        const data = [];

        for (const field in form) {
            // transform form to array
            data.push({ key: field, value: form[field] });
        }

        for (const skipField of skipFields) {
            // remove unrequired fields for validation
            const skipIndex = data.findIndex(field => field.key === skipField);
            if (skipIndex > -1) {
                data.splice(skipIndex, 1);
            }
        }

        for (const field of data) {
            // verify field is not empty
            if (field.value && field.key !== array) {
                return null;
            }
            // verify array has elements
            if (field.key === array && field.value.length > 0) {
                return null;
            }
        }

        return message;
    };
};

export const activateRequiredIfValueOnOtherFields = (fieldToSetRequired: string, array?: string[], componentsTable?: AvamComponentsTableComponent): ValidatorFn => {
    return (group: AbstractControl): ValidationErrors => {
        if (array.length) {
            const hasValue = array.some(item => {
                const control = group.get(item);
                if (control.value) {
                    group.get(fieldToSetRequired).setValidators(Validators.required);
                    group.get(fieldToSetRequired).updateValueAndValidity({ emitEvent: false, onlySelf: true });
                    componentsTable.triggerValidation();
                    return true;
                }
                group.get(fieldToSetRequired).clearValidators();
                group.get(fieldToSetRequired).updateValueAndValidity({ emitEvent: false, onlySelf: true });
            });

            if (hasValue && !group.get(fieldToSetRequired).value) {
                componentsTable.triggerValidation();
                return { key: group, value: hasValue };
            }
        }
        componentsTable.triggerValidation();
        return null;
    };
};
