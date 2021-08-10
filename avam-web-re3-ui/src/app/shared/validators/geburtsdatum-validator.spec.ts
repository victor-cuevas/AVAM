import { AbstractControl } from '@angular/forms';
import { GeburtsdatumValidator } from './geburtsdatum-validator';
import * as moment from 'moment';

describe('Geburtsdatum Validator', () => {
    it('no given data', () => {
        let control = { value: null };
        let result = GeburtsdatumValidator.formatValidator(control as AbstractControl);

        expect(result).toBeNull();
    });

    it('should be invalid format', () => {
        const control1 = { value: '07.07.19' };
        const control2 = { value: '07.7.2019' };
        const control3 = { value: '7.7.2019' };
        const control4 = { value: 'aa.bb.cccc' };
        const control5 = { value: 'a1.02.2019' };
        const control6 = { value: '32.07.20019' };
        const control7 = { value: '07.13.200019' };
        const control8 = { value: '7.13.0119' };

        const result1 = GeburtsdatumValidator.formatValidator(control1 as AbstractControl);
        const result2 = GeburtsdatumValidator.formatValidator(control2 as AbstractControl);
        const result3 = GeburtsdatumValidator.formatValidator(control3 as AbstractControl);
        const result4 = GeburtsdatumValidator.formatValidator(control4 as AbstractControl);
        const result5 = GeburtsdatumValidator.formatValidator(control5 as AbstractControl);
        const result6 = GeburtsdatumValidator.formatValidator(control6 as AbstractControl);
        const result7 = GeburtsdatumValidator.formatValidator(control7 as AbstractControl);
        const result8 = GeburtsdatumValidator.formatValidator(control8 as AbstractControl);

        expect(result1 !== null).toBe(true);
        expect(result2 !== null).toBe(true);
        expect(result3 !== null).toBe(true);
        expect(result4 !== null).toBe(true);
        expect(result5 !== null).toBe(true);
        expect(result6 !== null).toBe(true);
        expect(result7 !== null).toBe(true);
        expect(result8 !== null).toBe(true);
    });

    it('should be invalid date Format', () => {
        const control1 = { value: '00.00.0000' };
        const control2 = { value: '40.07.2019' };
        const control3 = { value: '30.02.2019' };
        const control4 = { value: '32.01.2019' };
        const control5 = { value: '07.13.2019' };
        const result1 = GeburtsdatumValidator.dateValidator(control1 as AbstractControl);
        const result2 = GeburtsdatumValidator.dateValidator(control2 as AbstractControl);
        const result3 = GeburtsdatumValidator.dateValidator(control3 as AbstractControl);
        const result4 = GeburtsdatumValidator.dateValidator(control4 as AbstractControl);
        const result5 = GeburtsdatumValidator.dateValidator(control5 as AbstractControl);

        expect(result1 !== null).toBe(true);
        expect(result2 !== null).toBe(true);
        expect(result3 !== null).toBe(true);
        expect(result4 !== null).toBe(true);
        expect(result5 !== null).toBe(true);
    });

    it('only Day invalid', () => {
        const control = { value: '01.00.0000' };
        const result = GeburtsdatumValidator.dateValidator(control as AbstractControl);

        expect(result !== null).toBe(true);
    });

    it('only given Month allowed', () => {
        const control = { value: '00.01.0000' };
        const result = GeburtsdatumValidator.dateValidator(control as AbstractControl);

        expect(result).toBeNull();
    });

    it('only given Year allowed', () => {
        const control = { value: '00.00.1990' };
        const result = GeburtsdatumValidator.dateValidator(control as AbstractControl);

        expect(result).toBeNull();
    });

    it('date bigger than Today invalid', () => {
        const control = {
            value: moment()
                .add(1, 'd')
                .format('DD.MM.YYYY')
        };
        const result = GeburtsdatumValidator.dateSmallerThanTodayValidator(control as AbstractControl);

        expect(result !== null).toBe(true);
    });
});
