import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZwischenverdienstBearbeitenComponent } from './zwischenverdienst-bearbeiten.component';
import { NavigationService } from '@app/shared/services/navigation-service';
import { TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';
import { MessageBus } from '@app/shared/services/message-bus';
import { of } from 'rxjs';
import { EventEmitter } from '@angular/core';
import {
    ToolboxService,
    VermittlungSelectComponent,
    AutosuggestInputComponent,
    DbTranslatePipe,
    ParagraphComponent,
    CloseTabDirective,
    TextareaComponent,
    GeschlechtPipe,
    PermissionDirective,
    TextOverflowTooltipDirective,
    TextOverflowTooltipInputFieldDirective,
    ObjectIteratorPipe
} from '@app/shared';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { UnternehmenDataService } from '@app/shared/services/unternehmen-data.service';
import { ArbeitsvermittlungRestService } from '@app/core/http/arbeitsvermittlung-rest.service';
import { NgbTooltipModule, NgbPopoverModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { MockTranslatePipe } from '../../../../../../../test_helpers';
import { DatePipe } from '@angular/common';
import { ZwischenverdienstFormHandler } from '..';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { MockTextControlClearDirective } from '@test_helpers/mock-text-control-clear.derective';
import { NavigationServiceStub } from '@test_helpers/navigation-service-stub';
import { AvamInfoIconBtnComponent } from '@app/shared/components/avam-info-icon-btn/avam-info-icon-btn.component';

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

describe('ZwischenverdienstBearbeitenComponent', () => {
    let component: ZwischenverdienstBearbeitenComponent;
    let fixture: ComponentFixture<ZwischenverdienstBearbeitenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ZwischenverdienstBearbeitenComponent,
                AutosuggestInputComponent,
                VermittlungSelectComponent,
                DbTranslatePipe,
                ParagraphComponent,
                AutosuggestInputComponent,
                VermittlungSelectComponent,
                MockTextControlClearDirective,
                CloseTabDirective,
                TextareaComponent,
                MockTranslatePipe,
                ObjectIteratorPipe,
                AvamInfoIconBtnComponent,
                PermissionDirective,
                TextOverflowTooltipDirective,
                TextOverflowTooltipInputFieldDirective
            ],
            imports: [
                HttpClientTestingModule,
                RouterTestingModule,
                NgbPopoverModule.forRoot(),
                NgbTypeaheadModule.forRoot(),
                FormsModule,
                ReactiveFormsModule,
                NgbTooltipModule.forRoot()
            ],
            providers: [
                { provide: NavigationService, useClass: NavigationServiceStub },
                AuthenticationRestService,
                AuthenticationService,
                MessageBus,
                DatePipe,
                UnternehmenDataService,
                FormBuilder,
                ArbeitsvermittlungRestService,
                { provide: TranslateService, useClass: TranslateServiceStub },
                ToolboxService,
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
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                    }
                },

                StesDataRestService,
                HttpClient,
                HttpHandler,
                GeschlechtPipe,
                ZwischenverdienstFormHandler,
                UnternehmenRestService
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ZwischenverdienstBearbeitenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
