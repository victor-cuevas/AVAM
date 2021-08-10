import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OsteDetailsModalBewirtschaftungComponent } from './oste-details-modal-bewirtschaftung.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MockTranslatePipe } from '@test_helpers/';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { OsteDataRestService } from '@app/core/http/oste-data-rest.service';
import { TextareaComponent } from '@app/shared/components/textarea/textarea.component';
import { NgbActiveModal, NgbModal, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@shared/shared.module';
import { ToolboxService } from '@app/shared';
import { SpinnerService } from 'oblique-reactive';
import { TranslateService } from '@ngx-translate/core';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { TranslateServiceStub } from '@app/library/wrappers/form/autosuggests/avam-unternehmen-autosuggest/avam-unternehmen-suche/avam-unternehmen-suche.component.spec';
import { AuthenticationService } from '@core/services/authentication.service';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { MessageBus } from '@shared/services/message-bus';
import { RouterTestingModule } from '@angular/router/testing';

describe('OsteDetailsModalBewirtschaftungComponent', () => {
    let component: OsteDetailsModalBewirtschaftungComponent;
    let fixture: ComponentFixture<OsteDetailsModalBewirtschaftungComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OsteDetailsModalBewirtschaftungComponent, MockTranslatePipe, TextareaComponent],
            imports: [NgbTooltipModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule, FormsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                StesDataRestService,
                OsteDataRestService,
                AuthenticationService,
                AuthenticationRestService,
                MessageBus,
                ToolboxService,
                { provide: TranslateService, useClass: TranslateServiceStub }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OsteDetailsModalBewirtschaftungComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
