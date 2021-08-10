import { Component, OnDestroy } from '@angular/core';
import { DeleteGuarded } from '@app/shared/services/can-delete-guard.service';
import { Observable, of } from 'rxjs';
import { AmmMassnahmeErfassenWizardService } from '@app/shared/components/new/avam-wizard/amm-massnahme-erfassen-wizard.service';
import { AmmConstants } from '@app/shared/enums/amm-constants';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { Router } from '@angular/router';
import { FacadeService } from '@app/shared/services/facade.service';

@Component({
    selector: 'avam-bew-massnahme-erfassen-wizard',
    templateUrl: './bew-massnahme-erfassen-wizard.component.html'
})
export class BewMassnahmeErfassenWizardComponent implements DeleteGuarded, OnDestroy {
    constructor(
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private router: Router,
        private facade: FacadeService,
        public wizardService: AmmMassnahmeErfassenWizardService
    ) {}

    shouldDelete(): boolean {
        if (this.wizardService.grunddatenForm && this.wizardService.grunddatenForm.dirty && !this.wizardService.isWizardNext) {
            return true;
        }

        if (!!this.wizardService.massnahmeId && this.wizardService.isWizardNext) {
            return false;
        }

        return !!this.wizardService.massnahmeId;
    }

    delete(): Observable<boolean> {
        const massnahmeId = this.wizardService.massnahmeId;

        if (massnahmeId && massnahmeId !== AmmConstants.UNDEFINED_LONG_ID) {
            return new Observable(subscriber => {
                this.facade.spinnerService.activate(this.wizardService.channel);

                this.bewirtschaftungRestService.deleteMassnahme(massnahmeId).subscribe(
                    () => {
                        this.facade.spinnerService.deactivate(this.wizardService.channel);
                        subscriber.next(true);
                        subscriber.complete();
                        OrColumnLayoutUtils.scrollTop();
                    },
                    () => {
                        this.facade.spinnerService.deactivate(this.wizardService.channel);
                        OrColumnLayoutUtils.scrollTop();
                    }
                );
            });
        } else {
            return of(true);
        }
    }

    back() {
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.wizardService.produktId}/massnahmen`]);
    }

    ngOnDestroy(): void {
        this.wizardService.resetValues();
    }
}
