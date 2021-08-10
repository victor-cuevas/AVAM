import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractKontaktpersonenResult } from '@shared/classes/abstract-kontaktpersonen-result';
import { KontaktpersonService, ToolboxService } from '@app/shared';
import { ActivatedRoute } from '@angular/router';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { Subscription } from 'rxjs';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { filter } from 'rxjs/operators';
import { Permissions } from '@shared/enums/permissions.enum';
import { DmsService } from '@app/shared/services/dms.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-kontaktpersonen',
    templateUrl: './kontaktpersonen.component.html'
})
export class KontaktpersonenComponent extends AbstractKontaktpersonenResult implements OnInit, OnDestroy {
    readonly stateKey = 'kontaktpersonen';
    unternehmenId: number;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    permissions: typeof Permissions = Permissions;
    readonly channel = 'kontaktpersonen-channel';
    private observePrint: Subscription;

    constructor(
        protected kontaktpersonService: KontaktpersonService,
        protected activatedRoute: ActivatedRoute,
        protected dmsService: DmsService,
        protected facadeService: FacadeService,
        private infopanelService: AmmInfopanelService
    ) {
        super(kontaktpersonService, activatedRoute, facadeService, dmsService);
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.facadeService.fehlermeldungenService.closeMessage();
        this.infopanelService.updateInformation({ subtitle: 'unternehmen.label.kontaktpersonen' });
        this.activatedRoute.parent.params.subscribe(params => {
            this.kontaktpersonService.getKontaktpersonenByUnternehmenId(params['unternehmenId']);
            this.unternehmenId = params['unternehmenId'];
            this.initToolbox(this.unternehmenId);
        });
        this.observePrintAction();
    }

    ngOnDestroy(): void {
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.facadeService.toolboxService.sendConfiguration([]);
        this.observePrint.unsubscribe();
        super.ngOnDestroy();
    }

    kontaktpersonErfassen(): void {
        this.kontaktpersonService.navigateToKontaktpersonenErfassen(this.unternehmenId, this.activatedRoute);
    }

    private initToolbox(unternehmenId: number): void {
        this.facadeService.toolboxService.sendConfiguration(
            ToolboxConfig.getKontaktpersonenConfig(),
            this.channel,
            ToolboxDataHelper.createForKontaktpersonByUnternehmenId(unternehmenId)
        );
    }

    private observePrintAction(): void {
        this.observePrint = this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .subscribe(() => this.kontaktpersonService.openBigModal(this.modalPrint));
    }
}
