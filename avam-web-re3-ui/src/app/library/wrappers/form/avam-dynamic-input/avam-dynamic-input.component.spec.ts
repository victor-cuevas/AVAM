import { of } from 'rxjs';
import { DbTranslatePipe } from '@app/shared/pipes/db-translate.pipe';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvamDynamicInputComponent } from './avam-dynamic-input.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule, FormGroup, FormArray, FormControl } from '@angular/forms';
import { MockTranslatePipe, MockTextControlClearDirective } from '@test_helpers/';
import { CoreInputComponent } from '@app/library/core/core-input/core-input.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';

describe('AvamDynamicInputComponent', () => {
    let component: AvamDynamicInputComponent;
    let fixture: ComponentFixture<AvamDynamicInputComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AvamDynamicInputComponent, MockTranslatePipe, DbTranslatePipe, CoreInputComponent, MockTextControlClearDirective],
            imports: [BrowserModule, FormsModule, ReactiveFormsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AvamDynamicInputComponent);
        component = fixture.componentInstance;
        component.parentForm = new FormGroup({});
        component.parentForm.setControl(
            'inputGroup',
            new FormArray([
                new FormGroup({
                    inputControl: new FormControl({})
                })
            ])
        );
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
