import { Component, OnDestroy, OnInit } from '@angular/core';
import { AmmBeschaeftigungseinheitErfassenWizardService } from '@app/shared';
import { Observable, of } from 'rxjs';
import { DeleteGuarded } from '@app/shared/services/can-delete-guard.service';
import { FacadeService } from '@app/shared/services/facade.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AmmConstants } from '@app/shared/enums/amm-constants';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';

@Component({
    selector: 'avam-bew-beschaeftigungseinheit-erfassen-wizard',
    templateUrl: './bew-beschaeftigungseinheit-erfassen-wizard.component.html'
})
export class BewBeschaeftigungseinheitErfassenWizardComponent implements DeleteGuarded, OnDestroy, OnInit {
    constructor(
        public wizardService: AmmBeschaeftigungseinheitErfassenWizardService,
        private facade: FacadeService,
        private route: ActivatedRoute,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.wizardService.produktId = +params['produktId'];
            this.wizardService.massnahmeId = +params['massnahmeId'];
            this.wizardService.dfeId = +params['dfeId'];
        });

        this.setIsPraktikumsstelle(this.wizardService.produktId, this.wizardService.massnahmeId);
    }

    setIsPraktikumsstelle(produktId: number, massnahmeId: number) {
        this.bewirtschaftungRestService.getStandortHoldsPraktikumsstellen(produktId, massnahmeId).subscribe(response => {
            this.wizardService.isPraktikumsstelle = !!response.data;
        });
    }

    shouldDelete(): boolean {
        if (this.wizardService.grunddatenForm && this.wizardService.grunddatenForm.dirty && !this.wizardService.isWizardNext) {
            return true;
        }

        if (!!this.wizardService.beId && this.wizardService.isWizardNext) {
            return false;
        }

        return !!this.wizardService.beId;
    }

    delete(): Observable<boolean> {
        const beId = this.wizardService.beId;

        if (beId && beId !== AmmConstants.UNDEFINED_LONG_ID) {
            return new Observable(subscriber => {
                this.facade.spinnerService.activate(this.wizardService.channel);

                this.bewirtschaftungRestService.deleteBeschaeftigungseinheit(beId).subscribe(
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
        this.router.navigate(
            [
                `amm/bewirtschaftung/produkt/${this.wizardService.produktId}/massnahmen/massnahme/standorte/standort/${
                    this.wizardService.isPraktikumsstelle ? 'praktikumsstellen' : 'arbeitsplatzkategorien'
                }`
            ],
            {
                queryParams: { massnahmeId: this.wizardService.massnahmeId, dfeId: this.wizardService.dfeId }
            }
        );
    }

    ngOnDestroy(): void {
        this.wizardService.resetValues();
    }
}
