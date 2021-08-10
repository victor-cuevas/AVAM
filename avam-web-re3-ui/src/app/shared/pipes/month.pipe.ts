import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MonthsCodeEnum } from '@shared/enums/domain-code/months-code.enum';

@Pipe({
    name: 'month',
    pure: false
})
export class MonthPipe implements PipeTransform {
    private static readonly MONTHS = {
        1: MonthsCodeEnum.JAN,
        2: MonthsCodeEnum.FEB,
        3: MonthsCodeEnum.MAR,
        4: MonthsCodeEnum.APR,
        5: MonthsCodeEnum.MAI,
        6: MonthsCodeEnum.JUN,
        7: MonthsCodeEnum.JUL,
        8: MonthsCodeEnum.AUG,
        9: MonthsCodeEnum.SEPT,
        10: MonthsCodeEnum.OKT,
        11: MonthsCodeEnum.NOV,
        12: MonthsCodeEnum.DEZ
    };

    constructor(private translateService: TranslateService) {}

    transform(value: any): any {
        if (value) {
            const key = MonthPipe.MONTHS[value];
            if (key) {
                return this.translateService.instant(key);
            }
        }
        return '';
    }
}
