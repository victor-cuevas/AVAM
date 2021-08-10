import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'avam-leistungsvereinbarungen-table',
    templateUrl: './leistungsvereinbarungen-table.component.html'
})
export class LeistungsvereinbarungenTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() forUebersicht = false;
    @Input() hideTableButton = false;

    @Output() onItemSelected: EventEmitter<number> = new EventEmitter();

    columns = [
        {
            columnDef: 'leistungsvereinbarungNr',
            header: 'amm.akquisition.label.leistungsvereinbarungnr',
            cell: (element: any) => `${element.leistungsvereinbarungNr}`
        },
        { columnDef: 'titel', header: 'amm.akquisition.label.titel', cell: (element: any) => `${element.titel}`, width: '500px' },
        { columnDef: 'gueltigVon', header: 'amm.akquisition.label.gueltigvon', cell: (element: any) => `${element.gueltigVon}` },
        { columnDef: 'gueltigBis', header: 'amm.akquisition.label.gueltigbis', cell: (element: any) => `${element.gueltigBis}` },
        { columnDef: 'status', header: 'common.label.status', cell: (element: any) => `${element.status}` },
        { columnDef: 'rahmenvertragNr', header: 'amm.akquisition.label.rahmenvertragnr', cell: (element: any) => `${element.rahmenvertragNr}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '60px' }
    ];

    displayedColumns = this.columns.map(c => c.columnDef);

    stateKey = 'leistungsvereinbarungen-table-key';

    ngOnInit() {
        if (!this.forUebersicht) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'rahmenvertragNr');
        }

        if (this.hideTableButton) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    itemSelected(row) {
        this.onItemSelected.emit(row);
    }
}
