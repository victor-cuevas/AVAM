import { PersonenNrValidator } from './personenNr-validator';
import { AbstractControl}  from '@angular/forms';

describe('PersonenNrValidator', () => {
    it('should 8 digits', () => {
        let control1 = {value: null};
        let control2 = {value: '0000000'};
        let control3 = {value: 'aaaaaaaa'};
        let control4 = {value: '0000000a'};
        let control5 = {value: '000000000'};
        let control6 = {value: '00000000'};

        let result1 = PersonenNrValidator.val011(control1 as AbstractControl);
        let result2 = PersonenNrValidator.val011(control2 as AbstractControl);
        let result3 = PersonenNrValidator.val011(control3 as AbstractControl);
        let result4 = PersonenNrValidator.val011(control4 as AbstractControl);
        let result5 = PersonenNrValidator.val011(control5 as AbstractControl);
        let result6 = PersonenNrValidator.val011(control6 as AbstractControl);

        expect(result1 !== null).toBe(false);
        expect(result2 !== null).toBe(true);
        expect(result3 !== null).toBe(true);
        expect(result4 !== null).toBe(true);
        expect(result5 !== null).toBe(true);
        expect(result6 !== null).toBe(false);
    });
});
