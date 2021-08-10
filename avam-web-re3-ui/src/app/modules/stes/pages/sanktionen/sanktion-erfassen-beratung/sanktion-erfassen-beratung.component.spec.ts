import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SanktionErfassenBeratungComponent } from './sanktion-erfassen-beratung.component';
import { NavigationService } from '@shared/services/navigation-service';
import { TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { StesSanktionen } from '@shared/enums/stes-navigation-paths.enum';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageBus } from '@shared/services/message-bus';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { AuthenticationService } from '@core/services/authentication.service';
import { ToolboxService } from '@app/shared';
import { Observable, of } from 'rxjs';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerService } from 'oblique-reactive';
import { ActivatedRoute } from '@angular/router';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { NavigationServiceStub } from '@test_helpers/navigation-service-stub';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { PreviousRouteService } from '@shared/services/previous-route.service';

class TranslateServiceStub {
    public currentLang = 'de';
    onLangChange = new EventEmitter();
    public static instant(key: any): any {
        return key;
    }
}

class DataRestService {
    getSachverhalteByType() {
        return new Observable();
    }
    getCode() {
        return new Observable();
    }
}

class PreviousRouteServiceStub {
    private previousUrl = '/sanktionen/beratung-bearbeiten';

    public getPreviousUrl(): string {
        return this.previousUrl;
    }
}

describe('SanktionErfassenBeratungComponent', () => {
    let component: SanktionErfassenBeratungComponent;
    let fixture: ComponentFixture<SanktionErfassenBeratungComponent>;
    const formBuilder: FormBuilder = new FormBuilder();
    const spinnerService: SpinnerService = new SpinnerService();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SanktionErfassenBeratungComponent, MockTranslatePipe],
            imports: [RouterTestingModule, HttpClientTestingModule, FormsModule, ReactiveFormsModule],
            providers: [
                ToolboxService,
                MessageBus,
                AuthenticationRestService,
                AuthenticationService,
                ObliqueHelperService,
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
        fixture = TestBed.createComponent(SanktionErfassenBeratungComponent);
        component = fixture.componentInstance;
        component.path = StesSanktionen.SANKTION_ERFASSEN_BEMUEHUNGEN;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
