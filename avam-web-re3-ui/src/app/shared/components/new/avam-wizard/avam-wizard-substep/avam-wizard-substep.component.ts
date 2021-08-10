import { Component, Input } from '@angular/core';
import { WizardService } from '../wizard.service';
import { Router } from '@angular/router';

@Component({
    selector: 'avam-wizard-substep',
    templateUrl: './avam-wizard-substep.component.html',
    styleUrls: ['./avam-wizard-substep.component.scss']
})
export class AvamWizardSubstepComponent {
    @Input() text: any;
    @Input() navigate: string;

    constructor(private wizardService: WizardService, private router: Router) {}

    onClick() {
        if (this.navigate) {
            this.router.navigateByUrl(`stes/anmeldung/${this.navigate}/${this.wizardService.stesId}`);
        }
    }
}
