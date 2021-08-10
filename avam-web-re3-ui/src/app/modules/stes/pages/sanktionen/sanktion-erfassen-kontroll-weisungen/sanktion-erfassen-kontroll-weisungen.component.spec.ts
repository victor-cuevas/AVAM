import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SanktionErfassenKontrollWeisungenComponent } from './sanktion-erfassen-kontroll-weisungen.component';
import { NavigationService } from '@shared/services/navigation-service';
import { TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { StesSanktionen } from '@shared/enums/stes-navigation-paths.enum';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageBus } from '@shared/services/message-bus';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { AuthenticationService } from '@core/services/authentication.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { SpinnerService } from 'oblique-reactive';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { ActivatedRoute } from '@angular/router';
import { FormUtilsService, ToolboxService } from '@app/shared';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { PreviousRouteService } from '@shared/services/previous-route.service';

class TranslateServiceStub {
    public currentLang = 'de';
    onLangChange = new EventEmitter();
    public static instant(key: any): any {
        return key;
    }
}

class DataRestServiceStub {
    getCode() {
        return new Observable();
    }
    getSknSachverhaltById() {
        return new Observable();
    }
}

class PreviousRouteServiceStub {
    private previousUrl = '/sanktionen/kontrollvorschriften-weisungen-bearbeiten';

    public getPreviousUrl(): string {
        return this.previousUrl;
    }
}

describe('SanktionErfassenKontrollWeisungenComponent', () => {
    let component: SanktionErfassenKontrollWeisungenComponent;
    let fixture: ComponentFixture<SanktionErfassenKontrollWeisungenComponent>;
    const formBuilder: FormBuilder = new FormBuilder();
    const spinnerService: SpinnerService = new SpinnerService();
    let stesDataRestService: StesDataRestService;
    let translateService: TranslateService;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SanktionErfassenKontrollWeisungenComponent, MockTranslatePipe],
            imports: [RouterTestingModule, HttpClientTestingModule, NgbTooltipModule.forRoot(), FormsModule, ReactiveFormsModule],
            providers: [
                ToolboxService,
                MessageBus,
                AuthenticationRestService,
                AuthenticationService,
                NavigationService,
                FormUtilsService,
                ToolboxService,
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                },
                { provide: FormBuilder, useValue: formBuilder },
                { provide: SpinnerService, useValue: spinnerService },
                {
                    provide: StesDataRestService,
                    useClass: DataRestServiceStub
                },
                {
                    provide: DatePipe,
                    useValue: new DatePipe('de')
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
        fixture = TestBed.createComponent(SanktionErfassenKontrollWeisungenComponent);
        component = fixture.componentInstance;
        component.path = StesSanktionen.SANKTION_ERFASSEN_KONTROLL_WEISUNGEN;
        stesDataRestService = TestBed.get(StesDataRestService);
        translateService = TestBed.get(TranslateService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
