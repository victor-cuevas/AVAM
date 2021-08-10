import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-code-domaene-table',
    templateUrl: './code-domaene-table.component.html'
})
export class CodeDomaeneTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() forPrinting = false;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns = [
        { columnDef: 'domain', header: 'common.label.codedomain', cell: (element: any) => `${element.domain}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '60px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

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
