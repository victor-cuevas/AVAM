import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'avam-bew-massnahme-teilnehmerplaetze-table',
    templateUrl: './bew-massnahme-teilnehmerplaetze-table.component.html'
})
export class BewMassnahmeTeilnehmerplaetzeTableComponent implements OnInit {
    @Input() dataSource: any;

    constructor() {}

    ngOnInit() {}
}
