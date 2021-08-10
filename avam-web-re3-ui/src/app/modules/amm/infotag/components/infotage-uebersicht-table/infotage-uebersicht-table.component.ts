import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'avam-infotage-uebersicht-table',
    templateUrl: './infotage-uebersicht-table.component.html',
    styleUrls: ['./infotage-uebersicht-table.component.scss']
})
export class InfotageUebersichtTableComponent implements OnInit {
    @Input() dataSource: any[];
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    @Input() hideTableButton = false;

    columns = [
        { columnDef: 'titel', header: 'amm.massnahmen.label.titel', cell: (element: any) => `${element.titel}` },
        { columnDef: 'ort', header: 'amm.massnahmen.label.ort', cell: (element: any) => `${element.ort}` },
        { columnDef: 'datum', header: 'common.label.datum', cell: (element: any) => `${element.datum}` },
        { columnDef: 'kurszeiten', header: 'amm.massnahmen.label.kurszeiten', cell: (element: any) => `${element.kurszeiten}` },
        { columnDef: 'teilnehmer', header: 'amm.massnahmen.label.teilnehmer', cell: (element: any) => `${element.teilnehmer}` },
        { columnDef: 'ueberbuchung', header: 'amm.massnahmen.label.ueberbuchung', cell: (element: any) => `${element.ueberbuchung}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '60px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    stateKey = 'infotage-uebersicht-key';

    constructor() {}

    ngOnInit() {
        if (this.hideTableButton) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    itemSelected(row) {
        this.onItemSelected.emit(row.infotagId);
    }
}
