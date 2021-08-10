import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FallbearbeitungFormComponent } from './fallbearbeitung-form.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from '@core/services/authentication.service';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateService } from '@ngx-translate/core';
import { TextareaComponent } from '@app/shared';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        return key;
    }
    onLangChange = new EventEmitter();
}

describe('FallbearbeitungFormComponent', () => {
    let component: FallbearbeitungFormComponent;
    let fixture: ComponentFixture<FallbearbeitungFormComponent>;
    const authenticationService = { getLoggedUser: jasmine.createSpy('getLoggedUser') };
    const currentUser = { benutzerstelleId: 123 };
    authenticationService.getLoggedUser.and.returnValue(currentUser);

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FallbearbeitungFormComponent, MockTranslatePipe, TextareaComponent],
            imports: [NgbTooltipModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule, FormsModule],
            providers: [
                FormBuilder,
                { provide: AuthenticationService, useValue: authenticationService },
                AuthenticationRestService,
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FallbearbeitungFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
