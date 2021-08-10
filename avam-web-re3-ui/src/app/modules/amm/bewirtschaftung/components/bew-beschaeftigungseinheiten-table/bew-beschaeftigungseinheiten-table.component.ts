import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { BewBeschaeftigungseinheitenTableHandlerService } from './bew-beschaeftigungseinheiten-table-handler.service';
import { Router } from '@angular/router';
import { BeschaeftigungseinheitDTO } from '@app/shared/models/dtos-generated/beschaeftigungseinheitDTO';

@Component({
    selector: 'avam-bew-beschaeftigungseinheiten-table',
    templateUrl: './bew-beschaeftigungseinheiten-table.component.html',
    providers: [BewBeschaeftigungseinheitenTableHandlerService]
})
export class BewBeschaeftigungseinheitenTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() firstRowHeader: string;
    @Input() hideTableButton = false;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns = [];
    displayedColumns: any[];

    constructor(private handler: BewBeschaeftigungseinheitenTableHandlerService, private router: Router) {}

    ngOnInit() {
        this.columns = [
            { columnDef: 'beschaeftigungseinheitId', header: this.firstRowHeader, cell: (element: any) => `${element.beschaeftigungseinheitId}` },
            { columnDef: 'titel', header: 'amm.massnahmen.label.titel', cell: (element: any) => `${element.titel}` },
            { columnDef: 'taetigkeit', header: 'amm.nutzung.label.taetigkeit', cell: (element: any) => `${element.taetigkeit}` },
            { columnDef: 'gueltigVon', header: 'common.label.gueltig_von', cell: (element: any) => `${element.gueltigVon}` },
            { columnDef: 'gueltigBis', header: 'common.label.gueltig_bis', cell: (element: any) => `${element.gueltigBis}` },
            { columnDef: 'kapazitaetmax', header: 'amm.massnahmen.label.kapazitaetmax', cell: (element: any) => `${element.kapazitaetmax}` },
            { columnDef: 'verfuegbarkeit', header: 'amm.massnahmen.label.verfuegbarkeit', cell: (element: any) => `${element.verfuegbarkeit}` },
            { columnDef: 'beschaeftigungmax', header: 'amm.massnahmen.label.beschaeftigungmax', cell: (element: any) => `${element.beschaeftigungmax}` },

            { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '60px' }
        ];
        this.displayedColumns = this.columns.map(c => c.columnDef);

        if (this.hideTableButton) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    createTableRow(responseDTO: BeschaeftigungseinheitDTO, index: number) {
        return this.handler.createRow(responseDTO, index);
    }

    itemSelected(row) {
        this.onItemSelected.next(row);
    }
}
