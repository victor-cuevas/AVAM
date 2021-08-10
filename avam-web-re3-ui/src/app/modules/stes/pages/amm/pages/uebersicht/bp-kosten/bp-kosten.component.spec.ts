import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BPKostenComponent } from './bp-kosten.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import {
    DbTranslatePipe,
    CloseTabDirective,
    TextOverflowTooltipDirective,
    TextOverflowTooltipInputFieldDirective,
    PermissionDirective,
    ButtonDisplayPipe,
    CustomFormControlStateDirective,
    FormatNumberPipe,
    ToolboxService,
    FormatSwissFrancPipe
} from '@app/shared';
import { MockTranslatePipe, MockTextControlClearDirective } from '@test_helpers/';
import { MessageBus } from '@app/shared/services/message-bus';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { CoreInputComponent } from '@app/library/core/core-input/core-input.component';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { SpinnerService } from 'oblique-reactive';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';

describe('BPKostenComponent', () => {
    let component: BPKostenComponent;
    let fixture: ComponentFixture<BPKostenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [
                ReactiveFormsModule,
                HttpClientTestingModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useClass: TranslateFakeLoader
                    }
                }),
                FormsModule,
                RouterTestingModule,
                NgbTooltipModule.forRoot()
            ],
            declarations: [
                BPKostenComponent,
                DbTranslatePipe,
                MockTranslatePipe,
                MockTextControlClearDirective,
                CloseTabDirective,
                TextOverflowTooltipDirective,
                TextOverflowTooltipInputFieldDirective,
                PermissionDirective,
                ButtonDisplayPipe,
                MockTextControlClearDirective,
                CloseTabDirective,
                MockTranslatePipe,
                DbTranslatePipe,
                TextOverflowTooltipDirective,
                PermissionDirective,
                TextOverflowTooltipInputFieldDirective,
                CustomFormControlStateDirective,
                CoreInputComponent,
                ButtonDisplayPipe,
                FormatNumberPipe,
                FormatSwissFrancPipe
            ],
            providers: [
                MessageBus,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 222 })
                        },
                        queryParamMap: of(convertToParamMap({ id: 1 })),
                        params: of({ stesId: 222 }),
                        paramMap: of(convertToParamMap({ id: 1 }))
                    }
                },
                MessageBus,
                FormBuilder,
                SpinnerService,
                AmmRestService,
                ToolboxService,
                StesDataRestService,
                AmmHelper,
                AuthenticationService,
                AuthenticationRestService,
                SearchSessionStorageService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BPKostenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
