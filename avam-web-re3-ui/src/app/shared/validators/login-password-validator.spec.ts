import { AbstractControl } from '@angular/forms';
import { passwordValidator } from './login-password-validator';

describe('PasswordValidator', () => {

    it('no given data', () => {
        let control = {value: null};
        let result = passwordValidator(control as AbstractControl);

        expect(result).toBeNull();

        control = {value: '00000'};
        result = passwordValidator(control as AbstractControl);
        expect(result).not.toBeNull();

        control = {value: '12345678'};
        result = passwordValidator(control as AbstractControl);
        expect(result).toBeNull();
    });
});
