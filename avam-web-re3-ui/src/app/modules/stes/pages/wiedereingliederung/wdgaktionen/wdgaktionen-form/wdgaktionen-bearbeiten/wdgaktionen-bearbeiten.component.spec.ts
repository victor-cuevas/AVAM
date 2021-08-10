import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WdgAktionenBearbeitenComponent } from './wdgaktionen-bearbeiten.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { NavigationService } from '@app/shared/services/navigation-service';
import { NavigationServiceStub, MockTranslatePipe, MockTextControlClearDirective } from '@test_helpers/';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { of } from 'rxjs';
import {
    DbTranslatePipe,
    TextareaComponent,
    CloseTabDirective,
    ToolboxService,
    TextOverflowTooltipDirective,
    TextOverflowTooltipInputFieldDirective,
    PermissionDirective
} from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { MessageBus } from '@app/shared/services/message-bus';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { AktionFormHandler } from '../wdgaktionen-form-handler';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

describe('WdgAktionenBearbeitenComponent', () => {
    let component: WdgAktionenBearbeitenComponent;
    let fixture: ComponentFixture<WdgAktionenBearbeitenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                WdgAktionenBearbeitenComponent,
                DbTranslatePipe,
                MockTranslatePipe,
                MockTextControlClearDirective,
                TextareaComponent,
                CloseTabDirective,
                TextOverflowTooltipDirective,
                TextOverflowTooltipInputFieldDirective,
                PermissionDirective
            ],
            imports: [HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule, FormsModule, NgbTooltipModule.forRoot()],
            providers: [
                {
                    provide: TranslateService,
                    Router,
                    useClass: TranslateServiceStub
                },
                FormBuilder,
                AuthenticationService,
                AuthenticationRestService,
                MessageBus,
                ToolboxService,
                {
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                    }
                },
                StesDataRestService,
                ToolboxService,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 222 })
                        },
                        paramMap: of(convertToParamMap({ id: 1 })),
                        queryParams: of(convertToParamMap({ id: 1 })),
                        queryParamMap: of(convertToParamMap({ id: 1 }))
                    }
                },
                StesDataRestService,
                { provide: NavigationService, useClass: NavigationServiceStub },
                AktionFormHandler,
                ObliqueHelperService
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WdgAktionenBearbeitenComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
