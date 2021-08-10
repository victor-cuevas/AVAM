import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WizardService } from '../wizard.service';

@Component({
    selector: 'avam-wizard-step',
    templateUrl: './avam-wizard-step.component.html',
    styleUrls: ['./avam-wizard-step.component.scss']
})
export class AvamWizardStepComponent {
    @Input() text: any;
    @Input() label: any;
    @Input() stepId: number;
    @Input() navigate: string;
    @Output() stepEnter: EventEmitter<any> = new EventEmitter();
    skipStep = false;
    isDefault = false;
    isActive = false;
    isDisabled = true;
    isValid = false;
    isDirty = false;
    isInvalid = false;
    isLoading = false;
    isVisible = true;

    constructor(private wizardService: WizardService) {}

    onClick(): void {
        if (!this.isDisabled && !this.skipStep) {
            this.wizardService.movePosition(this.stepId - 1, true);
        }
    }
}
