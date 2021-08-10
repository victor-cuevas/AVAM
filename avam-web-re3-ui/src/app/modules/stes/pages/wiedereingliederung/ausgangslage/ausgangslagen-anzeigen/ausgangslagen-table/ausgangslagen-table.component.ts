import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-ausgangslagen-table',
    templateUrl: './ausgangslagen-table.component.html',
    styleUrls: ['./ausgangslagen-table.component.scss']
})
export class AusgangslagenTableComponent implements OnInit {
    @Input() dataSource: [];
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    columns = [
        { columnDef: 'gultigAb', header: 'stes.label.wiedereingliederung.gultigAb', cell: (element: any) => `${element.gultigAb}` },
        { columnDef: 'vermittelbarkeit', header: 'stes.label.wiedereingliederung.vermittelbarkeit', cell: (element: any) => `${element.vermittelbarkeit}` },
        { columnDef: 'qualifizierungsbedarf', header: 'stes.label.wiedereingliederung.qualifizierungsbedarf', cell: (element: any) => `${element.qualifizierungsbedarf}` },
        { columnDef: 'bearbeitung', header: 'stes.label.wiedereingliederung.bearbeitung', cell: (element: any) => `${element.bearbeitung}` },
        { columnDef: 'stesIdAvam', header: 'stes.label.stesid', cell: (element: any) => `${element.stesIdAvam}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {}

    itemSelected(stesAusgangslageID) {
        this.onItemSelected.emit(stesAusgangslageID);
    }
}
