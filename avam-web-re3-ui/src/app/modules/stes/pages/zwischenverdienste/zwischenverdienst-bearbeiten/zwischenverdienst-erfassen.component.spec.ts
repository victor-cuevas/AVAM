import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
    ToolboxService,
    DbTranslatePipe,
    ParagraphComponent,
    AutosuggestInputComponent,
    ZahlstelleSuchenComponent,
    VermittlungSelectComponent,
    CloseTabDirective,
    GeschlechtPipe,
    PermissionDirective,
    TextOverflowTooltipDirective,
    TextOverflowTooltipInputFieldDirective,
    ObjectIteratorPipe
} from 'src/app/shared';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ZwischenverdienstErfassenComponent } from './zwischenverdienst-erfassen.component';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { MockTextControlClearDirective } from '@test_helpers/mock-text-control-clear.derective';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { NotificationService } from 'oblique-reactive';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbModal, NgbTooltipModule, NgbPopoverModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { ArbeitsvermittlungRestService } from '@app/core/http/arbeitsvermittlung-rest.service';
import { MessageBus } from '@shared/services/message-bus';
import { NavigationService } from '@app/shared/services/navigation-service';
import { TextareaComponent } from '@app/shared/components/textarea/textarea.component';
import { UnternehmenDataService } from '@app/shared/services/unternehmen-data.service';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { ZwischenverdienstFormHandler } from '..';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { NavigationServiceStub } from '@test_helpers/navigation-service-stub';

export class TranslateServiceStub {
    public instant(key: any): any {
        of(key);
    }

    public stream(): any {
        return new EventEmitter();
    }

    public currentLang = 'de';
    onLangChange = new EventEmitter();
}

class MockNotificationService {
    send() {}

    error() {}

    warning() {}

    success() {}
}

describe('ZwischenverdienstErfassenComponent', () => {
    let component: ZwischenverdienstErfassenComponent;
    let fixture: ComponentFixture<ZwischenverdienstErfassenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ZwischenverdienstErfassenComponent,
                DbTranslatePipe,
                MockTranslatePipe,
                ObjectIteratorPipe,
                ParagraphComponent,
                AutosuggestInputComponent,
                ZahlstelleSuchenComponent,
                VermittlungSelectComponent,
                MockTextControlClearDirective,
                CloseTabDirective,
                TextareaComponent,
                PermissionDirective,
                TextOverflowTooltipDirective,
                TextOverflowTooltipInputFieldDirective
            ],
            providers: [
                FormBuilder,
                StesDataRestService,
                [FehlermeldungenService],
                ToolboxService,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: { params: of({ id: 222 }), data: of({ isAnmeldung: true }) }
                    }
                },
                {
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                    }
                },
                { provide: TranslateService, useClass: TranslateServiceStub },
                MessageBus,
                { provide: NavigationService, useClass: NavigationServiceStub },
                AuthenticationRestService,
                AuthenticationService,
                { provide: NotificationService, useClass: MockNotificationService },
                NgbModal,
                ArbeitsvermittlungRestService,
                UnternehmenDataService,
                GeschlechtPipe,
                ZwischenverdienstFormHandler,
                UnternehmenRestService
            ],
            imports: [
                HttpClientTestingModule,
                RouterTestingModule,
                ReactiveFormsModule,
                FormsModule,
                NgbTooltipModule.forRoot(),
                NgbPopoverModule.forRoot(),
                NgbTypeaheadModule.forRoot()
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ZwischenverdienstErfassenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
