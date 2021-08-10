import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreAutosuggestComponent } from './core-autosuggest.component';
import { MockTextControlClearDirective } from '@test_helpers/mock-text-control-clear.derective';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbTypeaheadModule, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { AvamInfoIconBtnComponent } from '@app/shared/components/avam-info-icon-btn/avam-info-icon-btn.component';

describe('CoreAutosuggestComponent', () => {
    let component: CoreAutosuggestComponent;
    let fixture: ComponentFixture<CoreAutosuggestComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoreAutosuggestComponent, MockTextControlClearDirective, AvamInfoIconBtnComponent, NgbPopover],
            imports: [ReactiveFormsModule, NgbTypeaheadModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoreAutosuggestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
