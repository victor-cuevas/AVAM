import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RegelGeKoDTO } from '@dtos/regelGeKoDTO';
import { GekoRegelService } from '@shared/services/geko-regel.service';
import { BaseResponseWrapperListRegelGeKoDTOWarningMessages } from '@dtos/baseResponseWrapperListRegelGeKoDTOWarningMessages';
import { ToolboxService } from '@app/shared';
import { filter, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { Unsubscribable } from 'oblique-reactive';

@Component({
    selector: 'avam-geschaeftsregeln',
    templateUrl: './geschaeftsregeln.component.html'
})
export class GeschaeftsregelnComponent extends Unsubscribable implements OnInit, OnDestroy {
    data: RegelGeKoDTO[];
    readonly resultSpinnerChannel = 'geschaeftsregelnResults';
    @ViewChild('modalPrint') modalPrint: ElementRef;

    constructor(private service: GekoRegelService) {
        super();
        ToolboxService.CHANNEL = this.resultSpinnerChannel;
    }

    ngOnInit(): void {
        this.initHeader();
        this.configureToolbox();
        this.service.search().subscribe(
            (response: BaseResponseWrapperListRegelGeKoDTOWarningMessages) => {
                this.data = response.data;
                this.service.dispatchHeader({ tableCount: response.data.length });
                this.service.facade.spinnerService.deactivate(this.resultSpinnerChannel);
            },
            () => this.service.facade.spinnerService.deactivate(this.resultSpinnerChannel)
        );
    }

    ngOnDestroy(): void {
        this.service.facade.toolboxService.resetConfiguration();
        this.service.facade.fehlermeldungenService.closeMessage();
        this.service.dispatchHeader({ tableCount: undefined });
        super.ngOnDestroy();
    }

    openGeschaeftsregel(row: RegelGeKoDTO): void {
        this.service.navigateToGeschaeftsregelBearbeiten(row.regelId);
    }

    geschaeftsregelErfassen(): void {
        this.service.navigateToGeschaeftsregelErfassen();
    }

    private configureToolbox(): void {
        this.service.facade.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.service.facade.openModalFensterService.openPrintModal(this.modalPrint, this.data));
        this.service.facade.toolboxService.sendConfiguration(ToolboxConfig.getGeKoGeschaeftsregelnConfig(), this.resultSpinnerChannel);
    }

    private initHeader(): void {
        this.service.dispatchHeader({
            title: 'geko.subnavmenuitem.geschaeftsregeln'
        });
    }
}
