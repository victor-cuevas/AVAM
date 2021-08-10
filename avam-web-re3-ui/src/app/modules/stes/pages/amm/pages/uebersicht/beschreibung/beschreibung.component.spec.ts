import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { AmmnutzungWizardService } from '@app/shared/components/new/avam-wizard/ammnutzung-wizard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { BeschreibungComponent } from './beschreibung.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import {
    DbTranslatePipe,
    CloseTabDirective,
    TextOverflowTooltipDirective,
    TextOverflowTooltipInputFieldDirective,
    PermissionDirective,
    ToolboxService,
    ButtonDisplayPipe,
    TextareaComponent
} from '@app/shared';
import { MockTranslatePipe, MockTextControlClearDirective } from '@test_helpers/';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { MessageBus } from '@app/shared/services/message-bus';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';

class MockNotificationService {
    send() {}

    error() {}

    warning() {}

    success() {}
}

export class TranslateServiceStub {
    public currentLang = 'de';
    onLangChange = new EventEmitter();
    public instant(key: any): any {
        return key;
    }
}

describe('BeschreibungComponent', () => {
    let component: BeschreibungComponent;
    let fixture: ComponentFixture<BeschreibungComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [
                ReactiveFormsModule,
                HttpClientTestingModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useClass: TranslateFakeLoader
                    }
                }),
                FormsModule,
                RouterTestingModule,
                NgbTooltipModule.forRoot()
            ],
            declarations: [
                BeschreibungComponent,
                DbTranslatePipe,
                MockTranslatePipe,
                MockTextControlClearDirective,
                CloseTabDirective,
                TextOverflowTooltipDirective,
                TextOverflowTooltipInputFieldDirective,
                PermissionDirective,
                ButtonDisplayPipe,
                TextareaComponent
            ],
            providers: [
                FormBuilder,
                { provide: TranslateService, useClass: TranslateServiceStub },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: of({ isWizard: true }),
                        parent: { params: of({ id: 222 }), data: of({ isWizard: true }) }
                    }
                },
                StesDataRestService,
                AmmRestService,
                AmmHelper,
                {
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                    }
                },
                { provide: NotificationService, useClass: MockNotificationService },
                SpinnerService,
                AmmnutzungWizardService,
                AuthenticationService,
                AuthenticationRestService,
                MessageBus,
                ToolboxService,
                SearchSessionStorageService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BeschreibungComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
