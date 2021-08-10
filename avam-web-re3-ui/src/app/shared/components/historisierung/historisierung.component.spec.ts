import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorisierungComponent } from './historisierung.component';
import { ToolboxService } from '@app/shared';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { SpinnerService } from 'oblique-reactive';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateService } from '@ngx-translate/core';

export class TranslateServiceStub {
    public currentLang = 'de';
    onLangChange = new EventEmitter();
    public instant(key: any): any {
        return key;
    }
}

describe('HistorisierungComponent', () => {
    let component: HistorisierungComponent;
    let fixture: ComponentFixture<HistorisierungComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [HistorisierungComponent, MockTranslatePipe],
            imports: [HttpClientTestingModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [ToolboxService, NgbModal, StesDataRestService, SpinnerService, { provide: TranslateService, useClass: TranslateServiceStub }, NgbActiveModal]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HistorisierungComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
