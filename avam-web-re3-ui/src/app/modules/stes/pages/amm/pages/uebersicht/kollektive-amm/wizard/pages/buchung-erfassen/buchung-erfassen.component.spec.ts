import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BuchungErfassenComponent } from './buchung-erfassen.component';
import { MassnahmeBuchenWizardService } from '@app/shared/components/new/avam-wizard/massnahme-buchen-wizard.service';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionDirective, DbTranslatePipe, CloseTabDirective, TextOverflowTooltipDirective, TextareaComponent, ToolboxService, ButtonDisplayPipe } from '@app/shared';
import { MockTranslatePipe, NavigationServiceStub, MockTextControlClearDirective } from '@test_helpers/';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@app/library/core/core-calendar/core-calendar.component.spec';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { HttpHandler } from '@angular/common/http';
import { Router, ActivatedRoute, convertToParamMap, RouterModule } from '@angular/router';
import { MessageBus } from '@app/shared/services/message-bus';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerService, NotificationService } from 'oblique-reactive';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { of } from 'rxjs';
import { NavigationService } from '@app/shared/services/navigation-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DmsRestService } from '@app/core/http/dms-rest.service';
import { DokumentVorlagenRestService } from '@app/core/http/dokument-vorlagen-rest.service';
import { UrlRestService } from '@app/core/http/url-rest.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';

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

describe('BuchungErfassenComponent', () => {
    let component: BuchungErfassenComponent;
    let fixture: ComponentFixture<BuchungErfassenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                MockTextControlClearDirective,
                BuchungErfassenComponent,
                MockTextControlClearDirective,
                PermissionDirective,
                DbTranslatePipe,
                MockTranslatePipe,
                MockTextControlClearDirective,
                CloseTabDirective,
                TextOverflowTooltipDirective,
                TextareaComponent,
                ButtonDisplayPipe
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                ObliqueHelperService,
                UrlRestService,
                DokumentVorlagenRestService,
                MassnahmeBuchenWizardService,
                { provide: TranslateService, useClass: TranslateServiceStub },
                AuthenticationService,
                AuthenticationRestService,
                HttpHandler,
                {
                    provide: Router,
                    useClass: RouterMock
                },
                MessageBus,
                FormBuilder,
                SpinnerService,
                DmsRestService,
                StesDataRestService,
                AmmRestService,
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
            imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule, NgbTooltipModule, RouterModule, RouterTestingModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BuchungErfassenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
