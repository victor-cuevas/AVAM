import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-stes-common-search-table',
    templateUrl: './stes-common-search-table.component.html',
    styleUrls: ['./stes-common-search-table.component.scss']
})
export class StesCommonSearchTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() displayedColumns: any[];
    @Input() columns: [];
    @Input() sortField;
    @Input() stateKey: any;
    @Input() forPrinting = false;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    constructor() {}

    ngOnInit() {
        if (this.forPrinting) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'actions' && c !== 'action');
        }
    }

    itemSelected(data) {
        this.onItemSelected.emit(data);
    }
}
