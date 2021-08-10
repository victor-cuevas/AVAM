import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'avam-bew-massnahme-teilnehmerliste-table',
    templateUrl: './bew-massnahme-teilnehmerliste-table.component.html'
})
export class BewMassnahmeTeilnehmerlisteTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() displayKurseCheckboxes = false;
    @Input() isWarteliste = false;
    @Input() parentForm: FormGroup;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns;
    displayedColumns;
    stateKey = 'massnahme-teilnehmerliste-search-key';

    ngOnInit() {
        this.columns = [
            { columnDef: 'kanton', header: 'common.label.kanton', cell: (element: any) => `${element.kanton}` },
            { columnDef: 'platz', header: 'amm.massnahmen.label.platz', cell: (element: any) => `${element.platz}` },
            { columnDef: 'teilnehmer', header: 'amm.massnahmen.label.teilnehmer', cell: (element: any) => `${element.teilnehmer}` },
            { columnDef: 'personenNr', header: 'amm.massnahmen.label.personenNr', cell: (element: any) => `${element.personenNr}` },
            { columnDef: 'benutzerId', header: 'amm.massnahmen.label.benutzerId', cell: (element: any) => `${element.benutzerId}` },
            { columnDef: 'bearbeitung', header: 'amm.massnahmen.label.bearbeitung', cell: (element: any) => `${element.bearbeitung}` },
            { columnDef: 'benutzerstelle', header: 'amm.massnahmen.label.benutzerstelle', cell: (element: any) => `${element.benutzerstelle}` },
            { columnDef: 'buchungsdatum', header: 'amm.massnahmen.label.buchungsdatum', cell: (element: any) => `${element.buchungsdatum}` },
            { columnDef: 'von', header: 'amm.massnahmen.label.von', cell: (element: any) => `${element.von}` },
            { columnDef: 'bis', header: 'amm.massnahmen.label.bis', cell: (element: any) => `${element.bis}` },
            { columnDef: 'abbruch', header: 'amm.massnahmen.label.abbruch', cell: (element: any) => `${element.abbruch}` },
            { columnDef: 'entscheidart', header: 'amm.massnahmen.label.entscheidart', cell: (element: any) => `${element.entscheidart}` },
            { columnDef: 'status', header: 'amm.massnahmen.label.status', cell: (element: any) => `${element.status}` }
        ];

        if (this.displayKurseCheckboxes) {
            this.columns.unshift({ columnDef: 'checkbox', header: '', width: '45px' });
            this.columns.push({ columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '114px' });
        }

        this.displayedColumns = this.columns.map(c => c.columnDef);
    }

    itemSelected(row) {
        this.onItemSelected.emit(row);
    }
}
