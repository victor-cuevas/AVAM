import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardSubStepComponent } from './wizard-sub-step.component';
import { MockTranslatePipe } from '../../../../../../tests/helpers';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';
import { RouterTestingModule } from '@angular/router/testing';

describe('WizardSubStepComponent', () => {
    let component: WizardSubStepComponent;
    let fixture: ComponentFixture<WizardSubStepComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [WizardSubStepComponent, MockTranslatePipe],
            imports: [RouterTestingModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WizardSubStepComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
