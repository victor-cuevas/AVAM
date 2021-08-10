import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AmmConstants } from '@app/shared/enums/amm-constants';

@Component({
    selector: 'avam-bew-dfe-suchen-table',
    templateUrl: './bew-dfe-suchen-table.component.html',
    styleUrls: ['./bew-dfe-suchen-table.component.scss']
})
export class BewDfeSuchenTableComponent implements OnInit {
    static readonly STATE_KEY = 'dfe-search-key';
    @Input() dataSource: [];
    @Input() hideTableButton = false;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns = [
        { columnDef: 'durchfuehrungseinheitId', header: 'amm.nutzung.label.nummer', cell: (element: any) => `${element.durchfuehrungseinheitId}` },
        { columnDef: 'titel', header: 'amm.massnahmen.label.titel', cell: (element: any) => `${element.titel}` },
        { columnDef: 'typ', header: 'amm.massnahmen.label.typ', cell: (element: any) => `${this.dfeType(element.typ)}` },
        { columnDef: 'zulassungsTyp', header: 'amm.massnahmen.label.zulassungstyp', cell: (element: any) => `${element.zulassungsTyp}` },
        { columnDef: 'status', header: 'amm.massnahmen.label.status', cell: (element: any) => (element.status ? `${element.status}` : '') },
        { columnDef: 'anbieter', header: 'amm.massnahmen.label.anbieter', cell: (element: any) => (element.anbieter ? `${element.anbieter}` : '') },
        { columnDef: 'gueltigVon', header: 'common.label.gueltig_von', cell: (element: any) => `${element.gueltigVon}` },
        { columnDef: 'gueltigBis', header: 'common.label.gueltig_bis', cell: (element: any) => `${element.gueltigBis}` },
        { columnDef: 'stichtag', header: 'amm.massnahmen.label.stichtag', cell: (element: any) => (element.stichtag ? `${element.stichtag}` : '') },
        { columnDef: 'minPlaetze', header: 'common.label.min', cell: (element: any) => (element.minPlaetze ? `${element.minPlaetze}` : '') },
        { columnDef: 'maxPlaetze', header: 'common.label.max', cell: (element: any) => (element.maxPlaetze ? `${element.maxPlaetze}` : '') },
        { columnDef: 'anzBuchungen', header: 'amm.massnahmen.label.platzsicht.anzahlbuchungen', cell: (element: any) => (element.anzBuchungen ? `${element.anzBuchungen}` : '') },
        {
            columnDef: 'anzWartelistePlaetze',
            header: 'amm.massnahmen.subnavmenuitem.warteliste',
            cell: (element: any) => (element.anzWartelistePlaetze ? `${element.anzWartelistePlaetze}` : '')
        },

        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '60px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    stateKey = BewDfeSuchenTableComponent.STATE_KEY;

    constructor() {}

    ngOnInit() {
        if (this.hideTableButton) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    itemSelected(row) {
        this.onItemSelected.next(row);
    }

    private dfeType(entryType: string): string {
        if (entryType === AmmConstants.ENTRY_PRAKTIKUMSSTELLE) {
            return 'amm.massnahmen.label.praktikumsstelle';
        }
        if (entryType === AmmConstants.ENTRY_ARBEITSPLATZKATEGORIE) {
            return 'amm.massnahmen.label.arbeitsplatzkategorie';
        }
        if (entryType === AmmConstants.ENTRY_SESSION) {
            return 'amm.massnahmen.label.kurs';
        }
        if (entryType === AmmConstants.ENTRY_STANDORT) {
            return 'amm.massnahmen.label.standort';
        }
        return '';
    }
}
