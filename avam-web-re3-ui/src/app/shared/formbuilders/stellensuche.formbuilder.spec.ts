import { async, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StellensucheFormbuilder } from './stellensuche.formbuilder';
import { FormUtilsService } from '../services/forms/form-utils.service';
import { of } from 'rxjs/index';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '../services/db-translate.service';

class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        of(key);
    }
}
describe('StellensucheFormBuilder', () => {
    const letzteAktualisierungMock = {
        anstellungBisDatum: 1550793600000,
        arbeitszeitDetail: 'Test text for Arbeitszeit - Detailangaben:',
        arbeitszeitId: 587,
        fahrzeugVerfuegbar: true,
        letzterAGBekannt: false,
        letzterArbeitgeberBurObject: null,
        mobilitaetId: '1173',
        stellenAntrittAbDatum: 1548979200000,
        unternehmen: null,
        vermittlungsGrad: 100,
        wohnortwechselMoeglich: false,
        arbeitsformenList: [
            { code: { codeId: 582, textDe: 'test1', textFr: 'test2', textIt: 'test3' } },
            { code: { codeId: 583, textDe: 'test1', textFr: 'test2', textIt: 'test3' } },
            { code: { codeId: 584, textDe: 'test1', textFr: 'test2', textIt: 'test3' } },
            { code: { codeId: 585, textDe: 'test1', textFr: 'test2', textIt: 'test3' } },
            { code: { codeId: 586, textDe: 'test1', textFr: 'test2', textIt: 'test3' } }
        ],
        arbeitsortList: [{ regionId: 12, regionDe: 'Bern', regionFr: 'Berne', regionIt: 'Berna' }],
        fuehrerAusweisKatList: [{ code: { codeId: '924', textDe: 'B1', textFr: 'B1', textIt: 'B1' } }],
        letzterAgNoga: {
            nogaId: 9870,
            nogaCodeUp: 1234,
            textlangDe: 'Malerei',
            textlangFr: 'Peinture',
            textlangIt: 'Pittura'
        }
    };

    let arbeitFormCheckbox = [
        {
            codeId: 582,
            textDe: 'textDe',
            textFr: 'textFr',
            textIt: 'textIt',
            kurzTextDe: 'kurzTextDe',
            kurzTextFr: 'kurzTextFr',
            kurzTextIt: 'kurzTextIt'
        },
        {
            codeId: 583,
            textDe: 'textDe',
            textFr: 'textFr',
            textIt: 'textIt',
            kurzTextDe: 'kurzTextDe',
            kurzTextFr: 'kurzTextFr',
            kurzTextIt: 'kurzTextIt'
        },
        {
            codeId: 584,
            textDe: 'textDe',
            textFr: 'textFr',
            textIt: 'textIt',
            kurzTextDe: 'kurzTextDe',
            kurzTextFr: 'kurzTextFr',
            kurzTextIt: 'kurzTextIt'
        },
        {
            codeId: 585,
            textDe: 'textDe',
            textFr: 'textFr',
            textIt: 'textIt',
            kurzTextDe: 'kurzTextDe',
            kurzTextFr: 'kurzTextFr',
            kurzTextIt: 'kurzTextIt'
        },
        {
            codeId: 586,
            textDe: 'textDe',
            textFr: 'textFr',
            textIt: 'textIt',
            kurzTextDe: 'kurzTextDe',
            kurzTextFr: 'kurzTextFr',
            kurzTextIt: 'kurzTextIt'
        }
    ];

    let stellensucheFormbuilder: StellensucheFormbuilder;
    let service: FormUtilsService;
    const formBuilder: FormBuilder = new FormBuilder();
    const arbeitsForm = formBuilder.group({
        vermittlungsGrad: null,
        arbeitszeitId: null,
        arbeitszeitDetail: ' '
    });

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: FormBuilder, useValue: formBuilder }, { provide: TranslateService, useClass: TranslateServiceStub }, DbTranslateService]
        }).compileComponents();
        service = TestBed.get(FormUtilsService);
        let translateSevice = TestBed.get(TranslateService);
        let dbTranslateSevice = TestBed.get(DbTranslateService);
        stellensucheFormbuilder = new StellensucheFormbuilder(formBuilder, service, translateSevice, dbTranslateSevice);
        stellensucheFormbuilder.stellensucheForm = formBuilder.group({});
    }));

    it('initForm', () => {
        let testReturn: FormGroup = stellensucheFormbuilder.initForm();
        let arbeitsForm = testReturn.get('arbeitsForm') as FormGroup;

        expect(arbeitsForm.controls.vermittlungsGrad.value).toBeNull();
    });
});
