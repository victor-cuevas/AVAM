import { Component, OnDestroy } from '@angular/core';
import { DeleteGuarded } from '@app/shared/services/can-delete-guard.service';
import { Observable, of } from 'rxjs';
import { AmmKursErfassenWizardService } from '@app/shared/components/new/avam-wizard/amm-kurs-erfassen-wizard.service';
import { AmmConstants } from '@app/shared/enums/amm-constants';
import { Router } from '@angular/router';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FacadeService } from '@app/shared/services/facade.service';

@Component({
    selector: 'avam-bew-kurs-erfassen-wizard',
    templateUrl: './bew-kurs-erfassen-wizard.component.html'
})
export class BewKursErfassenWizardComponent implements DeleteGuarded, OnDestroy {
    constructor(
        public wizardService: AmmKursErfassenWizardService,
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

                this.bewirtschaftungRestService.deleteDfeSession(dfeId).subscribe(
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
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.wizardService.produktId}/massnahmen/massnahme/kurse`], {
            queryParams: { massnahmeId: this.wizardService.massnahmeId }
        });
    }

    ngOnDestroy(): void {
        this.wizardService.resetValues();
    }
}
