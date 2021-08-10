import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Environment, ZuweisungWizardService } from '@app/shared/components/new/avam-wizard/zuweisung-wizard.service';

@Component({
    selector: 'zuweisung-wizard',
    templateUrl: './zuweisung-wizard.component.html'
})
export class ZuweisungWizardComponent implements OnInit, OnDestroy {
    stesId: any;
    stepOne: string;
    stepTwo: string;
    stepThree: string;

    constructor(private route: ActivatedRoute, private wizardService: ZuweisungWizardService) {}

    ngOnInit() {
        this.getStesId();
        this.genereateWizardUrl();
        this.wizardService.setEnvironment(Environment.STES);
        this.wizardService.setStesId(this.stesId);
        // Redirect to step1 in case of browser refresh or manual URL entry
        this.wizardService.navigateToStes(1);
    }

    getStesId() {
        this.route.params.subscribe(params => {
            this.stesId = params['stesId'];
        });
    }

    genereateWizardUrl() {
        this.stepOne = `stes/${this.stesId}/vermittlung/erfassen/step1`;
        this.stepTwo = `stes/${this.stesId}/vermittlung/erfassen/step2`;
        this.stepThree = `stes/${this.stesId}/vermittlung/erfassen/step3`;
    }

    zuStellenvermittlung() {
        this.wizardService.navigateToArbeitsvermittlungStes();
    }

    ngOnDestroy() {
        this.wizardService.setStesId(null);
        this.wizardService.setOsteId(null);
        this.wizardService.setEnvironment(null);
        this.wizardService.setProfilvergleich(null);
    }
}
