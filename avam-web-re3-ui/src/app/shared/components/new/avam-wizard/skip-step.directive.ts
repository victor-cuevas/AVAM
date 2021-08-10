import { Directive, Host, OnInit } from '@angular/core';
import { AvamWizardStepComponent } from './avam-wizard-step/avam-wizard-step.component';

@Directive({
    selector: '[AvamWizardSkipStep]'
})
export class SkipStepDirective implements OnInit {
    constructor(@Host() private wizardStep: AvamWizardStepComponent) {}

    public ngOnInit(): void {
        this.wizardStep.skipStep = true;
    }
}
