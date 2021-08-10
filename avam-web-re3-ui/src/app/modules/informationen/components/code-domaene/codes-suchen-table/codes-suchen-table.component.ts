import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'avam-codes-suchen-table',
    templateUrl: './codes-suchen-table.component.html'
})
export class CodesSuchenTableComponent implements OnInit {
    static readonly STATE_KEY = 'code-suchen-table-state-key';

    @Input() dataSource: [];
    @Input() forPrinting = false;
    @Output() onItemSelected: EventEmitter<number> = new EventEmitter();

    columns = [
        { columnDef: 'codeDomaene', header: 'common.label.codedomain', cell: (element: any) => `${element.codeDomaene}`, width: '220px' },
        { columnDef: 'bezeichnung', header: 'common.label.bezeichnung', cell: (element: any) => `${element.bezeichnung}`, width: '570px' },
        { columnDef: 'code', header: 'common.label.code', cell: (element: any) => `${element.code}` },
        { columnDef: 'order', header: 'informationen.label.order', cell: (element: any) => `${element.order}` },
        { columnDef: 'status', header: 'amm.abrechnungen.label.status', cell: (element: any) => `${element.status}` },
        { columnDef: 'action', header: '', width: '60px' }
    ];

    displayedColumns = this.columns.map(c => c.columnDef);
    stateKey = CodesSuchenTableComponent.STATE_KEY;

    constructor() {}

    ngOnInit() {
        if (this.forPrinting) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    itemSelected(row) {
        this.onItemSelected.emit(row);
    }
}
