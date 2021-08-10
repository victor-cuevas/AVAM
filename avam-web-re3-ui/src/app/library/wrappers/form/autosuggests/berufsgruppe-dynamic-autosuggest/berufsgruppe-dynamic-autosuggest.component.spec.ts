import { MockTextControlClearDirective } from '@test_helpers/mock-text-control-clear.derective';
import { NgbTooltip, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DisableControlDirective } from '@app/library/core/directives/disable-control.directive';
import { CoreAutosuggestComponent } from '@app/library/core/core-autosuggest/core-autosuggest.component';
import { MockTranslatePipe } from '@test_helpers/index';
import { AvamBerufsgruppeAutosuggestComponent } from '../avam-berufsgruppe-autosuggest/avam-berufsgruppe-autosuggest.component';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BerufsgruppeDynamicAutosuggestComponent } from './berufsgruppe-dynamic-autosuggest.component';

describe('BerufsgruppeDynamicAutosuggestComponent', () => {
    let component: BerufsgruppeDynamicAutosuggestComponent;
    let fixture: ComponentFixture<BerufsgruppeDynamicAutosuggestComponent>;

    let formBuilder: FormBuilder;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, FormsModule, NgbTypeaheadModule],
            declarations: [
                BerufsgruppeDynamicAutosuggestComponent,
                AvamBerufsgruppeAutosuggestComponent,
                MockTranslatePipe,
                CoreAutosuggestComponent,
                DisableControlDirective,
                MockTextControlClearDirective,
                NgbTooltip
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BerufsgruppeDynamicAutosuggestComponent);
        formBuilder = TestBed.get(FormBuilder);
        component = fixture.componentInstance;
        component.parentForm = formBuilder.group({
            berufsgruppen: formBuilder.array([])
        });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
