import { async, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { FormUtilsService } from '../services/forms/form-utils.service';
import {
    TranslateService,
    TranslateStore,
    TranslateLoader,
    TranslateCompiler,
    TranslateParser,
    USE_STORE,
    USE_DEFAULT_LANG,
    MissingTranslationHandler,
    FakeMissingTranslationHandler
} from '@ngx-translate/core';
import { DbTranslateService } from '../services/db-translate.service';
import { StesBenutzerstelleSucheFormbuilder } from './stes-benutzerstelle-suche.formbuilder';
class TranslateServiceStub extends TranslateService {
    public instant(key: any): any {
        return key;
    }
}

describe('BenutzerStelleFormbuilder', () => {
    let stesBenutzerstelleSucheFormbuilder: StesBenutzerstelleSucheFormbuilder;
    const formBuilder: FormBuilder = new FormBuilder();
    let formUtilsService: FormUtilsService;
    let translate: TranslateServiceStub;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                DbTranslateService,
                TranslateStore,
                TranslateLoader,
                TranslateCompiler,
                TranslateParser,
                { provide: MissingTranslationHandler, useClass: FakeMissingTranslationHandler },
                { provide: USE_DEFAULT_LANG },
                { provide: USE_STORE },
                { provide: FormBuilder, useValue: formBuilder },
                { provide: TranslateService, useClass: TranslateServiceStub }
            ]
        }).compileComponents();

        formUtilsService = TestBed.get(FormUtilsService);
        translate = TestBed.get(TranslateService);
        stesBenutzerstelleSucheFormbuilder = new StesBenutzerstelleSucheFormbuilder(formBuilder, formUtilsService, translate);
    }));

    it('should init Form', () => {
        const initialSearchForm = {
            benutzerstelle: '',
            benutzerstelleIdBis: '',
            benutzerstelleIdVon: '',
            benutzerstellenASVon: null,
            benutzerstellenASBis: null,
            benutzerstelleTypId: '',
            kantonId: '',
            ort: '',
            postleitzahl: '',
            statusId: '1431',
            strasse: '',
            strasseNr: '',
            vollzugsregion: null,
            vollzugsregionTypeId: ''
        };
        stesBenutzerstelleSucheFormbuilder.initForm({ benutzerstellentyp: '', vollzugsregiontyp: '', status: '1431', kanton: '' });

        expect(stesBenutzerstelleSucheFormbuilder.searchForm.value).toEqual(initialSearchForm);
    });
});
