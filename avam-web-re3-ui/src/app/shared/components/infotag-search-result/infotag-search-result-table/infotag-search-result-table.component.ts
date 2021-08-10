import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'avam-infotag-search-result-table',
    templateUrl: './infotag-search-result-table.component.html'
})
export class InfotagSearchResultTableComponent implements OnInit {
    @Input() displayedColumns: [];
    @Input() columns: [];
    @Input() dataSource: [];
    @Input() sortField;
    @Output() onOeffnen: EventEmitter<any> = new EventEmitter();
    @Output() onUebernehmen: EventEmitter<any> = new EventEmitter();

    constructor() {}

    ngOnInit() {}

    uebernehmen(data) {
        this.onUebernehmen.emit(data);
    }

    oeffnen(data) {
        this.onOeffnen.emit(data);
    }
}
