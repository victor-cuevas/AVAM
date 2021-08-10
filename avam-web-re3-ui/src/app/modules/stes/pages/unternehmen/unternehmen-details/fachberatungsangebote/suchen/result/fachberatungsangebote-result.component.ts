import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FachberatungsangebotService, ToolboxService } from '@app/shared';
import { FachberatungsangebotViewDTO } from '@dtos/fachberatungsangebotViewDTO';
import { Unsubscribable } from 'oblique-reactive';
import { filter, takeUntil } from 'rxjs/operators';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { FacadeService } from '@shared/services/facade.service';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';

@Component({
    selector: 'avam-fachberatungsangebote-result',
    templateUrl: './fachberatungsangebote-result.component.html'
})
export class FachberatungsangeboteResultComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    readonly stateKey = 'fachberatungsangebote-result';
    results: FachberatungsangebotViewDTO[] = [];
    searchDone = false;

    get channel(): string {
        return this.service.fachberatungsangeboteResultChannel;
    }

    constructor(private service: FachberatungsangebotService, private facadeService: FacadeService, private sessionService: SearchSessionStorageService) {
        super();
        ToolboxService.CHANNEL = this.service.fachberatungsangeboteResultChannel;
    }

    ngOnInit(): void {
        this.configureToolbox();
        this.service.fachberatungsangeboteSubject.pipe(takeUntil(this.unsubscribe)).subscribe((dtos: FachberatungsangebotViewDTO[]) => {
            this.results = dtos;
            this.searchDone = true;
        });
    }

    onReset(): void {
        this.results = [];
        this.searchDone = false;
        this.sessionService.restoreDefaultValues(this.stateKey);
    }

    ngOnDestroy(): void {
        this.facadeService.toolboxService.resetConfiguration();
        this.service.resetInfopanel();
        super.ngOnDestroy();
    }

    open(dto: FachberatungsangebotViewDTO): void {
        this.service.navigateToFachberatungsangebotBearbeitenFromSuchen(dto.fachberatungsangebotId, dto.unternehmenId);
    }

    private configureToolbox(): void {
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getFachberatungsangebotSuchenConfig(), null, null);
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(
                filter(action => action.message.action === ToolboxActionEnum.PRINT),
                takeUntil(this.unsubscribe)
            )
            .subscribe(() => this.facadeService.openModalFensterService.openPrintModal(this.modalPrint, this.results));
    }
}
