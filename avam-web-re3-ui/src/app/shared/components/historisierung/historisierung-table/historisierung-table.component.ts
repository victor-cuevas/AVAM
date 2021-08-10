import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'avam-historisierung-table',
    templateUrl: './historisierung-table.component.html',
    styleUrls: ['./historisierung-table.component.scss']
})
export class HistorisierungTableComponent implements OnInit, OnChanges {
    @Input() dataSource: [];
    @Input() headers;
    columns = null;
    displayedColumns: any[];
    constructor() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.headers.currentValue && changes.dataSource.currentValue) {
            this.columns = changes.headers.currentValue;
            this.dataSource = changes.dataSource.currentValue;
            this.displayedColumns = this.columns.map(c => c.columnDef);
        }
    }

    ngOnInit() {}
}
