import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'avam-bew-massnahme-suchen-table',
    templateUrl: './bew-massnahme-suchen-table.component.html'
})
export class BewMassnahmeSuchenTableComponent implements OnInit {
    static readonly STATE_KEY = 'massnahme-search-table-state-key';
    @Input() dataSource: [];
    @Input() hideTableButton = false;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns = [
        { columnDef: 'massnahmeId', header: 'amm.massnahmen.label.massnahmennr', cell: (element: any) => `${element.massnahmeId}` },
        { columnDef: 'titel', header: 'amm.massnahmen.label.titel', cell: (element: any) => `${element.titel}` },
        {
            columnDef: 'zulassungstyp',
            header: 'amm.massnahmen.label.zulassungstyp',
            cell: (element: any) => `${element.zulassungstyp}`
        },
        { columnDef: 'gueltigVon', header: 'common.label.gueltig_von', cell: (element: any) => `${element.gueltigVon}` },
        { columnDef: 'gueltigBis', header: 'common.label.gueltig_bis', cell: (element: any) => `${element.gueltigBis}` },
        { columnDef: 'anbieter', header: 'amm.abrechnungen.label.anbieter', cell: (element: any) => `${element.anbieter}` },

        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '60px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    stateKey = BewMassnahmeSuchenTableComponent.STATE_KEY;

    constructor(private router: Router) {}

    ngOnInit() {
        if (this.hideTableButton) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    itemSelected(row) {
        this.router.navigate([`amm/bewirtschaftung/produkt/${row.produktId}/massnahmen/massnahme/grunddaten`], { queryParams: { massnahmeId: row.massnahmeId } });
    }
}
