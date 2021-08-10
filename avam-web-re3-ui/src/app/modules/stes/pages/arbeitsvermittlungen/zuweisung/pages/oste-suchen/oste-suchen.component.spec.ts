import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OsteSuchenComponent } from './oste-suchen.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GeschlechtPipe, PermissionDirective, ToolboxService } from '@app/shared';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { TranslateService } from '@ngx-translate/core';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { UnternehmenDataService } from '@app/shared/services/unternehmen-data.service';
import { MockTranslatePipe } from '@test_helpers/';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ZuweisungWizardService } from '@app/shared/components/new/avam-wizard/zuweisung-wizard.service';
import { Location } from '@angular/common';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { OsteDataRestService } from '@app/core/http/oste-data-rest.service';
import { UrlRestService } from '@app/core/http/url-rest.service';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { AuthenticationService } from '@core/services/authentication.service';
import { MessageBus } from '@shared/services/message-bus';

let locationStub: Partial<Location> = {};

describe('OsteSuchenComponent', () => {
    let component: OsteSuchenComponent;
    let fixture: ComponentFixture<OsteSuchenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [ReactiveFormsModule, RouterTestingModule, FormsModule, HttpClientTestingModule, NgbTooltipModule.forRoot()],
            declarations: [OsteSuchenComponent, MockTranslatePipe, PermissionDirective],
            providers: [
                FormBuilder,
                { provide: TranslateService, useClass: TranslateServiceStub },
                StesDataRestService,
                OsteDataRestService,
                UnternehmenDataService,
                UnternehmenRestService,
                ZuweisungWizardService,
                ToolboxService,
                { provide: Location, useValue: locationStub },
                {
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                    }
                },
                GeschlechtPipe,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 222 })
                        }
                    }
                },
                UrlRestService,
                SearchSessionStorageService,
                AuthenticationRestService,
                AuthenticationService,
                MessageBus
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OsteSuchenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
