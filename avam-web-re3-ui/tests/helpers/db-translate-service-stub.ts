import { EventEmitter } from '@angular/core';
import { LangChangeEvent } from '@ngx-translate/core';

export class DbTranslateServiceStub {
    private currentLang = 'de';
    translate(object: any, propertyPrefix): string {
        return object[propertyPrefix + this.capitalize(this.currentLang)];
    }
    getEventEmitter(): EventEmitter<LangChangeEvent> {
        return new EventEmitter<LangChangeEvent>();
    }
    getCurrentLang(): string {
        return this.currentLang;
    }
    private capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
