import { FormatNumberPipe } from './../../../../../../../../../shared/pipes/format-number.pipe';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AzKostenComponent } from './az-kosten.component';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { MessageBus } from '@app/shared/services/message-bus';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { MockTextControlClearDirective, MockTranslatePipe, NavigationServiceStub } from '@test_helpers/';
import {
    CloseTabDirective,
    TextOverflowTooltipDirective,
    DbTranslatePipe,
    ToolboxService,
    PermissionDirective,
    TextOverflowTooltipInputFieldDirective,
    CustomFormControlStateDirective,
    ButtonDisplayPipe,
    FormatSwissFrancPipe
} from '@app/shared';
import { SpinnerService, NotificationService } from 'oblique-reactive';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { of } from 'rxjs';
import { NavigationService } from '@app/shared/services/navigation-service';
import { navigationModel } from '@app/shared/models/navigation-model';
import { RouterTestingModule } from '@angular/router/testing';
import { CoreInputComponent } from '@app/library/core/core-input/core-input.component';
import { AmmRestService } from '@app/core/http/amm-rest.service';

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

class RouterMock {
    routeReuseStrategy() {
        return true;
    }
}

describe('AzKostenComponent', () => {
    let component: AzKostenComponent;
    let fixture: ComponentFixture<AzKostenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                MockTextControlClearDirective,
                CloseTabDirective,
                MockTranslatePipe,
                DbTranslatePipe,
                TextOverflowTooltipDirective,
                AzKostenComponent,
                PermissionDirective,
                TextOverflowTooltipInputFieldDirective,
                CustomFormControlStateDirective,
                CoreInputComponent,
                ButtonDisplayPipe,
                FormatNumberPipe,
                FormatSwissFrancPipe
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: TranslateService, useClass: TranslateServiceStub },
                AuthenticationService,
                AuthenticationRestService,
                HttpClient,
                HttpHandler,
                {
                    provide: Router,
                    useClass: RouterMock
                },
                MessageBus,
                FormBuilder,
                SpinnerService,
                StesDataRestService,
                AmmRestService,
                ToolboxService,
                SearchSessionStorageService,
                { provide: NotificationService, useClass: MockNotificationService },
                { provide: NavigationService, useClass: NavigationServiceStub },
                {
                    provide: Router,
                    useValue: {
                        config: [
                            {
                                path: of({ navItems: navigationModel.stes })
                            }
                        ]
                    }
                },
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
        fixture = TestBed.createComponent(AzKostenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
