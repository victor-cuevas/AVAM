import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MeldepflichtEnum } from '@app/shared/enums/table-icon-enums';

@Component({
    selector: 'avam-oste-details-modal-anforderungen-beruf-table',
    templateUrl: './modal-anf-beruf-table.component.html'
})
export class ModalAnfBerufTableComponent implements OnInit {
    @Input() dataSource: [];
    @Output() onOpenInfo: EventEmitter<any> = new EventEmitter();

    columns = [
        { columnDef: 'meldepflicht', header: 'arbeitgeber.oste.label.stelleMeldepflicht', cell: (element: any) => `${element.meldepflicht.text}`, width: '65px' },
        { columnDef: 'beruftaetigkeit', header: 'arbeitgeber.oste.label.beruftaetigkeit', cell: (element: any) => `${element.beruftaetigkeit}` },
        { columnDef: 'aehnlicheBerufe', header: 'arbeitgeber.oste.label.aehnlicheBerufe', cell: (element: any) => `${element.aehnlicheBerufe}` },
        { columnDef: 'qualifikation', header: 'arbeitgeber.oste.label.qualifikation', cell: (element: any) => `${element.qualifikation}` },
        { columnDef: 'erfahrung', header: 'arbeitgeber.oste.label.erfahrung', cell: (element: any) => `${element.erfahrung}` },
        { columnDef: 'ausbildungsniveau', header: 'arbeitgeber.oste.label.ausbildungsniveau', cell: (element: any) => `${element.ausbildungsniveau}` },
        { columnDef: 'abschlussInlaendisch', header: 'arbeitgeber.oste.label.abschlussInlaendisch', cell: (element: any) => `${element.abschlussInlaendisch}` },
        { columnDef: 'abschlussAuslaendisch', header: 'arbeitgeber.oste.label.abschlussAuslaendisch', cell: (element: any) => `${element.abschlussAuslaendisch}` },
        { columnDef: 'abschlussAnerkannt', header: 'arbeitgeber.oste.label.abschlussAnerkannt', cell: (element: any) => `${element.abschlussAnerkannt}` },
        { columnDef: 'anmerkungen', header: 'arbeitgeber.oste.label.anmerkungen', cell: (element: any) => `${element.anmerkungen}` }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    meldepflichtEnum = MeldepflichtEnum;

    constructor() {}

    ngOnInit() {}

    openInfo(item) {
        this.onOpenInfo.emit(item);
    }
}
