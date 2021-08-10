import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WdgZieleAnzeigenComponent } from './wdgziele-anzeigen.component';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { NavigationService } from '@app/shared/services/navigation-service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { NgbTooltipModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageBus } from '@app/shared/services/message-bus';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';
import { ToolboxService, PermissionDirective } from '@app/shared';
import { NavigationServiceStub } from '@test_helpers/navigation-service-stub';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { DatePipe } from '@angular/common';

describe('WiedereingliederungszieleAnzeigenComponent', () => {
    let component: WdgZieleAnzeigenComponent;
    let fixture: ComponentFixture<WdgZieleAnzeigenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [WdgZieleAnzeigenComponent, MockTranslatePipe, PermissionDirective],
            imports: [NgbTooltipModule.forRoot(), HttpClientTestingModule],
            providers: [
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                },
                AuthenticationService,
                NavigationService,
                AuthenticationRestService,
                MessageBus,
                DatePipe,
                { provide: NavigationService, useClass: NavigationServiceStub },
                ToolboxService,
                StesDataRestService,
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
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WdgZieleAnzeigenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
