import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-budget-suchen-table',
    templateUrl: './budget-suchen-table.component.html',
    styleUrls: ['./budget-suchen-table.component.scss']
})
export class BudgetSuchenTableComponent implements OnInit {
    static readonly STATE_KEY = 'budget-search-table-state-key';
    @Input() dataSource: [];
    @Input() forPrinting = false;
    @Output() onItemSelected: EventEmitter<number> = new EventEmitter();
    columns = [
        { columnDef: 'struktur', header: 'amm.massnahmen.label.struktur', cell: (element: any) => `${element.struktur}` },
        { columnDef: 'jahr', header: 'common.label.jahr', cell: (element: any) => `${element.jahr}` },
        { columnDef: 'version', header: 'common.label.version', cell: (element: any) => `${element.version}` },
        { columnDef: 'status', header: 'amm.massnahmen.label.status', cell: (element: any) => `${element.status}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '60px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    stateKey = BudgetSuchenTableComponent.STATE_KEY;

    constructor() {}

    ngOnInit() {
        if (this.forPrinting) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    itemSelected(selectedId) {
        this.onItemSelected.emit(selectedId);
    }
}
