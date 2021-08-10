import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErweiterteSucheComponent } from './erweiterte-suche.component';
import { of } from 'rxjs';
import { EventEmitter } from 'events';
import { TranslateService } from '@ngx-translate/core';
import { MockTranslatePipe, MockTextControlClearDirective } from '@test_helpers/';
import { DbTranslatePipe } from '@app/shared/pipes/db-translate.pipe';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AvamLabelInputComponent } from '../../../library/wrappers/form/avam-label-input/avam-label-input.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';
import { StesSearchRestService } from '@app/core/http/stes-search-rest.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

export class TranslateServiceStub {
    public instant(key: any): any {
        of(key);
    }

    public stream(): any {
        return new EventEmitter();
    }

    public currentLang = 'de';
    onLangChange = new EventEmitter();
}

describe('ErweiterteSucheComponent', () => {
    let component: ErweiterteSucheComponent;
    let fixture: ComponentFixture<ErweiterteSucheComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ErweiterteSucheComponent, MockTranslatePipe, DbTranslatePipe, AvamLabelInputComponent, MockTextControlClearDirective],
            providers: [{ provide: TranslateService, useClass: TranslateServiceStub }, StesSearchRestService],
            imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule, NgbModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ErweiterteSucheComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
