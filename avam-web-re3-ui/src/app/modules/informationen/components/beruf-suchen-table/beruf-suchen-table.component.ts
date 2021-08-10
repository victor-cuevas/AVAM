import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormUtilsService } from '@app/shared';
import { FacadeService } from '@shared/services/facade.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BerufMeldepflichtViewDTO } from '@dtos/berufMeldepflichtViewDTO';
import { CommonWrapperTableComponent } from '@shared/components/common-wrapper-table/common-wrapper-table.component';

@Component({
    selector: 'avam-beruf-suchen-table',
    templateUrl: './beruf-suchen-table.component.html',
    styleUrls: ['./beruf-suchen-table.component.scss']
})
export class BerufSuchenTableComponent implements OnInit {
    @Input() isPrintModal = false;
    @Input() isWithoutCheckbox = false;
    @ViewChild('tableComponent') tableComponent: CommonWrapperTableComponent;
    @Input() showEyeAction = false;
    @Input() dataSource;
    selectedRows: any[] = [];
    public tableConfig;
    public allchecked = false;
    baseTableConfig = {
        columns: [
            { columnDef: 'checked', header: '', cell: (element: any) => element.checked, width: '65px' },
            { columnDef: 'flag', header: '', cell: (element: any) => element.flag, width: '65px' },
            { columnDef: 'bezeichnung', header: 'common.label.bezeichnung', cell: (element: any) => `${element.bezeichnung || ''}` },
            { columnDef: 'chIscoCode', header: 'verzeichnisse.label.berufscode', cell: (element: any) => `${element.chIscoCode || ''}` },
            { columnDef: 'chIscoBerufsart', header: 'verzeichnisse.label.berufsgruppe', cell: (element: any) => `${element.chIscoBerufsart || ''}` },
            { columnDef: 'anerkennungsform', header: 'verzeichnisse.label.annerkennungsform', cell: (element: any) => `${element.anerkennungsform}` },
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
            { columnDef: 'actions', header: '', cell: (element: any) => `${element.actions}`, width: '75px' }
        ],
        data: [],
        config: {
            sortField: 'bezeichnung',
            sortOrder: 1,
            displayedColumns: []
        }
    };

    constructor(private facadeService: FacadeService, private router: Router, private route: ActivatedRoute) {}

    public ngOnInit() {
        this.setTableData(this.dataSource);
    }

    public setTableData(data: Array<BerufMeldepflichtViewDTO>) {
        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.tableConfig.data = data && data.length ? data.map(row => this.createRow(row)) : [];
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
        if (this.isPrintModal) {
            this.tableConfig.config.displayedColumns = this.baseTableConfig.columns.map(c => c.columnDef).filter(d => d !== 'actions' && d !== 'checked');
        }
        if (this.isWithoutCheckbox) {
            this.tableConfig.config.displayedColumns = this.baseTableConfig.columns.map(c => c.columnDef).filter(d => d !== 'checked');
        }
    }

    public selectItem(event: any) {
        this.router.navigate([`../bearbeiten`], { queryParams: { berufId: event.berufId }, relativeTo: this.route, state: { navigateToSearch: true } });
    }

    public checkbox(row): void {
        if (!row.checked) {
            row.checked = 1;
            this.selectedRows.push(row);
            this.trackAllChecked();
        } else {
            row.checked = 0;
            this.allchecked = false;
            this.selectedRows = this.selectedRows.filter(r => r.checked);
        }
    }

    checkAll(): void {
        this.allchecked = !this.allchecked;
        if (this.allchecked) {
            this.handleCheckAll();
        } else {
            this.handleUncheckAll();
        }
    }

    private trackAllChecked(): void {
        this.allchecked = this.selectedRows.length > 0 && this.selectedRows.length === this.tableConfig.data.length;
    }

    private createRow(data: BerufMeldepflichtViewDTO) {
        return {
            berufId: data.berufId,
            bezeichnung: this.facadeService.dbTranslateService.translate(data, 'bezeichnungMa'),
            chIscoCode: data.avamChIscoBerufObject ? data.avamChIscoBerufObject.chIscoCode : null,
            chIscoBerufsart: this.facadeService.dbTranslateService.translate(data.avamChIscoBerufObject, 'berufsArt'),
            anerkennungsform: this.facadeService.dbTranslateService.translate(data.anerkennungsformObject, 'text') || 'amm.beruf.anerkennungNichtDefiniert',
            gueltigvon: data.gueltigAb,
            gueltigbis: data.gueltigBis,
            flag: data.kantone ? this.getFlag(data.kantone) : '',
            checked: 0,
            chIscoBerufId: data.avamChIscoBerufObject ? data.avamChIscoBerufObject.chIscoBerufId : '0'
        };
    }

    private handleCheckAll(): void {
        this.tableConfig.data.forEach(row => {
            if (!row.checked) {
                this.selectedRows.push(row);
            }
            row.checked = 1;
        });
    }

    private handleUncheckAll(): void {
        this.tableConfig.data.forEach(row => {
            row.checked = 0;
            this.selectedRows = this.selectedRows.filter(r => r.checked);
        });
    }

    private getFlag(kantone: string) {
        if (kantone === 'CH') {
            return this.facadeService.translateService.instant('verzeichnisse.beruf.tooltip.meldepflichtigCH');
        } else {
            return `${this.facadeService.translateService.instant('verzeichnisse.beruf.tooltip.meldepflichtigIn')} ${kantone}`;
        }
    }
}
