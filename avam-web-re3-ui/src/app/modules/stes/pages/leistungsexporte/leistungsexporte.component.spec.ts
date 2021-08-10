import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeistungsexporteComponent } from './leistungsexporte.component';
import { TranslateService } from '@ngx-translate/core';
import { SortableHeader, ToolboxService, PermissionDirective } from '@app/shared';
import { MockTranslatePipe } from '../../../../../../tests/helpers';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { SpinnerService } from 'oblique-reactive';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageBus } from '@app/shared/services/message-bus';
import { AuthenticationService } from '@core/services/authentication.service';

export class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        return key;
    }
    onLangChange = new EventEmitter();
}

xdescribe('LeistungsexporteComponent', () => {
    let component: LeistungsexporteComponent;
    let fixture: ComponentFixture<LeistungsexporteComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LeistungsexporteComponent, SortableHeader, MockTranslatePipe, PermissionDirective],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [NgbTooltipModule.forRoot(), HttpClientTestingModule],
            providers: [
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                },
                SpinnerService,
                StesDataRestService,
                DbTranslateService,
                AuthenticationService,
                {
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                    }
                },
                ToolboxService,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: { params: of({ id: 222 }) }
                    }
                },
                MessageBus
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LeistungsexporteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
