import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'avam-vertragswert-teilzahlungswerte-table',
    templateUrl: './vertragswert-teilzahlungswerte-table.component.html'
})
export class VertragswertTeilzahlungswerteTableComponent implements OnInit {
    @Input() dataSource: [] = [];
    @Input() chfTotal = '0.00';
    @Input() forPrinting = false;

    @Output() onItemSelected: EventEmitter<number> = new EventEmitter();

    columns = [
        {
            columnDef: 'teilzahlungswertNr',
            header: 'amm.akquisition.label.teilzahlungswertnr',
            footer: 'amm.akquisition.label.total',
            cell: (element: any) => `${element.teilzahlungswertNr}`
        },
        { columnDef: 'chf', header: 'amm.akquisition.label.chf', footer: '', cell: (element: any) => `${element.chfBetrag}` },
        { columnDef: 'faelligAm', header: 'amm.abrechnungen.label.faelligam', footer: '', cell: (element: any) => `${element.faelligAm}` },
        { columnDef: 'vorgaenger', header: 'amm.akquisition.label.vorgaenger', footer: '', cell: (element: any) => `${element.vorgaenger}` },
        { columnDef: 'nachfolger', header: 'amm.akquisition.label.nachfolger', footer: '', cell: (element: any) => `${element.nachfolger}` },
        { columnDef: 'vertragswertNr', header: 'amm.akquisition.label.vertragswertnr', footer: '', cell: (element: any) => `${element.vertragswertNr}` },
        { columnDef: 'teilzahlungsNr', header: 'amm.zahlungen.label.teilzahlungsnr', footer: '', cell: (element: any) => `${element.teilzahlungsNr}` },
        { columnDef: 'titel', header: 'amm.akquisition.label.titel', footer: '', cell: (element: any) => `${element.titel}` },
        { columnDef: 'ausfuehrungsDatum', header: 'amm.zahlungen.label.ausfuehrungsdatum', footer: '', cell: (element: any) => `${element.ausfuehrungsDatum}` },
        { columnDef: 'action', header: '', footer: '', width: '60px' }
    ];

    displayedColumns = this.columns.map(c => c.columnDef);

    stateKey = 'vertragswerte-teilzahlungswerte-key';

    ngOnInit() {
        if (this.forPrinting) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    itemSelected(event) {
        this.onItemSelected.next(event);
    }
}
