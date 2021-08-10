import { Component, OnInit, Input } from '@angular/core';
import { FormUtilsService } from '@app/shared';

@Component({
    selector: 'avam-teilzahlungswert-vertragswert-table',
    templateUrl: './teilzahlungswert-vertragswert-table.component.html'
})
export class TeilzahlungswertVertragswertTableComponent implements OnInit {
    @Input() dataSource: any[];
    @Input() chfTotal: number;

    columns = [
        {
            columnDef: 'teilzahlungswertNr',
            header: 'amm.akquisition.label.teilzahlungswertnr',
            footer: 'amm.akquisition.label.total',
            cell: (element: any) => `${element.teilzahlungswertNr}`
        },
        { columnDef: 'chfBetrag', header: 'amm.akquisition.label.chf', footer: '', cell: (element: any) => `${element.chfBetrag}` },
        { columnDef: 'teilzahlungsNr', header: 'amm.zahlungen.label.teilzahlungsnr', footer: '', cell: (element: any) => `${element.teilzahlungsNr}` },
        { columnDef: 'status', header: 'amm.zahlungen.label.status', footer: '', cell: (element: any) => `${element.status}` },

        { columnDef: 'vertragswertNr', header: 'amm.akquisition.label.vertragswertnr', footer: '', cell: (element: any) => `${element.vertragswertNr}` }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {}
}
