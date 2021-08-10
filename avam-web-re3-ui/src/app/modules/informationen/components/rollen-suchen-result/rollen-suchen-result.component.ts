import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { RolleDTO } from '@dtos/rolleDTO';
import { ToolboxService } from '@app/shared';
import { filter, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { FacadeService } from '@shared/services/facade.service';
import { Unsubscribable } from 'oblique-reactive';

@Component({
    selector: 'avam-rollen-suchen-result',
    templateUrl: './rollen-suchen-result.component.html'
})
export class RollenSuchenResultComponent extends Unsubscribable implements OnInit {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @Input() stateKey: string;
    @Input('showBadge') showBadge: boolean;
    @Input('resultsData') resultsData: RolleDTO[];
    @Output() onOpenRolle: EventEmitter<RolleDTO> = new EventEmitter();
    private readonly toolboxChannel = 'rollenSuchenResult';

    constructor(private facadeService: FacadeService) {
        super();
        ToolboxService.CHANNEL = this.toolboxChannel;
    }

    ngOnInit() {
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.facadeService.openModalFensterService.openXLModal(this.modalPrint);
            });
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getRollenSuchenConfig());
    }

    openRolle(rolle: RolleDTO): void {
        this.onOpenRolle.emit(rolle);
    }
}
