import { Component, OnInit } from '@angular/core';
import { WizardService } from '@app/shared/components/new/avam-wizard/wizard.service';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-stes-anmeldung',
    templateUrl: './stes-anmeldung.component.html',
    styleUrls: ['./stes-anmeldung.component.scss']
})
export class StesAnmeldungComponent implements OnInit, DeactivationGuarded {
    showBerufsdaten = false;

    constructor(private wizardService: WizardService, private router: Router) {}

    ngOnInit() {
        this.wizardService.observeBerufsdaten().subscribe(show => {
            this.showBerufsdaten = show;
        });
    }

    stepEnterStesdaten() {
        this.wizardService.list.toArray()[0].isDisabled = true;
        this.wizardService.list.toArray()[0].isValid = true;
        this.wizardService.list.toArray()[1].isDisabled = true;
        this.wizardService.list.toArray()[1].isValid = true;
    }

    showStesBerufErfassen() {
        return this.wizardService.currentStep === 5 && this.router.url.includes('stes/anmeldung/berufsdaten/erfassen/');
    }

    canDeactivate(): boolean {
        return this.wizardService.isFormDirty();
    }
}
