import { StesDataService } from './stes-data.service';
import { StesSearchRestService } from '@core/http/stes-search-rest.service';
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { TranslateCompiler, TranslateLoader, TranslateParser, TranslateService, TranslateStore } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';

describe('StesDataService', () => {
    let stesDataService: StesDataService;
    let stesSearchRestService: StesSearchRestService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                StesSearchRestService,
                HttpClient,
                HttpHandler,
                DbTranslateService,
                { provide: TranslateService, useClass: TranslateServiceStub },
                TranslateStore,
                TranslateLoader,
                TranslateCompiler,
                TranslateParser
            ]
        });
        stesSearchRestService = TestBed.get(StesSearchRestService);
        stesDataService = new StesDataService(stesSearchRestService);
    });

    it('should callRestService', () => {
        let test: any;
        let spy = spyOn(stesDataService, 'callRestService').and.callThrough();

        stesDataService.callRestService(test);

        expect(spy).toHaveBeenCalled();
    });
});
