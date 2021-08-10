import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-stes-termine-table',
    templateUrl: './stes-termine-table.component.html',
    styleUrls: ['./stes-termine-table.component.scss']
})
export class StesTermineTableComponent implements OnInit {
    @Input() dataSource: [];
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    columns = [
        { columnDef: 'art', header: 'stes.label.termin.art', cell: (element: any) => (element.art ? `${element.art}` : '') },
        { columnDef: 'datum', header: 'unternehmen.label.termin.datum', dataType: 'date', cell: (element: any) => `${element.datum}` },
        { columnDef: 'zeit', header: 'stes.label.termin.zeitVonBisMitBindestrich', cell: (element: any) => (element.zeit ? `${element.zeit}` : '') },
        { columnDef: 'status', header: 'stes.label.termin.status', cell: (element: any) => (element.status ? `${element.status}` : '') },
        { columnDef: 'stesId', header: 'stes.label.stesid', cell: (element: any) => (element.stesId ? `${element.stesId}` : '') },
        { columnDef: 'kontaktperson', header: 'stes.label.termin.kontaktperson', cell: (element: any) => (element.kontaktperson ? `${element.kontaktperson}` : '') },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {}

    itemSelected(artCode, terminId) {
        this.onItemSelected.emit({ artCode, terminId });
    }
}
