import { of } from 'rxjs';

export class TranslateServiceStub {
    currentLang = 'de';

    public get(key: any, parameter?: any): any {
        parameter ? of(key, parameter) : of(key);
    }

    public stream(key: any): any {
        return of(key);
    }

    get onLangChange() {
        return of({ lang: 'en' });
    }

    public instant(key: any): any {
        return key;
    }

    public translate(value, propertyPrefix) {
        return value + propertyPrefix;
    }
}
