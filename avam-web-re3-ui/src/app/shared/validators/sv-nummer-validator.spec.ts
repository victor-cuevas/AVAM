import { AbstractControl } from '@angular/forms';
import { SvNummerValidator } from './sv-nummer-validator';

describe('Validators', () => {
    it('should svNummberValid not check empty', () => {
        let control = { value: null };
        let result = SvNummerValidator.svNummberValid(control as AbstractControl);

        expect(result).toBeNull();
    });

    it('should svNummberValid get only number', () => {
        let control = { value: '07.07.19' };
        let result = SvNummerValidator.svNummberValid(control as AbstractControl);

        expect(result).not.toBeNull();
    });

    it('should svNummberValid not get number', () => {
        let control = { value: '070719' };
        let result = SvNummerValidator.svNummberValid(control as AbstractControl);

        expect(result).not.toBeNull();
    });

    it('should svNummberValid get valid number', () => {
        let control = { value: '7569217076985' };
        let result = SvNummerValidator.svNummberValid(control as AbstractControl);

        expect(result).toBeNull();
    });

    it('should svNummberValid not get number without correct error check number', () => {
        let control = { value: '7569217076984' };
        let result = SvNummerValidator.svNummberValid(control as AbstractControl);

        expect(result).not.toBeNull();
    });
});
