import { Component, Input, Output, EventEmitter } from '@angular/core';
import { StepService } from '../step-service';

class StepProperties {
    stepTitle: string;
    stepLable: string;
    stepClass: string;
    stepId: string;
    isDefault = false;
    isActive = false;
    isDisabled = false;
    isValid = false;

    constructor(stepTitle, stepLable, stepClass, stepId) {
        this.stepTitle = stepTitle;
        this.stepLable = stepLable;
        this.stepClass = stepClass;
        this.stepId = stepId;
    }
}

@Component({
    selector: 'app-wizard-step',
    templateUrl: './wizard-step.component.html',
    styleUrls: ['./wizard-step.component.scss']
})
export class WizardStepComponent {
    @Input() stepTitle: string;
    @Input() stepLable: string;
    @Input() stepClass: string;
    @Input() stepId: string;

    @Output() clickedStep = new EventEmitter<any>();

    stepProperties: StepProperties = new StepProperties(this.stepTitle, this.stepLable, this.stepClass, this.stepId);

    constructor(private readonly stepService: StepService) {}

    onClick() {
        if (!this.stepProperties.isDisabled) {
            this.stepService.clickedStep(this.stepId);
        }
    }
}
