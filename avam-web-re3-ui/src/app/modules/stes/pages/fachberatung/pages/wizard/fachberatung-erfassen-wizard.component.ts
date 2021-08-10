import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FachberatungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { FachberatungWizardService } from '@app/shared/components/new/avam-wizard/fachberatung-wizard.service';

@Component({
    selector: 'avam-fachberatung-erfassen-wizard',
    templateUrl: './fachberatung-erfassen-wizard.component.html',
    styleUrls: ['./fachberatung-erfassen-wizard.component.scss']
})
export class FachberatungErfassenWizardComponent implements OnInit, OnDestroy {
    private stesId;

    constructor(private router: Router, private route: ActivatedRoute, private wizardService: FachberatungWizardService) {}

    ngOnInit() {
        this.setStesId();
        this.wizardService.setStesId(this.stesId);

        // this causes browser-refresh on any subsequent wizard-steps to always open the first step.
        this.wizardService.navigateStep1();
    }

    back() {
        this.wizardService.navigateZuwFachberatungen();
    }

    setStesId() {
        this.route.params.subscribe(params => {
            this.stesId = params['stesId'];
        });
    }

    ngOnDestroy() {
        this.wizardService.setSearchForm(null);
    }
}
