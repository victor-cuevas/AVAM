import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'avam-angebot-suchen-table',
    templateUrl: './angebot-suchen-table.component.html',
    styleUrls: ['./angebot-suchen-table.component.scss']
})
export class AngebotSuchenTableComponent implements OnInit {
    @Input() dataSource: [] = [];
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    @Output() onItemOpened: EventEmitter<any> = new EventEmitter();
    columns = [
        { columnDef: 'titel', header: 'amm.massnahmen.label.titel', cell: (element: any) => `${element.titel}` },
        { columnDef: 'arbeitgeber', header: 'amm.massnahmen.label.arbeitgeberAnbieter', cell: (element: any) => `${element.arbeitgeber}` },
        { columnDef: 'durchfuerungsort', header: 'amm.massnahmen.label.durchfuehrungsort', cell: (element: any) => `${element.durchfuerungsort}` },
        { columnDef: 'vollzugsregion', header: 'benutzerverwaltung.label.vollzugsregion', cell: (element: any) => `${element.vollzugsregion}` },
        { columnDef: 'datum', header: 'common.label.datum', cell: (element: any) => `${element.datum}` },
        { columnDef: 'lektionen', header: 'amm.nutzung.label.lektionen', cell: (element: any) => `${element.lektionen}` },
        { columnDef: 'plaetze', header: 'amm.nutzung.label.plaetze', cell: (element: any) => `${element.plaetze}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '100px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {}

    itemSelected(data) {
        this.onItemSelected.emit(data);
    }

    itemOpened(data) {
        this.onItemOpened.emit(data);
    }
}
