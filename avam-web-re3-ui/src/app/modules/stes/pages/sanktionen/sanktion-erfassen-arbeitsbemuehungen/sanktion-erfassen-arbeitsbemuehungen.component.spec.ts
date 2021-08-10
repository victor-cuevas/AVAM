import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SanktionErfassenArbeitsbemuehungenComponent } from './sanktion-erfassen-arbeitsbemuehungen.component';
import { NavigationService } from '@shared/services/navigation-service';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { StesSanktionen } from '@shared/enums/stes-navigation-paths.enum';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageBus } from '@shared/services/message-bus';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { AuthenticationService } from '@core/services/authentication.service';
import { ToolboxService } from '@app/shared';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerService } from 'oblique-reactive';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { Observable, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NavigationServiceStub } from '@test_helpers/navigation-service-stub';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { PreviousRouteService } from '@shared/services/previous-route.service';

class TranslateServiceStub {
    onLangChange = new EventEmitter();
    public currentLang = 'de';
    public instant(key: any): any {
        return key;
    }
}

class DataRestService {
    getKontrollperiode() {
        return new Observable();
    }

    getCode() {
        return new Observable();
    }
}

class PreviousRouteServiceStub {
    private previousUrl = '/sanktionen/arbeitsbemuehungen-stellungnahme-bearbeiten';

    public getPreviousUrl(): string {
        return this.previousUrl;
    }
}

describe('SanktionErfassenArbeitsbemuehungenComponent', () => {
    let component: SanktionErfassenArbeitsbemuehungenComponent;
    let fixture: ComponentFixture<SanktionErfassenArbeitsbemuehungenComponent>;
    const formBuilder: FormBuilder = new FormBuilder();
    const spinnerService: SpinnerService = new SpinnerService();
    let stesDataRestService: StesDataRestService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SanktionErfassenArbeitsbemuehungenComponent, MockTranslatePipe],
            imports: [RouterTestingModule, HttpClientTestingModule, FormsModule, ReactiveFormsModule, FormsModule],
            providers: [
                ToolboxService,
                MessageBus,
                AuthenticationRestService,
                AuthenticationService,
                { provide: NavigationService, useClass: NavigationServiceStub },
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                },
                { provide: FormBuilder, useValue: formBuilder },
                { provide: SpinnerService, useValue: spinnerService },
                {
                    provide: StesDataRestService,
                    useClass: DataRestService
                },
                {
                    provide: PreviousRouteService,
                    useClass: PreviousRouteServiceStub
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 222 })
                        }
                    }
                }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SanktionErfassenArbeitsbemuehungenComponent);
        component = fixture.componentInstance;
        component.path = StesSanktionen.SANKTION_ERFASSEN_BEMUEHUNGEN;
        stesDataRestService = TestBed.get(StesDataRestService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
