import { EventEmitter, Injectable } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})

/**
 * DbTranslateService
 *
 * With this class the injecting the TranslateService to the components is no longer required
 */
export class DbTranslateService {
    private static readonly DE: string = 'De';
    private static readonly FR: string = 'Fr';
    private static readonly IT: string = 'It';

    constructor(private translateService: TranslateService) {}

    get(object: any, propertyPrefix: string, lang: string) {
        return object[propertyPrefix + this.capitalize(lang)];
    }

    translate(object: any, propertyPrefix): string {
        if (!object) {
            return null;
        }

        const currentLang = this.translateService.currentLang;
        return object[propertyPrefix + this.capitalize(currentLang)];
    }

    translateWithOrder(object: any, propertyPrefix: string): string {
        const lang: string = this.capitalize(this.translateService.currentLang);
        const translationOrder: string[] = this.getTranslationOrder(lang);

        return this.doTranslateWithOrder(object, propertyPrefix, translationOrder, lang);
    }

    instant(key: string) {
        return this.translateService.instant(key);
    }

    /**
     * Allows registration for language changes
     */
    getEventEmitter(): EventEmitter<LangChangeEvent> {
        return this.translateService.onLangChange;
    }

    getCurrentLang(): string {
        return this.translateService.currentLang;
    }

    private capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    private doTranslateWithOrder(object: any, propertyPrefix: string, langOrder: string[], currentLang: string): string {
        let translationWithOrder: string = null;
        for (let lang of langOrder) {
            let translation: string = object[propertyPrefix + lang];
            if (translation !== null && translation !== undefined && translation.length > 0) {
                translationWithOrder = currentLang === lang ? translation : `${translation} [${lang.charAt(0)}]`;
                break;
            }
        }
        return translationWithOrder;
    }

    private getTranslationOrder(lang: string): string[] {
        let translationOrder: string[] = [];
        switch (lang) {
            case DbTranslateService.DE: {
                translationOrder = [DbTranslateService.DE, DbTranslateService.FR, DbTranslateService.IT];
                break;
            }
            case DbTranslateService.FR: {
                translationOrder = [DbTranslateService.FR, DbTranslateService.DE, DbTranslateService.IT];
                break;
            }
            case DbTranslateService.IT: {
                translationOrder = [DbTranslateService.IT, DbTranslateService.FR, DbTranslateService.DE];
                break;
            }
        }
        return translationOrder;
    }
}
