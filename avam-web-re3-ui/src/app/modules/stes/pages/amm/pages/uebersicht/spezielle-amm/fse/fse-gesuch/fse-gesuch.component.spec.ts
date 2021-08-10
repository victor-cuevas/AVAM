import { TextareaComponent } from 'src/app/shared/components/textarea/textarea.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FseGesuchComponent } from './fse-gesuch.component';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute, convertToParamMap, RouterModule, RouterEvent } from '@angular/router';
import { MessageBus } from '@app/shared/services/message-bus';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { MockTextControlClearDirective, MockTranslatePipe } from '@test_helpers/';
import {
    CloseTabDirective,
    TextOverflowTooltipDirective,
    DbTranslatePipe,
    ToolboxService,
    PermissionDirective,
    TextOverflowTooltipInputFieldDirective,
    ButtonDisplayPipe
} from '@app/shared';
import { SpinnerService, NotificationService } from 'oblique-reactive';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { of, ReplaySubject } from 'rxjs';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { NavigationService } from '@shared/services/navigation-service';
import { NavigationServiceStub } from '@test_helpers/navigation-service-stub';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';

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

class RouterMock {
    routeReuseStrategy() {
        return true;
    }
}

describe('FseGesuchComponent', () => {
    let component: FseGesuchComponent;
    let fixture: ComponentFixture<FseGesuchComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                MockTextControlClearDirective,
                CloseTabDirective,
                MockTranslatePipe,
                DbTranslatePipe,
                TextOverflowTooltipDirective,
                FseGesuchComponent,
                MockTranslatePipe,
                CloseTabDirective,
                MockTextControlClearDirective,
                PermissionDirective,
                DbTranslatePipe,
                MockTranslatePipe,
                MockTextControlClearDirective,
                CloseTabDirective,
                TextOverflowTooltipDirective,
                TextOverflowTooltipInputFieldDirective,
                TextareaComponent,
                ButtonDisplayPipe
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                TranslateService,
                { provide: TranslateService, useClass: TranslateServiceStub },
                AuthenticationService,
                AuthenticationRestService,
                HttpClient,
                HttpHandler,
                {
                    provide: Router,
                    useValue: routerMock
                },
                MessageBus,
                FormBuilder,
                SpinnerService,
                StesDataRestService,
                AmmRestService,
                AmmHelper,
                SearchSessionStorageService,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 222 })
                        },
                        queryParamMap: of(convertToParamMap({ id: 1 })),
                        params: of({ stesId: 222 })
                    }
                },
                ToolboxService,
                { provide: NotificationService, useClass: MockNotificationService },
                { provide: NavigationService, useClass: NavigationServiceStub }
            ],
            imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule, NgbTooltipModule, RouterModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FseGesuchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
