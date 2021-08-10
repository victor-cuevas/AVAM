import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-infotag-massnahme-suchen-table',
    templateUrl: './infotag-massnahme-suchen-table.component.html',
    styleUrls: ['./infotag-massnahme-suchen-table.component.scss']
})
export class InfotagMassnahmeSuchenTableComponent implements OnInit {
    static readonly STATE_KEY = 'infotag-massnahme-suchen-table';
    @Input() dataSource: [];
    @Input() forPrinting = false;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    columns = [
        { columnDef: 'titel', header: 'amm.massnahmen.label.titel', cell: (element: any) => `${element.titel}`, width: '360px' },
        { columnDef: 'durchfuerungsort', header: 'amm.massnahmen.label.durchfuehrungsort', cell: (element: any) => `${element.durchfuerungsort}` },
        { columnDef: 'gueltigVon', header: 'amm.infotag.label.gueltigVon', cell: (element: any) => `${element.gueltigVon}`, width: '135px' },
        { columnDef: 'gueltigBis', header: 'amm.infotag.label.gueltigBis', cell: (element: any) => `${element.gueltigBis}`, width: '135px' },
        { columnDef: 'anbieter', header: 'amm.massnahmen.label.anbieter', cell: (element: any) => `${element.anbieter}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '60px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    stateKey = InfotagMassnahmeSuchenTableComponent.STATE_KEY;

    constructor() {}

    ngOnInit() {
        if (this.forPrinting) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    itemSelected(data) {
        this.onItemSelected.emit(data.massnahmeId);
    }
}
