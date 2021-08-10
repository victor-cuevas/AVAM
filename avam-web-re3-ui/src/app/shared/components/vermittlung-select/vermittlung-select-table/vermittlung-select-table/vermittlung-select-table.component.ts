import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MeldepflichtEnum } from '@app/shared/enums/table-icon-enums';

@Component({
    selector: 'avam-vermittlung-select-table',
    templateUrl: './vermittlung-select-table.component.html'
})
export class VermittlungSelectTableComponent implements OnInit {
    @Input() dataSource: [] = [];
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns = [
        { columnDef: 'meldepflicht', header: 'arbeitgeber.oste.label.stelleMeldepflicht', cell: (element: any) => element.meldepflicht, width: '65px' },
        { columnDef: 'vom', header: 'stes.label.zuweisungstes.zuweisungsdatum', dataType: 'date', cell: (element: any) => `${element.vom}` },
        { columnDef: 'nr', header: 'stes.label.zuweisungstes.zuweisungsnummer', cell: (element: any) => `${element.nr}` },
        {
            columnDef: 'stellenbezeichnung',
            header: 'stes.label.vermittlung.stellenbezeichnung',
            cell: (element: any) => (element.stellenbezeichnung ? `${element.stellenbezeichnung}` : '')
        },
        { columnDef: 'unternehmensname', header: 'stes.label.arbeitgeberName', cell: (element: any) => (element.unternehmensname ? `${element.unternehmensname}` : '') },
        { columnDef: 'ort', header: 'stes.label.vermittlung.ort', cell: (element: any) => (element.ort ? `${element.ort}` : '') },
        { columnDef: 'stesIdAvam', header: 'stes.label.vermittlung.stesId', cell: (element: any) => `${element.stesIdAvam}` },
        { columnDef: 'status', header: 'stes.label.vermittlung.status', cell: (element: any) => `${element.status}` },
        { columnDef: 'ergebnis', header: 'stes.label.zuweisungstes.vermittlungsstand', cell: (element: any) => (element.ergebnis ? `${element.ergebnis}` : '') },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    meldepflichtEnum = MeldepflichtEnum;
    constructor() {}

    ngOnInit() {}

    itemSelected(data) {
        this.onItemSelected.emit(data);
    }
}
