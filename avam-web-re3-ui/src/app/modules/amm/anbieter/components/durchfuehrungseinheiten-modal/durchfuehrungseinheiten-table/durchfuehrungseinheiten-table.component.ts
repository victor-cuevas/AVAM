import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-durchfuehrungseinheiten-table',
    templateUrl: './durchfuehrungseinheiten-table.component.html'
})
export class DurchfuehrungseinheitenTableComponent implements OnInit {
    @Input() dataSource: [];
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns = [
        { columnDef: 'nummer', header: 'amm.nutzung.label.nummer', cell: (element: any) => `${element.nummer}` },
        { columnDef: 'titel', header: 'amm.massnahmen.label.titel', cell: (element: any) => `${element.titel}` },
        { columnDef: 'typ', header: 'amm.nutzung.label.typ', cell: (element: any) => `${element.typ}` },
        { columnDef: 'von', header: 'amm.abrechnungen.label.von', cell: (element: any) => `${element.von}` },
        { columnDef: 'bis', header: 'amm.abrechnungen.label.bis', cell: (element: any) => `${element.bis}` },
        { columnDef: 'status', header: 'amm.abrechnungen.label.status', cell: (element: any) => `${element.status}` },
        { columnDef: 'zulassungsTyp', header: 'amm.massnahmen.label.zulassungstyp', cell: (element: any) => `${element.zulassungsTyp}` },
        { columnDef: 'anbieter', header: 'amm.massnahmen.label.anbieter', cell: (element: any) => `${element.anbieter}` }
    ];

    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {}

    itemSelected(row) {
        this.onItemSelected.next(row);
    }
}
