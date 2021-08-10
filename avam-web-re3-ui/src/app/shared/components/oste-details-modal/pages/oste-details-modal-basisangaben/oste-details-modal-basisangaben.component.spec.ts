import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OsteDetailsModalBasisangabenComponent } from './oste-details-modal-basisangaben.component';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { MockTranslatePipe } from '@test_helpers/';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OsteDataRestService } from '@app/core/http/oste-data-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DbTranslatePipe, ToolboxService } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { DbTranslateServiceStub } from '@test_helpers/';
import { TextareaComponent } from '@app/shared/components/textarea/textarea.component';
import { CoreInputComponent } from '@app/library/core/core-input/core-input.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '@core/services/authentication.service';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { RouterTestingModule } from '@angular/router/testing';
import { MessageBus } from '@shared/services/message-bus';

export class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        return key;
    }
    onLangChange = new EventEmitter();
}
describe('OsteDetailsModalBasisangabenComponent', () => {
    let component: OsteDetailsModalBasisangabenComponent;
    let fixture: ComponentFixture<OsteDetailsModalBasisangabenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OsteDetailsModalBasisangabenComponent, MockTranslatePipe, DbTranslatePipe, TextareaComponent, CoreInputComponent],
            imports: [NgbTooltipModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule, FormsModule],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                AuthenticationService,
                AuthenticationRestService,
                MessageBus,
                ToolboxService,
                StesDataRestService,
                OsteDataRestService,
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                { provide: TranslateService, useClass: TranslateServiceStub }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OsteDetailsModalBasisangabenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
