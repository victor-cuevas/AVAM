import { AbstractControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AvamRegex, ValidationConstants } from './avam-regex';
import * as moment from 'moment';

export class DateValidator {
    /**
     * @deprecated use dateFormatNgx()
     */
    static dateFormat(control: AbstractControl): { [key: string]: any } {
        if (DateValidator.isNotBlank(control) && NgbDate.from(control.value).year === null) {
            const splitted = control.value.split('.', 3);
            if (splitted[2] === undefined || splitted[2].length !== 4) {
                return { invalidDateFromat: { valid: false, value: control.value } };
            }
        }
        return null;
    }

    /**
     * VAL248
     *
     * @param {AbstractControl} control - the control to which the val should be applied
     */
    static dateFormatNgx(control: AbstractControl): { [key: string]: any } {
        if (DateValidator.isNotBlank(control)) {
            if (DateValidator.isNotADateOrNgbDate(control)) {
                const splitted = control.value.split('.');
                if (splitted.length !== 3) {
                    return { invalidDateFromat: { valid: false, value: control.value } };
                }

                if (splitted.length === 3 && (splitted[2].length !== 4 || splitted[1].length !== 2 || splitted[0].length !== 2)) {
                    return { invalidDateFromat: { valid: false, value: control.value } };
                }
            } else if (control.errors && DateValidator.isNotInvalidDate(control)) {
                return control.errors;
            }
        }

        return null;
    }

    /**
     * @deprecated use isDateInFutureNgx()
     *
     */
    static dateSmallerToday(control: AbstractControl): { [key: string]: any } {
        const today = new Date();
        const todayNgb: NgbDateStruct = DateValidator.asNgbDateStruct(today);

        if (DateValidator.isNotBlank(control)) {
            if (NgbDate.from(control.value).year !== null) {
                if (NgbDate.from(control.value).after(NgbDate.from(todayNgb))) {
                    return { invalidDateBiggerThanToday: { valid: false, value: control.value } };
                }
            } else {
                const splitted = control.value.split('.', 3);
                const inputDate = new NgbDate(+splitted[2], +splitted[1], +splitted[0]);

                if (inputDate.after(NgbDate.from(todayNgb))) {
                    return { invalidDateBiggerThanToday: { valid: false, value: control.value } };
                }
            }
        }
        return null;
    }

    // VAL200
    static isDateInFutureNgx(control: AbstractControl): { [key: string]: any } {
        const today = new Date();

        if (DateValidator.isNotBlank(control)) {
            if (control.value instanceof Date) {
                if (control.value > today) {
                    return { invalidDateBiggerThanToday: { valid: false, value: control.value } };
                }
            } else if (control.value instanceof NgbDate) {
                if (control.value.after(NgbDate.from(DateValidator.asNgbDateStruct(today)))) {
                    return { invalidDateBiggerThanToday: { valid: false, value: control.value } };
                }
            } else {
                const inputDateMoment = moment(control.value, 'DD.MM.YYYY').startOf('day');
                const todayMoment = moment().startOf('day');

                if (inputDateMoment.isAfter(todayMoment)) {
                    return { invalidDateBiggerThanToday: { valid: false, value: control.value } };
                }
            }
        }

        return null;
    }

    /**
     * Custom validator for val201, val202, val208. Should be used on the form group and not single form control.
     *
     * Example form val201:
     *  createForm() {
     *      return this.formBuilder.group(
     *          {
     *              datumVon: null,
     *              datumBis: null,
     *          },
     *          { validator: DateValidator.rangeBetweenDates('datumVon', 'datumBis', 'val201') }
     *      );
     *  }
     *  OR for val202:
     *  createForm() {
     *      return this.formBuilder.group(
     *          {
     *              datumVon: null,
     *              datumBis: null,
     *          },
     *          { validator: DateValidator.rangeBetweenDates('datumVon', 'datumBis', 'val202', false) }
     *      );
     *  }
     *
     * @param from string - name of from control
     * @param to string - name of to control
     * @param errorKey string - name of error to show from i18n
     * @param allowEqual boolean - Optional. False if you don't need equal dates (val202)
     * @param showOnBoth boolean - Optional. True if you need to show the error on both fields
     */
    static rangeBetweenDates(from: string, to: string, errorKey: string, allowEqual = true, showOnBoth = false): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            const toDate = moment(c.get(to).value, ['DD.MM.YYYY', 'x'], true);
            const fromDate = moment(c.get(from).value, ['DD.MM.YYYY', 'x'], true);
            const isBefore = toDate.isBefore(fromDate, 'days');
            const isSameOrBefore = toDate.isSameOrBefore(fromDate, 'days');
            if (allowEqual ? isBefore : isSameOrBefore) {
                const toErrors = { ...c.get(to).errors };
                const fromErrors = { ...c.get(from).errors };
                toErrors[errorKey] = true;
                c.get(to).setErrors(toErrors);
                c.get(to).markAsDirty();
                if (showOnBoth) {
                    fromErrors[errorKey] = true;
                    c.get(from).setErrors(fromErrors);
                    c.get(from).markAsDirty();
                }
                return { invalid: true };
            } else {
                if (c.get(to).errors) {
                    delete c.get(to).errors[errorKey];
                    if (this.isEmptyObj(c.get(to).errors)) {
                        c.get(to).setErrors(null);
                        c.get(to).updateValueAndValidity();
                    }
                }
                if (showOnBoth && c.get(from).errors) {
                    delete c.get(from).errors[errorKey];
                    if (this.isEmptyObj(c.get(from).errors)) {
                        c.get(from).setErrors(null);
                        c.get(from).updateValueAndValidity();
                    }
                }
                return null;
            }
        };
    }

    /**
     * VAL307
     * Similar to rangeBetweenDates. Here we display errors only on the 'from' control
     *
     * @param {AbstractControl} control - the control to which the val should be applied
     */
    static val307(from: string, to: string, errorKey: string, allowEqual = true): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            const toDate = moment(c.get(to).value).format('DD.MM.YYYY');
            const fromDate = moment(c.get(from).value).format('DD.MM.YYYY');
            const isBefore = moment(toDate, 'DD.MM.YYYY').isBefore(moment(fromDate, 'DD.MM.YYYY'));
            const isSameOrBefore = moment(toDate, 'DD.MM.YYYY').isSameOrBefore(moment(fromDate, 'DD.MM.YYYY'));

            if (allowEqual ? isBefore : isSameOrBefore) {
                const fromErrors = { ...c.get(from).errors };
                fromErrors[errorKey] = true;
                c.get(from).setErrors(fromErrors);
                c.get(from).markAsDirty();

                return { invalid: true };
            } else {
                DateValidator.clearDateError(c, from, 'val307');
            }

            return null;
        };
    }

    /**
     * Custom validator for val206 and val207. Should be used on the form group and not single form control.
     *
     * Example:
     *  createForm() {
     *      return this.formBuilder.group(
     *          {
     *              datumVon: null,
     *              datumBis: null,
     *          },
     *          { validator: DateValidator.rangeBetweenDates('datumVon', 'datumBis', 'val207') }
     *      );
     *  }
     *
     * @param from string - name of from control
     * @param to string - name of to control
     * @param errorKey string - name of error to show from i18n
     */
    static rangeBetweenDatesWarning(from: string, to: string, warningKey: string): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            const toDate = moment(c.get(to).value).format('DD.MM.YYYY');
            const fromDate = moment(c.get(from).value).format('DD.MM.YYYY');
            const isBefore = moment(toDate, 'DD.MM.YYYY').isBefore(moment(fromDate, 'DD.MM.YYYY'));
            if (isBefore) {
                const toErrors = { ...c.get(to).errors, [warningKey]: { type: 'warning', value: 'date' } };
                c.get(to).setErrors(toErrors);
            } else {
                c.get(to).setErrors({ ...c.get(to).errors });
            }
            return null;
        };
    }

    /**
     * @param from string - name of from control
     * @param dateToCompare string - name of to control
     *
     * dateToCompare should be in the following date range: from <= dateToCompare <= from + 30 days
     */
    static val318(from: string, dateToCompare: string): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            const fromDate = moment(c.get(from).value, ['DD.MM.YYYY', 'x'], true);
            const compareDate = moment(c.get(dateToCompare).value, ['DD.MM.YYYY', 'x'], true);
            const toDate = moment(c.get(from).value, ['DD.MM.YYYY', 'x'], true).add(30, 'days');

            const invalid = compareDate.isBefore(fromDate, 'day') || compareDate.isAfter(toDate, 'day');
            if (invalid) {
                const toErrors = { ...c.get(dateToCompare).errors, val318: { valid: false, value: c.get(dateToCompare).value } };
                c.get(dateToCompare).setErrors(toErrors);
                c.get(dateToCompare).markAsDirty();
            } else {
                if (c.get(dateToCompare).errors) {
                    delete c.get(dateToCompare).errors['val318'];
                    if (this.isEmptyObj(c.get(dateToCompare).errors)) {
                        c.get(dateToCompare).setErrors(null);
                        c.get(dateToCompare).updateValueAndValidity();
                    }
                }
            }
            return null;
        };
    }

    /**
     * VAL297, VAL301
     * @param dateToCompare Date
     * @param errorKey error key from i18n
     * The validation compares two dates - one extracted from the
     * abstract control and the other passed as an argument - and checks if the date from the abstract control
     * is the same or before the date which is passed as an argument.
     */
    static checkDateSameOrBefore(dateToCompare: Date, errorKey: string): ValidatorFn {
        return (c: AbstractControl): { [key: string]: any } | null => {
            const fromDate = moment(c.value, ['DD.MM.YYYY', 'x'], true);
            const compareDate = moment(dateToCompare, ['DD.MM.YYYY', 'x'], true);

            if (!compareDate.isSameOrBefore(fromDate, 'day') && fromDate.isValid()) {
                return { [errorKey]: { 0: compareDate.format('DD.MM.YYYY') } };
            }
            return null;
        };
    }

    /**
     * VAL296, VAL300
     * @param dateToCompare Date
     * @param errorKey error key from i18n
     * The validation compares two dates - one extracted from the
     * abstract control and the other passed as an argument - and checks if the date from the abstract control
     * is the same or after the date which is passed as an argument.
     */
    static checkDateSameOrAfter(dateToCompare: Date, errorKey: string): ValidatorFn {
        return (c: AbstractControl): { [key: string]: any } | null => {
            const fromDate = moment(c.value, ['DD.MM.YYYY', 'x'], true);
            const compareDate = moment(dateToCompare, ['DD.MM.YYYY', 'x'], true);

            if (!compareDate.isSameOrAfter(fromDate, 'day') && fromDate.isValid()) {
                return { [errorKey]: { 0: compareDate.format('DD.MM.YYYY') } };
            }
            return null;
        };
    }

    /**
     * val167
     * @param firstDate Date
     * The validation compares two dates - one extracted from the
     * abstract control and the other passed as an argument - and checks if the date from the abstract control
     * is the same or after the date which is passed as an argument.
     */
    static val167(firstDate: Date): ValidatorFn {
        return (c: AbstractControl): { [key: string]: any } | null => {
            const activityBeginningMomentObj = moment(firstDate);
            const dateFromMomentObj = moment(c.value);

            if (!dateFromMomentObj.isSameOrAfter(activityBeginningMomentObj) && activityBeginningMomentObj.isValid()) {
                return { val167: { 0: activityBeginningMomentObj.format('DD.MM.YYYY') } };
            }

            return null;
        };
    }

    /**
     * VAL185
     * @param from - from date
     * @param to - to date
     * The validation checks if the peroiod between from and to is greater than 12 months.
     */
    static checkPeriodGreaterThan12(from: any, to: any): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            if (c.get(from).value && c.get(to).value) {
                const momentFrom = moment(c.get(from).value, 'DD.MM.YYYY', true);
                const momentTo = moment(c.get(to).value, 'DD.MM.YYYY', true);

                const yearsDiff = momentTo.year() - momentFrom.year();
                let durationAsMonths = yearsDiff * 12;
                const monthDiff = momentTo.month() - momentFrom.month();
                durationAsMonths += monthDiff;
                const dayDiff = momentTo.date() - momentFrom.date();

                if (dayDiff >= 0) {
                    const maxDaysInMonth = momentTo.daysInMonth();
                    durationAsMonths += (dayDiff + 1) / maxDaysInMonth;
                } else if (dayDiff < 0) {
                    const maxDaysInMonth = momentFrom.daysInMonth();
                    durationAsMonths = durationAsMonths - 1 + (maxDaysInMonth + dayDiff + 1) / maxDaysInMonth;
                }

                if (durationAsMonths > 12) {
                    const toErrors = { ...c.get(to).errors, val185: { type: 'warning', value: 'date' } };
                    c.get(to).setErrors(toErrors);
                } else {
                    if (c.get(to).errors) {
                        c.get(to).setErrors({ ...c.get(to).errors });
                    } else {
                        c.get(to).setErrors(null);
                    }
                }
            }
            return null;
        };
    }

    /**
     * @deprecated use dateRangeNgx()
     */
    static dateRange(control: AbstractControl): { [key: string]: any } {
        const lowerLimit: NgbDateStruct = { year: 1990, month: 1, day: 1 };
        const upperLimit: NgbDateStruct = { year: 2099, month: 12, day: 31 };

        if (DateValidator.isNotBlank(control)) {
            if (NgbDate.from(control.value).year === null) {
                const splitted = control.value.split('.', 3);
                const inputDate = new NgbDate(+splitted[2], +splitted[1], +splitted[0]);

                if (inputDate.after(NgbDate.from(upperLimit)) || inputDate.before(NgbDate.from(lowerLimit))) {
                    return { invalidDateRange: { valid: false, value: control.value } };
                }
            } else {
                if (NgbDate.from(control.value).after(NgbDate.from(upperLimit)) || NgbDate.from(control.value).before(NgbDate.from(lowerLimit))) {
                    return { invalidDateRange: { valid: false, value: control.value } };
                }
            }
        }
        return null;
    }

    /**
     * VAL203
     * @param from string - name of from control
     * @param to string - name of to control
     * @param errorKey string - error name
     * The validation checks if the date range period is within 12 months.
     * If not a validation error is returned
     */
    static dateRange12M(from: string, to: string, errorKey: string): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            const duration = DateValidator.createMomentObj(c, to).diff(DateValidator.createMomentObj(c, from), 'months', true);

            // when the user inputs free text, the timezone is not considered, thus, illogical difference of less than one day is calculated
            if (duration > 12) {
                const toErrors = { ...c.get(to).errors };
                toErrors[errorKey] = true;
                c.get(to).setErrors(toErrors);
                c.get(to).markAsDirty();
                return { invalid: true };
            } else {
                if (c.get(to).errors) {
                    delete c.get(to).errors[errorKey];
                    if (this.isEmptyObj(c.get(to).errors)) {
                        c.get(to).setErrors(null);
                        c.get(to).updateValueAndValidity();
                    }
                }
                return null;
            }
        };
    }

    /**
     * VAL204. Should be used on the form group and not single form control.
     *
     * Example:
     *  createForm() {
     *      return this.formBuilder.group(
     *          {
     *              ausbildungVon: null,
     *              ausbildungBis: null,
     *          },
     *          { validator: DateValidator.rangeBetweenDates('ausbildungVon', 'ausbildungBis') }
     *      );
     *  }
     *
     * @param from string - name of from control
     * @param to string - name of to control
     */
    static dateRangeWarning48M(from: string, to: string): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            const duration = DateValidator.createMomentObj(c, to).diff(DateValidator.createMomentObj(c, from), 'months', true);

            if (duration > 48) {
                const toErrors = { ...c.get(to).errors, ['val204']: { type: 'warning', value: 'date' } };
                c.get(to).setErrors(toErrors);
            } else {
                c.get(to).setErrors({ ...c.get(to).errors });
            }
            return null;
        };
    }

    // VAL205
    static dateRangeNgx(control: AbstractControl): { [key: string]: any } {
        const lowerLimitYear = 1990;
        const upperLimitYear = 2099;

        if (DateValidator.isNotBlank(control)) {
            if (!(control.value instanceof Date)) {
                const splitted = control.value.split('.', 3);

                if (splitted[2] && splitted[2].length === 4 && (+splitted[2] < lowerLimitYear || +splitted[2] > upperLimitYear)) {
                    return { invalidDateRange: { valid: false, value: control.value } };
                }
            } else {
                if (control.value.getFullYear() < lowerLimitYear || control.value.getFullYear() > upperLimitYear) {
                    return { invalidDateRange: { valid: false, value: control.value } };
                }
            }
        }

        return null;
    }

    // VAL328
    // Validatior to check whether the control value is within given range 1900 <= date <= 2099.
    // Exclusive ordered parsing (de->fr->it) is needed since there is no straightforward way to pass current language to the validator.
    static yearInRange(control: AbstractControl): { [key: string]: any } {
        let momentObj = DateValidator.momentParseMonthYear(control.value, 'de');

        // parsing with German unsuccessful - try with French
        if (!momentObj.isValid()) {
            momentObj = DateValidator.momentParseMonthYear(control.value, 'fr');

            // parsing with French unsuccessful - try with Italian
            if (!momentObj.isValid()) {
                momentObj = DateValidator.momentParseMonthYear(control.value, 'it');
            }
        }

        if (momentObj.year() < 1900 || momentObj.year() > 2099) {
            return { val328: { valid: false, value: control.value } };
        }

        return null;
    }

    /**
     * @deprecated use dateRangeBiggerCenturyNgx()
     */
    static dateRangeBiggerCentury(control: AbstractControl): { [key: string]: any } {
        const lowerLimit: NgbDateStruct = { year: 1900, month: 1, day: 1 };

        if (DateValidator.isNotBlank(control)) {
            if (NgbDate.from(control.value).year === null) {
                const splitted = control.value.split('.', 3);
                const inputDate = new NgbDate(+splitted[2], +splitted[1], +splitted[0]);

                if (inputDate.before(NgbDate.from(lowerLimit))) {
                    return { invalidDateRangeBiggerCentury: { valid: false, value: control.value } };
                }
            } else {
                if (NgbDate.from(control.value).before(NgbDate.from(lowerLimit))) {
                    return { invalidDateRangeBiggerCentury: { valid: false, value: control.value } };
                }
            }
        }
        return null;
    }

    // VAL016
    static dateRangeBiggerCenturyNgx(control: AbstractControl): { [key: string]: any } {
        const lowerLimitYear = 1900;

        if (DateValidator.isNotBlank(control)) {
            if (!(control.value instanceof Date)) {
                const splitted = control.value.split('.', 3);

                if (splitted[2] && splitted[2].length === 4 && splitted[2] && splitted[2] !== '0000' && +splitted[2] < lowerLimitYear) {
                    return { invalidDateRangeBiggerCentury: { valid: false, value: control.value } };
                }
            } else {
                if (control.value.getFullYear() < lowerLimitYear) {
                    return { invalidDateRangeBiggerCentury: { valid: false, value: control.value } };
                }
            }
        }
        return null;
    }

    /**
     * VAL186
     * @param from string - name of from control
     * @param to string - name of to control
     * @param days string - name of the number of days control
     * The validation checks if the difference between the from and to dates is equals or greater than a specific number of days.
     */
    static val186(from: string, to: string, days: string): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            const toDate = moment(c.get(to).value).format('DD.MM.YYYY');
            const fromDate = moment(c.get(from).value).format('DD.MM.YYYY');
            const durationAsDays = moment(toDate, 'DD.MM.YYYY').diff(moment(fromDate, 'DD.MM.YYYY'), 'days') + 1;
            const daysControl = c.get(days);

            if (durationAsDays < daysControl.value) {
                daysControl.markAsDirty();

                const toErrors = { ...daysControl.errors };
                toErrors['val186'] = { 0: durationAsDays };
                daysControl.setErrors(toErrors);
            } else {
                if (daysControl.errors) {
                    delete daysControl.errors['val186'];
                    if (this.isEmptyObj(daysControl.errors)) {
                        daysControl.setErrors(null);
                        daysControl.updateValueAndValidity();
                    }
                }
                return null;
            }
        };
    }

    // VAL246
    static dateFormatMonthYearNgx(control: AbstractControl): { [key: string]: any } {
        let error = null;
        if (DateValidator.isNotBlank(control)) {
            if (!(control.value instanceof Date)) {
                const splitted = control.value.split(' ', 2);

                if (splitted[1] === undefined || splitted[1].length !== 4) {
                    if (!moment(control.value, ['M.YY', 'M.YYYY', 'MM.YY', 'MM.YYYY'], true).isValid()) {
                        error = { val246: { valid: false, value: control.value } };
                    }
                }
            } else if (isNaN(control.value.getTime())) {
                error = { val246: { valid: false, value: control.value } };
            }
        }

        return error;
    }

    // VAL247
    static dateValidMonthYearNgx(control: AbstractControl): { [key: string]: any } {
        let error = DateValidator.checkIfInvalidDate(control);
        let splitted = null;

        if (!(control.value instanceof Date) && DateValidator.isNotBlank(control)) {
            splitted = control.value.split(' ');
        }

        if (splitted) {
            if (splitted.length === 2 && splitted[1].length === 4) {
                const isMonthValid = ValidationConstants.months.some(month => month === splitted[0].toLowerCase());
                const isYearFourDigits = splitted[1].match(AvamRegex.common.jahr4ziffern);

                if (!isMonthValid || !isYearFourDigits) {
                    error = { invalidDate: { valid: false, value: control.value } };
                }
            } else {
                if (!moment(control.value, ['M.YY', 'M.YYYY', 'MM.YY', 'MM.YYYY'], true).isValid()) {
                    error = { invalidDate: { valid: false, value: control.value } };
                }
            }
        }

        return error;
    }

    /**
     * VAL249
     *
     * @param {AbstractControl} control - the control to which the val should be applied
     */
    static dateValidNgx(control: AbstractControl): { [key: string]: any } {
        if (DateValidator.isNotBlank(control)) {
            const date = moment(control.value, 'DD.MM.YYYY', true);
            const minDate = moment('04.10.1582', 'DD.MM.YYYY', true);

            if (!date.isValid() || moment(date).isBefore(minDate)) {
                return { val249: { valid: false, value: control.value } };
            }
        }

        return null;
    }

    // VAL250
    static val250: ValidatorFn = (control: AbstractControl) => {
        const time = control.value;
        if (!time) {
            return null;
        }

        if (!time.match(AvamRegex.common.val250)) {
            return { val250: { valid: false, value: time } };
        }
        return null;
    };

    // VAL251
    static val251: ValidatorFn = (control: AbstractControl) => {
        const time = control.value;
        if (!time) {
            return null;
        }

        if (!time.match(AvamRegex.common.val251)) {
            return { val251: { valid: false, value: time } };
        }
        return null;
    };

    /**
     * VAL273, VAL 274
     * @param datePickerFrom date "from"
     * @param datePickerTo date "to"
     * Checks if a date is within a given date range
     */

    static val273(datePickerFrom: Date, datePickerTo: Date): ValidatorFn {
        return (c: AbstractControl): { [key: string]: any } => {
            const dateFrom = moment(datePickerFrom);
            const dateTo = moment(datePickerTo);
            const isDateWithinRange = moment(c.value, 'DD.MM.YYYY', true);

            const isDateSameOrAfter = isDateWithinRange.isSameOrAfter(dateFrom);
            const isDateSameOrBefore = isDateWithinRange.isSameOrBefore(dateTo);

            const isDatePickerValid = dateFrom.isValid() && dateTo.isValid();
            const isDateWithinRangeValid = isDateWithinRange.isValid();

            if (isDatePickerValid && isDateWithinRangeValid && (!isDateSameOrAfter || !isDateSameOrBefore)) {
                return { val273: { 0: dateFrom.format('DD.MM.YYYY'), 1: dateTo.format('DD.MM.YYYY') } };
            }

            return null;
        };
    }

    /**
     * isDateWithinRange covers Validation 278 and similar
     * @param datePickerFrom date "from"
     * @param datePickerTo date "to"
     * @param errorKey the key of error to show from i18n
     * Checks if a date is within a given date range
     */
    static isDateWithinRange(datePickerFrom: Date, datePickerTo: Date, errorKey: string): ValidatorFn {
        return (c: AbstractControl): { [key: string]: any } => {
            const dateFrom = moment(datePickerFrom);
            const dateTo = moment(datePickerTo);
            const isDateWithinRange = moment(c.value, 'DD.MM.YYYY', true);

            const isDateSameOrAfter = isDateWithinRange.isSameOrAfter(dateFrom, 'day');
            const isDateSameOrBefore = isDateWithinRange.isSameOrBefore(dateTo, 'day');

            const isDatePickerValid = dateFrom.isValid() && dateTo.isValid();
            const isDateWithinRangeValid = isDateWithinRange.isValid();

            if (isDatePickerValid && isDateWithinRangeValid && (!isDateSameOrAfter || !isDateSameOrBefore)) {
                return { [errorKey]: { 0: dateFrom.format('DD.MM.YYYY'), 1: dateTo.format('DD.MM.YYYY') } };
            }

            return null;
        };
    }

    /**
     * checkDateWithinRange similar to Validation 278, but instead accepts three controls
     * @param dateToCheck date to be checked
     * @param dateFrom date "from"
     * @param dateTo date "to"
     * @param errorKey the key of error to show from i18n
     * Checks if a date is within a given date range
     */
    static checkDateWithinRange(dateToCheck: string, dateFrom: string, dateTo: string, errorKey: string): ValidatorFn {
        return (c: AbstractControl): { [key: string]: any } => {
            const dateToCheckObj = DateValidator.createMomentObj(c, dateToCheck);
            const dateFromObj = DateValidator.createMomentObj(c, dateFrom);
            const dateToObj = DateValidator.createMomentObj(c, dateTo);

            const isDateSameOrAfter = dateToCheckObj.isSameOrAfter(dateFromObj);
            const isDateSameOrBefore = dateToCheckObj.isSameOrBefore(dateToObj);

            const isDatePickerValid = dateFromObj.isValid() && dateToObj.isValid();
            const isDateWithinRangeValid = dateToCheckObj.isValid();

            if (isDatePickerValid && isDateWithinRangeValid && (!isDateSameOrAfter || !isDateSameOrBefore)) {
                const toErrors = { ...c.get(dateToCheck).errors };
                toErrors[errorKey] = { 0: dateFromObj.format('DD.MM.YYYY'), 1: dateToObj.format('DD.MM.YYYY') };
                c.get(dateToCheck).setErrors(toErrors);
                c.get(dateToCheck).markAsDirty();
            } else {
                if (c.get(dateToCheck).errors) {
                    c.get(dateToCheck).setErrors({ ...c.get(dateToCheck).errors });
                } else {
                    c.get(dateToCheck).setErrors(null);
                }
                return null;
            }

            return null;
        };
    }

    /**
     * VAL282
     * @param firstDatePickerFrom string - name of the first 'from' control
     * @param firstDatePickerTo string - name of the first 'to' control
     * @param secondDatePickerFrom string - name of the second 'from' control
     * @param secondDatePickerTo string - name of the second 'to' control
     * The validation requires two daterangepickers and checks if the date range of the second daterangepicker is within
     * the date range of the first daterangepicker (firstDateTo <= secondDateTo and  firstDateFrom >= secondDateFrom).
     * If not an error is returned - "Valid date range <Date1> to <Date2>".
     */
    static val282(firstDatePickerFrom: string, firstDatePickerTo: string, secondDatePickerFrom: string, secondDatePickerTo: string): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            const firstDateFrom = DateValidator.createMomentObj(c, firstDatePickerFrom);
            const firstDateTo = DateValidator.createMomentObj(c, firstDatePickerTo);
            const secondDateFrom = DateValidator.createMomentObj(c, secondDatePickerFrom);
            const secondDateTo = DateValidator.createMomentObj(c, secondDatePickerTo);
            const isFirstDatePickerValid = firstDateFrom.isValid() && firstDateTo.isValid();

            if (isFirstDatePickerValid && secondDateFrom.isValid() && !firstDateFrom.isSameOrBefore(secondDateFrom)) {
                const toErrors = { ...c.get(secondDatePickerFrom).errors };
                toErrors['val282'] = true;
                c.get(secondDatePickerFrom).setErrors({
                    val282: { 0: firstDateFrom.format('DD.MM.YYYY'), 1: firstDateTo.format('DD.MM.YYYY') }
                });
                c.get(secondDatePickerFrom).markAsDirty();
                return { invalid: true };
            } else if (isFirstDatePickerValid && secondDateTo.isValid() && !firstDateTo.isSameOrAfter(secondDateTo)) {
                const toErrors = { ...c.get(secondDatePickerTo).errors };
                toErrors['val282'] = true;
                c.get(secondDatePickerTo).setErrors({
                    val282: { 0: firstDateFrom.format('DD.MM.YYYY'), 1: firstDateTo.format('DD.MM.YYYY') }
                });
                c.get(secondDatePickerTo).markAsDirty();
                return { invalid: true };
            } else {
                DateValidator.clearDateError(c, secondDatePickerTo, 'val282');
                DateValidator.clearDateError(c, secondDatePickerFrom, 'val282');

                return null;
            }
        };
    }

    static val083(control: AbstractControl): { [key: string]: any } {
        const today = moment();
        const formatedDate = moment(control.value, 'DD.MM.YYYY');

        if (DateValidator.isNotBlank(control)) {
            if (control.value instanceof Date) {
                if (formatedDate.isBefore(today, 'day')) {
                    return { val083: { valid: false, value: control.value } };
                }
            } else {
                const dateArr = control.value.split('.');
                if (dateArr.length === 3 && dateArr[2].length === 4) {
                    if (formatedDate.isBefore(today, 'day')) {
                        return { val083: { valid: false, value: control.value } };
                    }
                }
            }
        }

        return null;
    }
    static val067(control: AbstractControl): { [key: string]: any } {
        const today = moment();
        const formatedDate = moment(control.value, 'DD.MM.YYYY');

        if (DateValidator.isNotBlank(control)) {
            if (control.value instanceof Date) {
                if (formatedDate.isBefore(today, 'day')) {
                    return { val067: { type: 'warning', valid: false, value: control.value } };
                }
            } else {
                const dateArr = control.value.split('.');
                if (dateArr.length === 3 && dateArr[2].length === 4) {
                    if (formatedDate.isBefore(today, 'day')) {
                        return { val067: { type: 'warning', valid: false, value: control.value } };
                    }
                }
            }
        }

        return null;
    }

    static dateBiggerThanTodayWarning(datum: string, warningKey: string): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            const today = moment();
            const formatedDate = moment(c.get(datum).value, 'DD.MM.YYYY');

            if (DateValidator.isNotBlank(c.get(datum))) {
                if (c.get(datum).value instanceof Date) {
                    if (formatedDate.isBefore(today, 'day')) {
                        const datumErrors = { ...c.get(datum).errors, [warningKey]: { type: 'warning', value: 'date' } };
                        c.get(datum).setErrors(datumErrors);
                    } else {
                        c.get(datum).setErrors({ ...c.get(datum).errors });
                    }
                } else {
                    const dateArr = c.get(datum).value.split('.');
                    if (dateArr.length === 3 && dateArr[2].length === 4) {
                        if (formatedDate.isBefore(today, 'day')) {
                            const toErrors = { ...c.get(datum).errors, [warningKey]: { type: 'warning', value: 'date' } };
                            c.get(datum).setErrors(toErrors);
                        }
                    } else {
                        c.get(datum).setErrors({ ...c.get(datum).errors });
                    }
                }
            } else {
                c.get(datum).setErrors({ ...c.get(datum).errors });
            }
            return null;
        };
    }

    // VAL006
    static val006: ValidatorFn = (fg: FormGroup) => {
        let zeitVon = fg.get('zeitVon').value;
        let zeitBis = fg.get('zeitBis').value;

        // Für die Initialisierung notwendig
        if (!zeitVon || !zeitBis) {
            return null;
        }

        if (zeitBis.indexOf(';') !== -1) {
            return null;
        }

        // Gleicht die Zeitangabe 0000 zu 00:00 an
        zeitVon = DateValidator.addTimeDelimiter(zeitVon);
        zeitBis = DateValidator.addTimeDelimiter(zeitBis);

        if (!zeitVon || !zeitBis) {
            return null;
        }

        const startHourArr = zeitVon.split(':');
        const endHourArr = zeitBis.split(':');

        const dateVon = new Date();
        const dateBis = new Date();

        dateVon.setHours(startHourArr[0]);
        dateVon.setMinutes(startHourArr[1]);
        dateBis.setHours(endHourArr[0]);
        dateBis.setMinutes(endHourArr[1]);

        if (dateVon.getTime() < dateBis.getTime()) {
            return null;
        } else {
            fg.controls.zeitBis.setErrors({ val006: { valid: false, value: dateBis.getTime() } });
            return { val006: { valid: false, value: dateBis.getTime() } };
        }
    };

    static zeitVonBisBoth: ValidatorFn = (fg: FormGroup) => {
        const zeitVon = fg.get('zeitVon');
        const zeitBis = fg.get('zeitBis');
        if (zeitVon.value || zeitBis.value) {
            DateValidator.addRequired(zeitVon, [DateValidator.val250, DateValidator.val251]);
            DateValidator.addRequired(zeitBis, [DateValidator.val250, DateValidator.val251]);
        } else {
            DateValidator.removeRequired(zeitVon, [DateValidator.val250, DateValidator.val251]);
            DateValidator.removeRequired(zeitBis, [DateValidator.val250, DateValidator.val251]);
        }
        return null;
    };

    private static addRequired(control, validators: ValidatorFn[]) {
        if (!control.validator({} as AbstractControl) || !control.validator({} as AbstractControl).hasOwnProperty('required')) {
            control.setValidators([...validators, Validators.required]);
            control.updateValueAndValidity({ onlySelf: true, emitEvent: true });
        }
    }

    private static removeRequired(control, validators: ValidatorFn[]) {
        if (control.validator({} as AbstractControl) && control.validator({} as AbstractControl).hasOwnProperty('required')) {
            control.setValidators(validators);
            control.updateValueAndValidity({ onlySelf: true, emitEvent: true });
        }
    }

    private static checkIfInvalidDate(control: AbstractControl): { [key: string]: any } {
        let error = null;
        if (control.value instanceof Date && isNaN(control.value.getTime())) {
            error = { invalidDate: { valid: false, value: control.value } };
        }
        return error;
    }

    private static asNgbDateStruct(date: Date): NgbDateStruct {
        return {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
            day: date.getUTCDate()
        } as NgbDateStruct;
    }

    private static isNotBlank(control: AbstractControl): boolean {
        return control.value !== null && control.value !== '';
    }

    private static isNotADateOrNgbDate(control: AbstractControl): boolean {
        return !(control.value instanceof Date) && !(control.value instanceof NgbDate);
    }

    private static isNotInvalidDate(control: AbstractControl): boolean {
        return control.value instanceof Date && isNaN(control.value.valueOf());
    }

    private static isEmptyObj(obj: any): boolean {
        for (const name in obj) {
            if (obj.hasOwnProperty(name)) {
                return false;
            }
        }
        return true;
    }

    private static addTimeDelimiter(date: any): string {
        if (!!date && date.length === 4) {
            return `${date[0]}${date[1]}:${date[2]}${date[3]}`;
        } else if (!!date && date.length === 5 && date[2] === ':') {
            return date;
        }
        return null;
    }

    private static createMomentObj(c: AbstractControl, controlName: string) {
        return moment(c.get(controlName).value, 'DD.MM.YYYY', true);
    }

    private static clearDateError(c: AbstractControl, date: string, errorKey: string) {
        if (c.get(date).errors) {
            delete c.get(date).errors[errorKey];
            if (this.isEmptyObj(c.get(date).errors)) {
                c.get(date).setErrors(null);
                c.get(date).updateValueAndValidity();
            }
        }
    }

    private static momentParseMonthYear(controlValue, locale: string): moment.Moment {
        return moment(controlValue, ['M.YY', 'M.YYYY', 'MM.YY', 'MM.YYYY', 'MMMM YYYY'], locale, true);
    }
}
