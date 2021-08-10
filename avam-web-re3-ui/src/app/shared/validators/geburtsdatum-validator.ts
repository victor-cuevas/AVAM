import { FormControl, ValidatorFn } from '@angular/forms';
import { NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AvamRegex } from './avam-regex';
import { DateValidator } from '@shared/validators/date-validator';

export class GeburtsdatumValidator {
    static formatValidator: ValidatorFn = (control: FormControl) => {
        const date = control.value;
        if (!date) {
            return null;
        }

        if (!date.match(AvamRegex.stesSuche.geburtsdatum.validDateFormat)) {
            return { val248: { valid: false, value: date } };
        }
        return null;
    };

    static dateValidator: ValidatorFn = (control: FormControl) => {
        const date = control.value;
        if (!date || !date.match(AvamRegex.stesSuche.geburtsdatum.validDateFormat)) {
            return null;
        }

        if (
            !(
                date.match(AvamRegex.stesSuche.geburtsdatum.valid29dayFebruary) ||
                date.match(AvamRegex.stesSuche.geburtsdatum.valid30dayMonth) ||
                date.match(AvamRegex.stesSuche.geburtsdatum.valid31dayMonth)
            ) ||
            date.match(AvamRegex.stesSuche.geburtsdatum.invalidNullInput) ||
            date.match(AvamRegex.stesSuche.geburtsdatum.invalidOnlyDayInput) ||
            date.match(AvamRegex.stesSuche.geburtsdatum.invalidOnlyMonthInput) ||
            date.match(AvamRegex.stesSuche.geburtsdatum.invalidDayAndMonthInput)
        ) {
            return { val245: { valid: false, value: date } };
        }

        return null;
    };

    static anmeldungDateValidator: ValidatorFn = (control: FormControl) => {
        const date = control.value;
        if (!date || !date.match(AvamRegex.stesSuche.geburtsdatum.validDateFormat)) {
            return null;
        }

        if (
            !(
                date.match(AvamRegex.stesSuche.geburtsdatum.valid29dayFebruary) ||
                date.match(AvamRegex.stesSuche.geburtsdatum.valid30dayMonth) ||
                date.match(AvamRegex.stesSuche.geburtsdatum.valid31dayMonth)
            ) ||
            date.match(AvamRegex.stesSuche.geburtsdatum.invalidOnlyDayInput)
        ) {
            return { val245: { valid: false, value: date } };
        }

        return null;
    };

    static dateSucheValidator: ValidatorFn = (control: FormControl) => {
        const date = control.value;
        if (!date || !date.match(AvamRegex.stesSuche.geburtsdatum.validDateFormat)) {
            return null;
        }

        if (!date.match(AvamRegex.stesSuche.geburtsdatum.validDateFormatSuche)) {
            return { val252: { valid: false, value: date } };
        }

        return null;
    };

    static dateAnmeldungValidator: ValidatorFn = (control: FormControl) => {
        const date = control.value;
        if (!date || !date.match(AvamRegex.stesSuche.geburtsdatum.validDateFormatAnmeldung)) {
            return null;
        }

        if (!date.match(AvamRegex.stesSuche.geburtsdatum.validDateFormatAnmeldung)) {
            return { val252: { valid: false, value: date } };
        }

        return null;
    };

    static dateMonthAndDayValidator: ValidatorFn = (control: FormControl) => {
        const date = control.value;
        if (!date || !date.match(AvamRegex.stesSuche.geburtsdatum.validDateFormat)) {
            return null;
        }

        if (date.match(AvamRegex.stesSuche.geburtsdatum.invalidDayAndMonthInput)) {
            return { val252: { valid: false, value: date } };
        }
        return null;
    };

    static dateSmallerThanTodayValidator: ValidatorFn = (control: FormControl) => {
        const date = control.value;
        if (!date || date.length > 10 || GeburtsdatumValidator.dateSucheValidator(control) || DateValidator.dateFormatNgx(control)) {
            return null;
        }
        const today = new Date();
        const todayNgb: NgbDateStruct = { year: today.getUTCFullYear(), month: today.getUTCMonth() + 1, day: today.getUTCDate() };

        const dateElements = date.split('.', 3);
        const ngbDate = new NgbDate(+dateElements[2], +dateElements[1], +dateElements[0]);

        if (ngbDate.after(NgbDate.from(todayNgb))) {
            return { invalidDateBiggerThanToday: { valid: false, value: date } };
        }
        return null;
    };
}
