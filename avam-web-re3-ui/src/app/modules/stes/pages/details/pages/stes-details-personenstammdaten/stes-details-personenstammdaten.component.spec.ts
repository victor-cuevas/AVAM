import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MockTextControlClearDirective, MockTranslatePipe } from '../../../../../../../../tests/helpers';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { of, Subscriber } from 'rxjs';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import {
    CloseTabDirective,
    DbTranslatePipe,
    TextareaComponent,
    ToolboxService,
    ParagraphComponent,
    TextOverflowTooltipDirective,
    TextOverflowTooltipInputFieldDirective
} from 'src/app/shared';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { StesZasRestService } from '../../../../../../core/http/stes-zas-rest.service';

import { StesDetailsPersonenstammdatenComponent } from './stes-details-personenstammdaten.component';
import { StesZasAbgleichService } from '@app/modules/stes/services/stes-zas-abgleich.service';
import { APP_BASE_HREF, Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { AuthenticationService } from '@core/services/authentication.service';
import { MessageBus } from '@shared/services/message-bus';

let locationStub: Partial<Location> = { subscribe: () => new Subscriber() };

class MockNotificationService {
    send() {}

    error() {}

    warning() {}

    success() {}
}

describe('StesDetailsPersonenstammdatenComponent', () => {
    let component: StesDetailsPersonenstammdatenComponent;
    let fixture: ComponentFixture<StesDetailsPersonenstammdatenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                StesDetailsPersonenstammdatenComponent,
                MockTextControlClearDirective,
                CloseTabDirective,
                MockTranslatePipe,
                DbTranslatePipe,
                TextareaComponent,
                ParagraphComponent,
                TextOverflowTooltipDirective,
                TextOverflowTooltipInputFieldDirective
            ],
            imports: [
                ReactiveFormsModule,
                HttpClientTestingModule,
                RouterTestingModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useClass: TranslateFakeLoader
                    }
                }),
                FormsModule,
                NgbModule
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                FormBuilder,
                ToolboxService,
                AuthenticationRestService,
                AuthenticationService,
                MessageBus,
                StesZasRestService,
                StesDataRestService,
                StesZasAbgleichService,
                {
                    provide: Router,
                    useValue: {
                        events: of({})
                    }
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        events: of({}),
                        parent: {
                            params: of({ id: 222 }),
                            data: of({ isAnmeldung: true })
                        },
                        paramMap: of(convertToParamMap({ id: 1 }))
                    }
                },
                { provide: NotificationService, useClass: MockNotificationService },
                SpinnerService,
                { provide: Location, useValue: locationStub },
                { provide: APP_BASE_HREF, useValue: '/' }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesDetailsPersonenstammdatenComponent);
        component = fixture.componentInstance;
        component.state = {
            window: {
                history: {
                    state: {}
                }
            }
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
