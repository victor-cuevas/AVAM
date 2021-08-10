import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OsteDetailsModalBewerbungComponent } from './oste-details-modal-bewerbung.component';
import { MockTranslatePipe, DbTranslateServiceStub } from '@test_helpers/';
import { TextareaComponent } from '@app/shared/components/textarea/textarea.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { OsteDataRestService } from '@app/core/http/oste-data-rest.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { RouterTestingModule } from '@angular/router/testing';
import { MessageBus } from '@shared/services/message-bus';
import { AuthenticationService } from '@core/services/authentication.service';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { ToolboxService } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@stes/pages/details/pages/stes-details-stellensuche/stes-details-stellensuche.component.spec';

describe('OsteDetailsModalBewerbungComponent', () => {
    let component: OsteDetailsModalBewerbungComponent;
    let fixture: ComponentFixture<OsteDetailsModalBewerbungComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OsteDetailsModalBewerbungComponent, MockTranslatePipe, TextareaComponent],
            imports: [NgbTooltipModule, HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule, FormsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                StesDataRestService,
                OsteDataRestService,
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                MessageBus,
                AuthenticationService,
                AuthenticationRestService,
                ToolboxService,
                { provide: TranslateService, useClass: TranslateServiceStub }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OsteDetailsModalBewerbungComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
