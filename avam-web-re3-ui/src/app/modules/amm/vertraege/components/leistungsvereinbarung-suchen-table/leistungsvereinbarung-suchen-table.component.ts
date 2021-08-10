import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'avam-leistungsvereinbarung-suchen-table',
    templateUrl: './leistungsvereinbarung-suchen-table.component.html'
})
export class LeistungsvereinbarungSuchenTableComponent implements OnInit {
    static readonly STATE_KEY = 'leistungsvereinbarung-search-key';

    @Input() dataSource: [];
    @Input() hideTableButton = false;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    initialSort = true;
    initialDirection = -1;

    columns = [
        {
            columnDef: 'leistungsvereinbarungNr',
            header: 'amm.akquisition.label.leistungsvereinbarungnr',
            cell: (element: any) => `${element.leistungsvereinbarungNr}`,
            width: '200px'
        },
        { columnDef: 'titel', header: 'amm.massnahmen.label.titel', cell: (element: any) => `${element.titel}` },
        { columnDef: 'gueltigVon', header: 'amm.akquisition.label.gueltigvon', cell: (element: any) => `${element.gueltigVon}` },
        { columnDef: 'gueltigBis', header: 'amm.akquisition.label.gueltigbis', cell: (element: any) => `${element.gueltigBis}` },
        { columnDef: 'status', header: 'common.label.status', cell: (element: any) => `${element.status}` },
        { columnDef: 'rahmenvertragNr', header: 'amm.akquisition.label.rahmenvertragnr', cell: (element: any) => `${element.rahmenvertragNr}` },
        { columnDef: 'anbieterName', header: 'amm.planundakqui.label.anbieter', cell: (element: any) => `${element.anbieterName}` },

        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '60px' }
    ];

    displayedColumns = this.columns.map(c => c.columnDef);
    stateKey = LeistungsvereinbarungSuchenTableComponent.STATE_KEY;

    ngOnInit() {
        if (this.hideTableButton) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    itemSelected(row) {
        this.onItemSelected.emit(row);
    }

    sortFunction(event) {
        if (event.field === 'gueltigVon' && this.initialSort && event.order === this.initialDirection) {
            event.data.sort((value1, value2) => {
                const firstComparison = value2.gueltigVon - value1.gueltigVon;

                if (firstComparison !== 0) {
                    return firstComparison;
                }

                return value2.leistungsvereinbarungNr - value1.leistungsvereinbarungNr;
            });
        } else {
            this.initialSort = false;

            if (event.field === 'titel' || event.field === 'status' || event.field === 'anbieterName') {
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
