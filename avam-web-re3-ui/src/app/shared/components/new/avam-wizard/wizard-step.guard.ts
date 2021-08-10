import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { WizardService } from '@shared/components/new/avam-wizard/wizard.service';

@Injectable({
    providedIn: 'root'
})
export class WizardStepGuard implements CanActivate {
    private readonly personalienStep = 3;

    constructor(private route: Router, private wizardService: WizardService) {}

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        // forbid browser back from personalien
        if (this.isFromPersonalien()) {
            // push the personalien url to forbid browser back.
            window.history.pushState(null, '', this.route.url);
            return false;
        } else {
            return true;
        }
    }

    private isFromPersonalien(): boolean {
        return this.wizardService.currentStep === this.personalienStep;
    }
}
