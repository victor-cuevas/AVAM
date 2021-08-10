import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-wdgaktionen-table',
    templateUrl: './wdgaktionen-table.component.html',
    styleUrls: ['./wdgaktionen-table.component.scss']
})
export class WdgaktionenTableComponent implements OnInit {
    @Input() dataSource: [];
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    columns = [
        { columnDef: 'aktion', header: 'stes.label.wiedereingliederung.aktion', cell: (element: any) => `${element.aktion}` },
        { columnDef: 'erfassungsDatum', header: 'stes.label.wiedereingliederung.erfassungsDatum', cell: (element: any) => `${element.erfassungsDatum}` },
        { columnDef: 'inDerZeitVon', header: 'stes.label.wiedereingliederung.inDerZeitVon', cell: (element: any) => (element.inDerZeitVon ? `${element.inDerZeitVon}` : '') },
        { columnDef: 'bis', header: 'stes.label.wiedereingliederung.bis', cell: (element: any) => (element.inDerZeitVon ? `${element.bis}` : '') },
        { columnDef: 'durchgefuehrt', header: 'stes.label.wiedereingliederung.durchgefuehrt', cell: (element: any) => `${element.durchgefuehrt}` },
        { columnDef: 'bearbeitung', header: 'stes.label.wiedereingliederung.bearbeitung', cell: (element: any) => `${element.bearbeitung}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {}

    itemSelected(aktionId) {
        this.onItemSelected.emit(aktionId);
    }
}
