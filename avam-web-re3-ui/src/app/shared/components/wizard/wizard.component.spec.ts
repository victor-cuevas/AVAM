import { async, TestBed } from '@angular/core/testing';
import { WizardComponent } from './wizard.component';
import { MockTranslatePipe } from '../../../../../tests/helpers';
import { StepService } from './step-service';
import { WizardStepComponent } from './wizard-step/wizard-step.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';

export class StepServiceServiceStub {
    setStepList(any) {
        return true;
    }
}

describe('WizardComponent', () => {
    let component: WizardComponent;
    let stepService: StepService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [WizardComponent, WizardStepComponent, MockTranslatePipe],
            providers: [{ provide: StepService, useClass: StepServiceServiceStub }],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ]
        })
            .compileComponents();
        stepService = TestBed.get(StepService);

    }));

    beforeEach(() => {
        component = new WizardComponent(stepService);
    });

    it('should create', () => {
        spyOn(stepService, 'setStepList');

        component.ngAfterContentInit();

        expect(stepService.setStepList).toHaveBeenCalled();
    });
});
