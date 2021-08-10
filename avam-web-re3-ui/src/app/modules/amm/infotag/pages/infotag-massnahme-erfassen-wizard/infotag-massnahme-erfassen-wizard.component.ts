import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { AmmInfotagMassnahmeWizardService } from '@app/shared/components/new/avam-wizard/amm-infotag-massnahme-wizard.service';
import { DeleteGuarded } from '@app/shared/services/can-delete-guard.service';
import { SpinnerService } from 'oblique-reactive';
import { Observable, of } from 'rxjs';
import { AmmInfotagRestService } from '../../services/amm-infotag-rest.service';

@Component({
    selector: 'avam-infotag-massnahme-erfassen-wizard',
    templateUrl: './infotag-massnahme-erfassen-wizard.component.html',
    styleUrls: ['./infotag-massnahme-erfassen-wizard.component.scss']
})
export class InfotagMassnahmeErfassenWizardComponent implements OnInit, OnDestroy, DeleteGuarded {
    channel = 'InfotagMassnahmeErfassenWizardChannel';

    constructor(
        public wizardService: AmmInfotagMassnahmeWizardService,
        private infopanelService: AmmInfopanelService,
        private spinnerService: SpinnerService,
        private rest: AmmInfotagRestService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.setIsMassnahme();
        this.wizardService.navigateStep(0);
    }

    setIsMassnahme() {
        this.wizardService.isMassnahme = this.router.url.indexOf('/infotag/massnahme/erfassen') > -1;

        if (!this.wizardService.isMassnahme) {
            this.route.params.subscribe(params => {
                this.wizardService.massnahmeId = params['massnahmeId'];
            });
            this.route.queryParams.subscribe(queryParams => {
                this.wizardService.dfeCopyId = queryParams['dfeId'];
            });
        }
    }

    shouldDelete(): boolean | Observable<boolean> | Promise<boolean> {
        if (this.wizardService.isMassnahme) {
            return this.shouldDeleteMassnahme();
        }

        return this.shouldDeleteInfotag();
    }

    shouldDeleteMassnahme(): boolean | Observable<boolean> | Promise<boolean> {
        if (this.wizardService.wizardCompleted || this.wizardService.navigateInside) {
            return false;
        }

        if ((this.wizardService.massnahmeDto && this.wizardService.massnahmeDto.massnahmeId > 0) || this.wizardService.grunddatenForm.dirty) {
            return true;
        }

        return false;
    }

    shouldDeleteInfotag(): boolean | Observable<boolean> | Promise<boolean> {
        if (this.wizardService.wizardCompleted || this.wizardService.navigateInside) {
            return false;
        }

        if ((this.wizardService.infotagDto && this.wizardService.infotagDto.durchfuehrungsId > 0) || this.wizardService.grunddatenForm.dirty) {
            return true;
        }

        return false;
    }

    delete(): Observable<boolean> {
        const condition = this.getDeleteCondition();
        const endpoint: Observable<any> = this.wizardService.isMassnahme
            ? this.rest.deleteInfotagMassnahme(this.wizardService.massnahmeDto.massnahmeId)
            : this.rest.deleteInfotag(this.wizardService.infotagDto.durchfuehrungsId);

        if (condition) {
            return new Observable(subscriber => {
                this.spinnerService.activate(this.channel);

                endpoint.subscribe(
                    () => {
                        this.spinnerService.deactivate(this.channel);
                        subscriber.next(true);
                        subscriber.complete();
                    },
                    () => {
                        this.spinnerService.deactivate(this.channel);
                    }
                );
            });
        }
        return of(true);
    }

    getDeleteCondition() {
        if (this.wizardService.isMassnahme) {
            return !this.wizardService.wizardCompleted && this.wizardService.massnahmeDto && this.wizardService.massnahmeDto.massnahmeId > 0;
        }

        return !this.wizardService.wizardCompleted && this.wizardService.infotagDto && this.wizardService.infotagDto.durchfuehrungsId > 0;
    }

    ngOnDestroy(): void {
        this.infopanelService.resetTemplateInInfobar();
        this.wizardService.ngOnDestroy();
    }
}
