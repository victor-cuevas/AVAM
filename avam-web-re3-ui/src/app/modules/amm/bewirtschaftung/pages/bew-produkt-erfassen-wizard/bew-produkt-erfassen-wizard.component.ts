import { Component, OnDestroy } from '@angular/core';
import { AmmProduktErfassenWizardService } from '@app/shared/components/new/avam-wizard/amm-produkt-erfassen-wizard.service';
import { DeleteGuarded } from '@app/shared/services/can-delete-guard.service';
import { Observable, of } from 'rxjs';
import { AmmConstants } from '@app/shared/enums/amm-constants';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { FacadeService } from '@app/shared/services/facade.service';

@Component({
    selector: 'avam-bew-produkt-erfassen-wizard',
    templateUrl: './bew-produkt-erfassen-wizard.component.html'
})
export class BewProduktErfassenWizardComponent implements DeleteGuarded, OnDestroy {
    constructor(private bewirtschaftungRestService: BewirtschaftungRestService, private facade: FacadeService, public wizardService: AmmProduktErfassenWizardService) {}

    shouldDelete(): boolean {
        if (this.wizardService.grunddatenForm && this.wizardService.grunddatenForm.dirty && !this.wizardService.isWizardNext) {
            return true;
        }

        if (!!this.wizardService.produktId && this.wizardService.isWizardNext) {
            return false;
        }

        return !!this.wizardService.produktId;
    }

    delete(): Observable<boolean> {
        const produktId = this.wizardService.produktId;

        if (produktId && produktId !== AmmConstants.UNDEFINED_LONG_ID) {
            return new Observable(subscriber => {
                this.facade.spinnerService.activate(this.wizardService.channel);

                this.bewirtschaftungRestService.deleteProdukt(produktId).subscribe(
                    () => {
                        this.facade.spinnerService.deactivate(this.wizardService.channel);
                        subscriber.next(true);
                        subscriber.complete();
                    },
                    () => {
                        this.facade.spinnerService.deactivate(this.wizardService.channel);
                    }
                );
            });
        } else {
            return of(true);
        }
    }

    ngOnDestroy(): void {
        this.facade.fehlermeldungenService.closeMessage();
        this.wizardService.resetValues();
    }
}
