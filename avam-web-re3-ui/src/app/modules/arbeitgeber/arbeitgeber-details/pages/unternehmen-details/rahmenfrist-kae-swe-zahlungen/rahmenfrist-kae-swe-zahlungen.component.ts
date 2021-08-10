import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Unsubscribable } from 'oblique-reactive';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { FacadeService } from '@shared/services/facade.service';
import { RahmenfristKaeSweService } from '@modules/arbeitgeber/services/rahmenfrist-kae-swe.service';
import { filter, takeUntil } from 'rxjs/operators';
import { F1000OutputDTO } from '@dtos/f1000OutputDTO';
import { forkJoin, Subscription } from 'rxjs';
import { RahmenfristKaeSweDetailDTO } from '@dtos/rahmenfristKaeSweDetailDTO';
import { FormUtilsService, ToolboxService } from '@app/shared';
import { BaseResponseWrapperRahmenfristKaeSweDetailDTOWarningMessages } from '@dtos/baseResponseWrapperRahmenfristKaeSweDetailDTOWarningMessages';
import { BaseResponseWrapperListF1000OutputDTOWarningMessages } from '@dtos/baseResponseWrapperListF1000OutputDTOWarningMessages';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';

@Component({
    selector: 'avam-rahmenfrist-kae-swe-zahlungen',
    templateUrl: './rahmenfrist-kae-swe-zahlungen.component.html'
})
export class RahmenfristKaeSweZahlungenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalZahlungen') modalZahlungen: ElementRef;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    tableDataSource: F1000OutputDTO[] = [];
    readonly channel = 'rahmenfrist-kae-swe-zahlungen-channel';
    private static readonly SIDE_NAVI_ITEM_PATH = './rahmenfristen/zahlungen';
    private rahmenfristId: number;
    private rahmenfristData: RahmenfristKaeSweDetailDTO;
    private observePrint: Subscription;
    private unternehmenId: number;

    constructor(private activatedRoute: ActivatedRoute, private facadeService: FacadeService, private rahmenfirstService: RahmenfristKaeSweService) {
        super();
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.observeRouteParams();
        this.observeNavItemClose();
        this.observeLangChange();
        this.observePrintAction();
    }

    ngOnDestroy() {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.facadeService.toolboxService.resetConfiguration();
        this.observePrint.unsubscribe();
        this.rahmenfirstService.infopanelService.updateInformation({ tableCount: undefined });
        super.ngOnDestroy();
    }

    openModalZahlungen(): void {
        this.facadeService.openModalFensterService.openXLModal(this.modalZahlungen);
    }

    cancel(): void {
        this.hideNavigationTreeRoute();
        this.rahmenfirstService.redirectToSibling(this.activatedRoute, '../anzeigen', this.rahmenfristId);
    }

    private observeNavItemClose(): void {
        this.facadeService.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((message: { type: string; data: any }) => {
                if (message.type === 'close-nav-item' && message.data) {
                    this.cancel();
                }
            });
    }

    private observeRouteParams(): void {
        this.activatedRoute.queryParamMap.subscribe((params: ParamMap) => {
            this.rahmenfristId = +params.get('rahmenfristId');
            this.facadeService.navigationService.showNavigationTreeRoute(RahmenfristKaeSweZahlungenComponent.SIDE_NAVI_ITEM_PATH, this.getQueryParams());
            this.loadData();
        });
        this.activatedRoute.parent.params.subscribe((params: ParamMap) => {
            this.unternehmenId = params['unternehmenId'];
            this.facadeService.toolboxService.sendConfiguration(
                ToolboxConfig.getRahmenfristKaeSweZahlungenConfig(),
                this.channel,
                ToolboxDataHelper.createByUnternehmenId(this.unternehmenId)
            );
        });
    }

    private getQueryParams(): any {
        return { rahmenfristId: this.rahmenfristId };
    }

    private loadData(): void {
        this.facadeService.spinnerService.activate(this.channel);
        forkJoin<BaseResponseWrapperRahmenfristKaeSweDetailDTOWarningMessages, BaseResponseWrapperListF1000OutputDTOWarningMessages>(
            this.rahmenfirstService.getRahmenfrist(this.rahmenfristId),
            this.rahmenfirstService.getASALZahlungen(this.rahmenfristId)
        ).subscribe(
            ([rahmenfristRes, zahlungenRes]) => {
                this.rahmenfristData = rahmenfristRes.data;
                this.tableDataSource = zahlungenRes.data;
                this.initHeader();
                this.rahmenfirstService.infopanelService.updateInformation({ tableCount: this.tableDataSource ? this.tableDataSource.length : 0 });
                this.facadeService.spinnerService.deactivate(this.channel);
            },
            () => {
                this.rahmenfirstService.infopanelService.updateInformation({ tableCount: 0 });
                this.facadeService.spinnerService.deactivate(this.channel);
            }
        );
    }

    private initHeader(): void {
        const zahlungenKaeSweLabel = this.facadeService.translateService.instant('kaeswe.label.zahlungenKaeSwe');
        this.rahmenfirstService.infopanelService.updateInformation({
            subtitle: zahlungenKaeSweLabel + this.getRahmenfristVonBis()
        });
    }

    private getRahmenfristVonBis(): string {
        return ` - ${this.facadeService.formUtilsService.formatDateNgx(
            this.rahmenfristData.rahmenfristBeginn,
            FormUtilsService.GUI_DATE_FORMAT
        )} - ${this.facadeService.formUtilsService.formatDateNgx(this.rahmenfristData.rahmenfristEnde, FormUtilsService.GUI_DATE_FORMAT)}`;
    }

    private observeLangChange(): void {
        this.facadeService.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => this.initHeader());
    }

    private hideNavigationTreeRoute(): void {
        this.facadeService.navigationService.hideNavigationTreeRoute(RahmenfristKaeSweZahlungenComponent.SIDE_NAVI_ITEM_PATH, this.getQueryParams());
    }

    private observePrintAction(): void {
        this.observePrint = this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .subscribe(() => this.facadeService.openModalFensterService.openPrintModal(this.modalPrint, this.tableDataSource));
    }
}
