import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Permissions } from '@shared/enums/permissions.enum';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { filter, takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { FachberatungsangebotViewDTO } from '@dtos/fachberatungsangebotViewDTO';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { FachberatungsangebotService, ToolboxService } from '@app/shared';
import { CodeDTO } from '@dtos/codeDTO';
import { UnternehmenStatusCodeEnum } from '@shared/enums/domain-code/unternehmen-status-code.enum';
import { WarningMessages } from '@dtos/warningMessages';
import { UnternehmenDTO } from '@dtos/unternehmenDTO';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-fachberatungsangebote',
    templateUrl: './fachberatungsangebote.component.html'
})
export class FachberatungsangeboteComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    stateKey = 'fachberatungsangebote';
    unternehmenId: number;
    resultsData: FachberatungsangebotViewDTO[] = [];
    showErfassen = true;
    permissions: typeof Permissions = Permissions;
    readonly channel = 'fachberatungsangebote-channel';

    constructor(private router: Router, private activatedRoute: ActivatedRoute, private service: FachberatungsangebotService, private facadeService: FacadeService) {
        super();
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.service.updateInfoPanel({ subtitle: 'stes.label.fachberatung.trefferlisteFachberatungsangebot' });
        this.setSubscribtions();
    }

    ngOnDestroy(): void {
        this.service.resetInfopanel();
        this.facadeService.toolboxService.sendConfiguration([]);
    }

    angebotErfassen(): void {
        this.service.navigateToFachberatungsangebotErfassen(this.activatedRoute);
    }

    openFachberatungsangebot(dto: FachberatungsangebotViewDTO): void {
        this.service.navigateToFachberatungsangebotBearbeiten(this.activatedRoute, dto.fachberatungsangebotId);
    }

    private setSubscribtions(): void {
        this.activatedRoute.parent.params.subscribe((params: Params) => {
            const unternehmenIdParam = params['unternehmenId'];
            this.service.searchBy(unternehmenIdParam, this.channel);
            this.unternehmenId = unternehmenIdParam;
            this.initToolbox(this.unternehmenId);
            this.service.getUnternehmen(this.unternehmenId.toString()).subscribe((unternehmen: UnternehmenDTO) => {
                this.checkUnternehmenStatus(unternehmen.statusObject);
            });
        });
        this.service.fachberatungsangeboteSubject.pipe(takeUntil(this.unsubscribe)).subscribe((dtos: FachberatungsangebotViewDTO[]) => {
            this.resultsData = dtos;
            this.service.updateInfoPanel({ tableCount: this.resultsData.length });
        });
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(
                filter(action => action.message.action === ToolboxActionEnum.PRINT),
                takeUntil(this.unsubscribe)
            )
            .subscribe(() => this.facadeService.openModalFensterService.openPrintModal(this.modalPrint, this.resultsData));
    }

    private checkUnternehmenStatus(statusObject: CodeDTO): void {
        this.showErfassen = statusObject.code === UnternehmenStatusCodeEnum.STATUS_AKTIV || statusObject.code === UnternehmenStatusCodeEnum.STATUS_INAKTIV_AVAM;
        if (!this.showErfassen) {
            this.facadeService.fehlermeldungenService.showMessage('stes.message.fachberatung.unternehmeninaktiv', WarningMessages.KeyEnum.INFO.toLowerCase());
        }
    }

    private initToolbox(unternehmenId: number): void {
        this.facadeService.toolboxService.sendConfiguration(
            ToolboxConfig.getFachberatungsangeboteConfig(),
            this.channel,
            ToolboxDataHelper.createForFachberatungUebersicht(unternehmenId)
        );
    }
}
