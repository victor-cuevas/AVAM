import { CoreInputComponent } from '@app/library/core/core-input/core-input.component';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CoreRangeSliderComponent } from '../../../core/core-range-slider/core-range-slider.component';

import { AvamRangeValuedWrapperComponent } from './avam-range-valued-wrapper.component';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AvamRangeValuedWrapperComponent', () => {
    let component: AvamRangeValuedWrapperComponent;
    let fixture: ComponentFixture<AvamRangeValuedWrapperComponent>;
    let formBuilder: FormBuilder;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AvamRangeValuedWrapperComponent, CoreRangeSliderComponent, MockTranslatePipe, CoreInputComponent],
            providers: [ObliqueHelperService],
            imports: [ReactiveFormsModule, FormsModule],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AvamRangeValuedWrapperComponent);
        component = fixture.componentInstance;

        formBuilder = TestBed.get(FormBuilder);
        component.parentForm = formBuilder.group({
            rangeSliderInput: '',
            input1: 1,
            input2: 70
        });
        component.rangeSliderControlName = 'rangeSliderInput';
        component.fromInputControlName = 'input1';
        component.toInputControlName = 'input2';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
