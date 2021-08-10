import { FormControl } from '@angular/forms';
import { EmailValidator } from './email-validator';

describe('Telephone Number Format Validator', () => {
    it('should email be invalid', () => {
        const control = { value: 'testInvalid' };
        const result = EmailValidator.isValidFormat(control as FormControl);

        expect(result).not.toBeNull();
    });

    it('should email be valid', () => {
        const control = { value: 'abc@abc.ch' };
        const result = EmailValidator.isValidFormat(control as FormControl);

        expect(result).toBeNull();
    });
});
