import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-zwischenverdienste-table',
    templateUrl: './zwischenverdienste-table.component.html'
})
export class ZwischenverdiensteTableComponent implements OnInit {
    @Input() dataSource: [];
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    columns = [
        { columnDef: 'berufsTaetigkeit', header: 'stes.label.vermittlung.berufTaetigkeit', cell: (element: any) => `${element.berufsTaetigkeit}` },
        { columnDef: 'zvDatumVon', header: 'stes.label.zwischenverdienstvon', cell: (element: any) => `${element.zvDatumVon}` },
        { columnDef: 'zvDatumBis', header: 'stes.label.zwischenverdienstbis', cell: (element: any) => `${element.zvDatumBis}` },
        { columnDef: 'arbeitgeber', header: 'stes.label.arbeitgeber', cell: (element: any) => `${element.arbeitgeber}` },
        { columnDef: 'vermittlung', header: 'stes.label.vermittlung', cell: (element: any) => `${element.vermittlung}` },
        { columnDef: 'vermittlungNr', header: 'stes.label.vermittlungsnummer', cell: (element: any) => `${element.vermittlungNr}` },
        { columnDef: 'status', header: 'common.label.status', cell: (element: any) => `${element.status}` },
        { columnDef: 'stesId', header: 'stes.label.stesid', cell: (element: any) => `${element.stesId}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.zwischenverdienstId}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {}

    itemSelected(zwischenverdienstId) {
        this.onItemSelected.emit(zwischenverdienstId);
    }
}
