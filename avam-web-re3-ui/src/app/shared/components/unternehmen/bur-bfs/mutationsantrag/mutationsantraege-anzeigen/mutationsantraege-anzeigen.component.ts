import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { MutationsAntragBfsDTO } from '@dtos/mutationsAntragBfsDTO';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { FormUtilsService, ToolboxService } from '@app/shared';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { BaseResponseWrapperListMutationsAntragBfsDTOWarningMessages } from '@dtos/baseResponseWrapperListMutationsAntragBfsDTOWarningMessages';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { filter, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BFSAntragsStatusCode } from '@shared/enums/domain-code/bfs-antrag-status-code.enum';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';

@Component({
    selector: 'avam-mutationsantraege-anzeigen',
    templateUrl: './mutationsantraege-anzeigen.component.html',
    styleUrls: ['./mutationsantraege-anzeigen.component.scss']
})
export class MutationsantraegeAnzeigenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    public channel = 'mutationsantraege';
    public tableConfig;
    public readonly toolboxChannel = 'mutationsantraege-channel';
    private printColumns: any;
    private printConfig: any;
    private unternehmenId: number;
    private baseTableConfig = {
        columns: [
            {
                columnDef: 'mutationsAntragDatum',
                header: 'unternehmen.label.antragsdatum',
                cell: (element: any) => `${this.formUtils.formatDateNgx(element.mutationsAntragDatum, FormUtilsService.GUI_DATE_FORMAT)}`
            },
            {
                columnDef: 'meldungsDatum',
                header: 'unternehmen.label.antwortdatumbfs',
                cell: (element: any) => `${this.formUtils.formatDateNgx(element.meldungsDatum, FormUtilsService.GUI_DATE_FORMAT) || ''}`
            },
            {
                columnDef: 'status',
                header: 'unternehmen.label.burstatus',
                cell: (element: any) => `${this.dbTranslateService.translate(element.status, 'text') || ''}`
            },
            { columnDef: 'ansprechpersonAvam', header: 'common.label.bearbeitungdurch', cell: (element: any) => `${element.ansprechpersonAvam || ''}` },
            { columnDef: 'actions', header: 'common.button.oeffnen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'status',
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
        ToolboxService.CHANNEL = this.toolboxChannel;
    }

    public ngOnInit() {
        this.setTableData([]);
        this.infopanelService.updateInformation({ subtitle: 'unternehmen.label.mutationsantraege' });
        this.getUnternehmenId();
        this.initToolBox();
    }

    public ngAfterViewInit(): void {
        this.spinnerService.activate(this.channel);
        this.getData();
    }

    public ngOnDestroy(): void {
        this.toolboxService.sendConfiguration([]);
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    public selectItem(selectedRow): void {
        this.router.navigate([`./bearbeiten`], { queryParams: { mutationsAntragId: selectedRow.additionalData.mutationsAntragId }, relativeTo: this.activatedRoute });
    }

    public applySort(event) {
        if (event.field === 'status') {
            event.data.sort((value1, value2) => {
                const aStatus = value1.status.code;
                const bStatus = value2.status.code;
                if (this.shouldMoveDown(aStatus, bStatus)) {
                    return -1 * event.order;
                }
                if (this.shouldMoveUp(aStatus, bStatus)) {
                    return 1 * event.order;
                }
                return 0;
            });
        } else if (event.field === 'mutationsAntragDatum') {
            this.sortDates(event, 'mutationsAntragDatum');
        } else if (event.field === 'meldungsDatum') {
            this.sortDates(event, 'meldungsDatum');
        } else if (event.field === 'ansprechpersonAvam') {
            event.data.sort((value1, value2) => {
                return value1.ansprechpersonAvam.localeCompare(value2.ansprechpersonAvam) * event.order;
            });
        }
    }

    private sortDates(event, prop) {
        event.data.sort((value1, value2) => {
            if (value1[prop] < value2[prop]) {
                return -1 * event.order;
            }
            if (value1[prop] > value2[prop]) {
                return 1 * event.order;
            }
            return 0;
        });
    }

    private shouldMoveDown(aStatus, bStatus) {
        return (
            (this.isBeantwortet(aStatus) && this.isPendent(bStatus)) || (aStatus === BFSAntragsStatusCode.NICHTTRANSFERIERT && bStatus !== BFSAntragsStatusCode.NICHTTRANSFERIERT)
        );
    }

    private isBeantwortet(status) {
        return status === BFSAntragsStatusCode.BEANTWORTET || status === BFSAntragsStatusCode.BEANTWORTET2 || status === BFSAntragsStatusCode.BEANTWORTET3;
    }

    private isPendent(status) {
        return status === BFSAntragsStatusCode.PENDENT || status === BFSAntragsStatusCode.PENDENT2;
    }

    private shouldMoveUp(aStatus, bStatus) {
        return (
            (this.isBeantwortet(aStatus) && bStatus === BFSAntragsStatusCode.NICHTTRANSFERIERT) ||
            (this.isPendent(aStatus) && (bStatus !== BFSAntragsStatusCode.PENDENT && bStatus !== BFSAntragsStatusCode.PENDENT2)) ||
            (this.isBeantwortet(bStatus) && aStatus === BFSAntragsStatusCode.NICHTTRANSFERIERT) ||
            (this.isPendent(bStatus) && (aStatus !== BFSAntragsStatusCode.PENDENT && aStatus !== BFSAntragsStatusCode.PENDENT2))
        );
    }

    private getUnternehmenId() {
        this.activatedRoute.parent.params.subscribe(parentData => {
            if (parentData && parentData['unternehmenId']) {
                this.unternehmenId = parentData['unternehmenId'];
            }
        });
    }

    private getData() {
        this.unternehmenRestService
            .getMutationsAntraege(this.unternehmenId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperListMutationsAntragBfsDTOWarningMessages) => {
                    this.setTableData(response.data);
                    this.spinnerService.deactivate(this.channel);
                    this.infopanelService.updateInformation({ tableCount: response.data.length });
                },
                () => this.spinnerService.deactivate(this.channel)
            );
    }

    private setTableData(data: MutationsAntragBfsDTO[]) {
        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.sortDates({ data, order: this.tableConfig.config.sortOrder }, 'mutationsAntragDatum');
        this.tableConfig.data = data.length ? data.map(row => this.createRow(row)) : [];
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
    }

    private createRow(data: MutationsAntragBfsDTO) {
        const fullName =
            data.ansprechpersonAvamObject && data.ansprechpersonAvamObject.vorname && data.ansprechpersonAvamObject.nachname
                ? `${data.ansprechpersonAvamObject.nachname} ${data.ansprechpersonAvamObject.vorname}`
                : '';
        return {
            mutationsAntragDatum: data.mutationsAntragDatum,
            meldungsDatum: data.meldungsDatum,
            status: data.mutationsAntragStatusObject,
            ansprechpersonAvam: fullName,
            additionalData: data
        };
    }

    private initToolBox() {
        this.printColumns = this.tableConfig.columns.filter(item => item.columnDef !== 'actions');
        this.printConfig = {
            ...this.tableConfig.config,
            displayedColumns: this.printColumns.map(c => c.columnDef)
        };
        this.toolboxService.sendConfiguration(
            ToolboxConfig.getMutationsAntraegeConfig(),
            this.toolboxChannel,
            ToolboxDataHelper.createForKontaktpersonByUnternehmenId(this.unternehmenId)
        );
        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.modalService.open(this.modalPrint, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' }));
    }
}
