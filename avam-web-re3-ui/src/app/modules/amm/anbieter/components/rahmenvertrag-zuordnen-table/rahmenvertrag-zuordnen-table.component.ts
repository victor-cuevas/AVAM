import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-rahmenvertrag-zuordnen-table',
    templateUrl: './rahmenvertrag-zuordnen-table.component.html'
})
export class RahmenvertragZuordnenTableComponent {
    @Input() dataSource: [];
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns = [
        {
            columnDef: 'rahmenvertragNr',
            header: 'amm.akquisition.label.rahmenvertragnr',
            cell: (element: any) => `${element.rahmenvertragNr}`
        },
        { columnDef: 'titel', header: 'amm.massnahmen.label.titel', cell: (element: any) => `${element.titel}` },
        { columnDef: 'gueltigVon', header: 'amm.akquisition.label.gueltigvon', cell: (element: any) => `${element.gueltigVon}` },
        { columnDef: 'gueltigBis', header: 'amm.akquisition.label.gueltigbis', cell: (element: any) => `${element.gueltigBis}` },
        { columnDef: 'gueltig', header: 'amm.akquisition.label.gueltig', cell: (element: any) => `${element.gueltig}` },
        { columnDef: 'status', header: 'common.label.status', cell: (element: any) => `${element.status}` },

        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '60px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    stateKey = 'rahmenvertrag-zuordnen-key';

    itemSelected(row) {
        this.onItemSelected.emit(row);
    }

    sortFunction(event) {
        if (event.field === 'initial') {
            event.data.sort((value1, value2) => {
                const firstComparison = value2.gueltigVon - value1.gueltigVon;

                if (firstComparison !== 0) {
                    return firstComparison;
                }

                return value2.rahmenvertragNr - value1.rahmenvertragNr;
            });
        } else {
            const comparableValue = event.data && event.data.length > 0 && event.data[0][event.field];
            if (typeof comparableValue === 'string') {
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
