import { FacadeService } from '@shared/services/facade.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DeleteGuarded } from '@shared/services/can-delete-guard.service';
import { VertragswertErfassenWizardService } from '@shared/components/new/avam-wizard/vertragswert-erfassen-wizard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';

@Component({
    selector: 'avam-vertragswert-erfassen-wizard',
    templateUrl: './vertragswert-erfassen-wizard.component.html'
})
export class VertragswertErfassenWizardComponent implements DeleteGuarded, OnDestroy, OnInit {
    constructor(
        public wizardService: VertragswertErfassenWizardService,
        private route: ActivatedRoute,
        private infopanelService: AmmInfopanelService,
        private router: Router,
        private facade: FacadeService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.wizardService.anbieterId = +params['anbieterId'];
        });

        this.route.queryParams.subscribe(queryParams => {
            this.wizardService.leistungsvereinbarungId = +queryParams['lvId'];
        });
    }

    shouldDelete(): boolean {
        return this.wizardService.displayLeaveConfirmation;
    }

    delete(): Observable<boolean> {
        return of(true);
    }

    back() {
        this.facade.fehlermeldungenService.closeMessage();

        this.router.navigate([`/amm/anbieter/${this.wizardService.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung`], {
            queryParams: { lvId: this.wizardService.leistungsvereinbarungId }
        });
    }

    ngOnDestroy(): void {
        this.infopanelService.resetTemplateInInfobar();
        this.wizardService.resetValues();
    }
}
