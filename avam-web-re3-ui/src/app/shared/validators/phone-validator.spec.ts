import { FormControl } from '@angular/forms';
import { EmailValidator } from './email-validator';
import { PhoneValidator } from '@shared/validators/phone-validator';

describe('Phone Number Format Validator', () => {
    it('should be invalid', () => {
        const control = { value: 'testInvalid' };
        const result = PhoneValidator.isValidFormat(control as FormControl);

        expect(result).not.toBeNull();
    });

    // interational mininum: +1 2 3
    it('interational valid', () => {
        const control = { value: '+41 79 456 45 45' };
        const result = PhoneValidator.isValidFormat(control as FormControl);

        expect(result).toBeNull();
    });

    // national minimum: 1 2
    it('national valid', () => {
        const control = { value: '079 456 45 45' };
        const result = PhoneValidator.isValidFormat(control as FormControl);

        expect(result).toBeNull();
    });
});
