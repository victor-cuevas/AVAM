import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl } from '@angular/forms';
import { formatNumber } from '@angular/common';
import { MultiLanguageParamDTO } from '@app/shared/models/dtos-generated/multiLanguageParamDTO';
import { CodeDTO } from '@dtos/codeDTO';
import { Moment } from 'moment';

@Injectable({
    providedIn: 'root'
})
export class FormUtilsService {
    static readonly GUI_DATE_FORMAT = 'DD.MM.YYYY';
    static readonly GUI_MONTH_DATE_FORMAT = 'MMMM YYYY';

    /**
     * gui string date e.g. '30.08.2019'
     *
     * @param value the iso string e.g. '2019-08-30'
     */
    public getGuiStringDateFromIsoString(value: string): string {
        if (!value) {
            return null;
        }
        return moment(value).format(FormUtilsService.GUI_DATE_FORMAT);
    }

    /**
     * @deprecated use parseDate
     * NgbDate
     *
     * @param value approx 8 types possible which are supported by moment()
     */
    public checkDateIfNull(value: number) {
        let formattedDate = null;
        if (value) {
            const momentDate = moment(value);
            // month + 1 - because months are indexed from 0 to 11
            formattedDate = new NgbDate(momentDate.year(), momentDate.month() + 1, momentDate.date());
        }
        return formattedDate;
    }

    // provide STRING e.g. 01.07.2017 or NgbDate or Date
    public transformDateToTimestamps(value: string | NgbDate | Date) {
        if (value) {
            if (value instanceof NgbDate) {
                value = `${value.day}.${value.month}. ${value.year}`;
            }
            return moment(value, 'DD.MM.YYYY').valueOf();
        }
        return null;
    }

    /**
     * @deprecated use parseDate
     *
     * STRING (if NgbDate provided)
     * ANY (return whatever has been provided)
     *
     * @param value
     */
    public transformToStringIfNgbDate(value: any) {
        if (value instanceof NgbDate) {
            const day = `0${value.day}`.slice(-2);
            const month = `0${value.month}`.slice(-2);

            return `${day}.${month}.${value.year}`;
        }

        return value;
    }

    /**
     * DATE
     *
     * @param value
     * @param time
     */
    public transformDateAndTimeToTimestampsNgx(value: Date, time: { _hh: string; _mm: string }) {
        const stringValue = this.formatDateNgx(value, 'DD.MM.YYYY');
        return this.transformDateAndTimeToTimestamps(stringValue, time);
    }

    /**
     * STRING (ISO-string if no format provided)
     *
     * @param value approx 8 types possible which are supported by moment()
     * @param format
     */
    public formatDateNgx(value: string | Date | number, format?: string): string {
        if (!value) {
            return null;
        }
        return moment(value).format(format ? format : 'YYYY-MM-DD');
    }

    public formatNumber(num, precision) {
        return num ? num.toFixed(precision) : Number(0).toFixed(precision);
    }

    public formatDateWithDots(control: AbstractControl) {
        const value = control.value;
        if (value && value.match(/^[0-9]{8}$/)) {
            control.setValue(`${value[0]}${value[1]}.${value[2]}${value[3]}.${value[4]}${value[5]}${value[6]}${value[7]}`);
        }
    }

    /**
     * Receives percentage in string format e.g. '100%' and precision and returns string value '100.00%'
     *
     * @param perc
     * @param precision
     */
    public formatPercentage(perc: string, precision: number): string {
        if (perc) {
            const number = +perc.slice(0, -1);
            const result = number.toFixed(precision) + ' %';

            return result;
        } else {
            return '';
        }
    }

    /**
     * Formats money amounts by the principle "Banker's rounding" a.k.a. "kaufmännisches Runden".
     * In order to achieve the same result that we have in RE2 we apply the exact same function as in RE2
     * with minor refactoring and rewritten in Typescript
     * @param value
     */
    formatAmountOfMoney(value: any): string {
        const maxValue = 99999.99;

        if (!value) {
            return null;
        } else if (!value.toString().trim()) {
            return null;
        } else if (isNaN(Number(value))) {
            return value;
        }

        if (value > maxValue - 0.02 && value <= maxValue) {
            value = maxValue - 0.04;
        }

        let punkt = value.toString().indexOf('.');

        if (punkt > 0) {
            value = value.toString().substr(0, punkt + 3);
            value = Math.round(value * 20) / 2 / 10;
        }

        value = value.toString();
        punkt = value.indexOf('.');

        if (punkt < 0) {
            value = value + '.00';
        }

        if (punkt + 2 === value.length) {
            value = value + '0';
        }

        // If ".0" is entered format to 0.0
        if (punkt === 0) {
            value = '0' + value;
        }

        value = formatNumber(value, 'de-CH', '.2-2');

        return value;
    }

    /**
     * The method returns the codeId of the specified item
     *
     * @param options array of objects
     * @param code code of the specified item in options
     */
    public getCodeIdByCode(options: any[], code: string) {
        const option = options.find(item => item.code === code);

        return option ? String(option.codeId) : undefined;
    }

    /**
     * The method returns the code of the specified item
     *
     * @param options array of objects
     * @param codeId codeId of the specified item in options
     */
    public getCodeByCodeId(options: any[], codeId: string) {
        const option = options.find(item => item.codeId === +codeId);

        return option ? String(option.code) : undefined;
    }

    /**
     * The method maps a CodeDTO to a DropdownOption for AvamLabelDroptom Component
     *
     * @param codes of CodeDTO
     */
    defaultPropertyMapper(element: CodeDTO): DropdownOption {
        return {
            value: element.codeId,
            code: element.code,
            codeId: element.codeId,
            labelFr: element.textFr,
            labelIt: element.textIt,
            labelDe: element.textDe
        } as DropdownOption;
    }

    /**
     * The method maps a CodeDTO to a DropdownOption for AvamLabelDropdown Component using kurztext property as label text
     *
     * @param {CodeDTO} element
     */
    defaultPropertyMapperKurztext(element: CodeDTO): DropdownOption {
        return {
            value: element.codeId,
            code: element.code,
            codeId: element.codeId,
            labelFr: element.kurzTextFr,
            labelIt: element.kurzTextIt,
            labelDe: element.kurzTextDe
        } as DropdownOption;
    }

    mapDropdown(items: CodeDTO[]): DropdownOption[] {
        if (items) {
            return items.map(item => this.defaultPropertyMapper(item));
        }

        return [];
    }

    mapDropdownKurztext(items: CodeDTO[]): DropdownOption[] {
        if (items) {
            return items.map(item => this.defaultPropertyMapperKurztext(item));
        }

        return [];
    }

    /**
     * hh:mm time string such as 12:34
     *
     * @param time the time such as "1234" (other values: "12:34", null)
     */
    addColonToTimeString(time: string): string {
        if (!!time && time.length === 4) {
            // enhance too short string
            return `${time[0]}${time[1]}:${time[2]}${time[3]}`;
        }

        return time;
    }

    /**
     * Parses date properly for both displaying (mapToForm) and saving to BE (mapToDto)
     * Two formats are provided:
     * 'DD.MM.YYYY' to handle freetext input such as 22.11.2020
     * 'x' to handle timestamp format coming from BE
     *
     * @param date - either null, timestamp, date obj or string
     * @returns Date object or null
     */
    parseDate(date): Date {
        if (!date) {
            return null;
        }
        return this.parseMomentDate(date).toDate();
    }

    /**
     * Parses date properly as Date by moment library
     * Two formats are provided:
     * 'DD.MM.YYYY' to handle freetext input such as 22.11.2020
     * 'x' to handle timestamp format coming from BE
     *
     * @param date - either null, timestamp, date obj or string
     * @returns Date object or null
     */
    parseMomentDate(date): Moment {
        return moment(date, ['DD.MM.YYYY', 'x'], true);
    }

    /**
     * Parses date properly to a string with the format MM.YYYY (month and year only)
     *
     * @param date - either null or date obj
     * @returns string (empty if null) representing the date formatted as MM.YYYY
     */
    dateToMonthYearString(date: Date): string {
        if (!date) {
            return '';
        }

        return moment(date).format('MM.YYYY');
    }

    /**
     *  Utility method for spliting element strukture path.
     *  @param path the path we want to split/extract
     */
    public extractElementNameFromPath(path: MultiLanguageParamDTO) {
        const de = path.nameDe.split('>>');
        const fr = path.nameFr.split('>>');
        const it = path.nameIt.split('>>');

        return {
            nameDe: de[de.length - 1].trim(),
            nameFr: fr[fr.length - 1].trim(),
            nameIt: it[it.length - 1].trim()
        };
    }

    public getLastUpdated(data: ValueObjectAvamDTO[]): ValueObjectAvamDTO {
        if (!data || data.length === 0) {
            return null;
        }

        let lastUpdated: ValueObjectAvamDTO = data[0];

        data.forEach(el => {
            const updateDate = el.geaendertAm || el.erfasstAm;
            const lastUpdateDate = lastUpdated.geaendertAm || lastUpdated.erfasstAm;

            if (lastUpdateDate < updateDate) {
                lastUpdated = el;
            }
        });

        return lastUpdated;
    }

    asNumber(val: any): number | null {
        if (!/^[0-9]+$/.test(val)) {
            return null;
        }
        return parseInt(val);
    }

    public mapMultiselectOption(codeDTO: CodeDTO): any {
        return {
            id: codeDTO.codeId,
            textDe: codeDTO.kurzTextDe,
            textIt: codeDTO.kurzTextIt,
            textFr: codeDTO.kurzTextFr,
            value: false
        };
    }

    /**
     * DATE
     *
     * @param value
     * @param time
     */
    private transformDateAndTimeToTimestamps(value: string | NgbDate, time: { _hh: string; _mm: string }) {
        if (value) {
            return moment(value, 'DD.MM.YYYY')
                .set('hour', +time._hh)
                .set('minutes', +time._mm);
        }
        return null;
    }
}

export interface ValueObjectAvamDTO {
    erfasstAm?: Date;
    erfasstDurch?: string;
    geaendertAm?: Date;
    geaendertDurch?: string;
}

export interface DropdownOption {
    codeId: number;
    code: string;
    labelDe: string;
    labelFr: string;
    labelIt: string;
    value: number | string;
}
