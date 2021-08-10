import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MeldepflichtEnum } from '@app/shared/enums/table-icon-enums';

@Component({
    selector: 'avam-kontaktperson-waehlen-table',
    templateUrl: './kontaktperson-waehlen-table.component.html'
})
export class KontaktpersonWaehlenTableComponent implements OnInit {
    @Input() dataSource: [] = [];
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns = [
        { columnDef: 'anrede', header: 'arbeitgeber.oste.label.anrede', cell: (element: any) => `${element.anrede}` },
        { columnDef: 'name', header: 'amm.nutzung.label.name', cell: (element: any) => `${element.name}` },
        { columnDef: 'vorname', header: 'common.label.vorname', cell: (element: any) => (element.vorname ? `${element.vorname}` : null) },
        { columnDef: 'funktion', header: 'unternehmen.label.funktion', cell: (element: any) => (element.funktion ? `${element.funktion}` : null) },
        { columnDef: 'email', header: 'stes.label.email', cell: (element: any) => (element.email ? `${element.email}` : null) },
        { columnDef: 'telefonNr', header: 'stes.label.telefon', cell: (element: any) => (element.telefonNr ? `${element.telefonNr}` : null) },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {}

    itemSelected(data) {
        this.onItemSelected.emit(data);
    }
}
