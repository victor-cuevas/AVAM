import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WdgZielBearbeitenComponent } from './wdgziel-bearbeiten.component';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MessageBus } from '@app/shared/services/message-bus';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { NavigationService } from '@app/shared/services/navigation-service';
import { NavigationServiceStub, MockTranslatePipe, MockTextControlClearDirective } from '@test_helpers/';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WdgZielFormHandler } from '../wdgziel-form-handler';
import { CloseTabDirective, ToolboxService, TextareaComponent, TextOverflowTooltipDirective, TextOverflowTooltipInputFieldDirective, PermissionDirective } from '@app/shared';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

describe('WiedereingliederungszielBearbeitenComponent', () => {
    let component: WdgZielBearbeitenComponent;
    let fixture: ComponentFixture<WdgZielBearbeitenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                WdgZielBearbeitenComponent,
                CloseTabDirective,
                MockTranslatePipe,
                TextareaComponent,
                MockTextControlClearDirective,
                TextOverflowTooltipDirective,
                TextOverflowTooltipInputFieldDirective,
                PermissionDirective
            ],
            imports: [HttpClientTestingModule, RouterTestingModule, FormsModule, ReactiveFormsModule, NgbTooltipModule],
            providers: [
                StesDataRestService,
                WdgZielFormHandler,
                ToolboxService,
                {
                    provide: TranslateService,
                    Router,
                    useClass: TranslateServiceStub
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 222 })
                        },
                        queryParamMap: of(convertToParamMap({ id: 1 }))
                    }
                },
                { provide: NavigationService, useClass: NavigationServiceStub },
                AuthenticationService,
                AuthenticationRestService,
                MessageBus,
                ObliqueHelperService
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WdgZielBearbeitenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
