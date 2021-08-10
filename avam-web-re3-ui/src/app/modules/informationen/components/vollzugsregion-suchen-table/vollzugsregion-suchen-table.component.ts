import { Component, Input, OnInit } from '@angular/core';
import { FormUtilsService } from '@app/shared';
import { FacadeService } from '@shared/services/facade.service';
import { ActivatedRoute, Router } from '@angular/router';
import { VollzugsregionDTO } from '@dtos/vollzugsregionDTO';

@Component({
    selector: 'avam-vollzugsregion-suchen-table',
    templateUrl: './vollzugsregion-suchen-table.component.html',
    styleUrls: ['./vollzugsregion-suchen-table.component.scss']
})
export class VollzugsregionSuchenTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() isPrintModal = false;
    baseTableConfig = {
        columns: [
            { columnDef: 'vollzugsregionenCode', header: 'benutzerverwaltung.label.vollzugsregionid', cell: (element: any) => `${element.vollzugsregionenCode || ''}` },
            { columnDef: 'bezeichnung', header: 'common.label.bezeichnung', cell: (element: any) => `${element.bezeichnung || ''}` },
            { columnDef: 'vollzugsregiontyp', header: 'benutzerverwaltung.label.vollzugsregiontyp', cell: (element: any) => `${element.vollzugsregiontyp || ''}` },
            {
                columnDef: 'gueltigvon',
                header: 'common.label.gueltig_von',
                cell: (element: any) => `${this.facadeService.formUtilsService.formatDateNgx(element.gueltigvon, FormUtilsService.GUI_DATE_FORMAT) || ''}`
            },
            {
                columnDef: 'gueltigbis',
                header: 'common.label.gueltig_bis',
                cell: (element: any) => `${this.facadeService.formUtilsService.formatDateNgx(element.gueltigbis, FormUtilsService.GUI_DATE_FORMAT) || ''}`
            },
            { columnDef: 'actions', header: 'common.button.oeffnen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'vollzugsregionenCode',
            sortOrder: 1,
            displayedColumns: []
        }
    };
    tableConfig: any;

    constructor(private facadeService: FacadeService, private router: Router, private route: ActivatedRoute) {}

    ngOnInit() {
        this.setTableData(this.dataSource);
    }

    selectItem(event: VollzugsregionDTO) {
        this.router.navigate([`../bearbeiten`], { queryParams: { vollzugsregionId: event.vollzugsregionId }, relativeTo: this.route, state: { navigateToSearch: true } });
    }

    setTableData(data: Array<VollzugsregionDTO>) {
        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.tableConfig.data = data && data.length ? data.map(row => this.createRow(row)) : [];
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
        if (this.isPrintModal) {
            this.tableConfig.config.displayedColumns = this.baseTableConfig.columns.map(c => c.columnDef).filter(d => d !== 'actions');
        }
    }

    private createRow(data: VollzugsregionDTO) {
        return {
            vollzugsregionenCode: data.code,
            bezeichnung: this.facadeService.dbTranslateService.translate(data, 'name'),
            vollzugsregiontyp: this.facadeService.dbTranslateService.translate(data.vregTypeObject, 'text'),
            gueltigvon: data.gueltigAb,
            gueltigbis: data.gueltigBis,
            vollzugsregionId: data.vollzugsregionId
        };
    }
}
