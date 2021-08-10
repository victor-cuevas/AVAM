import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-stes-personenstammdaten-table',
    templateUrl: './stes-personenstammdaten-table.component.html',
    styleUrls: ['./stes-personenstammdaten-table.component.scss']
})
export class StesPersonenstammdatenTableComponent implements OnInit {
    @Input() dataSource: [];
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    columns = [
        { columnDef: 'svnr', header: 'stes.label.svnr', cell: (element: any) => (element.svnr ? `${element.svnr}` : '') },
        { columnDef: 'zasNameVorname', header: 'stes.label.zasNameVorname', cell: (element: any) => (element.zasNameVorname ? `${element.zasNameVorname}` : '') },
        { columnDef: 'geburtsdatum', header: 'stes.label.geburtsdatum', cell: (element: any) => (element.geburtsdatum ? `${element.geburtsdatum}` : '') },
        { columnDef: 'geschlecht', header: 'stes.label.geschlecht', cell: (element: any) => (element.geschlecht ? `${element.geschlecht}` : '') },
        { columnDef: 'zivilstand', header: 'stes.label.zivilstand', cell: (element: any) => (element.zivilstand ? `${element.zivilstand}` : '') },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {}

    itemSelected(personStesId) {
        this.onItemSelected.emit(personStesId);
    }
}
