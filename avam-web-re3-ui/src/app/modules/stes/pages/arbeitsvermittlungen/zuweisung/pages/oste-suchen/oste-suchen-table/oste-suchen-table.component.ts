import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MeldepflichtEnum } from '@app/shared/enums/table-icon-enums';

@Component({
    selector: 'avam-oste-suchen-table',
    templateUrl: './oste-suchen-table.component.html',
    styleUrls: ['./oste-suchen-table.component.scss']
})
export class OsteSuchenTableComponent implements OnInit {
    @Input() dataSource: [] = [];
    @Input() forPrinting = false;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    columns = [
        { columnDef: 'meldepflicht', header: 'arbeitgeber.oste.label.stelleMeldepflicht', cell: (element: any) => element.meldepflicht, width: '65px' },
        { columnDef: 'stellenbezeichnung', header: 'arbeitgeber.label.stellenbezeichnung', cell: (element: any) => `${element.stellenbezeichnung}`, width: '300px' },
        { columnDef: 'beschaeftingungsgrad', header: 'common.label.prozentzeichen', cell: (element: any) => `${element.beschaeftingungsgrad}`, width: '90px' },
        { columnDef: 'arbeitsort', header: 'arbeitgeber.label.arbeitsort', cell: (element: any) => `${element.arbeitsort}` },
        { columnDef: 'arbeitgeberName', header: 'arbeitgeber.label.namearbeitgeber', cell: (element: any) => `${element.arbeitgeberName}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    meldepflichtEnum = MeldepflichtEnum;
    stateKey = 'stellenangebote-search-key';

    constructor() {}

    ngOnInit() {
        if (this.forPrinting) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    itemSelected(osteId) {
        this.onItemSelected.emit(osteId);
    }
}
