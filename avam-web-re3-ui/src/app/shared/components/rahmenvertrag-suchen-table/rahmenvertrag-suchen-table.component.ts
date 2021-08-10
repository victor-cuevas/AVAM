import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'avam-rahmenvertrag-suchen-table',
    templateUrl: './rahmenvertrag-suchen-table.component.html'
})
export class RahmenvertragSuchenTableComponent implements OnInit {
    static readonly STATE_KEY = 'rahmenvertrag-search-key';

    @Input() dataSource: [];
    @Input() forPrinting = false;
    @Input() forUebersicht = false;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns = [
        {
            columnDef: 'rahmenvertragNr',
            header: 'amm.akquisition.label.rahmenvertragnr',
            cell: (element: any) => `${element.rahmenvertragNr}`
        },
        { columnDef: 'titel', header: 'amm.massnahmen.label.titel', cell: (element: any) => `${element.titel}` },
        { columnDef: 'gueltigVon', header: 'amm.akquisition.label.gueltigvon', cell: (element: any) => `${element.gueltigVon}` },
        { columnDef: 'gueltigBis', header: 'amm.akquisition.label.gueltigbis', cell: (element: any) => `${element.gueltigBis}` },
        { columnDef: 'gueltig', header: 'amm.akquisition.label.gueltig', cell: (element: any) => `${element.gueltig}` },
        { columnDef: 'status', header: 'common.label.status', cell: (element: any) => `${element.status}` },
        { columnDef: 'anbieterName', header: 'amm.planundakqui.label.anbieter', cell: (element: any) => `${element.anbieterName}` },

        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '60px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    stateKey = RahmenvertragSuchenTableComponent.STATE_KEY;

    ngOnInit() {
        if (this.forPrinting) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
        if (this.forUebersicht) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'anbieterName');
        }
    }

    itemSelected(row) {
        this.onItemSelected.emit(row);
    }
}
