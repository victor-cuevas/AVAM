import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StartPageComponent } from './start-page.component';
import { MessageBus } from '@shared/services/message-bus';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { BenutzerstelleAendernService } from '@myAvam/services/benutzerstelle-aendern.service';
import { BenutzerstelleAendernRestService } from '@core/http/benutzerstelle-aendern-rest.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { AuthenticationService } from '@core/services/authentication.service';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('StartPageComponent', () => {
    let component: StartPageComponent;
    let fixture: ComponentFixture<StartPageComponent>;
    let messageBus: MessageBus;
    let store = {};
    const mockLocalStorage = {
        getItem: (key: string): string => {
            return key in store ? store[key] : null;
        },
        setItem: (key: string, value: string) => {
            store[key] = `${value}`;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        }
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [StartPageComponent, MockTranslatePipe],
            providers: [
                MessageBus,
                BenutzerstelleAendernService,
                BenutzerstelleAendernRestService,
                HttpClient,
                HttpHandler,
                AuthenticationService,
                AuthenticationRestService,
                {
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                    }
                },
                { provide: TranslateService, useClass: TranslateServiceStub }
            ],
            imports: [NgbTooltipModule.forRoot(), RouterTestingModule, HttpClientTestingModule]
        }).compileComponents();
        messageBus = TestBed.get(MessageBus);
        spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
        spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
        spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
        spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StartPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.showBackgroundImage).toBeTruthy();
    });

    it('do not show background Image', () => {
        localStorage.setItem(StartPageComponent.LOCAL_STORAGE_SHOW_BG_IMG, 'false');
        messageBus.buildAndSend('start-page.show-background-image', false);
        expect(component).toBeTruthy();
        expect(component.showBackgroundImage).toBeFalsy();
    });
});
