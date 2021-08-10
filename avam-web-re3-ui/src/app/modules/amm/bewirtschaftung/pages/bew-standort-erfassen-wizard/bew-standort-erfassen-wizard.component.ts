import { Component, OnDestroy } from '@angular/core';
import { AmmStandortErfassenWizardService } from '@app/shared';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AmmConstants } from '@app/shared/enums/amm-constants';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { DeleteGuarded } from '@app/shared/services/can-delete-guard.service';
import { FacadeService } from '@app/shared/services/facade.service';

@Component({
    selector: 'avam-bew-standort-erfassen-wizard',
    templateUrl: './bew-standort-erfassen-wizard.component.html'
})
export class BewStandortErfassenWizardComponent implements DeleteGuarded, OnDestroy {
    constructor(
        public wizardService: AmmStandortErfassenWizardService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private router: Router,
        private facade: FacadeService
    ) {}

    shouldDelete(): boolean {
        if (this.wizardService.grunddatenForm && this.wizardService.grunddatenForm.dirty && !this.wizardService.isWizardNext) {
            return true;
        }

        if (!!this.wizardService.dfeId && this.wizardService.isWizardNext) {
            return false;
        }

        return !!this.wizardService.dfeId;
    }

    delete(): Observable<boolean> {
        const dfeId = this.wizardService.dfeId;

        if (dfeId && dfeId !== AmmConstants.UNDEFINED_LONG_ID) {
            return new Observable(subscriber => {
                this.facade.spinnerService.activate(this.wizardService.channel);

                this.bewirtschaftungRestService.deleteDfeStandort(this.wizardService.produktId, this.wizardService.massnahmeId, dfeId).subscribe(
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
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.wizardService.produktId}/massnahmen/massnahme/standorte`], {
            queryParams: { massnahmeId: this.wizardService.massnahmeId }
        });
    }

    ngOnDestroy(): void {
        this.facade.fehlermeldungenService.closeMessage();
        this.wizardService.resetValues();
    }
}
