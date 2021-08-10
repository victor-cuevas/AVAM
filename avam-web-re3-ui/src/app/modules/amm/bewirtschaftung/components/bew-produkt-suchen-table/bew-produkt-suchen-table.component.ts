import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'avam-bew-produkt-suchen-table',
    templateUrl: './bew-produkt-suchen-table.component.html'
})
export class BewProduktSuchenTableComponent implements OnInit {
    static readonly STATE_KEY = 'produkt-search-key';
    @Input() dataSource: [];
    @Input() hideTableButton = false;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns = [
        { columnDef: 'produktId', header: 'amm.massnahmen.label.produktnr', cell: (element: any) => `${element.produktId}` },
        { columnDef: 'titel', header: 'amm.massnahmen.label.titel', cell: (element: any) => `${element.titel}` },
        { columnDef: 'gueltigVon', header: 'common.label.gueltig_von', cell: (element: any) => `${element.gueltigVon}` },
        { columnDef: 'gueltigBis', header: 'common.label.gueltig_bis', cell: (element: any) => `${element.gueltigBis}` },
        { columnDef: 'anzMassnahmen', header: 'amm.massnahmen.label.anzahlmassnahmen', cell: (element: any) => `${element.anzMassnahmen}` },
        { columnDef: 'strkMassn', header: 'amm.massnahmen.label.strukturMassnahmetyp', cell: (element: any) => `${element.strkMassn}` },

        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '60px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    stateKey = BewProduktSuchenTableComponent.STATE_KEY;

    constructor(private router: Router) {}

    ngOnInit() {
        if (this.hideTableButton) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    itemSelected(row) {
        this.router.navigate([`amm/bewirtschaftung/produkt/${row.produktId}/grunddaten`]);
    }
}
