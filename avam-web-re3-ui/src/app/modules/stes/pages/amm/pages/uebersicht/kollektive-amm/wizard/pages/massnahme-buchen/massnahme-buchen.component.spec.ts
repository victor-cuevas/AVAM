import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MassnahmeBuchenComponent } from './massnahme-buchen.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CloseTabDirective, TextareaComponent, ToolboxService, ButtonDisplayPipe } from '@app/shared';
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { MassnahmeBuchenWizardService } from '@app/shared/components/new/avam-wizard/massnahme-buchen-wizard.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { UrlRestService } from '@app/core/http/url-rest.service';
import { DokumentVorlagenRestService } from '@app/core/http/dokument-vorlagen-rest.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { MessageBus } from '@shared/services/message-bus';
import { TranslateServiceStub } from '@stes/pages/details/pages/stes-details-stellensuche/stes-details-stellensuche.component.spec';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';

describe('MassnahmeBuchenComponent', () => {
    let component: MassnahmeBuchenComponent;
    let fixture: ComponentFixture<MassnahmeBuchenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MassnahmeBuchenComponent, CloseTabDirective, TextareaComponent, ButtonDisplayPipe],
            imports: [
                NgbTooltipModule,
                ReactiveFormsModule,
                FormsModule,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                }),
                RouterTestingModule,
                HttpClientTestingModule
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                MassnahmeBuchenWizardService,
                StesDataRestService,
                AmmRestService,
                ObliqueHelperService,
                AuthenticationRestService,
                AuthenticationService,
                ToolboxService,
                UrlRestService,
                DokumentVorlagenRestService,
                AmmHelper,
                MessageBus,
                SearchSessionStorageService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MassnahmeBuchenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
