import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { BaseResponseWrapperListBeschaeftigterBerufDTOWarningMessages } from '@dtos/baseResponseWrapperListBeschaeftigterBerufDTOWarningMessages';
import { BeschaeftigterBerufDTO } from '@dtos/beschaeftigterBerufDTO';
import { ToolboxService } from '@app/shared';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { Permissions } from '@shared/enums/permissions.enum';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { MessageBus } from '@shared/services/message-bus';
import { TranslateService } from '@ngx-translate/core';
import { MeldepflichtEnum } from '@shared/enums/table-icon-enums';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';

@Component({
    selector: 'avam-berufe-taetigkeit',
    templateUrl: './berufe-taetigkeit.component.html',
    styleUrls: ['./berufe-taetigkeit.component.scss']
})
export class BerufeTaetigkeitComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    public channel = 'berufe-taetigkeit';
    public unternehmenId;
    public listBeschaeftigterBeruf: BeschaeftigterBerufDTO[];
    permissions: typeof Permissions = Permissions;
    public tableConfig;
    private baseTableConfig = {
        columns: [
            {
                columnDef: 'flag',
                header: '',
                fixWidth: true,
                cell: (element: any) => element.flag
            },
            {
                columnDef: 'berufetaetigkeit',
                header: 'arbeitgeber.label.berufe-taetigkeit',
                cell: (element: any) => `${element.berufetaetigkeit}`
            },
            {
                columnDef: 'temporaer',
                header: 'arbeitgeber.label.temporaer',
                cell: (element: any) => `${this.translateService.instant(element.temporaer ? 'common.label.ja' : 'common.label.nein') || ''}`
            },
            {
                columnDef: 'praktikumstellen',
                header: 'amm.massnahmen.subnavmenuitem.praktikumsstellen',
                cell: (element: any) => `${this.translateService.instant(element.praktikumstellen ? 'common.label.ja' : 'common.label.nein') || ''}`
            },
            {
                columnDef: 'lehrstellen',
                header: 'arbeitgeber.label.lehrstellen',
                cell: (element: any) => `${this.translateService.instant(element.lehrstellen ? 'common.label.ja' : 'common.label.nein') || ''}`
            },
            { columnDef: 'actions', header: '', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'berufetaetigkeit',
            sortOrder: 1,
            displayedColumns: []
        }
    };
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private toolboxService: ToolboxService,
        public spinnerService: SpinnerService,
        private unternehmenRestService: UnternehmenRestService,
        public messageBus: MessageBus,
        private translateService: TranslateService,
        private infopanelService: AmmInfopanelService,
        private dbTranslateService: DbTranslateService
    ) {
        super();
    }

    public ngOnInit() {
        this.infopanelService.updateInformation({ subtitle: 'arbeitgeber.label.berufe-taetigkeit' });
        this.setTableData([]);
        this.getRouteData();
        this.initToolBox();
        this.setSubscription();
    }

    public ngAfterViewInit(): void {
        this.getData();
    }

    public ngOnDestroy(): void {
        this.infopanelService.updateInformation({ tableCount: undefined });
        super.ngOnDestroy();
    }

    public selectItem(selectedRow) {
        this.router.navigate(['./bearbeiten'], { queryParams: { beschaeftigterBerufId: selectedRow.id }, relativeTo: this.activatedRoute });
    }

    public getData(): void {
        this.spinnerService.activate(this.channel);
        this.unternehmenRestService
            .getArbeitgeberBeschaeftigterBerufByUnternehmenId(this.unternehmenId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperListBeschaeftigterBerufDTOWarningMessages) => {
                    if (response.data) {
                        this.listBeschaeftigterBeruf = response.data;
                        this.setTableData(this.listBeschaeftigterBeruf);
                    }
                    this.spinnerService.deactivate(this.channel);
                },
                () => this.spinnerService.deactivate(this.channel)
            );
    }

    public berufErfassen(): void {
        this.router.navigate(['./erfassen'], { relativeTo: this.activatedRoute });
    }

    private getRouteData(): void {
        this.activatedRoute.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(parentData => {
            if (parentData && parentData['unternehmenId']) {
                this.unternehmenId = parentData['unternehmenId'];
            }
        });
    }

    private initToolBox(): void {
        ToolboxService.CHANNEL = this.channel;
        this.toolboxService.sendConfiguration(ToolboxConfig.getBerufeTaetigkeitAnzeigenConfig(), this.channel, ToolboxDataHelper.createForArbeitgeber(+this.unternehmenId));
        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => PrintHelper.print());
    }

    private setTableData(data: BeschaeftigterBerufDTO[]) {
        this.infopanelService.updateInformation({ tableCount: data.length });
        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.tableConfig.data = data.length ? data.map(row => this.createRow(row)) : [];
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
    }

    private createRow(data: BeschaeftigterBerufDTO) {
        return {
            kantone: data.meldepflichtKantone,
            flag: this.getFlagTypeBSP2AndBSP3(data.meldepflichtKantone),
            id: data.beschaeftigterberufId,
            berufetaetigkeit: this.dbTranslateService.translate(data.berufObject, 'bezeichnungMa') || '',
            temporaer: data.temporaer,
            praktikumstellen: data.praktikumstellen,
            lehrstellen: data.lehrstellen
        };
    }

    private getFlagTypeBSP2AndBSP3(kantone: string) {
        if (kantone) {
            return {
                flagType: MeldepflichtEnum.UNTERLIEGT_LAUFEND,
                tooltip: this.getTooltip(kantone)
            };
        }
        return null;
    }

    private getTooltip(kantone: string) {
        const meldepflichtigCH = 'verzeichnisse.beruf.tooltip.meldepflichtigCH';
        const meldepflichtigIn = 'verzeichnisse.beruf.tooltip.meldepflichtigIn';
        return kantone === 'CH' ? this.translateService.instant(meldepflichtigCH) : ` ${this.translateService.instant(meldepflichtigIn)}  ${kantone}`;
    }

    private setSubscription() {
        this.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.setTableData(this.listBeschaeftigterBeruf);
        });
    }
}
