import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'avam-infotag-teilnehmerliste-table',
    templateUrl: './infotag-teilnehmerliste-table.component.html',
    styleUrls: ['./infotag-teilnehmerliste-table.component.scss']
})
export class InfotagTeilnehmerlisteTableComponent implements OnInit {
    @Input() dataSource: [];

    columns = [
        { columnDef: 'kanton', header: 'common.label.kanton', cell: (element: any) => (element.kanton ? `${element.kanton}` : '') },
        { columnDef: 'platz', header: 'amm.nutzung.label.platz', cell: (element: any) => (element.platz ? `${element.platz}` : '') },
        { columnDef: 'teilnehmer', header: 'amm.nutzung.label.teilnehmer', cell: (element: any) => (element.teilnehmer ? `${element.teilnehmer}` : '') },
        { columnDef: 'personenNr', header: 'amm.nutzung.label.personennr', cell: (element: any) => (element.personenNr ? `${element.personenNr}` : '') },
        { columnDef: 'bearbeitung', header: 'amm.nutzung.label.bearbeitung', cell: (element: any) => (element.bearbeitung ? `${element.bearbeitung}` : '') },
        { columnDef: 'buchungsdatum', header: 'amm.nutzung.label.datumBuchung', cell: (element: any) => (element.buchungsdatum ? `${element.buchungsdatum}` : '') },
        { columnDef: 'personalberater', header: 'amm.nutzung.label.personalberater', cell: (element: any) => (element.personalberater ? `${element.personalberater}` : '') },
        { columnDef: 'status', header: 'amm.infotag.label.praesenzstatus', cell: (element: any) => element.statusCode }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    PRAESENZSTATUS_TEILGENOMMEN = '1';
    PRAESENZSTATUS_ENTSCHULDIGT = '2';
    PRAESENZSTATUS_UNENTSCHULDIGT = '3';
    constructor() {}

    ngOnInit() {}
}
