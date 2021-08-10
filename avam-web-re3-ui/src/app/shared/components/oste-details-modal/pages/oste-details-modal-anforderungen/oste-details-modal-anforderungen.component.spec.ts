import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OsteDetailsModalAnforderungenComponent } from './oste-details-modal-anforderungen.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';
import { TextareaComponent, ToolboxService } from '@app/shared';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { OsteDataRestService } from '@app/core/http/oste-data-rest.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { DbTranslatePipe } from '@app/shared/pipes/db-translate.pipe';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationService } from '@core/services/authentication.service';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { MessageBus } from '@shared/services/message-bus';

describe('OsteDetailsModalAnforderungenComponent', () => {
    let component: OsteDetailsModalAnforderungenComponent;
    let fixture: ComponentFixture<OsteDetailsModalAnforderungenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OsteDetailsModalAnforderungenComponent, TextareaComponent],
            imports: [
                NgbTooltipModule,
                HttpClientTestingModule,
                RouterTestingModule,
                ReactiveFormsModule,
                FormsModule,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                })
            ],
            providers: [StesDataRestService, OsteDataRestService, DbTranslatePipe, AuthenticationService, AuthenticationRestService, ToolboxService, MessageBus],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OsteDetailsModalAnforderungenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
