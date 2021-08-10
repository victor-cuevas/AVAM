import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'avam-stes-zas-abgleichen-table',
    templateUrl: './stes-zas-abgleichen-table.component.html'
})
export class StesZasAbgleichenTableComponent implements OnInit {
    @Input() dataSource: [];
    columns = [
        { columnDef: 'svNr', header: 'stes.label.svnr', cell: (element: any) => (element.svNr ? `${element.svNr}` : '') },
        { columnDef: 'nameVorname', header: 'stes.label.zasNameVorname', cell: (element: any) => (element.nameVorname ? `${element.nameVorname}` : '') },
        { columnDef: 'geburtsdatum', header: 'stes.label.geburtsdatum', cell: (element: any) => (element.geburtsdatum ? `${element.geburtsdatum}` : '') },
        { columnDef: 'geschlecht', header: 'stes.label.geschlecht', cell: (element: any) => (element.geschlecht ? `${element.geschlecht}` : '') },
        { columnDef: 'nationalitaet', header: 'stes.label.nationalitaet', cell: (element: any) => (element.nationalitaet ? `${element.nationalitaet}` : '') }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {}
}
