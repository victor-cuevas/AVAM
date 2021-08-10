import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WizardErfassenService } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/erfassen/wizard/wizard-erfassen.service';
import { Unsubscribable } from 'oblique-reactive';
import { filter, takeUntil } from 'rxjs/operators';
import PrintHelper from '@shared/helpers/print.helper';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxService } from '@app/shared';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-oste-erfassen-wizard',
    templateUrl: './oste-erfassen-wizard.component.html'
})
export class OsteErfassenWizardComponent extends Unsubscribable implements OnInit, OnDestroy {
    unternehmenId: any;

    step1: string;
    step2: string;
    step3: string;
    step4: string;

    constructor(private route: ActivatedRoute, private wizardService: WizardErfassenService, private facadeService: FacadeService) {
        super();
    }

    ngOnInit() {
        this.getRouteParams();
        this.generateWizardUrl();
        this.initToolbox();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.wizardService.resetData();
        this.facadeService.fehlermeldungenService.closeMessage();
    }

    navigateToOsteUebersicht() {
        this.wizardService.navigateToOsteUebersicht();
    }

    private getRouteParams() {
        this.route.params.subscribe(params => {
            this.unternehmenId = params['unternehmenId'];
            this.wizardService.unternehmenId = this.unternehmenId;
        });
        this.route.queryParams.subscribe(params => {
            if (params['osteId']) {
                this.wizardService.setOsteId(params['osteId']);
            }
        });
    }

    private generateWizardUrl() {
        this.step1 = `${this.unternehmenId}/stellenangebote/erfassen/step1`;
        this.step2 = `${this.unternehmenId}/stellenangebote/erfassen/step2`;
        this.step3 = `${this.unternehmenId}/stellenangebote/erfassen/step3`;
        this.step4 = `${this.unternehmenId}/stellenangebote/erfassen/step4`;
    }

    private initToolbox() {
        ToolboxService.CHANNEL = 'osteErfassen';
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getOsteErfassenConfig(), 'osteErfassen', null);
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => PrintHelper.print());
    }
}
