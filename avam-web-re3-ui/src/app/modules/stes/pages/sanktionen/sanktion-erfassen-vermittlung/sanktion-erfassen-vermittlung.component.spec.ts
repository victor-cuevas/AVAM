import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SanktionErfassenVermittlungComponent } from './sanktion-erfassen-vermittlung.component';
import { NavigationService } from '@shared/services/navigation-service';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StesSanktionen } from '@shared/enums/stes-navigation-paths.enum';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageBus } from '@shared/services/message-bus';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { AuthenticationService } from '@core/services/authentication.service';
import { Observable, of } from 'rxjs';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerService } from 'oblique-reactive';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { ToolboxService, VermittlungSelectComponent } from '@app/shared';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ArbeitsvermittlungRestService } from '@core/http/arbeitsvermittlung-rest.service';
import { ActivatedRoute } from '@angular/router';
import { PreviousRouteService } from '@shared/services/previous-route.service';

class TranslateServiceStub {
    onLangChange = new EventEmitter();
    public currentLang = 'de';
    public instant(key: any): any {
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
    private previousUrl = '/sanktionen/vermittlung-bearbeiten';

    public getPreviousUrl(): string {
        return this.previousUrl;
    }
}

describe('SanktionErfassenVermittlungComponent', () => {
    let component: SanktionErfassenVermittlungComponent;
    let fixture: ComponentFixture<SanktionErfassenVermittlungComponent>;
    const formBuilder: FormBuilder = new FormBuilder();
    const spinnerService: SpinnerService = new SpinnerService();
    let stesDataRestService: StesDataRestService;
    let translateService: TranslateService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SanktionErfassenVermittlungComponent, VermittlungSelectComponent, MockTranslatePipe],
            imports: [RouterTestingModule, HttpClientTestingModule, NgbTooltipModule.forRoot(), FormsModule, ReactiveFormsModule],
            providers: [
                MessageBus,
                AuthenticationRestService,
                AuthenticationService,
                NavigationService,
                StesDataRestService,
                ToolboxService,
                ArbeitsvermittlungRestService,
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
        fixture = TestBed.createComponent(SanktionErfassenVermittlungComponent);
        component = fixture.componentInstance;
        component.path = StesSanktionen.SANKTION_ERFASSEN_BEMUEHUNGEN;
        stesDataRestService = TestBed.get(StesDataRestService);
        translateService = TestBed.get(TranslateService);

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
