import { async, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormUtilsService } from '../services/forms/form-utils.service';
import { StesSucheFormbuilder } from './stes-suche.formbuilder';
import {
    FakeMissingTranslationHandler,
    MissingTranslationHandler,
    TranslateCompiler,
    TranslateLoader,
    TranslateParser,
    TranslateService,
    TranslateStore,
    USE_DEFAULT_LANG,
    USE_STORE
} from '@ngx-translate/core';
import { StesSucheQueryDTO } from '@dtos/stesSucheQueryDTO';
import { EnhancedSearchQueryDTO } from '@dtos/enhancedSearchQueryDTO';
import { DbTranslateService } from '../services/db-translate.service';

class TranslateServiceStub extends TranslateService {
    public instant(key: any): any {
        return key;
    }
}

describe('StesSucheFormbuilder', () => {
    let searchFormBuilder: StesSucheFormbuilder;
    const formBuilder: FormBuilder = new FormBuilder();
    let formUtilsService: FormUtilsService;
    let translate: TranslateServiceStub;

    const searchDataFormMock = formBuilder.group({
        personalberaterId: '',
        extraCriteria: [],
        geburtsdatum: '',
        gemeinde: '',
        nachname: 'meier',
        personalBerater: { benutzerDetailId: 5 },
        personenNr: '',
        schlagwort: '',
        statusId: 1404,
        stesId: '',
        svNr: '',
        vorname: 'susanne'
    });

    let searchQueryDTOMock: StesSucheQueryDTO = {} as StesSucheQueryDTO;
    let extraCriteria: EnhancedSearchQueryDTO[] = [];

    const ngDatemock = {
        year: 1987,
        month: 10,
        day: 25
    };

    const extraCriteriaOutputMock = {
        searchFieldId: '',
        comparatorId: '',
        searchValue: ''
    };

    const extraCriteriaInputMock = {
        searchLevel1: '',
        searchFieldId: '',
        searchLevel3: '',
        comparatorId: '',
        searchFreeText: '',
        searchValue: ''
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                FormUtilsService,
                DbTranslateService,
                { provide: FormBuilder, useValue: formBuilder },
                { provide: TranslateService, useClass: TranslateServiceStub },
                TranslateStore,
                TranslateLoader,
                TranslateCompiler,
                TranslateParser,
                { provide: MissingTranslationHandler, useClass: FakeMissingTranslationHandler },
                { provide: USE_DEFAULT_LANG },
                { provide: USE_STORE }
            ]
        }).compileComponents();

        formUtilsService = TestBed.get(FormUtilsService);
        translate = TestBed.get(TranslateService);
        searchFormBuilder = new StesSucheFormbuilder(formBuilder, formUtilsService, translate);
    }));

    it('initForm', () => {
        let searchForm: FormGroup = searchFormBuilder.initForm();
        expect(searchForm.get('geburtsdatum').value).toEqual('');
    });

    it('should transformDate from string', () => {
        expect(searchFormBuilder.transformDate('01.01.1987')).toEqual('01.01.1987');
    });

    it('should transformDate from NgDate', () => {
        expect(searchFormBuilder.transformDate(ngDatemock)).toEqual('25.10.1987');
    });

    it('should transformDate null', () => {
        expect(searchFormBuilder.transformDate(null)).toEqual('');
    });

    it('should build ExtraCriteria Output Form', () => {
        expect(searchFormBuilder.buildExtraCriteriaOutput()).toEqual(extraCriteriaOutputMock);
    });

    it('should build ExtraCriteria Input Form', () => {
        expect(searchFormBuilder.buildExtraCriteriaInput().value).toEqual(extraCriteriaInputMock);
    });
});
