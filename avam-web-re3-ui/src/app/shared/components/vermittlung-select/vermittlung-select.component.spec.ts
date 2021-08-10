import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MockTranslatePipe, DbTranslateServiceStub } from '../../../../../tests/helpers';
import { VermittlungSelectComponent } from './vermittlung-select.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ArbeitsvermittlungRestService } from '../../../core/http/arbeitsvermittlung-rest.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'oblique-reactive';
import { DbTranslatePipe, ToolboxService } from '../..';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { ArbeitsvermittlungDTO } from '@app/shared/models/dtos-generated/arbeitsvermittlungDTO';

export class MockAbstractClass {
    reset(): void {}
}

export class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        return key;
    }
}

describe('VermittlungSelectComponent', () => {
    let component: VermittlungSelectComponent;
    let fixture: ComponentFixture<VermittlungSelectComponent>;
    let translateServiceStub: TranslateServiceStub;
    let dbTranslateServiceStub: DbTranslateServiceStub;
    const arbeitsvermittlungMock: ArbeitsvermittlungDTO = {
        stesIdAvam: '123',
        schnellZuweisungFlag: false,
        stesId: 98765,
        osteId: 1,
        meldepflicht: true,
        zuweisungDatumVom: new Date(),
        zuweisungId: null,
        zuweisungNr: 123,
        sperrfristDatum: new Date(),
        ortDe: 'Zürich',
        ortFr: 'Zurich',
        ortIt: 'Zurigo',
        stellenbezeichnung: 'Stelle 1',
        unternehmenId: null,
        unternehmenName1: 'Firma XY',
        unternehmenName2: null,
        unternehmenName3: null,
        zuweisungStatusDe: 'status DE',
        zuweisungStatusFr: 'status FR',
        zuweisungStatusIt: 'status IT',
        vermittlungsstandDe: '',
        vermittlungsstandFr: '',
        vermittlungsstandIt: ''
    };

    const vermittlungMock = {
        data: {
            icon: null,
            vom: null,
            nr: '2',
            stellenbezeichnung: null,
            unternehmensId: null,
            osteId: null,
            unternehmensname: null,
            ort: null,
            stesId: null,
            status: null,
            ergebnis: null,
            id: null,
            schnellFlag: false,
            attTooltips: null,
            attHtmls: null
        }
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [VermittlungSelectComponent, MockTranslatePipe, DbTranslatePipe, NgbTooltip],
            imports: [
                HttpClientTestingModule,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                })
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: ToolboxService,
                    useClass: ToolboxService
                },
                ArbeitsvermittlungRestService,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 222 })
                        }
                    }
                },
                { provide: TranslateService, useClass: TranslateServiceStub },
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                SpinnerService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VermittlungSelectComponent);
        translateServiceStub = TestBed.get(TranslateService);
        dbTranslateServiceStub = TestBed.get(DbTranslateService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create Arbeitsvermittlung (DE) from Arbeitsvermittlung model', () => {
        const arbeitsvermittlungDto = component.buildArbeitsVermittlungDto(arbeitsvermittlungMock);
    });

    it('should create setVermittlung', () => {
        component.itemSelected(vermittlungMock);
    });
});
