import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-teilbudget-table',
    templateUrl: './teilbudget-table.component.html'
})
export class TeilbudgetTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() forPrinting = false;
    @Output() onItemSelected: EventEmitter<number> = new EventEmitter();
    columns = [
        { columnDef: 'institution', header: 'common.label.institution', cell: (element: any) => `${element.institution}` },
        { columnDef: 'kanton', header: 'common.label.kanton', cell: (element: any) => `${element.kanton}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '60px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

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
