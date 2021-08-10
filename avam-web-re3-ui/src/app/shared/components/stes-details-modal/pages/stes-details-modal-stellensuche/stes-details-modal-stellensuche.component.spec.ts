import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StesDetailsModalStellensucheComponent } from './stes-details-modal-stellensuche.component';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MockTranslatePipe } from '@test_helpers/';
import { DbTranslatePipe, TextareaComponent, ToolboxService } from '@app/shared';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationService } from '@core/services/authentication.service';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { MessageBus } from '@shared/services/message-bus';

export class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        return key;
    }
    onLangChange = new EventEmitter();
}
describe('StesDetailsModalStellensucheComponent', () => {
    let component: StesDetailsModalStellensucheComponent;
    let fixture: ComponentFixture<StesDetailsModalStellensucheComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesDetailsModalStellensucheComponent, MockTranslatePipe, DbTranslatePipe, TextareaComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [NgbTooltipModule, HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule, FormsModule],
            providers: [
                StesDataRestService,
                AuthenticationService,
                AuthenticationRestService,
                ToolboxService,
                MessageBus,
                { provide: TranslateService, useClass: TranslateServiceStub }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesDetailsModalStellensucheComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
