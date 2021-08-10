import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-wdgziele-table',
    templateUrl: './wdgziele-table.component.html',
    styleUrls: ['./wdgziele-table.component.scss']
})
export class WdgzieleTableComponent implements OnInit {
    @Input() dataSource: [];
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    columns = [
        { columnDef: 'ziel', header: 'stes.label.wiedereingliederung.ziel', cell: (element: any) => (element.ziel ? `${element.ziel}` : '') },
        {
            columnDef: 'erfassungsdatum',
            header: 'stes.label.wiedereingliederung.erfassungsDatum',
            cell: (element: any) => (element.erfassungsdatum ? `${element.erfassungsdatum}` : '')
        },
        { columnDef: 'fristBis', header: 'stes.label.wiedereingliederung.fristBis', cell: (element: any) => (element.fristBis ? `${element.fristBis}` : '') },
        { columnDef: 'erreicht', header: 'stes.label.wiedereingliederung.erreicht', cell: (element: any) => (element.erreicht ? `${element.erreicht}` : '') },
        { columnDef: 'bearbeitung', header: 'stes.label.wiedereingliederung.bearbeitung', cell: (element: any) => (element.bearbeitung ? `${element.bearbeitung}` : '') },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {}

    itemSelected(zielId) {
        this.onItemSelected.emit(zielId);
    }
}
