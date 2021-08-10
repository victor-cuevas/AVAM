import { FacadeService } from '@shared/services/facade.service';
import { DeleteGuarded } from '@shared/services/can-delete-guard.service';
import { Component, OnDestroy } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BenutzerstelleErfassenWizardService } from '@shared/components/new/avam-wizard/benutzerstelle-erfassen-wizard.service';

@Component({
    selector: 'avam-benutzerstelle-erfassen-wizard',
    templateUrl: './benutzerstelle-erfassen-wizard.component.html'
})
export class BenutzerstelleErfassenWizardComponent implements DeleteGuarded, OnDestroy {
    constructor(private facade: FacadeService, public wizardService: BenutzerstelleErfassenWizardService) {}

    /**
     * Should a modal confirmation window to be shown.
     *
     * @memberof BenutzerstelleErfassenWizardComponent
     */
    shouldDelete(): boolean {
        // check if some data on the first step has been entered
        // this can be done by setting a flag in the service (see VertragswertErfassenWizardService.displayLeaveConfirmation for reference)
        return this.wizardService.displayLeaveConfirmation;
    }

    /**
     * Call the BE for delete.
     *
     * @memberof BenutzerstelleErfassenWizardComponent
     */
    delete(): Observable<boolean> {
        return of(true);
    }

    /**
     * Clear messages and reset all values in the wizard-service
     *
     * @memberof BenutzerstelleErfassenWizardComponent
     */
    ngOnDestroy(): void {
        this.facade.fehlermeldungenService.closeMessage();
        this.wizardService.resetValues();
    }
}
