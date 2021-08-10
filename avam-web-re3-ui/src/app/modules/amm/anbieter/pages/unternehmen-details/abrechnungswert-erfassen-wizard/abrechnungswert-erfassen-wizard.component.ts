import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbrechnungswertErfassenWizardService } from '@app/shared/components/new/avam-wizard/abrechnungswert-erfassen-wizard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { Observable, of } from 'rxjs';
import { DeleteGuarded } from '@app/shared/services/can-delete-guard.service';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'avam-abrechnungswert-erfassen-wizard',
    templateUrl: './abrechnungswert-erfassen-wizard.component.html'
})
export class AbrechnungswertErfassenWizardComponent extends Unsubscribable implements DeleteGuarded, OnInit, OnDestroy {
    constructor(
        public wizardService: AbrechnungswertErfassenWizardService,
        private route: ActivatedRoute,
        private infopanelService: AmmInfopanelService,
        private anbieterRestService: AnbieterRestService,
        private spinnerService: SpinnerService,
        private router: Router
    ) {
        super();
    }

    ngOnInit(): void {
        this.route.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.wizardService.anbieterId = +params['anbieterId'];
        });

        this.route.queryParams.pipe(takeUntil(this.unsubscribe)).subscribe(queryParams => {
            this.wizardService.leistungsvereinbarungId = +queryParams['lvId'];
            this.wizardService.vertragswertId = +queryParams['vertragswertId'];
        });

        this.wizardService.navigateStep(0);
        this.wizardService.isWizardNext = false;
        this.wizardService.abrechnungswertId = null;
    }

    shouldDelete(): boolean {
        if (this.wizardService.grunddatenForm && this.wizardService.grunddatenForm.dirty && !this.wizardService.isWizardNext) {
            return true;
        }

        if (!!this.wizardService.abrechnungswertId && this.wizardService.isWizardNext) {
            return false;
        }

        return !!this.wizardService.abrechnungswertId;
    }

    delete(): Observable<boolean> {
        if (this.wizardService.abrechnungswertId) {
            return new Observable(subscriber => {
                this.spinnerService.activate(this.wizardService.channel);

                this.anbieterRestService.deleteAbrechnungswert(this.wizardService.abrechnungswertId).subscribe(
                    () => {
                        this.spinnerService.deactivate(this.wizardService.channel);
                        subscriber.next(true);
                        subscriber.complete();
                    },
                    () => {
                        this.spinnerService.deactivate(this.wizardService.channel);
                    }
                );
            });
        }
        return of(true);
    }

    back() {
        this.router.navigate([`amm/anbieter/${this.wizardService.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/detail`], {
            queryParams: { vertragswertId: this.wizardService.vertragswertId, lvId: this.wizardService.leistungsvereinbarungId }
        });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.infopanelService.resetTemplateInInfobar();
        this.wizardService.resetValues();
        this.infopanelService.removeFromInfobar(this.wizardService.panelTemplate);
    }
}
