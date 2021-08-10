import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailFachberatungsangebotModalComponent } from './detail-fachberatungsangebot-modal.component';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MockTranslatePipe } from '@test_helpers/';
import { ToolboxService } from '@app/shared/services/toolbox.service';

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

describe('DetailFachberatungsangebotModalComponent', () => {
    let component: DetailFachberatungsangebotModalComponent;
    let fixture: ComponentFixture<DetailFachberatungsangebotModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [ReactiveFormsModule, FormsModule],
            declarations: [DetailFachberatungsangebotModalComponent, MockTranslatePipe],
            providers: [FormBuilder, ObliqueHelperService, { provide: TranslateService, useClass: TranslateServiceStub }, ToolboxService]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DetailFachberatungsangebotModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
