import { Component, OnInit, QueryList, ContentChildren, Input } from '@angular/core';
import { WizardStepComponent } from './wizard-step/wizard-step.component';
import { StepService } from './step-service';

@Component({
    selector: 'app-wizard',
    templateUrl: './wizard.component.html',
    styleUrls: ['./wizard.component.scss']
})

export class WizardComponent implements OnInit {

    @ContentChildren(WizardStepComponent) steps: QueryList<WizardStepComponent>;
    @Input() selectedStep: number;

    constructor(private stepService: StepService) { }

    ngOnInit() {
    }

    ngAfterContentInit(): void {
        this.stepService.setStepList(this.steps);
    }
}
