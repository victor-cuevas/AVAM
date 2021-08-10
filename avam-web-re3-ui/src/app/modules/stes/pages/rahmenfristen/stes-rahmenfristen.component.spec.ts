import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StesRahmenfristenComponent } from './stes-rahmenfristen.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SpinnerService } from 'oblique-reactive';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DbTranslateService } from 'src/app/shared/services/db-translate.service';
import { RouterTestingModule } from '@angular/router/testing';
import { StesRahmenfristDTO } from 'src/app/shared/models/dtos-generated/stesRahmenfristDTO';
import { ToolboxService } from 'src/app/shared/services/toolbox.service';
import { DbTranslateServiceStub } from '@test_helpers/db-translate-service-stub';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { DbTranslatePipe } from '@app/shared';

describe('StesRahmenfristenComponent', () => {
    let component: StesRahmenfristenComponent;
    let fixture: ComponentFixture<StesRahmenfristenComponent>;
    let serviceDataRestService: StesDataRestService;
    let dbTranslateServiceStub: DbTranslateServiceStub;
    let rahmenfristDtoMock: StesRahmenfristDTO = {
        raRahmenfristID: 1,
        anspruch: {
            codeId: 1,
            textDe: 'textDe',
            textFr: 'textFr',
            textIt: 'textIt'
        },
        asfAlkNr: '66',
        asfZahlstelleNr: '777',
        raDatumRahmenfristVon: new Date(),
        raDatumRahmenfristBis: new Date(),
        kwKontrollperiode: new Date()
    };

    let lastUpdateMock = {
        data: [
            {
                raPersonStesID: 1,
                raRahmenfristID: 1,
                anspruch: {
                    codeId: 1,
                    textDe: 'textDe',
                    textFr: 'textFr',
                    textIt: 'textIt'
                },
                asfAlkNr: '66',
                asfZahlstelleNr: '777',
                raDatumRahmenfristVon: new Date(),
                raDatumRahmenfristBis: new Date()
            },
            {
                raPersonStesID: 2,
                raRahmenfristID: 2,
                anspruch: {
                    codeId: 1,
                    textDe: 'textDe',
                    textFr: 'textFr',
                    textIt: 'textIt'
                },
                asfAlkNr: '66',
                asfZahlstelleNr: '777',
                raDatumRahmenfristVon: new Date(),
                raDatumRahmenfristBis: new Date()
            },
            {
                raPersonStesID: 3,
                raRahmenfristID: 3,
                anspruch: {
                    codeId: 1,
                    textDe: 'textDe',
                    textFr: 'textFr',
                    textIt: 'textIt'
                },
                asfAlkNr: '66',
                asfZahlstelleNr: '777',
                raDatumRahmenfristVon: new Date(),
                raDatumRahmenfristBis: new Date()
            }
        ]
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            declarations: [StesRahmenfristenComponent],
            providers: [
                SpinnerService,
                StesDataRestService,
                ToolboxService,
                DbTranslatePipe,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 1 })
                        }
                    }
                },
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                { provide: TranslateService, useClass: TranslateServiceStub }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        serviceDataRestService = TestBed.get(StesDataRestService);
        dbTranslateServiceStub = TestBed.get(DbTranslateService);
        fixture = TestBed.createComponent(StesRahmenfristenComponent);
        component = fixture.componentInstance;
        component.lastUpdate = lastUpdateMock.data;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create model from DTO', () => {
        let rahmenfristModel = component.buildModel(rahmenfristDtoMock);
        expect(rahmenfristModel.gueltigAb).toEqual(rahmenfristDtoMock.kwKontrollperiode);
        expect(rahmenfristModel.anspruch).toEqual(rahmenfristDtoMock.anspruch.textDe);
        expect(rahmenfristModel.alkZahlstelle).toEqual(`${rahmenfristDtoMock.asfAlkNr} / ${rahmenfristDtoMock.asfZahlstelleNr}`);
    });
});
