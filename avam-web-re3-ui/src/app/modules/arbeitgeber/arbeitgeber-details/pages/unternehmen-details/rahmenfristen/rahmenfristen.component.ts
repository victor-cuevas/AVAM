import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FacadeService } from '@shared/services/facade.service';
import { ToolboxService } from '@app/shared';
import { Unsubscribable } from 'oblique-reactive';
import { RahmenfristKaeSweDTO } from '@dtos/rahmenfristKaeSweDTO';
import { RahmenfristKaeSweService } from '@modules/arbeitgeber/services/rahmenfrist-kae-swe.service';
import { BaseResponseWrapperListRahmenfristKaeSweDTOWarningMessages } from '@dtos/baseResponseWrapperListRahmenfristKaeSweDTOWarningMessages';
import { filter, map, takeUntil } from 'rxjs/operators';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';

@Component({
    selector: 'avam-rahmenfristen-kae-swe',
    templateUrl: './rahmenfristen.component.html'
})
export class RahmenfristenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('modalDetails') modalDetails: ElementRef;
    @ViewChild('modalZahlungen') modalZahlungen: ElementRef;

    readonly channel = 'rahmenfristen-kae-swe';
    dataSource: RahmenfristKaeSweDTO[] = [];
    unternehmenId: number;
    private static readonly TITLE = 'kaeswe.label.rahmenfristen';
    private static readonly UNTERNEHMEN_ID = 'unternehmenId';
    private selectedRahmenfristId: number;

    constructor(private route: ActivatedRoute, private service: RahmenfristKaeSweService, private facadeService: FacadeService) {
        super();
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit(): void {
        this.initHeader();
        this.observeUnternehmenId();
        this.observePrintAction();
    }

    ngOnDestroy(): void {
        this.resetHeader();
        super.ngOnDestroy();
    }

    // The button labeled "Details pro Rahmenfrist" opens the Rahmenfrist Zahlungen modal (UI 0215-026)
    openRahmenfristZahlungenModal(row: any) {
        this.selectedRahmenfristId = row.betriebsabteilungObject.unternehmenId;
        this.facadeService.openModalFensterService.openXLModal(this.modalZahlungen);
    }

    // The button labeled "Rahmenfrist / Zahlungen" opens the Rahmenfrist Details modal (UI 0215-025)
    openRahmenfristDetailsModal() {
        this.facadeService.openModalFensterService.openXLModal(this.modalDetails);
    }

    private resetHeader(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.service.infopanelService.updateInformation({ tableCount: undefined });
        this.facadeService.toolboxService.resetConfiguration();
    }

    private initHeader(): void {
        this.service.infopanelService.updateInformation({ subtitle: RahmenfristenComponent.TITLE });
    }

    private observeUnternehmenId(): void {
        this.route.parent.params.subscribe(params => {
            this.unternehmenId = params[RahmenfristenComponent.UNTERNEHMEN_ID];
            this.loadData();
            this.facadeService.toolboxService.sendConfiguration(
                ToolboxConfig.getRahmenfristenKaeSweConfig(),
                this.channel,
                ToolboxDataHelper.createByUnternehmenId(this.unternehmenId)
            );
        });
    }

    private observePrintAction(): void {
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(
                filter(action => action.message.action === ToolboxActionEnum.PRINT),
                takeUntil(this.unsubscribe)
            )
            .subscribe(() => this.facadeService.openModalFensterService.openPrintModal(this.modalPrint, this.dataSource));
    }

    private loadData(): void {
        this.facadeService.spinnerService.activate(this.channel);
        this.service
            .searchByUnternehmenId(this.unternehmenId)
            .pipe(
                map((response: BaseResponseWrapperListRahmenfristKaeSweDTOWarningMessages) => response.data),
                filter((data: RahmenfristKaeSweDTO[]) => data !== null && data !== undefined)
            )
            .subscribe(
                (data: RahmenfristKaeSweDTO[]) => {
                    this.dataSource = data;
                    this.service.infopanelService.updateInformation({ tableCount: this.dataSource.length });
                    this.facadeService.spinnerService.deactivate(this.channel);
                },
                () => {
                    this.service.infopanelService.updateInformation({ tableCount: 0 });
                    this.facadeService.spinnerService.deactivate(this.channel);
                }
            );
    }
}
