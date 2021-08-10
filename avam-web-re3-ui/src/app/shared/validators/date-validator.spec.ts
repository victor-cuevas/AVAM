import { AbstractControl } from '@angular/forms';
import { DateValidator } from './date-validator';
import { NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

describe('Validators', () => {
    it('date Format false', () => {
        const control = { value: '07.07.19' };
        const result = DateValidator.dateFormat(control as AbstractControl);

        expect(result !== null).toBe(true);
    });

    it('date Format true', () => {
        const control = { value: '07.07.2019' };
        const result = DateValidator.dateFormat(control as AbstractControl);

        expect(result).toBeNull();
    });

    it('dateSmallerToday false', () => {
        const control = { value: '07.07.2100' };
        const result = DateValidator.dateSmallerToday(control as AbstractControl);

        expect(result !== null).toBe(true);
    });

    it('dateSmallerToday true', () => {
        const control = { value: '07.07.2018' };
        const result = DateValidator.dateSmallerToday(control as AbstractControl);

        expect(result).toBeNull();
    });

    it('dateSmallerToday NgbDate false', () => {
        const ngbDate = new NgbDate(2100, 12, 21);
        const control = { value: ngbDate };
        const result = DateValidator.dateSmallerToday(control as AbstractControl);

        expect(result !== null).toBe(true);
    });

    it('dateRange false', () => {
        const control = { value: '07.07.1989' };
        const result = DateValidator.dateRange(control as AbstractControl);

        expect(result !== null).toBe(true);
    });

    it('dateRange true', () => {
        const control = { value: '07.07.2018' };
        const result = DateValidator.dateRange(control as AbstractControl);

        expect(result).toBeNull();
    });

    it('dateRange NgbDate false', () => {
        const ngbDate = new NgbDate(1989, 7, 7);
        const control = { value: ngbDate };
        const result = DateValidator.dateRange(control as AbstractControl);

        expect(result !== null).toBe(true);
    });

    it('invalidDateRangeBiggerCentury true', () => {
        const control = { value: '07.07.1985' };
        const result = DateValidator.dateRangeBiggerCentury(control as AbstractControl);

        expect(result).toBeNull();
    });

    it('invalidDateRangeBiggerCentury NgbDate false', () => {
        const ngbDate = new NgbDate(1887, 12, 21);
        const control = { value: ngbDate };
        const result = DateValidator.dateRangeBiggerCentury(control as AbstractControl);

        expect(result !== null).toBe(true);
    });

    it('val250', () => {
        const time1 = null;
        const time2 = 'aa:aa';
        const time3 = '0:00';
        const time4 = '00:aa';
        const time5 = '00:00';

        const control1 = { value: time1 };
        const control2 = { value: time2 };
        const control3 = { value: time3 };
        const control4 = { value: time4 };
        const control5 = { value: time5 };

        const result1 = DateValidator.val250(control1 as AbstractControl);
        const result2 = DateValidator.val250(control2 as AbstractControl);
        const result3 = DateValidator.val250(control3 as AbstractControl);
        const result4 = DateValidator.val250(control4 as AbstractControl);
        const result5 = DateValidator.val250(control5 as AbstractControl);

        expect(result1 !== null).toBe(false);
        expect(result2 !== null).toBe(true);
        expect(result3 !== null).toBe(true);
        expect(result4 !== null).toBe(true);
        expect(result5 !== null).toBe(false);
    });

    it('val251', () => {
        const time1 = null;
        const time2 = '00:00';
        const time3 = '25:30';
        const time4 = '24:00';
        const time5 = '23:59';
        const time6 = '00:60';

        const control1 = { value: time1 };
        const control2 = { value: time2 };
        const control3 = { value: time3 };
        const control4 = { value: time4 };
        const control5 = { value: time5 };
        const control6 = { value: time6 };

        const result1 = DateValidator.val251(control1 as AbstractControl);
        const result2 = DateValidator.val251(control2 as AbstractControl);
        const result3 = DateValidator.val251(control3 as AbstractControl);
        const result4 = DateValidator.val251(control4 as AbstractControl);
        const result5 = DateValidator.val251(control5 as AbstractControl);
        const result6 = DateValidator.val251(control6 as AbstractControl);

        expect(result1 !== null).toBe(false);
        expect(result2 !== null).toBe(false);
        expect(result3 !== null).toBe(true);
        expect(result4 !== null).toBe(true);
        expect(result5 !== null).toBe(false);
        expect(result6 !== null).toBe(true);
    });

    it('dateFormatNgx VAL248 valid', () => {
        [{ value: NgbDate.from({ year: 2017, month: 7, day: 27 } as NgbDateStruct) }, { value: new Date() }, { value: '01.01.2000' }, { value: null }, { value: '' }]
            .map(control => DateValidator.dateFormatNgx(control as AbstractControl))
            .forEach(validation => expect(validation).toBeNull());
    });

    it('dateFormatNgx VAL248 invalid', () => {
        const controlInvalidStr = { value: '01.01.21000090' };
        const validation: any = DateValidator.dateFormatNgx(controlInvalidStr as AbstractControl);
        expect(validation).not.toBeNull();
        expect(validation.invalidDateFromat).not.toBeNull();
        expect(validation.invalidDateFromat.valid).toBe(false);
    });

    it('isDateInFutureNgx VAL200 valid', () => {
        [{ value: NgbDate.from({ year: 2000, month: 1, day: 1 } as NgbDateStruct) }, { value: new Date(2000, 0, 1) }, { value: '01.01.2000' }, { value: null }, { value: '' }]
            .map(control => DateValidator.isDateInFutureNgx(control as AbstractControl))
            .forEach(validation => expect(validation).toBeNull());
    });

    it('isDateInFutureNgx VAL200 invalid', () => {
        [{ value: '01.01.9999' }]
            .map(control => DateValidator.isDateInFutureNgx(control as AbstractControl))
            .forEach((validation: any) => {
                expect(validation).not.toBeNull();
                expect(validation.invalidDateBiggerThanToday).not.toBeNull();
                expect(validation.invalidDateBiggerThanToday.valid).toBe(false);
            });
    });
});
