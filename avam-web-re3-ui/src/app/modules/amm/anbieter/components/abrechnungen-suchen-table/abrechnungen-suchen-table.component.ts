import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'avam-abrechnungen-suchen-table',
    templateUrl: './abrechnungen-suchen-table.component.html',
    styleUrls: ['./abrechnungen-suchen-table.component.scss']
})
export class AbrechnungenSuchenTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() showAdditionalInformation: boolean;
    @Input() forPrinting: boolean;
    @Input() isButtonZuordnen = false;
    @Input() stateKey: string;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    columns: any[];
    firstColumnGroup = [
        { columnDef: 'abrechnungNr', header: 'amm.abrechnungen.label.abrechnungsnr', cell: (element: any) => `${element.abrechnungNr}` },
        { columnDef: 'titel', header: 'amm.abrechnungen.label.titel', cell: (element: any) => `${element.titel}` }
    ];
    anbieterName = [{ columnDef: 'anbieterName', header: 'amm.abrechnungen.label.anbieter', cell: (element: any) => `${element.anbieterName}` }];
    secondColumnGroup = [
        { columnDef: 'ausfuehrungsdatum', header: 'amm.abrechnungen.label.ausfuehrungsdatum', cell: (element: any) => `${element.ausfuehrungsdatum}` },
        { columnDef: 'status', header: 'amm.abrechnungen.label.status', cell: (element: any) => `${element.status}` }
    ];
    thirdColumnGroup = [
        { columnDef: 'vorgaenger', header: 'amm.abrechnungen.label.vorgaenger', cell: (element: any) => `${element.vorgaenger}` },
        { columnDef: 'nachfolger', header: 'amm.abrechnungen.label.nachfolger', cell: (element: any) => `${element.nachfolger}` }
    ];
    action = [{ columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '60px' }];

    displayedColumns: any[];

    constructor() {}

    ngOnInit() {
        this.columns = this.showAdditionalInformation
            ? [...this.firstColumnGroup, ...this.anbieterName, ...this.secondColumnGroup, ...this.thirdColumnGroup, ...this.action]
            : [...this.firstColumnGroup, ...this.secondColumnGroup, ...this.action];
        if (this.forPrinting) {
            this.columns = this.columns.filter(c => c.columnDef !== 'action');
        }
        this.displayedColumns = this.columns.map(c => c.columnDef);
    }

    itemSelected(abrechnungId, anbieterId) {
        this.onItemSelected.emit({ abrechnungId, anbieterId });
    }

    abrechnungZuordnen(row) {
        this.onItemSelected.emit(row);
    }
}
