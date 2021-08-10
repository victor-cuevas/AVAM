import { AbstractControl } from '@angular/forms';
import { NumberValidator } from './number-validator';

describe('Validators', () => {
    it('check isPositiveInteger - valid number', () => {
        const controlTrue = { value: '1' };
        const resultTrue = NumberValidator.isPositiveInteger(controlTrue as AbstractControl);

        expect(resultTrue).toBeNull();
    });

    it('check isPositiveInteger - invalid float or double', () => {
        const controlFalse = { value: 1.2 };
        const resultFalse = NumberValidator.isPositiveInteger(controlFalse as AbstractControl);

        expect(resultFalse).not.toBeNull();
    });
});
