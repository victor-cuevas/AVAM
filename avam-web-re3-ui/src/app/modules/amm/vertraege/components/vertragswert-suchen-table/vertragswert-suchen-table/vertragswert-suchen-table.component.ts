import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'avam-vertragswert-suchen-table',
    templateUrl: './vertragswert-suchen-table.component.html'
})
export class VertragswertSuchenTableComponent {
    @Input() dataSource: [];
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    initialSort = true;
    initialDirection = -1;

    columns = [
        {
            columnDef: 'vertragswertNr',
            header: 'amm.akquisition.label.vertragswertnr',
            cell: (element: any) => `${element.vertragswertNr}`,
            width: '200px'
        },
        { columnDef: 'chfBetrag', header: 'amm.zahlungen.label.chf', cell: (element: any) => `${element.chfBetrag}` },
        { columnDef: 'gueltigVon', header: 'amm.akquisition.label.gueltigvon', cell: (element: any) => `${element.gueltigVon}` },
        { columnDef: 'gueltigBis', header: 'amm.akquisition.label.gueltigbis', cell: (element: any) => `${element.gueltigBis}` },
        { columnDef: 'gueltigB', header: 'amm.zahlungen.label.gueltig', cell: (element: any) => `${element.gueltigB}` },
        { columnDef: 'profilNr', header: 'amm.akquisition.label.profilnr', cell: (element: any) => `${element.profilNr}` },
        { columnDef: 'vertragswerttyp', header: 'amm.akquisition.label.vertragswerttyp', cell: (element: any) => `${element.vertragswerttyp}` },
        { columnDef: 'titel', header: 'amm.akquisition.label.titelmassnahmede', cell: (element: any) => `${element.titel}` },
        { columnDef: 'anbieterName', header: 'amm.planundakqui.label.anbieter', cell: (element: any) => `${element.anbieterName}` },
        { columnDef: 'leistungsvereinbarungNr', header: 'amm.akquisition.label.leistungsvereinbarungnr', cell: (element: any) => `${element.leistungsvereinbarungNr}` },
        { columnDef: 'status', header: 'common.label.status', cell: (element: any) => `${element.status}` },

        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '60px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    stateKey = 'vertragswert-search-key';

    itemSelected(row) {
        this.onItemSelected.emit(row);
    }

    sortFunction(event) {
        if (event.field === 'gueltigVon' && this.initialSort && event.order === this.initialDirection) {
            event.data.sort((value1, value2) => {
                const firstComparison = value2.gueltigVon - value1.gueltigVon;
                const secondComparison = value2.profilNr - value1.profilNr;
                const thirdComparison = value2.vertragswertNr - value1.vertragswertNr;
                const fourthComparison = value2.leistungsvereinbarungNr - value1.leistungsvereinbarungNr;

                if (firstComparison !== 0) {
                    return firstComparison;
                } else if (secondComparison !== 0) {
                    return secondComparison;
                } else if (thirdComparison !== 0) {
                    return thirdComparison;
                } else if (fourthComparison !== 0) {
                    return fourthComparison;
                }
            });
        } else {
            this.initialSort = false;

            if (event.field === 'status' || event.field === 'anbieterName') {
                event.data.sort((value1, value2) => {
                    if (event.order === 1) {
                        return value1[event.field].localeCompare(value2[event.field]);
                    }
                    if (event.order === -1) {
                        return value2[event.field].localeCompare(value1[event.field]);
                    }
                });
            } else {
                event.data.sort((value1, value2) => {
                    if (event.order === 1) {
                        return value1[event.field] - value2[event.field];
                    }
                    if (event.order === -1) {
                        return value2[event.field] - value1[event.field];
                    }
                });
            }
        }
    }
}
