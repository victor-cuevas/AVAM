import { Zahlstelle } from './../../models/zahlstelle.model';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

import { ZahlstelleSuchenComponent } from './zahlstelle-suchen.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { SpracheEnum } from '../../enums/sprache.enum';
import { ToolboxService } from '../..';
import { ToolboxActionEnum, ToolboxEvent } from '../../services/toolbox.service';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { SpinnerService } from 'oblique-reactive';

describe('ZahlstelleSuchenComponent', () => {
    let component: ZahlstelleSuchenComponent;
    let fixture: ComponentFixture<ZahlstelleSuchenComponent>;
    let serviceToolboxService: ToolboxService;
    let httpMock: HttpTestingController;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ZahlstelleSuchenComponent],
            imports: [
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                }),
                HttpClientTestingModule
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: ToolboxService,
                    useClass: ToolboxService
                },
                StesDataRestService,
                SpinnerService,
                TranslateService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        serviceToolboxService = TestBed.get(ToolboxService);
        httpMock = TestBed.get(HttpTestingController);
        fixture = TestBed.createComponent(ZahlstelleSuchenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call toolbox actions and close', () => {
        const clickEvent: ToolboxEvent = new ToolboxEvent(ToolboxActionEnum.EXIT, component.zahlstelleToolboxId);
        spyOn(serviceToolboxService, 'observeClickAction').and.returnValue(of(clickEvent));
        spyOn(component, 'close').and.callThrough();
        serviceToolboxService.observeClickAction('zahlstelle').subscribe(value => {
            expect(value).toBe('observable value');
        });
    });
});
