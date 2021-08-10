import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-bew-massnahmen-uebersicht-table',
    templateUrl: './bew-massnahmen-uebersicht-table.component.html'
})
export class BewMassnahmenUebersichtTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() productId: number;
    @Input() hideTableButton = false;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns = [
        { columnDef: 'massnahmenNr', header: 'amm.massnahmen.label.massnahmennr', cell: (element: any) => `${element.massnahmenNr}` },
        { columnDef: 'titel', header: 'amm.massnahmen.label.titel', cell: (element: any) => `${element.titel}` },
        { columnDef: 'zulassungsTyp', header: 'amm.massnahmen.label.zulassungstyp', cell: (element: any) => `${element.zulassungsTyp}` },
        { columnDef: 'gueltigVon', header: 'common.label.gueltig_von', cell: (element: any) => `${element.gueltigVon}` },
        { columnDef: 'gueltigBis', header: 'common.label.gueltig_bis', cell: (element: any) => `${element.gueltigBis}` },
        { columnDef: 'anbieter', header: 'amm.massnahmen.label.anbieter', cell: (element: any) => `${element.anbieter}` },

        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '60px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    stateKey = 'massnahmen-uebersicht-key';

    constructor() {}

    ngOnInit() {
        if (this.hideTableButton) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    itemSelected(row) {
        this.onItemSelected.next(row);
    }

    sortFunction(event) {
        if (event.field === 'initial') {
            event.data.sort((value1, value2) => {
                const firstComparison = value1['titel'].localeCompare(value2['titel']);

                if (firstComparison !== 0) {
                    return firstComparison;
                }

                const secondComparison = value1.gueltigVon - value2.gueltigVon;

                if (secondComparison !== 0) {
                    return secondComparison;
                }

                const thirdComparison = value1['anbieter'].localeCompare(value2['anbieter']);

                if (thirdComparison !== 0) {
                    return thirdComparison;
                }

                return value1.massnahmenNr - value2.massnahmenNr;
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
