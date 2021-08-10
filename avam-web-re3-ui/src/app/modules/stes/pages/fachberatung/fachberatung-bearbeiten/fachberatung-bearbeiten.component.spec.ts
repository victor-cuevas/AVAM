import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FachberatungBearbeitenComponent } from './fachberatung-bearbeiten.component';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MessageBus } from '@app/shared/services/message-bus';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockTranslatePipe } from '@test_helpers/';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TextareaComponent, PermissionDirective, ToolboxService } from '@app/shared';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { NavigationService } from '@shared/services/navigation-service';
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

describe('FachberatungBearbeitenComponent', () => {
    let component: FachberatungBearbeitenComponent;
    let fixture: ComponentFixture<FachberatungBearbeitenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule, NgbTooltipModule],
            declarations: [FachberatungBearbeitenComponent, MockTranslatePipe, TextareaComponent, PermissionDirective],
            providers: [
                StesDataRestService,
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                },
                AuthenticationService,
                AuthenticationRestService,
                {
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                    }
                },
                MessageBus,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            paramMap: of({ id: 222 }),
                            data: of({ isAnmeldung: true }),
                            params: of({ id: 222 })
                        },
                        params: of({ id: 222 }),
                        paramMap: of(convertToParamMap({ id: 1 })),
                        queryParams: of(convertToParamMap({ id: 1 })),
                        queryParamMap: of(convertToParamMap({ id: 1 }))
                    }
                },
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                },
                ToolboxService,
                ObliqueHelperService,
                { provide: NavigationService, useClass: NavigationServiceStub },
                MessageBus
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FachberatungBearbeitenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
