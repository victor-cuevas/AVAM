import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RahmenfristDropDownAktionenEnum } from '../stes-rahmenfristen.component';

@Component({
    selector: 'avam-stes-rahmenfristen-table',
    templateUrl: './stes-rahmenfristen-table.component.html',
    styleUrls: ['./stes-rahmenfristen-table.component.scss']
})
export class StesRahmenfristenTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() aktionenOptions: [];
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    @Output() openAuszahlungenRahmenfrist: EventEmitter<any> = new EventEmitter();
    @Output() openZwischenVerdienst: EventEmitter<any> = new EventEmitter();
    columns = [
        { columnDef: 'gueltigAb', header: 'stes.asal.table.gueltigab', cell: (element: any) => (element.gueltigAb ? `${element.gueltigAb}` : '') },
        { columnDef: 'anspruch', header: 'stes.asal.table.anspruch', cell: (element: any) => (element.anspruch ? `${element.anspruch}` : '') },
        { columnDef: 'alkZahlstelle', header: 'stes.asal.table.alkzahlstelle', cell: (element: any) => (element.alkZahlstelle ? `${element.alkZahlstelle}` : '') },
        { columnDef: 'rahmenfristDauer', header: 'stes.asal.table.rahmenfristdauer', cell: (element: any) => (element.rahmenfristDauer ? `${element.rahmenfristDauer}` : '') },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '170px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {}

    itemSelected(rahmenfristId) {
        this.onItemSelected.emit(rahmenfristId);
    }

    onActionSelected(aktionId, rahmenfristId) {
        if (aktionId === RahmenfristDropDownAktionenEnum.AUSZAHLUNGEN) {
            this.openAuszahlungenRahmenfrist.emit(rahmenfristId);
        } else if (aktionId === RahmenfristDropDownAktionenEnum.ZWISCHENVERDIENST) {
            this.openZwischenVerdienst.emit(rahmenfristId);
        }
    }
}
