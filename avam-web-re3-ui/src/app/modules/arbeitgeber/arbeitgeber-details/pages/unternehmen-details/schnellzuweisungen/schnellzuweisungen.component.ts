import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { FormUtilsService, ToolboxService } from '@app/shared';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { filter, takeUntil } from 'rxjs/operators';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SchnellzuweisungListeViewDTO } from '@dtos/schnellzuweisungListeViewDTO';
import { BaseResponseWrapperListSchnellzuweisungListeViewDTOWarningMessages } from '@dtos/baseResponseWrapperListSchnellzuweisungListeViewDTOWarningMessages';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';

@Component({
    selector: 'avam-schnellzuweisungen',
    templateUrl: './schnellzuweisungen.component.html',
    styleUrls: ['./schnellzuweisungen.component.scss']
})
export class SchnellzuweisungenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    public channel = 'schnellzuweisungen';
    public tableConfig;
    public printColumns: any;
    public printConfig: any;
    private listData: SchnellzuweisungListeViewDTO[];
    private unternehmenId: number;
    private baseTableConfig = {
        columns: [
            {
                columnDef: 'vermittlungVom',
                header: 'arbeitgeber.label.vermittlungVom',
                cell: (element: any) => `${this.formUtils.formatDateNgx(element.vermittlungVom, FormUtilsService.GUI_DATE_FORMAT)}`
            },
            {
                columnDef: 'fullZuweisungNummer',
                header: 'stes.label.fachberatung.zuweisungsnr',
                cell: (element: any) => element.fullZuweisungNummer
            },
            {
                columnDef: 'szuweisStellenbezeichnung',
                header: 'arbeitgeber.label.stellenbezeichnung',
                cell: (element: any) => element.szuweisStellenbezeichnung
            },
            {
                columnDef: 'stesName',
                header: 'common.label.name',
                cell: (element: any) => element.stesName
            },
            {
                columnDef: 'stesVorname',
                header: 'common.label.vorname',
                cell: (element: any) => element.stesVorname
            },
            {
                columnDef: 'stesOrt',
                header: 'common.label.ort',
                cell: (element: any) => element.stesOrt
            },
            {
                columnDef: 'stesIdAvam',
                header: 'arbeitgeber.label.stesId',
                cell: (element: any) => element.stesIdAvam
            },
            {
                columnDef: 'szuweisungStatus',
                header: 'common.label.status',
                cell: (element: any) => element.szuweisungStatus
            },
            {
                columnDef: 'szuweisungVermittlungsstand',
                header: 'stes.label.zuweisungstes.vermittlungsstand',
                cell: (element: any) => element.szuweisungVermittlungsstand
            },
            { columnDef: 'actions', header: 'common.button.oeffnen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'vermittlungVom',
            sortOrder: -1,
            displayedColumns: []
        }
    };

    constructor(
        private infopanelService: AmmInfopanelService,
        private dbTranslateService: DbTranslateService,
        private formUtils: FormUtilsService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private spinnerService: SpinnerService,
        private unternehmenRestService: UnternehmenRestService,
        private toolboxService: ToolboxService,
        private modalService: NgbModal,
        private fehlermeldungenService: FehlermeldungenService
    ) {
        super();
    }

    public ngOnInit() {
        this.setTableData([]);
        this.infopanelService.updateInformation({ subtitle: 'unternehmen.subnavmenuitem.schnellzuweisungen' });
        this.getUnternehmenId();
        this.initToolBox();
        this.dbTranslateService
            .getEventEmitter()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.setTableData(this.listData);
            });
    }

    public ngAfterViewInit(): void {
        this.getData();
    }

    public ngOnDestroy(): void {
        this.toolboxService.sendConfiguration([]);
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    public selectItem(selectedRow): void {
        this.router.navigate([`./bearbeiten`], {
            queryParams: { zuweisungId: selectedRow.additionalData.szuweisungId, stesId: selectedRow.additionalData.stesId },
            relativeTo: this.activatedRoute
        });
    }

    private getUnternehmenId() {
        this.activatedRoute.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(parentData => {
            if (parentData && parentData['unternehmenId']) {
                this.unternehmenId = parentData['unternehmenId'];
            }
        });
    }

    private getData() {
        this.spinnerService.activate(this.channel);
        this.unternehmenRestService
            .getSchnellzuweisungen(this.unternehmenId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperListSchnellzuweisungListeViewDTOWarningMessages) => {
                    if (response.data) {
                        this.listData = response.data;
                        this.setTableData(this.listData);
                        this.infopanelService.updateInformation({ tableCount: response.data.length });
                    }
                    this.spinnerService.deactivate(this.channel);
                    OrColumnLayoutUtils.scrollTop();
                },
                () => {
                    this.spinnerService.deactivate(this.channel);
                    OrColumnLayoutUtils.scrollTop();
                }
            );
    }

    private setTableData(data: SchnellzuweisungListeViewDTO[]) {
        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.tableConfig.data = data.length ? data.map(row => this.createRow(row)) : [];
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
    }

    private createRow(data: SchnellzuweisungListeViewDTO) {
        const stesOrt = this.dbTranslateService.translate(data.stesOrt, 'text');
        const szuweisungVermittlungsstand = this.dbTranslateService.translate(data.szuweisungVermittlungsstand, 'text');
        const szuweisungStatus = this.dbTranslateService.translate(data.szuweisungStatus, 'text');
        return {
            vermittlungVom: data.szuweisungDatumVom,
            fullZuweisungNummer: data.fullZuweisungNummer,
            szuweisStellenbezeichnung: data.szuweisStellenbezeichnung,
            stesName: data.stesName,
            stesVorname: data.stesVorname,
            stesOrt,
            stesIdAvam: data.stesIdAvam,
            szuweisungStatus,
            szuweisungVermittlungsstand,
            additionalData: data
        };
    }

    private initToolBox() {
        this.printColumns = this.tableConfig.columns.filter(item => item.columnDef !== 'actions');
        this.printConfig = {
            ...this.tableConfig.config,
            displayedColumns: this.printColumns.map(c => c.columnDef)
        };
        this.toolboxService.sendConfiguration(ToolboxConfig.getSchnellzuweisungenAnzeigenConfig(), this.channel, ToolboxDataHelper.createForArbeitgeber(this.unternehmenId));
        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.modalService.open(this.modalPrint, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' }));
    }
}
