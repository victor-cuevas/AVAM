import { TestBed } from '@angular/core/testing';

import { StesVermittlungsfaehigkeitService } from './stes-vermittlungsfaehigkeit.service';
import { TranslateService } from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';

export class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        return key;
    }
    onLangChange = new EventEmitter();
}

describe('StesVermittlungsfaehigkeitService', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                }
            ]
        })
    );

    it('should be created', () => {
        const service: StesVermittlungsfaehigkeitService = TestBed.get(StesVermittlungsfaehigkeitService);
        expect(service).toBeTruthy();
    });
});
