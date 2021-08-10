import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '../services/db-translate.service';

/**
 * This custom pipe has to be used to localize properties for localization of any objects used in the code
 */
@Pipe({ name: 'dbTranslate', pure: false })
export class DbTranslatePipe implements PipeTransform {
    constructor(private translateService: TranslateService, private dbTranslateService: DbTranslateService) {}

    transform(value: any, propertyPrefix: string): string {
        if (propertyPrefix === null) {
            return '';
        }
        if (value) {
            let label = this.dbTranslateService.translate(value, propertyPrefix);
            if ((label == null || label.length === 0) && value.labelKey != null) {
                label = this.translateService.instant(value.labelKey);
            }
            return label;
        } else {
            return '';
        }
    }
}
