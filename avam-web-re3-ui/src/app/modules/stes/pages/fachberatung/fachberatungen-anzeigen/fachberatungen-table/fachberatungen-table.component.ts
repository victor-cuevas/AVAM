import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-fachberatungen-table',
    templateUrl: './fachberatungen-table.component.html',
    styleUrls: ['./fachberatungen-table.component.scss']
})
export class FachberatungenTableComponent implements OnInit {
    @Input() dataSource: [];
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    columns = [
        { columnDef: 'zuweisungDatumVom', header: 'stes.label.fachberatung.zuweisungvom', cell: (element: any) => `${element.zuweisungDatumVom}`, width: '110px' },
        { columnDef: 'zuweisungNr', header: 'stes.label.fachberatung.zuweisungnr', cell: (element: any) => `${element.zuweisungNr}`, width: '80px' },
        { columnDef: 'fachberatungsbereich', header: 'stes.label.fachberatung.beratungsbereich', cell: (element: any) => `${element.fachberatungsbereich}` },
        { columnDef: 'bezeichnung', header: 'stes.label.fachberatung.bezeichnung', cell: (element: any) => `${element.bezeichnung}` },
        { columnDef: 'zuweisungsStatus', header: 'stes.label.fachberatung.status', cell: (element: any) => `${element.zuweisungsStatus}` },
        { columnDef: 'angebotNr', header: 'stes.label.fachberatung.angebotnr', cell: (element: any) => `${element.angebotNr}`, width: '150px' },
        { columnDef: 'stesIdAvam', header: 'stes.label.stesid', cell: (element: any) => `${element.stesIdAvam}`, width: '110px' },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {}

    itemSelected(zuweisungStesFachberatungId) {
        this.onItemSelected.emit(zuweisungStesFachberatungId);
    }
}
