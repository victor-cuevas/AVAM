import { AuthenticationService } from '@app/core/services/authentication.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { NavigationService } from '@shared/services/navigation-service';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageBus } from '@shared/services/message-bus';
import { ToolboxService, TextareaComponent } from '@app/shared';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { StesInfotagBeschreibungDurchfuehrungsortComponent } from '@stes/pages/termine';
import { navigationModel } from '@shared/models/navigation-model';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { InfotagService } from '@shared/services/infotag.service';
import { InfotagRestService } from '@core/http/infotag-rest.service';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { DbTranslateServiceStub } from '@test_helpers/db-translate-service-stub';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NavigationServiceStub } from '@test_helpers/navigation-service-stub';
import { AmmRestService } from '@app/core/http/amm-rest.service';

class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        return key;
    }
    public stream(): any {
        return new EventEmitter();
    }
}

describe('StesInfotagBeschreibungDurchfuehrungsortComponent', () => {
    let component: StesInfotagBeschreibungDurchfuehrungsortComponent;
    let fixture: ComponentFixture<StesInfotagBeschreibungDurchfuehrungsortComponent>;
    let serviceToolboxService: ToolboxService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([]),
                ReactiveFormsModule,
                FormsModule,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                })
            ],
            declarations: [StesInfotagBeschreibungDurchfuehrungsortComponent, MockTranslatePipe, TextareaComponent, NgbTooltip],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
                MessageBus,
                { provide: TranslateService, useClass: TranslateServiceStub },
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                InfotagService,
                InfotagRestService,
                AmmRestService,
                AuthenticationRestService,
                AuthenticationService,
                StesDataRestService,
                HttpClient,
                HttpHandler,
                FormBuilder,
                FehlermeldungenService,
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
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesInfotagBeschreibungDurchfuehrungsortComponent);
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
