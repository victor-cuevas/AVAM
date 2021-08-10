import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { AusgangslagenAnzeigenComponent } from './ausgangslagen-anzeigen.component';
import { of, Observable } from 'rxjs';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { NavigationService } from '@app/shared/services/navigation-service';
import { NavigationServiceStub } from '@test_helpers/navigation-service-stub';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { NgbTooltipModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageBus } from '@app/shared/services/message-bus';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { SpinnerService } from 'oblique-reactive';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { ToolboxService, PermissionDirective } from '@app/shared';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';

class TranslateServiceStub {
    public stream(key: string | Array<string>, interpolateParams?: Object): Observable<string | any> {
        return of({ label: key });
    }

    onLangChange = new EventEmitter();
}

describe('AusgangslagenAnzeigenComponent', () => {
    let component: AusgangslagenAnzeigenComponent;
    let fixture: ComponentFixture<AusgangslagenAnzeigenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [AusgangslagenAnzeigenComponent, MockTranslatePipe, PermissionDirective],
            imports: [NgbTooltipModule.forRoot(), HttpClientTestingModule],
            providers: [
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                },
                AuthenticationService,
                AuthenticationRestService,
                SpinnerService,
                NgbModal,
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
                DbTranslateService,
                ToolboxService,
                StesDataRestService,
                MessageBus,
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
                { provide: NavigationService, useClass: NavigationServiceStub }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AusgangslagenAnzeigenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
