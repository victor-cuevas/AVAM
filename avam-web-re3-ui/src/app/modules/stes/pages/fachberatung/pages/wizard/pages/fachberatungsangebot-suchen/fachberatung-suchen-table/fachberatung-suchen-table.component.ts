import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-fachberatung-suchen-table',
    templateUrl: './fachberatung-suchen-table.component.html'
})
export class FachberatungSuchenTableComponent implements OnInit {
    @Input() dataSource: [];
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    columns = [
        { columnDef: 'beratungsbereich', header: 'stes.label.fachberatungsangebote.beratungsbereich', cell: (element: any) => `${element.beratungsbereich}` },
        { columnDef: 'bezeichnung', header: 'stes.label.fachberatungsangebote.bezeichnung', cell: (element: any) => `${element.bezeichnung}` },
        { columnDef: 'angebotnr', header: 'stes.label.fachberatungsangebote.angebotnr', cell: (element: any) => `${element.angebotnr}` },
        { columnDef: 'fachberatungsstelle', header: 'stes.label.fachberatungsangebote.fachberatungsstelle', cell: (element: any) => `${element.fachberatungsstelle}` },
        { columnDef: 'strasse', header: 'stes.label.fachberatungsangebote.strasse', cell: (element: any) => `${element.strasse}` },
        { columnDef: 'plzOrt', header: 'stes.label.fachberatungsangebote.plzort', cell: (element: any) => `${element.plzOrt}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    stateKey = 'fachberatung-search-key';

    constructor() {}

    ngOnInit() {}

    itemSelected(data) {
        const rowData = { fachberatungsangebotId: data.fachberatungsangebotId, istIdentischeZuweisungVorhanden: data.istIdentischeZuweisungVorhanden };
        this.onItemSelected.emit(rowData);
    }
}
