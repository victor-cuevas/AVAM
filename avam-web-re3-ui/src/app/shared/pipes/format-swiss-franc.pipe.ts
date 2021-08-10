import { Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';
import { LocaleEnum } from '../enums/locale.enum';

/**
 *
 * The pipe is used to adjust money values to the swiss format. (e.g. 12345.00 -> 12'345.00)
 *
 * Properties:
 * value - The numeric value to be formatted
 * displayZeroIfNull - Determines whether 0.00 should be displayed if the number is "null" or
 * if the field should be left empty
 */
@Pipe({
    name: 'formatSwissFranc'
})
export class FormatSwissFrancPipe implements PipeTransform {
    readonly twoDecimalDigits = '.2-2';

    transform(value, displayZeroIfNull?: boolean): string | number {
        if (!displayZeroIfNull && value === null) {
            return null;
        } else if (displayZeroIfNull) {
            return formatNumber(value, LocaleEnum.SWITZERLAND, this.twoDecimalDigits);
        }

        return formatNumber(value, LocaleEnum.SWITZERLAND, this.twoDecimalDigits);
    }
}
