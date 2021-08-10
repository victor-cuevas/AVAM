import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-zahlstelle-suchen-table',
    templateUrl: './zahlstelle-suchen-table.component.html',
    styleUrls: ['./zahlstelle-suchen-table.component.scss']
})
export class ZahlstelleSuchenTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() sortField;
    @Input() forPrinting = false;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns = [
        { columnDef: 'alkNr', header: 'verzeichnisse.label.zahlstelle.alkNr', cell: (element: any) => `${element.alkNr}` },
        { columnDef: 'zahlstelleNr', header: 'verzeichnisse.label.zahlstelle.zahlstelleNummer', cell: (element: any) => `${element.zahlstelleNr}` },
        { columnDef: 'kurzname', header: 'verzeichnisse.label.zahlstelle.kurzname', cell: (element: any) => `${element.kurzname}` },
        { columnDef: 'standStrasse', header: 'verzeichnisse.label.zahlstelle.adresse', cell: (element: any) => `${element.standStrasse}` },
        { columnDef: 'plz', header: 'verzeichnisse.label.zahlstelle.plz', cell: (element: any) => `${element.plz}` },
        { columnDef: 'ort', header: 'verzeichnisse.label.zahlstelle.ort', cell: (element: any) => `${element.ort}` },
        { columnDef: 'kassenstatus', header: 'verzeichnisse.label.zahlstelle.kassenstatus', cell: (element: any) => `${element.kassenstatus}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {
        if (this.forPrinting) {
            this.displayedColumns = this.displayedColumns.filter(d => d !== 'action');
        }
    }

    itemSelected(data) {
        this.onItemSelected.emit(data);
    }
}
