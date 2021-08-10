import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MeldepflichtEnum } from '@app/shared/enums/table-icon-enums';

@Component({
    selector: 'avam-arbeitsvermittlungen-table',
    templateUrl: './arbeitsvermittlungen-table.component.html',
    styleUrls: ['./arbeitsvermittlungen-table.component.scss']
})
export class ArbeitsvermittlungenTableComponent implements OnInit {
    @Input() dataSource: [];
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    columns = [
        { columnDef: 'meldepflicht', header: 'arbeitgeber.oste.label.stelleMeldepflicht', cell: (element: any) => element.meldepflicht, width: '65px' },
        { columnDef: 'zuweisungDatumVom', header: 'stes.label.zuweisungstes.zuweisungsdatum', cell: (element: any) => element.zuweisungDatumVom },
        {
            columnDef: 'zuweisungNr',
            header: 'stes.label.zuweisungstes.zuweisungsnummer',
            cell: (element: any) => (element.schnellZuweisungFlag ? 'SZ-' : 'Z-') + element.zuweisungNr
        },
        { columnDef: 'stellenbezeichnung', header: 'stes.label.vermittlung.stellenbezeichnung', cell: (element: any) => element.stellenbezeichnung },
        { columnDef: 'unternehmensname', header: 'stes.label.arbeitgeberName', cell: (element: any) => element.unternehmensname },
        { columnDef: 'ort', header: 'stes.label.vermittlung.ort', cell: (element: any) => element.ort },
        { columnDef: 'stesIdAvam', header: 'stes.label.vermittlung.stesId', cell: (element: any) => element.stesIdAvam },
        { columnDef: 'zuweisungStatus', header: 'stes.label.vermittlung.status', cell: (element: any) => element.zuweisungStatus },
        { columnDef: 'vermittlungsstand', header: 'stes.label.zuweisungstes.vermittlungsstand', cell: (element: any) => element.vermittlungsstand },
        { columnDef: 'action', header: '', cell: (element: any) => element.action, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    meldepflichtEnum = MeldepflichtEnum;
    stateKey = 'arbeitsvermittlungen-anzeigen-table';

    constructor() {}

    ngOnInit() {}

    itemSelected(selectedRow) {
        this.onItemSelected.emit(selectedRow);
    }
}
