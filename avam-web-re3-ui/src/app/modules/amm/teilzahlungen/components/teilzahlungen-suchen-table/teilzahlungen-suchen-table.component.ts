import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-teilzahlungen-suchen-table',
    templateUrl: './teilzahlungen-suchen-table.component.html',
    styleUrls: ['./teilzahlungen-suchen-table.component.scss']
})
export class TeilzahlungenSuchenTableComponent implements OnInit {
    static readonly STATE_KEY = 'teilzahlung-search-key';

    @Input() dataSource: [];
    @Input() firstRowHeader: string;
    @Input() hideTableButton = false;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns = [];
    displayedColumns: any[];
    stateKey = TeilzahlungenSuchenTableComponent.STATE_KEY;

    constructor() {}

    ngOnInit() {
        this.columns = [
            { columnDef: 'teilzahlungsnr', header: 'amm.zahlungen.label.teilzahlungsnr', cell: (element: any) => `${element.teilzahlungsnr}` },
            { columnDef: 'titel', header: 'amm.massnahmen.label.titel', cell: (element: any) => `${element.titel}` },
            { columnDef: 'anbieter', header: 'amm.anbieter.label.anbieter', cell: (element: any) => `${element.anbieter}` },
            { columnDef: 'ausfuehrungsdatum', header: 'amm.zahlungen.label.ausfuehrungsdatum', cell: (element: any) => `${element.ausfuehrungsdatum}` },
            { columnDef: 'status', header: 'amm.zahlungen.label.status', cell: (element: any) => `${element.status}` },
            { columnDef: 'vorgaenger', header: 'amm.zahlungen.label.vorgaenger', cell: (element: any) => `${element.vorgaenger}` },
            { columnDef: 'nachfolger', header: 'amm.nutzung.label.nachfolger', cell: (element: any) => `${element.nachfolger}` },

            { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '60px' }
        ];
        this.displayedColumns = this.columns.map(c => c.columnDef);

        if (this.hideTableButton) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    itemSelected(row) {
        this.onItemSelected.emit(row);
    }
}
