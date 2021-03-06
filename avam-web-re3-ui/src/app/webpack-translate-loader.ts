import { TranslateLoader } from '@ngx-translate/core';
import { Observable, from } from 'rxjs';

export class WebpackTranslateLoader implements TranslateLoader {
    getTranslation(lang: string): Observable<any> {
        return from(System.import(`../assets/i18n/${lang}.json`));
    }
}
