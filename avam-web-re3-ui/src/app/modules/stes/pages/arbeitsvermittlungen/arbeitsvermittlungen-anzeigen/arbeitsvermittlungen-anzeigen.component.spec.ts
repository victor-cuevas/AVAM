import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArbeitsvermittlungenAnzeigenComponent } from './arbeitsvermittlungen-anzeigen.component';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageBus } from '@app/shared/services/message-bus';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { ArbeitsvermittlungRestService } from '@app/core/http/arbeitsvermittlung-rest.service';
import { ToolboxService, DbTranslatePipe, PermissionDirective } from '@app/shared';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { MockTranslatePipe } from '@test_helpers/';

export class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        return key;
    }
    onLangChange = new EventEmitter();
}

describe('ArbeitsvermittlungenAnzeigenComponent', () => {
    let component: ArbeitsvermittlungenAnzeigenComponent;
    let fixture: ComponentFixture<ArbeitsvermittlungenAnzeigenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ArbeitsvermittlungenAnzeigenComponent, MockTranslatePipe, DbTranslatePipe, PermissionDirective],
            imports: [HttpClientTestingModule],
            providers: [
                ArbeitsvermittlungRestService,
                StesDataRestService,
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                },
                AuthenticationService,
                AuthenticationRestService,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: { params: of({ id: 222 }) }
                    }
                },
                MessageBus,
                ToolboxService,
                {
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                    }
                }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ArbeitsvermittlungenAnzeigenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
