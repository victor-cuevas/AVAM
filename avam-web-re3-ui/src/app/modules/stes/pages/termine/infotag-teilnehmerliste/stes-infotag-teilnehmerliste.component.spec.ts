import { AuthenticationService } from '@app/core/services/authentication.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StesInfotagTeilnehmerlisteComponent } from './stes-infotag-teilnehmerliste.component';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { NavigationService } from '@shared/services/navigation-service';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { MessageBus } from '@shared/services/message-bus';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { navigationModel } from '@app/shared/models/navigation-model';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DbTranslatePipe, ToolboxService } from '@app/shared';
import { InfotagService } from '@shared/services/infotag.service';
import { InfotagRestService } from '@core/http/infotag-rest.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { NavigationServiceStub } from '@test_helpers/navigation-service-stub';
import { AmmRestService } from '@app/core/http/amm-rest.service';

describe('StesInfotagTeilnehmerlisteComponent', () => {
    let component: StesInfotagTeilnehmerlisteComponent;
    let fixture: ComponentFixture<StesInfotagTeilnehmerlisteComponent>;
    let serviceToolboxService: ToolboxService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesInfotagTeilnehmerlisteComponent, MockTranslatePipe],
            providers: [
                ToolboxService,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ stesId: 123 }),
                            data: of({ isAnmeldung: false })
                        },
                        queryParamMap: of(convertToParamMap({ dfeId: 789 }))
                    }
                },
                { provide: NavigationService, useClass: NavigationServiceStub },
                InfotagService,
                InfotagRestService,
                AmmRestService,
                StesDataRestService,
                DbTranslatePipe,
                DbTranslateService,
                MessageBus,
                { provide: TranslateService, useClass: TranslateServiceStub },
                AuthenticationRestService,
                AuthenticationService,
                HttpClient,
                HttpHandler,
                {
                    provide: Router,
                    useValue: {
                        config: [
                            {
                                path: of({ navItems: navigationModel.stes })
                            }
                        ]
                    }
                }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesInfotagTeilnehmerlisteComponent);
        component = fixture.componentInstance;
        serviceToolboxService = TestBed.get(ToolboxService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.dfeId).toBe(789);
        expect(component.stesId).toBe(123);
    });
});
