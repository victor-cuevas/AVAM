import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ToolboxService } from '@app/shared';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { filter, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { Unsubscribable } from 'oblique-reactive';
import { FacadeService } from '@shared/services/facade.service';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { ContentService } from '@shared/components/unternehmen/common/content/content.service';
import { MeldungenVerifizierenWizardService } from '@shared/components/new/avam-wizard/meldungen-verifizieren-wizard.service';

@Component({
    selector: 'avam-stelle-uebernehmen',
    templateUrl: './stelle-uebernehmen.component.html',
    styleUrls: []
})
export class StelleUebernehmenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    constructor(
        private facadeService: FacadeService,
        private infopanelService: AmmInfopanelService,
        private contentService: ContentService,
        private wizardService: MeldungenVerifizierenWizardService
    ) {
        super();
    }

    ngOnInit() {
        if (this.wizardService.unternehmenId) {
            this.contentService.getUnternehmen(this.wizardService.unternehmenId);
            this.infopanelService.updateInformation({ hideInfobar: false });
            this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
            this.initToolbox();
        } else {
            this.wizardService.selectCurrentStep(0);
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.infopanelService.updateInformation({ hideInfobar: true });
        this.infopanelService.resetTemplateInInfobar();
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
