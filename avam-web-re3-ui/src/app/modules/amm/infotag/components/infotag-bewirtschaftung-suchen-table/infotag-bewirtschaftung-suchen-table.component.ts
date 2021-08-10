import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-infotag-bewirtschaftung-suchen-table',
    templateUrl: './infotag-bewirtschaftung-suchen-table.component.html',
    styleUrls: ['./infotag-bewirtschaftung-suchen-table.component.scss']
})
export class InfotagBewirtschaftungSuchenTableComponent implements OnInit {
    static readonly STATE_KEY = 'infotag-bewirtschaftung-suchen-table';
    @Input() dataSource: [];
    @Input() hideTableButton = false;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns = [
        { columnDef: 'titel', header: 'amm.massnahmen.label.titel', cell: (element: any) => `${element.titel}`, width: '350px' },
        { columnDef: 'ort', header: 'amm.massnahmen.label.ort', cell: (element: any) => `${element.ort}` },
        { columnDef: 'datum', header: 'common.label.datum', cell: (element: any) => `${element.datum}`, width: '115px' },
        { columnDef: 'kurszeiten', header: 'amm.massnahmen.label.kurszeiten', cell: (element: any) => `${element.kurszeiten}` },
        { columnDef: 'teilnehmer', header: 'amm.massnahmen.label.teilnehmer', cell: (element: any) => `${element.teilnehmer}` },
        { columnDef: 'ueberbuchung', header: 'amm.massnahmen.label.ueberbuchung', cell: (element: any) => `${element.ueberbuchung}` },
        { columnDef: 'anbieter', header: 'amm.massnahmen.label.anbieter', cell: (element: any) => `${element.anbieter}`, width: '200px' },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '60px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    stateKey = InfotagBewirtschaftungSuchenTableComponent.STATE_KEY;

    constructor() {}

    ngOnInit() {
        if (this.hideTableButton) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    itemSelected(data) {
        this.onItemSelected.emit(data);
    }
}
