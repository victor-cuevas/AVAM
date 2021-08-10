import { TestBed } from '@angular/core/testing';

import { RoboHelpService } from '@shared/services/robo-help.service';
import {DefaultUrl, UrlRestService} from '@core/http/url-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { DbTranslateServiceStub } from '@test_helpers/db-translate-service-stub';

class TranslateServiceStub {
    public currentLang = 'de';

    public instant(key: any): any {
        of(key);
    }
}

describe('RoboHelpService', () => {
    let service: RoboHelpService;
    let restService: UrlRestService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [HttpClientTestingModule],
            providers: [
                UrlRestService,
                HttpClient,
                HttpHandler,
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                { provide: TranslateService, useClass: TranslateServiceStub }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
        restService = TestBed.get(UrlRestService);
        service = new RoboHelpService(restService, TestBed.get(DbTranslateService));
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('help-non-digits', () => {
        const spy = spyOn(restService, 'urlById').and.callThrough();
        service.help('01-23');
        expect(spy).toHaveBeenCalledWith(DefaultUrl.HELP, 123);
    });

    it('help', () => {
        const spy = spyOn(restService, 'urlById').and.callThrough();
        service.help('123');
        expect(spy).toHaveBeenCalledWith(DefaultUrl.HELP, 123);
    });

    it('help non-digits', () => {
        const spy = spyOn(restService, 'defaultUrl').and.callThrough();
        service.help('bla');
        expect(spy).toHaveBeenCalled();
    });

    it('help empty spaces', () => {
        const spy = spyOn(restService, 'defaultUrl').and.callThrough();
        service.help(' ');
        expect(spy).toHaveBeenCalled();
    });

    it('help default', () => {
        const spy = spyOn(restService, 'defaultUrl').and.callThrough();
        service.help();
        expect(spy).toHaveBeenCalled();
    });
});
