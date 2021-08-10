import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class UnternehmenWizardService {
    list: any = [];
    currentStep: number;

    constructor(private router: Router) {}

    movePosition(clickedStep: number) {
        this.router.navigate([this.list.toArray()[clickedStep].navigate]);
        this.changeStep(clickedStep);
    }

    changeStep(stepId) {
        this.deactiveSteps();
        this.list.toArray()[stepId].isActive = true;
        this.list.toArray()[stepId].isDisabled = false;
        this.list.toArray()[stepId].isDirty = true;
        this.currentStep = stepId;
        if (this.currentStep !== 0) {
            this.list.toArray()[this.currentStep - 1].isValid = true;
        }
    }

    deactiveSteps() {
        this.list.forEach(step => {
            if (!step.skipStep) {
                step.isActive = false;
            }
        });
    }

    initSteps() {
        this.currentStep = 0;
        this.list.forEach(element => {
            element.isActive = false;
            element.isDefault = false;
            element.isDirty = false;
            element.isDisabled = true;
            element.isInvalid = false;
            element.isLoading = false;
            element.isValid = false;
        });
        this.list.first.isActive = true;
        this.list.first.isDirty = true;
        this.list.first.isDisabled = false;
    }
}
