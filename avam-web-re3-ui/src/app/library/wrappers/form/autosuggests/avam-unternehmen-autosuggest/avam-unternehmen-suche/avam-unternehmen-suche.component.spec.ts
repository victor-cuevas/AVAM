import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AvamUnternehmenSucheComponent } from './avam-unternehmen-suche.component';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { SpinnerService } from 'oblique-reactive';
import { TranslateService } from '@ngx-translate/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DbTranslatePipe } from '@app/shared/pipes/db-translate.pipe';
import { MockTranslatePipe } from '@test_helpers/index';
import { ToolboxService } from '@app/shared/services/toolbox.service';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { AuthenticationService } from '@core/services/authentication.service';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { MessageBus } from '@shared/services/message-bus';
import { RouterTestingModule } from '@angular/router/testing';

export class TranslateServiceStub {
    public currentLang = 'de';
    onLangChange = new EventEmitter();
    public instant(key: any): any {
        return key;
    }
}

describe('AvamUnternehmenSucheComponent', () => {
    let component: AvamUnternehmenSucheComponent;
    let fixture: ComponentFixture<AvamUnternehmenSucheComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AvamUnternehmenSucheComponent, DbTranslatePipe, MockTranslatePipe],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [FormsModule, RouterTestingModule, ReactiveFormsModule, HttpClientTestingModule],
            providers: [
                NgbActiveModal,
                ToolboxService,
                SpinnerService,
                StesDataRestService,
                { provide: NgbModal, useClass: NgbModal },
                AuthenticationService,
                AuthenticationRestService,
                MessageBus,
                { provide: TranslateService, useClass: TranslateServiceStub },
                SearchSessionStorageService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AvamUnternehmenSucheComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
