import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { StesVMDTO } from '@dtos/stesVMDTO';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToolboxService } from '@app/shared';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';

@Component({
    selector: 'avam-oste-zuweisung-suchen-results',
    templateUrl: './oste-zuweisung-suchen-results.component.html'
})
export class OsteZuweisungSuchenResultsComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;

    @Output() itemSelected = new EventEmitter<number>();
    @Input() set searchResult(dtoArray: StesVMDTO[]) {
        if (!!dtoArray) {
            this.dtoArray = dtoArray;
            this.dtoArray.sort((v1, v2) => v1.stesName.localeCompare(v2.stesName));
            this.dtoArray.sort((v1, v2) => v1.stesWohnort.localeCompare(v2.stesWohnort));
            this.setTableData(this.dtoArray);
        }
    }

    tableConfig: any;
    printColumns: any;
    printConfig: any;

    private dtoArray: StesVMDTO[] = [];
    private baseTableConfig = {
        columns: [
            {
                columnDef: 'beruf',
                header: 'arbeitgeber.label.beruf',
                cell: (element: any) => element.beruf,
                tooltip: (element: any) => element.berufTooltip
            },
            {
                columnDef: 'vermittlungsgrad',
                header: 'common.label.prozentzeichen',
                cell: (element: any) => element.vermittlungsgrad
            },
            {
                columnDef: 'qualifikation',
                header: 'arbeitgeber.oste.label.qualifikation',
                cell: (element: any) => element.qualifikation,
                tooltip: (element: any) => element.qualifikationTooltip
            },
            {
                columnDef: 'stesName',
                header: 'common.label.name',
                cell: (element: any) => element.stesName,
                tooltip: (element: any) => element.stesNameTooltip
            },
            {
                columnDef: 'stesVorname',
                header: 'common.label.vorname',
                cell: (element: any) => element.stesVorname,
                tooltip: (element: any) => element.stesVornameTooltip
            },
            {
                columnDef: 'wohnort',
                header: 'stes.vermittlung.label.adressewohnort',
                cell: (element: any) => element.wohnort
            },
            {
                columnDef: 'erwerbssituation',
                header: 'stes.label.erwerbssituation',
                cell: (element: any) => element.erwerbssituation
            },
            {
                columnDef: 'gesucht',
                header: 'erweitertesuche.label.gesucht',
                cell: (element: any) => element.gesucht
            },
            { columnDef: 'actions', header: 'common.button.uebernehmen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'gesucht',
            sortOrder: 1,
            displayedColumns: []
        }
    };

    constructor(
        private modalService: NgbModal,
        private toolboxService: ToolboxService,
        private infopanelService: AmmInfopanelService,
        private translateService: TranslateService,
        private dbTranslateService: DbTranslateService
    ) {
        super();
    }

    ngOnInit() {
        this.setTableData([]);
        this.initToolbox();
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.translateService.onLangChange.subscribe(() => {
            this.setTableData(this.dtoArray);
        });
    }

    ngOnDestroy(): void {
        this.toolboxService.sendConfiguration([]);
        this.infopanelService.updateInformation({ tableCount: undefined });
        super.ngOnDestroy();
    }

    rowSelected(rowData: any) {
        this.itemSelected.emit(rowData.additionalData.stesId);
    }

    private setTableData(data: StesVMDTO[]) {
        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.tableConfig.data = data.length ? data.map(row => this.createRow(row)) : [];
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
    }

    private createRow(data: StesVMDTO) {
        const beruf = this.dbTranslateService.translate(data.beruf, 'bezeichnungMa');
        const qualifikation = this.dbTranslateService.translate(data.qualifikation, 'text');
        const erwerbssituation = this.dbTranslateService.translate(data.erwerbssituation, 'text');
        const gesucht = this.translateService.instant(data.gesucht ? 'common.label.ja' : 'common.label.nein');
        const erfahrung = this.dbTranslateService.translate(data.erfahrung, 'text');
        const geschlecht = this.dbTranslateService.translate(data.geschlecht, 'text');
        const alter = moment().diff(moment(data.geburtsdatum), 'year');
        return {
            beruf,
            vermittlungsgrad: data.vermittlungsgrad.toString(),
            qualifikation,
            stesName: data.stesName,
            stesVorname: data.stesVorname,
            wohnort: data.stesWohnort,
            erwerbssituation,
            gesucht,
            berufTooltip: data.skills || '',
            qualifikationTooltip: !!erfahrung ? this.translateService.instant('arbeitgeber.label.erfahrungtooltip', { 0: erfahrung }) : '',
            stesNameTooltip: this.translateService.instant('arbeitgeber.label.geschlechtaltertooltip', { 0: geschlecht, 1: alter }),
            stesVornameTooltip: this.translateService.instant('arbeitgeber.label.geschlechtaltertooltip', { 0: geschlecht, 1: alter }),
            additionalData: data
        };
    }

    private initToolbox() {
        ToolboxService.CHANNEL = 'osteZuweisungErfassenSuchen';
        this.printColumns = this.tableConfig.columns.filter(item => item.columnDef !== 'actions');
        this.printConfig = { ...this.tableConfig.config, displayedColumns: this.printColumns.map(c => c.columnDef) };
        this.toolboxService.sendConfiguration(ToolboxConfig.getZuweisungErfassenSuchenConfig(), 'osteZuweisungErfassenSuchen', null, false);
        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.modalService.open(this.modalPrint, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' }));
    }
}
