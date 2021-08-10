import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpesenComponent } from './spesen.component';
import {
    CloseTabDirective,
    DbTranslatePipe,
    TextOverflowTooltipDirective,
    PermissionDirective,
    TextOverflowTooltipInputFieldDirective,
    CustomFormControlStateDirective,
    ButtonDisplayPipe,
    ToolboxService,
    FormatNumberPipe
} from '@app/shared';
import { MockTextControlClearDirective, MockTranslatePipe, NavigationServiceStub } from '@test_helpers/';
import { CoreInputComponent } from '@app/library/core/core-input/core-input.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@app/library/core/core-calendar/core-calendar.component.spec';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { Router, ActivatedRoute, convertToParamMap, RouterEvent } from '@angular/router';
import { MessageBus } from '@app/shared/services/message-bus';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerService, NotificationService } from 'oblique-reactive';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { NavigationService } from '@app/shared/services/navigation-service';
import { of, ReplaySubject } from 'rxjs';
import { navigationModel } from '@app/shared/models/navigation-model';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { AmmHelper } from '@app/shared/helpers/amm.helper';

import localeCh from '@angular/common/locales/de-CH';
import { LocaleEnum } from '@app/shared/enums/locale.enum';
import { registerLocaleData } from '@angular/common';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';

registerLocaleData(localeCh, LocaleEnum.SWITZERLAND);

class MockNotificationService {
    send() {}

    error() {}

    warning() {}

    success() {}
}

const eventSubject = new ReplaySubject<RouterEvent>(1);
const routerMock = {
    navigate: jasmine.createSpy('navigate'),
    events: eventSubject.asObservable(),
    url: 'test'
};

describe('SpesenComponent', () => {
    let component: SpesenComponent;
    let fixture: ComponentFixture<SpesenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SpesenComponent,
                MockTextControlClearDirective,
                CloseTabDirective,
                MockTranslatePipe,
                DbTranslatePipe,
                TextOverflowTooltipDirective,
                PermissionDirective,
                TextOverflowTooltipInputFieldDirective,
                CustomFormControlStateDirective,
                CoreInputComponent,
                ButtonDisplayPipe,
                FormatNumberPipe
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: TranslateService, useClass: TranslateServiceStub },
                AuthenticationService,
                AuthenticationRestService,
                {
                    provide: Router,
                    useValue: routerMock
                },
                MessageBus,
                FormBuilder,
                SpinnerService,
                AmmRestService,
                ToolboxService,
                StesDataRestService,
                AmmHelper,
                SearchSessionStorageService,
                { provide: NotificationService, useClass: MockNotificationService },
                { provide: NavigationService, useClass: NavigationServiceStub },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 222 })
                        },
                        queryParamMap: of(convertToParamMap({ id: 1 })),
                        params: of({ stesId: 222 })
                    }
                }
            ],
            imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule, NgbTooltipModule, RouterTestingModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SpesenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
