import { Pipe, PipeTransform } from '@angular/core';

/**
 * This custom pipe returns formatted number value
 * It accepts value, precision and nullCheck as arguments
 * The third argument is optional and if set to true checks if the number
 * has a null value. If yes - null is returned which basically leaves
 * the field empty.
 */
@Pipe({
    name: 'formatNumber'
})
export class FormatNumberPipe implements PipeTransform {
    transform(value, precision, checkForNull?: boolean): string | number {
        if (checkForNull && value === null) {
            return null;
        }

        return value ? Number(value).toFixed(precision) : Number(0).toFixed(precision);
    }
}
