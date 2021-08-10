import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-wizard-sub-step',
    templateUrl: './wizard-sub-step.component.html',
    styleUrls: ['./wizard-sub-step.component.scss']
})
export class WizardSubStepComponent implements OnInit {
    @Input() hidden: boolean;
    @Input() routerLink: string;
    @Input() label: string;

    constructor() {}

    ngOnInit() {}
}
