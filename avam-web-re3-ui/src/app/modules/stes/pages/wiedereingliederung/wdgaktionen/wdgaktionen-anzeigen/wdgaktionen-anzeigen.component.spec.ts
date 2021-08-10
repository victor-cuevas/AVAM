import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { ObjectIteratorPipe, ResizableColumnDirective, SortableHeader, ToolboxService, PermissionDirective } from '@app/shared';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { MessageBus } from '@app/shared/services/message-bus';
import { NavigationService } from '@app/shared/services/navigation-service';
import { NgbModal, NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { MockTranslatePipe } from '@test_helpers/';
import { NavigationServiceStub } from '@test_helpers/navigation-service-stub';
import { SpinnerService } from 'oblique-reactive';
import { Observable, of } from 'rxjs';
import { WdgAktionenAnzeigenComponent } from './wdgaktionen-anzeigen.component';

class TranslateServiceStub {
    public currentLang = 'de';
    onLangChange = new EventEmitter();
    public stream(key: string | Array<string>, interpolateParams?: Object): Observable<string | any> {
        return of({ label: key });
    }
    public instant(key: any): any {
        return key;
    }
}

describe('WdgAktionenAnzeigenComponent', () => {
    let component: WdgAktionenAnzeigenComponent;
    let fixture: ComponentFixture<WdgAktionenAnzeigenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [WdgAktionenAnzeigenComponent, SortableHeader, ResizableColumnDirective, ObjectIteratorPipe, MockTranslatePipe, PermissionDirective],
            imports: [NgbModule, NgbTooltipModule.forRoot(), HttpClientTestingModule, RouterTestingModule],

            providers: [
                {
                    provide: TranslateService,
                    Router,
                    useClass: TranslateServiceStub
                },
                AuthenticationService,
                NavigationService,
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
        fixture = TestBed.createComponent(WdgAktionenAnzeigenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
