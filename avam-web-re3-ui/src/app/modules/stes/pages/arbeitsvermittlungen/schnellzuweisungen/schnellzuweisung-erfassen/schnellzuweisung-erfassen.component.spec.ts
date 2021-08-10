import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchnellzuweisungErfassenComponent } from './schnellzuweisung-erfassen.component';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageBus } from '@app/shared/services/message-bus';
import { of } from 'rxjs';
import { MockTranslatePipe } from '@test_helpers/';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CloseTabDirective, GeschlechtPipe, ToolboxService, PermissionDirective } from '@app/shared';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { CoreSliderComponent } from '@app/library/core/core-slider/core-slider.component';
import { UnternehmenDataService } from '@app/shared/services/unternehmen-data.service';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';

describe('SchnellzuweisungErfassenComponent', () => {
    let component: SchnellzuweisungErfassenComponent;
    let fixture: ComponentFixture<SchnellzuweisungErfassenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SchnellzuweisungErfassenComponent, MockTranslatePipe, CloseTabDirective, CoreSliderComponent, PermissionDirective],
            imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule, NgbTooltipModule],
            providers: [
                UnternehmenDataService,
                UnternehmenRestService,
                ToolboxService,
                StesDataRestService,
                AuthenticationService,
                AuthenticationRestService,
                GeschlechtPipe,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: { params: of({ id: 222 }) }
                    }
                },
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                },
                {
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                    }
                },
                MessageBus
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SchnellzuweisungErfassenComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
