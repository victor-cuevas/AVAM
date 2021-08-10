import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FachberatungsangebotSuchenComponent } from './fachberatungsangebot-suchen.component';
import { FachberatungErfassenWizardComponent } from '../../fachberatung-erfassen-wizard.component';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MockTranslatePipe } from '@test_helpers/';
import { ToolboxService, PermissionDirective } from '@app/shared';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { FachberatungWizardService } from '@app/shared/components/new/avam-wizard/fachberatung-wizard.service';
import { UrlRestService } from '@app/core/http/url-rest.service';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { AuthenticationService } from '@core/services/authentication.service';
import { MessageBus } from '@shared/services/message-bus';

export class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        return key;
    }
    onLangChange = new EventEmitter();
}

describe('FachberatungsangebotSuchenComponent', () => {
    let component: FachberatungsangebotSuchenComponent;
    let fixture: ComponentFixture<FachberatungsangebotSuchenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [ReactiveFormsModule, RouterTestingModule, FormsModule, HttpClientTestingModule],
            declarations: [FachberatungsangebotSuchenComponent, FachberatungErfassenWizardComponent, MockTranslatePipe, PermissionDirective],
            providers: [
                FormBuilder,
                { provide: TranslateService, useClass: TranslateServiceStub },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: { params: of({ id: 222 }), data: of({ isAnmeldung: true }) }
                    }
                },
                StesDataRestService,
                {
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                    }
                },
                ToolboxService,
                FachberatungWizardService,
                UrlRestService,
                AuthenticationRestService,
                AuthenticationService,
                MessageBus
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FachberatungsangebotSuchenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
