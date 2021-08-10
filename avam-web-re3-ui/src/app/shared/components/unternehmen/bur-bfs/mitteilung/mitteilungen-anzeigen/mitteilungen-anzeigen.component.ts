import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { ActivatedRoute, Router } from '@angular/router';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { filter, takeUntil } from 'rxjs/operators';
import { BaseResponseWrapperListMitteilungBfsDTOWarningMessages } from '@dtos/baseResponseWrapperListMitteilungBfsDTOWarningMessages';
import { MitteilungBfsDTO } from '@dtos/mitteilungBfsDTO';
import { FormUtilsService, ToolboxService } from '@app/shared';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { BfsMitteilungStatusCodeEnum } from '@shared/enums/domain-code/bfs-mitteilung-status-code.enum';
import { Permissions } from '@shared/enums/permissions.enum';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'avam-mitteilungen-anzeigen',
    templateUrl: './mitteilungen-anzeigen.component.html',
    styleUrls: ['./mitteilungen-anzeigen.component.scss']
})
export class MitteilungenAnzeigenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('mitteilungSenden') mitteilungSenden: ElementRef;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    unternehmenId: string;
    mitteilungenList: MitteilungBfsDTO[];
    mitteilungenAnzeigenChannel: 'mitteilungenAnzeigenChannel';
    permissions: typeof Permissions = Permissions;
    tableConfig: any;
    private printConfig: any;
    private printColumns: any;
    private baseTableConfig = {
        columns: [
            {
                columnDef: 'mitteilungsDatum',
                header: 'unternehmen.label.mitteilungsdatum',
                cell: (element: any) => `${this.formUtils.formatDateNgx(element.mitteilungsDatum, FormUtilsService.GUI_DATE_FORMAT) || ''}`
            },
            {
                columnDef: 'antwortDatum',
                header: 'unternehmen.label.antwortdatumbfs',
                cell: (element: any) => `${this.formUtils.formatDateNgx(element.antwortDatum, FormUtilsService.GUI_DATE_FORMAT) || ''}`
            },
            {
                columnDef: 'status',
                header: 'unternehmen.label.burstatus',
                cell: (element: any) => `${this.dbTranslateService.translate(element.status, 'text') || ''}`
            },
            {
                columnDef: 'ansprechpersonAvam',
                header: 'common.label.bearbeitungdurch',
                cell: (element: any) => `${element.ansprechpersonAvam || ''}`
            },
            { columnDef: 'actions', header: 'common.button.oeffnen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {}
    };

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private formUtils: FormUtilsService,
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private dbTranslateService: DbTranslateService,
        private infopanelService: AmmInfopanelService,
        private restService: UnternehmenRestService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.setTableData([]);
        this.infopanelService.updateInformation({ subtitle: 'unternehmen.label.mitteilungen' });
        this.route.parent.params.subscribe(parentData => {
            if (parentData && parentData['unternehmenId']) {
                this.unternehmenId = parentData['unternehmenId'];
            }
        });
        this.initToolBox();
    }

    public ngAfterViewInit(): void {
        this.getData();
    }

    public ngOnDestroy(): void {
        this.infopanelService.updateInformation({ tableCount: undefined });
        super.ngOnDestroy();
    }

    public openMitteilungSenden(): void {
        this.modalService.open(this.mitteilungSenden, { windowClass: 'avam-modal-md', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
    }

    public selectItem(selectedRow): void {
        this.router.navigate([`./bearbeiten`], { queryParams: { mitteilungId: selectedRow.additionalData.mitteilungBfsId }, relativeTo: this.route });
    }

    public applySort(event) {
        if (event.field === 'status') {
            this.sortByStatus(event);
        } else if (event.field === 'mitteilungsDatum') {
            this.sortDates(event, 'mitteilungsDatum');
        } else if (event.field === 'antwortDatum') {
            this.sortDates(event, 'antwortDatum');
        } else if (event.field === 'ansprechpersonAvam') {
            event.data.sort((value1, value2) => {
                return value1.ansprechpersonAvam.localeCompare(value2.ansprechpersonAvam) * event.order;
            });
        }
    }
    private sortByStatus(event) {
        const currentLang = this.dbTranslateService.getCurrentLang();
        const toSearch = currentLang.substring(0, 1).toUpperCase() + currentLang.substring(1);
        event.data.sort((val1, val2) => event.order * val1.status[`text${toSearch}`].localeCompare(val2.status[`text${toSearch}`]));
    }

    private getData() {
        this.spinnerService.activate(this.mitteilungenAnzeigenChannel);
        this.restService
            .getMitteilungen(this.unternehmenId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperListMitteilungBfsDTOWarningMessages) => {
                    this.spinnerService.deactivate(this.mitteilungenAnzeigenChannel);
                    this.infopanelService.updateInformation({ tableCount: response.data.length });
                    this.mitteilungenList = response.data;
                    response.data.sort(this.firstSortMethod());
                    this.setTableData(response.data);
                },
                () => this.spinnerService.deactivate(this.mitteilungenAnzeigenChannel)
            );
    }

    private setTableData(data: MitteilungBfsDTO[]) {
        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.sortDates({ data, order: this.tableConfig.config.sortOrder }, 'mitteilungsDatum');
        this.tableConfig.data = data.length ? data.map(row => this.createRow(row)) : [];
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
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

    private createRow(data: MitteilungBfsDTO) {
        const fullName =
            data.ansprechpersonAvamObject && data.ansprechpersonAvamObject.vorname && data.ansprechpersonAvamObject.nachname
                ? `${data.ansprechpersonAvamObject.nachname} ${data.ansprechpersonAvamObject.vorname}`
                : '';
        return {
            mitteilungsDatum: data.mitteilungsDatum,
            antwortDatum: data.antwortDatum,
            status: data.mitteilungStatusObject,
            ansprechpersonAvam: fullName,
            additionalData: data
        };
    }

    private initToolBox() {
        ToolboxService.CHANNEL = this.mitteilungenAnzeigenChannel;
        this.printColumns = this.tableConfig.columns.filter(item => item.columnDef !== 'actions');
        this.printConfig = { ...this.tableConfig.config, displayedColumns: this.printColumns.map(c => c.columnDef) };
        this.toolboxService.sendConfiguration(
            ToolboxConfig.getMitteilungenAnzeigenConfig(),
            this.mitteilungenAnzeigenChannel,
            ToolboxDataHelper.createForUnternehmen(+this.unternehmenId)
        );

        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.modalService.open(this.modalPrint, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' }));
    }

    private getSortOrderValueFromStatusCode(code: string): number {
        if (code === BfsMitteilungStatusCodeEnum.PENDENT) {
            return StatusSortPosition.PENDENT.valueOf();
        } else if (code === BfsMitteilungStatusCodeEnum.BEANTWORTET) {
            return StatusSortPosition.BEANTWORTET.valueOf();
        } else {
            return StatusSortPosition.NICHTTRANSFERIERT.valueOf();
        }
    }

    private firstSortMethod() {
        return (p1: MitteilungBfsDTO, p2: MitteilungBfsDTO) => {
            if (p1.mitteilungStatusObject.code !== p2.mitteilungStatusObject.code) {
                return this.getSortOrderValueFromStatusCode(p1.mitteilungStatusObject.code) - this.getSortOrderValueFromStatusCode(p2.mitteilungStatusObject.code);
            } else {
                return new Date(p1.mitteilungsDatum).getTime() - new Date(p2.mitteilungsDatum).getTime();
            }
        };
    }
}
export enum StatusSortPosition {
    PENDENT = 1,
    BEANTWORTET = 2,
    NICHTTRANSFERIERT = 3
}
