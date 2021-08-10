import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxService } from '@app/shared';
import { UnternehmenTerminViewDTO } from '@dtos/unternehmenTerminViewDTO';
import { KontaktService } from '@shared/services/kontakt.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { Permissions } from '@shared/enums/permissions.enum';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-kontakte',
    templateUrl: './kontakte.component.html'
})
export class KontakteComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    readonly stateKey = 'kontakte';
    unternehmenId: number;
    resultsData: UnternehmenTerminViewDTO[];
    readonly resultSpinnerChannel = 'kontakteResults';
    permissions: typeof Permissions = Permissions;
    readonly channel = 'kontakte-channel';

    constructor(private activatedRoute: ActivatedRoute, private facadeService: FacadeService, private kontaktService: KontaktService) {
        super();
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit(): void {
        this.kontaktService.closeMessage();
        this.kontaktService.updateInformation({ subtitle: 'unternehmen.label.kontakte' });
        this.subscribeToData();
        this.observePrintAction();
    }

    ngOnDestroy(): void {
        this.kontaktService.updateInformation({ tableCount: undefined });
        this.facadeService.toolboxService.sendConfiguration([]);
    }

    openKontakt(kontakt: UnternehmenTerminViewDTO): void {
        this.kontaktService.navigateToKontaktBearbeiten(kontakt.unternehmenTerminID, this.activatedRoute);
    }

    kontaktErfassen(): void {
        this.kontaktService.navigateToKontaktErfassen(this.activatedRoute);
    }

    private subscribeToData(): void {
        this.kontaktService.kontakteListSubject.pipe(takeUntil(this.unsubscribe)).subscribe((dtos: UnternehmenTerminViewDTO[]) => {
            this.resultsData = dtos;
        });
        this.activatedRoute.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.unternehmenId = params['unternehmenId'];
            this.kontaktService.getKontakteByUnternehmenId(this.unternehmenId, this.resultSpinnerChannel);
            this.initToolbox(this.unternehmenId);
        });
    }
    private initToolbox(unternehmenId: number): void {
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getKontakteConfig(), this.channel, ToolboxDataHelper.createForKontakteByUnternehmenId(unternehmenId));
    }

    private observePrintAction(): void {
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.kontaktService.openBigModal(this.modalPrint));
    }
}
