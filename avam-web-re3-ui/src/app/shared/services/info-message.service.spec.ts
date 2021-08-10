import { TestBed } from '@angular/core/testing';
import { InfoMessageService } from '@shared/services/info-message.service';
import { InfoMessageRestService } from '@core/http/info-message-rest.service';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SpinnerService } from 'oblique-reactive';

describe('InfoMessageService', () => {
    let service: InfoMessageService;
    let resService: InfoMessageRestService;
    let translateService: TranslateService;
    let spinnerService: SpinnerService;

    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        TestBed.configureTestingModule({
            providers: [InfoMessageRestService, HttpClient, HttpHandler, SpinnerService],
            imports: [
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                }),
                HttpClientTestingModule
            ]
        });
        spinnerService = TestBed.get(SpinnerService);
        resService = TestBed.get(InfoMessageRestService);
        translateService = TestBed.get(TranslateService);
        translateService.currentLang = 'de';
        service = new InfoMessageService(resService, spinnerService);
    });

    it('getInfoMessages', () => {
        let restServicespy = spyOn(resService, 'getInfoMessages').and.callThrough();
        service.getInfoMessages('channel');
        expect(restServicespy).toHaveBeenCalled();
    });

    it('markInfoMessageAsRead', () => {
        let restMarkInfoMessageAsReadSpy = spyOn(resService, 'markInfoMessageAsRead').and.callThrough();
        service.markInfoMessageAsRead('channel', 1050, 'T7018');
        expect(restMarkInfoMessageAsReadSpy).toHaveBeenCalled();
    });
});
