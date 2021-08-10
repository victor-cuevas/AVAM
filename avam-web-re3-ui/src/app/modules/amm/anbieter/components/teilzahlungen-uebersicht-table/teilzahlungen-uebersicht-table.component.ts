import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

export enum TeilzahlungenTableType {
    UEBERSICHT,
    ZUORDNEN
}

@Component({
    selector: 'avam-teilzahlungen-uebersicht-table',
    templateUrl: './teilzahlungen-uebersicht-table.component.html',
    styleUrls: ['./teilzahlungen-uebersicht-table.component.scss']
})
export class TeilzahlungenUebersichtTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() hideTableButton = false;
    @Input() tableType: TeilzahlungenTableType;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns = [
        { columnDef: 'teilzahlungNr', header: 'amm.zahlungen.label.teilzahlungsnr', cell: (element: any) => `${element.teilzahlungNr}`, width: '150px' },
        { columnDef: 'titel', header: 'amm.massnahmen.label.titel', cell: (element: any) => `${element.titel}`, width: '350px' },
        { columnDef: 'ausfuehrungsdatum', header: 'amm.zahlungen.label.ausfuehrungsdatum', cell: (element: any) => `${element.ausfuehrungsdatum}`, width: '120px' },
        { columnDef: 'status', header: 'amm.massnahmen.label.status', cell: (element: any) => `${element.status}`, width: '200px' },

        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '60px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    stateKey: string;
    types = TeilzahlungenTableType;
    customSort: boolean;
    sortField: string;

    ngOnInit() {
        if (this.hideTableButton) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }

        if (this.tableType === TeilzahlungenTableType.UEBERSICHT) {
            this.customSort = true;
            this.sortField = 'initial';
            this.stateKey = 'teilzahlungen-uebersicht-search-key';
        } else if (this.tableType === TeilzahlungenTableType.ZUORDNEN) {
            this.customSort = false;
            this.sortField = 'ausfuehrungsdatum';
            this.stateKey = null;
        }
    }

    itemSelected(row) {
        this.onItemSelected.emit(row);
    }

    // custom sorting for TableType.UEBERSICHT only
    sortFunction(event) {
        if (event.field === 'initial') {
            event.data.sort((value1, value2) => {
                const firstComparison = value2.ausfuehrungsdatum - value1.ausfuehrungsdatum;

                if (firstComparison !== 0) {
                    return firstComparison;
                }

                return value2.teilzahlungNr - value1.teilzahlungNr;
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
