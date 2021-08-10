import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'avam-metadaten-copy-table',
    templateUrl: './metadaten-copy-table.component.html'
})
export class MetadatenCopyTableComponent implements OnInit {
    @Input() dataSource: [];
    columns = [
        { columnDef: 'key', header: 'dokmanager.label.key', cell: (element: any) => `${element.key}` },
        { columnDef: 'value', header: 'dokmanager.label.value', cell: (element: any) => `${element.value}` }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {}
}
