import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StesDetailsModalBerufsdatenDetailComponent } from './stes-details-modal-berufsdaten-detail.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { GeschlechtPipe } from '@app/shared/pipes/geschlecht.pipe';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { DbTranslateServiceStub, MockTranslatePipe } from '@test_helpers/';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TextareaComponent } from '@app/shared/components/textarea/textarea.component';
import { CoreInputComponent } from '@app/library/core/core-input/core-input.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationService } from '@core/services/authentication.service';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { ToolboxService } from '@app/shared';
import { MessageBus } from '@shared/services/message-bus';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@stes/pages/details/pages/stes-details-stellensuche/stes-details-stellensuche.component.spec';

describe('StesDetailsModalBerufsdatenDetailComponent', () => {
    let component: StesDetailsModalBerufsdatenDetailComponent;
    let fixture: ComponentFixture<StesDetailsModalBerufsdatenDetailComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesDetailsModalBerufsdatenDetailComponent, MockTranslatePipe, TextareaComponent, CoreInputComponent],
            providers: [
                GeschlechtPipe,
                FormBuilder,
                { provide: TranslateService, useClass: TranslateServiceStub },
                AuthenticationService,
                AuthenticationRestService,
                ToolboxService,
                MessageBus
            ],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [NgbTooltipModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule, FormsModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesDetailsModalBerufsdatenDetailComponent);
        component = fixture.componentInstance;
        component.beruf = {};
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
