import { SpinnerService } from 'oblique-reactive';
import { ParagraphComponent, CloseTabDirective, ToolboxService, FormatNumberPipe, FormatSwissFrancPipe } from 'src/app/shared';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuszugComponent } from './auszug.component';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { MessageBus } from '@app/shared/services/message-bus';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MockTranslatePipe } from '@test_helpers/';
import { FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { NavigationService } from '@shared/services/navigation-service';
import { NavigationServiceStub } from '@test_helpers/navigation-service-stub';

describe('AuszugComponent', () => {
    let component: AuszugComponent;
    let fixture: ComponentFixture<AuszugComponent>;
    let serviceDataRestService: StesDataRestService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AuszugComponent, ParagraphComponent, CloseTabDirective, MockTranslatePipe, FormatNumberPipe, FormatSwissFrancPipe],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: TranslateService, useClass: TranslateServiceStub },
                AuthenticationService,
                AuthenticationRestService,
                ToolboxService,
                StesDataRestService,
                {
                    provide: Router
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 222 }),
                            data: of({ isAnmeldung: true })
                        },
                        paramMap: of(convertToParamMap({ id: 1 }))
                    }
                },
                MessageBus,
                SpinnerService,
                FormBuilder,
                { provide: NavigationService, useClass: NavigationServiceStub }
            ],
            imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AuszugComponent);
        serviceDataRestService = TestBed.get(StesDataRestService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
