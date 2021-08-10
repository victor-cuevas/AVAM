import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchingWizardService } from '@shared/components/new/avam-wizard/matching-wizard.service';
import { Environment } from '@shared/components/new/avam-wizard/zuweisung-wizard.service';
import { StesMatchingprofilPaths } from '@shared/enums/stes-navigation-paths.enum';

@Component({
    selector: 'avam-matching-wizard',
    templateUrl: './matching-wizard.component.html'
})
export class MatchingWizardComponent implements OnInit, OnDestroy {
    stesId: any;
    stesMatchingProfilId: any;
    osteId: any;

    stepOne: string;
    stepTwo: string;

    constructor(private route: ActivatedRoute, private wizardService: MatchingWizardService) {}

    ngOnInit() {
        this.getRouteParamsAndSetWizard();
        this.genereateWizardUrl();

        if (this.wizardService.currentStep !== 0) {
            this.wizardService.navigateStep1();
        }
    }

    getRouteParamsAndSetWizard() {
        this.wizardService.setEnvironment(Environment.STES);
        this.route.params.subscribe(params => {
            this.stesId = params['stesId'];
            this.wizardService.setStesId(this.stesId);
            this.stesMatchingProfilId = params['stesMatchingProfilId'];
            this.wizardService.setStesMatchingProfilId(this.stesMatchingProfilId);
            this.osteId = params['osteId'];
            this.wizardService.setOsteId(this.osteId);
        });
    }

    genereateWizardUrl() {
        this.stepOne = `stes/${this.stesId}/${StesMatchingprofilPaths.MATCHINGPROFIL}/${this.stesMatchingProfilId}/${StesMatchingprofilPaths.VERMITTLUNG_ERFASSEN}/${
            this.osteId
        }/step1`;
        this.stepTwo = `stes/${this.stesId}/${StesMatchingprofilPaths.MATCHINGPROFIL}/${this.stesMatchingProfilId}/${StesMatchingprofilPaths.VERMITTLUNG_ERFASSEN}/${
            this.osteId
        }/step2`;
    }

    zuMatching() {
        this.wizardService.navigateToMatching();
    }

    ngOnDestroy() {
        this.wizardService.setEnvironment(null);
        this.wizardService.setStesId(null);
        this.wizardService.setStesMatchingProfilId(null);
        this.wizardService.setOsteId(null);
        this.wizardService.setProfilvergleich(null);
    }
}
