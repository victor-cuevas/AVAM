import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-leistungsexporte-table',
    templateUrl: './leistungsexporte-table.component.html',
    styleUrls: ['./leistungsexporte-table.component.scss']
})
export class LeistungsexporteTableComponent implements OnInit {
    @Input() dataSource: [];
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    columns = [
        { columnDef: 'antragsDatum', header: 'stes.label.antragdatum', cell: (element: any) => `${element.antragsDatum}` },
        { columnDef: 'zielstaat', header: 'stes.label.zielstaat', cell: (element: any) => `${element.zielstaat}` },
        { columnDef: 'abreiseDatum', header: 'stes.label.datumabreise', cell: (element: any) => `${element.abreiseDatum}` },
        { columnDef: 'leistungExpVon', header: 'stes.label.datumlstexpvon', cell: (element: any) => `${element.leistungExpVon}` },
        { columnDef: 'bis', header: 'common.label.bis', cell: (element: any) => `${element.bis}` },
        { columnDef: 'sachbearbeitung', header: 'stes.label.relBenutzer', cell: (element: any) => `${element.sachbearbeitung}` },
        { columnDef: 'stesIdAvam', header: 'stes.label.stesid', cell: (element: any) => `${element.stesIdAvam}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {}

    itemSelected(leistungsexportId) {
        this.onItemSelected.emit(leistungsexportId);
    }
}
