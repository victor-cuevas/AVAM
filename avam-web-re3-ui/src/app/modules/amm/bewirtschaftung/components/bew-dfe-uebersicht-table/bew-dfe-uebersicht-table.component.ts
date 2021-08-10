import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'avam-bew-dfe-uebersicht-table',
    templateUrl: './bew-dfe-uebersicht-table.component.html'
})
export class BewDfeUebersichtTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() hideTableButton = false;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns = [
        { columnDef: 'durchfuehrungseinheitId', header: 'amm.massnahmen.label.durchfuehrungsnr', cell: (element: any) => `${element.durchfuehrungseinheitId}` },
        { columnDef: 'titel', header: 'amm.massnahmen.label.titel', cell: (element: any) => `${element.titel}` },
        { columnDef: 'ort', header: 'amm.massnahmen.label.ort', cell: (element: any) => `${element.ort}` },
        { columnDef: 'status', header: 'amm.massnahmen.label.status', cell: (element: any) => `${element.status}` },
        { columnDef: 'gueltigVon', header: 'common.label.gueltig_von', cell: (element: any) => `${element.gueltigVon}` },
        { columnDef: 'gueltigBis', header: 'common.label.gueltig_bis', cell: (element: any) => `${element.gueltigBis}` },

        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '60px' }
    ];

    displayedColumns = this.columns.map(c => c.columnDef);
    stateKey = 'kurse-uebersicht-key';

    ngOnInit() {
        if (this.hideTableButton) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    itemSelected(row) {
        this.onItemSelected.emit(row);
    }
}
