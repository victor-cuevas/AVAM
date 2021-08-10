import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-vertragswerte-table',
    templateUrl: './vertragswerte-table.component.html'
})
export class VertragswerteTableComponent {
    @Input() dataSource: [] = [];
    @Input() chfTotal = '0.00';
    @Input() tnTageTotal = 0;
    @Input() tnTotal = 0;

    @Output() onItemSelected: EventEmitter<number> = new EventEmitter();

    columns = [
        {
            columnDef: 'vertragswertNr',
            header: 'amm.akquisition.label.vertragswertnr',
            footer: '',
            cell: (element: any) => `${element.vertragswertNr}`
        },
        { columnDef: 'titel', header: 'amm.akquisition.label.titelmassnahmede', footer: '', cell: (element: any) => `${element.titel}` },
        { columnDef: 'gueltigVon', header: 'amm.akquisition.label.gueltigvon', footer: '', cell: (element: any) => `${element.gueltigVon}` },
        { columnDef: 'gueltigBis', header: 'amm.akquisition.label.gueltigbis', footer: '', cell: (element: any) => `${element.gueltigBis}` },
        { columnDef: 'isGueltig', header: 'amm.akquisition.label.gueltig', footer: '', cell: (element: any) => `${element.isGueltig}` },
        { columnDef: 'preismodell', header: 'amm.akquisition.label.preismodell', footer: 'amm.akquisition.label.total', cell: (element: any) => `${element.preismodell}` },
        { columnDef: 'chf', header: 'amm.akquisition.label.chf', footer: '', cell: (element: any) => `${element.chfBetrag}` },
        { columnDef: 'teilnehmerTage', header: 'amm.akquisition.label.tntage', footer: '', cell: (element: any) => `${element.teilnehmerTage}` },
        { columnDef: 'teilnehmer', header: 'amm.akquisition.label.tn', footer: '', cell: (element: any) => `${element.teilnehmer}` },
        { columnDef: 'action', header: '', footer: '', width: '60px' }
    ];

    displayedColumns = this.columns.map(c => c.columnDef);

    stateKey = 'leistungsvereinbarung-vertragswerte-key';

    itemSelected(event) {
        this.onItemSelected.next(event.vertragswertId);
    }

    sortFunction(event) {
        if (event.field === 'initial') {
            event.data.sort((value1, value2) => {
                const firstComparison = value2.gueltigVon - value1.gueltigVon;

                if (firstComparison !== 0) {
                    return firstComparison;
                }

                return value2.vertragswertNr - value1.vertragswertNr;
            });
        } else {
            if (event.field === 'titel' || event.field === 'preismodell') {
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
