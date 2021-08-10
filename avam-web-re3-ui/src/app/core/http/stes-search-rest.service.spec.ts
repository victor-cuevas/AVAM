import { StesSearchRestService } from './stes-search-rest.service';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { DbTranslateService } from '@shared/services/db-translate.service';
import {
    TranslateCompiler,
    TranslateLoader,
    TranslateParser,
    TranslateService,
    TranslateStore
} from '@ngx-translate/core';
import {TranslateServiceStub} from '@test_helpers/translate-service-stub';

describe('StesSearchRestService', () => {
    let stesService: StesSearchRestService;
    let httpClient: HttpClient;
    let translateService: DbTranslateService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                DbTranslateService,
                { provide: TranslateService, useClass: TranslateServiceStub },
                TranslateStore,
                TranslateLoader,
                TranslateCompiler,
                TranslateParser
            ]
        });
        httpClient = TestBed.get(HttpClient);
        translateService = TestBed.get(DbTranslateService);
        stesService = new StesSearchRestService(httpClient, translateService);
    });

    it('should searchStes', () => {
        let test: any;
        let spy = spyOn(stesService, 'searchStes').and.callThrough();

        stesService.searchStes(test);

        expect(spy).toHaveBeenCalled();
    });
});
