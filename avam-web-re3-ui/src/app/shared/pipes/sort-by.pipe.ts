import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/*
 *ngFor="let c of oneDimArray | sortBy"
 *ngFor="let c of arrayOfObjects | sortBy:'propertyNamePrefix':true:true"
 */

@Pipe({ name: 'sortBy' })
export class SortByPipe implements PipeTransform {
    constructor(private translateService: TranslateService) {}

    transform(value: any[], column = '', reverse = false, translateProperty = false): any[] {
        if (!value || value.length <= 1) {
            return value;
        }
        if (!column || column === '') {
            return this.checkOrder(
                value.sort((a, b) => {
                    if (a > b) {
                        return 1;
                    }
                    if (a < b) {
                        return -1;
                    }
                    return 0;
                }),
                reverse
            );
        }
        const property = translateProperty ? column + this.capitalize(this.translateService.currentLang) : column;
        if (!(property in value[0])) {
            return value;
        }
        return this.checkOrder(
            value.sort((a, b) => {
                if (a[property] > b[property]) {
                    return 1;
                }
                if (a[property] < b[property]) {
                    return -1;
                }
                return 0;
            }),
            reverse
        );
    }

    private checkOrder(value: any[], reverse: boolean) {
        return reverse ? value.reverse() : value;
    }

    private capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
