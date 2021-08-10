/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { RegionenAuswaehlenComponent } from './regionen-auswaehlen.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ToolboxService } from '../..';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { ToolboxActionEnum, ToolboxEvent } from '../../services/toolbox.service';
import { of } from 'rxjs';
import { SpinnerService } from 'oblique-reactive';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FacadeService } from '@shared/services/facade.service';
import { AuthenticationService } from '@core/services/authentication.service';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { Router } from '@angular/router';
import { MessageBus } from '@shared/services/message-bus';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';

describe('RegionenAuswaehlenComponent', () => {
    let serviceToolboxService: ToolboxService;
    let httpMock: HttpTestingController;
    let component: RegionenAuswaehlenComponent;
    let fixture: ComponentFixture<RegionenAuswaehlenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RegionenAuswaehlenComponent],
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
                TranslateService,
                FacadeService,
                AuthenticationService,
                AuthenticationRestService,
                ObliqueHelperService,
                {
                    provide: Router,
                    useValue: {
                        events: of({})
                    }
                },
                MessageBus,
                SearchSessionStorageService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        serviceToolboxService = TestBed.get(ToolboxService);
        httpMock = TestBed.get(HttpTestingController);
        fixture = TestBed.createComponent(RegionenAuswaehlenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call toolbox actions and close', () => {
        let clickEvent: ToolboxEvent = new ToolboxEvent(ToolboxActionEnum.EXIT, component.regionentoolboxId);
        spyOn(serviceToolboxService, 'observeClickAction').and.returnValue(of(clickEvent));
        spyOn(component, 'close').and.callThrough();
        serviceToolboxService.observeClickAction().subscribe(value => {
            expect(value).toBe('observable value');
        });
    });
});
