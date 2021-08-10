import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface VertragswertZuordnenTableRow {
    vertragswertId: number;
    vertragswertNr: number | string;
    profilNr: number | string;
    gueltigVon: Date | string;
    gueltigBis: Date | string;
    preismodell: string;
    gueltig: string;
    chf: string | number;
    tnTage: number | string;
    tn: number | string;
}

@Component({
    selector: 'avam-bew-vertragswert-zuordnen-table',
    templateUrl: './bew-vertragswert-zuordnen-table.component.html'
})
export class BewVertragswertZuordnenTableComponent {
    @Input() dataSource: [];
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns = [
        { columnDef: 'vertragswertNr', header: 'amm.akquisition.label.vertragswertnr', cell: (element: VertragswertZuordnenTableRow) => `${element.vertragswertNr}` },
        { columnDef: 'profilNr', header: 'amm.akquisition.label.profilnr', cell: (element: VertragswertZuordnenTableRow) => `${element.profilNr}` },
        { columnDef: 'gueltigVon', header: 'common.label.gueltig_von', cell: (element: VertragswertZuordnenTableRow) => `${element.gueltigVon}` },
        { columnDef: 'gueltigBis', header: 'common.label.gueltig_bis', cell: (element: VertragswertZuordnenTableRow) => `${element.gueltigBis}` },
        { columnDef: 'preismodell', header: 'amm.akquisition.label.preismodell', cell: (element: VertragswertZuordnenTableRow) => `${element.preismodell}` },
        { columnDef: 'gueltig', header: 'amm.akquisition.label.gueltig', cell: (element: VertragswertZuordnenTableRow) => `${element.gueltig}` },
        { columnDef: 'chf', header: 'amm.akquisition.label.chf', cell: (element: VertragswertZuordnenTableRow) => `${element.chf}` },
        { columnDef: 'tnTage', header: 'amm.akquisition.label.tntage', cell: (element: VertragswertZuordnenTableRow) => `${element.tnTage}` },
        { columnDef: 'tn', header: 'amm.akquisition.label.tn', cell: (element: VertragswertZuordnenTableRow) => `${element.tn}` },

        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '60px' }
    ];

    displayedColumns = this.columns.map(c => c.columnDef);
    stateKey = 'vertragswert-zuordnen-key';

    itemSelected(row) {
        this.onItemSelected.emit(row);
    }
}
