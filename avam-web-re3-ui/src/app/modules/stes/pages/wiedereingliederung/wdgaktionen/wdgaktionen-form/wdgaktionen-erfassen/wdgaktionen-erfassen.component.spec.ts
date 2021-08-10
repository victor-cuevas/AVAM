import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WdgAktionenErfassenComponent } from './wdgaktionen-erfassen.component';
import { NavigationService } from '@app/shared/services/navigation-service';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@app/shared/services/forms/form-personalien-helper.service.spec';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageBus } from '@app/shared/services/message-bus';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NavigationServiceStub, MockTextControlClearDirective } from '@test_helpers/';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import {
    ToolboxService,
    DbTranslatePipe,
    TextareaComponent,
    CloseTabDirective,
    TextOverflowTooltipDirective,
    TextOverflowTooltipInputFieldDirective,
    PermissionDirective
} from '@app/shared';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AktionFormHandler } from '../wdgaktionen-form-handler';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { AvamPersonalberaterAutosuggestComponent } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';

describe('WdgAktionenErfassenComponent', () => {
    let component: WdgAktionenErfassenComponent;
    let fixture: ComponentFixture<WdgAktionenErfassenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                WdgAktionenErfassenComponent,
                DbTranslatePipe,
                MockTranslatePipe,
                MockTextControlClearDirective,
                TextareaComponent,
                AvamPersonalberaterAutosuggestComponent,
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
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: { params: of({ id: 222 }) }
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
        fixture = TestBed.createComponent(WdgAktionenErfassenComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
