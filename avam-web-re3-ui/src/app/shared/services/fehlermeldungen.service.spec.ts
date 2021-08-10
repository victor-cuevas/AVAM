import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { FehlermeldungenService } from './fehlermeldungen.service';
import { of } from 'rxjs';

export class TranslateServiceStub {
    public instant(key: any): any {
        of(key);
    }
}

describe('FehlermeldungenService', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            providers: [{ provide: TranslateService, useClass: TranslateServiceStub }]
        })
    );

    it('should be created', () => {
        const service: FehlermeldungenService = TestBed.get(FehlermeldungenService);
        expect(service).toBeTruthy();
    });

    it('show Message', () => {
        const service: FehlermeldungenService = TestBed.get(FehlermeldungenService);

        this.subscription = service.getMessage().subscribe(message => {
            expect(message.text).toEqual('testText');
            expect(message.type).toEqual('testType');
        });

        service.showMessage('testText', 'testType');
    });

    it('delete Message', () => {
        const service: FehlermeldungenService = TestBed.get(FehlermeldungenService);

        this.subscription = service.getMessage().subscribe(message => {
            expect(message.text).toEqual('testText');
            expect(message.type).toEqual('testType');
        });

        service.deleteMessage('testText', 'testType');
    });
});
