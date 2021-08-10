import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'avam-teilzahlungswerte-anzeigen-table',
    templateUrl: './teilzahlungswerte-anzeigen-table.component.html'
})
export class TeilzahlungswerteAnzeigenTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() summeTotal: number;

    columns = [
        {
            columnDef: 'teilzahlungswertNr',
            header: 'amm.akquisition.label.teilzahlungswertnr',
            footer: 'amm.abrechnungen.label.total',
            cell: (element: any) => `${element.teilzahlungswertNr}`
        },
        { columnDef: 'chf', header: 'amm.abrechnungen.label.chf', footer: '', cell: (element: any) => `${element.chf}` },
        { columnDef: 'transferAnAlk', header: 'amm.abrechnungen.label.transferanalk', footer: '', cell: (element: any) => `${element.transferAnAlk}` },
        { columnDef: 'teilzahlungsNr', header: 'amm.zahlungen.label.teilzahlungsnr', footer: '', cell: (element: any) => `${element.teilzahlungsNr}` },
        { columnDef: 'titel', header: 'amm.abrechnungen.label.titel', footer: '', cell: (element: any) => `${element.titel}`, width: '370px' },
        { columnDef: 'status', header: 'amm.abrechnungen.label.status', footer: '', cell: (element: any) => `${element.status}` },
        { columnDef: 'vertragswertNr', header: 'amm.akquisition.label.vertragswertnr', footer: '', cell: (element: any) => `${element.vertragswertNr}` }
    ];

    displayedColumns = this.columns.map(c => c.columnDef);

    stateKey = 'teilzahlungswerte-anzeigen-key';

    constructor() {}

    ngOnInit() {}
}
