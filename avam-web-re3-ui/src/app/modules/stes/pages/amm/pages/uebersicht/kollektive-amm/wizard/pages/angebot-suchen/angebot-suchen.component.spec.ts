import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroupDirective } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CoreInputComponent } from '@app/library/core/core-input/core-input.component';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { MassnahmeBuchenWizardService } from '@app/shared/components/new/avam-wizard/massnahme-buchen-wizard.service';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AngebotSuchenComponent } from './angebot-suchen.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { MockTextControlClearDirective } from '@test_helpers/';
import { ToolboxService, PermissionDirective } from '@app/shared';
import { UrlRestService } from '@app/core/http/url-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpHandler } from '@angular/common/http';
import { Router } from '@angular/router';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { DatePipe } from '@angular/common';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { MessageBus } from '@shared/services/message-bus';
import { TranslateServiceStub } from '@stes/pages/details/pages/stes-details-stellensuche/stes-details-stellensuche.component.spec';

class RouterMock {
    routeReuseStrategy() {
        return true;
    }
}

describe('AngebotSuchenComponent', () => {
    let component: AngebotSuchenComponent;
    let fixture: ComponentFixture<AngebotSuchenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AngebotSuchenComponent, CoreInputComponent, MockTextControlClearDirective, PermissionDirective],
            providers: [
                MassnahmeBuchenWizardService,
                ObliqueHelperService,
                ToolboxService,
                StesDataRestService,
                UrlRestService,
                HttpHandler,
                AmmHelper,
                {
                    provide: Router,
                    useClass: RouterMock
                },
                AmmRestService,
                AuthenticationRestService,
                AuthenticationService,
                DatePipe,
                SearchSessionStorageService,
                MessageBus
            ],
            imports: [
                HttpClientTestingModule,
                RouterTestingModule,
                ReactiveFormsModule,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                }),
                NgbTooltipModule.forRoot()
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AngebotSuchenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
