import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'avam-oste-details-modal-anforderungen-sprache-table',
    templateUrl: './modal-anf-sprache-table.component.html'
})
export class ModalAnfSpracheTableComponent implements OnInit {
    @Input() dataSource: [];
    columns = [
        { columnDef: 'sprache', header: 'arbeitgeber.oste.label.sprache', cell: (element: any) => `${element.sprache}` },
        { columnDef: 'muendlichKenntnisse', header: 'arbeitgeber.oste.label.muendlich', cell: (element: any) => `${element.muendlichKenntnisse}` },
        { columnDef: 'schriftlichKenntnisse', header: 'arbeitgeber.oste.label.schriftlich', cell: (element: any) => `${element.schriftlichKenntnisse}` },
        { columnDef: 'muttersprache', header: 'arbeitgeber.oste.label.muttersprache', cell: (element: any) => `${element.muttersprache}` },
        { columnDef: 'sprachAufenthalt', header: 'arbeitgeber.oste.label.sprachaufenthalt', cell: (element: any) => `${element.sprachAufenthalt}` }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {}
}
