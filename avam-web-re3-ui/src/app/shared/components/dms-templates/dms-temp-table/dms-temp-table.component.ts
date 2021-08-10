import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-dms-temp-table',
    templateUrl: './dms-temp-table.component.html',
    styleUrls: ['./dms-temp-table.component.scss']
})
export class DmsTempTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() forPrinting = false;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    @Output() onItemSaved: EventEmitter<any> = new EventEmitter();

    columns = [
        { columnDef: 'name', header: 'office.label.vorlagen', cell: (element: any) => `${element.name}` },
        { columnDef: 'type', header: 'dokmanager.label.dokumententyp', cell: (element: any) => `${element.type}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '135px' }
    ];

    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {
        if (this.forPrinting) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    itemSelected(data) {
        this.onItemSelected.emit(data);
    }

    itemSaved(data) {
        this.onItemSaved.emit(data);
    }
}
