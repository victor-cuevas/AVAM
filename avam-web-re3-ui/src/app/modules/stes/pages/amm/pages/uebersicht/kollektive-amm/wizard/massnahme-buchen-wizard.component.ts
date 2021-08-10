import { MassnahmeBuchenWizardService } from '@app/shared/components/new/avam-wizard/massnahme-buchen-wizard.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StesHeaderDTO } from '@app/shared/models/dtos-generated/stesHeaderDTO';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { DeleteGuarded } from '@app/shared/services/can-delete-guard.service';
import { Observable, of } from 'rxjs';
import { AmmConstants } from '@app/shared/enums/amm-constants';
import { SpinnerService } from 'oblique-reactive';
import { AmmRestService } from '@app/core/http/amm-rest.service';

@Component({
    selector: 'massnahme-buchen-wizard',
    templateUrl: './massnahme-buchen-wizard.component.html',
    styleUrls: ['./massnahme-buchen-wizard.component.scss']
})
export class MassnahmeBuchenWizardComponent implements OnInit, DeleteGuarded {
    stesId: number;
    stesHeader: StesHeaderDTO;
    currentStep: 0;
    channel = 'MassnahmeBuchenChannel';

    constructor(
        private route: ActivatedRoute,
        private wizardService: MassnahmeBuchenWizardService,
        private dataService: StesDataRestService,
        private translate: TranslateService,
        private ammDataService: AmmRestService,
        private spinnerService: SpinnerService
    ) {}

    ngOnInit() {
        this.getRouteParamsAndSetWizard();
        this.wizardService.movePosition(0);
        this.getData();
    }

    getRouteParamsAndSetWizard() {
        this.route.params.subscribe(params => {
            this.stesId = params['stesId'];
            this.wizardService.setStesId(this.stesId);
        });
    }

    zuAmm() {
        this.wizardService.navigateToAmm();
    }

    getData() {
        this.dataService.getStesHeader(this.wizardService.getStesId().toString(), this.translate.currentLang).subscribe(res => {
            this.stesHeader = res;
        });
    }

    updateCurrentStep(currentStep) {
        this.currentStep = currentStep;
        this.getData();
    }

    shouldDelete(): boolean {
        return this.wizardService.shouldDelete();
    }

    delete(): Observable<boolean> {
        return this.wizardService.delete();
    }
}
