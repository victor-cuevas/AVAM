import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { RegionAuswaehlenRowInterface } from '../region-auswaehlen-row.interface';
import { RegionenAuswaehlenComponent } from '../regionen-auswaehlen.component';

@Component({
    selector: 'avam-regionen-auswaehlen-table',
    templateUrl: './regionen-auswaehlen-table.component.html'
})
export class RegionenAuswaehlenTableComponent implements OnInit {
    @Input() dataSource: RegionenAuswaehlenComponent[];
    @Input() sortField: string;
    @Input() isPrintTable = false;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns = [
        { columnDef: 'code', header: 'common.label.code', cell: (element: any) => `${element.code}` },
        { columnDef: 'bezeichnung', header: 'common.label.bezeichnung', cell: (element: any) => `${element.bezeichnung}` },
        { columnDef: 'typ', header: 'common.label.typ', cell: (element: any) => `${element.typ}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {
        if (this.isPrintTable) {
            this.displayedColumns = this.columns.filter(col => col.columnDef !== 'action').map(c => c.columnDef);
        }
    }

    itemSelected(data: RegionAuswaehlenRowInterface) {
        this.onItemSelected.emit(data);
    }
}
