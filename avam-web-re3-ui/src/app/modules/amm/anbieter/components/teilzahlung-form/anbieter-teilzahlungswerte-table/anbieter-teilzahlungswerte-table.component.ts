import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

export enum TeilzahlungswerteTableType {
    BEARBEITEN,
    ERFASSEN,
    ZUORDNEN,
    SUCHEN
}
@Component({
    selector: 'avam-anbieter-teilzahlungswerte-table',
    templateUrl: './anbieter-teilzahlungswerte-table.component.html',
    styleUrls: ['./anbieter-teilzahlungswerte-table.component.scss']
})
export class AnbieterTeilzahlungswerteTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() summeTotal = '';
    @Input() tableType: TeilzahlungswerteTableType;
    @Input() parentForm: FormGroup;
    @Input() forPrinting: boolean;
    @Output() onItemSelected: EventEmitter<number> = new EventEmitter();
    @Output() onRemove: EventEmitter<number> = new EventEmitter();
    @Output() onCreate: EventEmitter<number> = new EventEmitter();
    @Output() onCheckboxChange: EventEmitter<number> = new EventEmitter();

    tableTypes = TeilzahlungswerteTableType;
    showFooter = false;
    shouldFocusInitialRow = false;
    stateKey = 'teilzahlungBearbeiten';

    selection = [
        {
            columnDef: 'selection',
            header: '',
            width: '50px'
        }
    ];
    defaultColumnGroup = [
        {
            columnDef: 'teilzahlungswertNr',
            header: 'amm.zahlungen.label.teilzahlungswertnr',
            footer: 'amm.zahlungen.label.total',
            cell: (element: any) => `${element.teilzahlungswertNr}`
        },
        { columnDef: 'chf', header: 'amm.zahlungen.label.chf', footer: '', cell: (element: any) => `${element.chf}` },
        { columnDef: 'faelligAm', header: 'amm.zahlungen.label.faellig.am', footer: '', cell: (element: any) => `${element.faelligAm}` },
        { columnDef: 'titel', header: 'amm.zahlungen.label.titelmassnahmede', footer: '', cell: (element: any) => `${element.titel}` },
        { columnDef: 'gueltigVon', header: 'amm.abrechnungen.label.vertragswertgueltigvon', footer: '', cell: (element: any) => `${element.gueltigVon}` },
        { columnDef: 'gueltigBis', header: 'common.label.gueltig_bis', footer: '', cell: (element: any) => `${element.gueltigBis}` },
        { columnDef: 'profilNr', header: 'amm.zahlungen.label.profilnr', footer: '', cell: (element: any) => `${element.profilNr}` },
        { columnDef: 'action', header: '', width: '80px' }
    ];
    vorgaengerNachfolgerGroup = [
        { columnDef: 'vorgaenger', header: 'amm.zahlungen.label.vorgaenger', footer: '', cell: (element: any) => `${element.vorgaenger}` },
        { columnDef: 'nachfolger', header: 'amm.zahlungen.label.nachfolger', footer: '', cell: (element: any) => `${element.nachfolger}` }
    ];
    teilzahlungInfoGroup = [
        { columnDef: 'anbieter', header: 'amm.abrechnungen.label.anbieter', footer: '', cell: (element: any) => `${element.anbieter}` },
        { columnDef: 'teilzahlungNr', header: 'amm.zahlungen.label.teilzahlungsnr', footer: '', cell: (element: any) => `${element.teilzahlungNr}` },
        { columnDef: 'status', header: 'amm.abrechnungen.label.status', footer: '', cell: (element: any) => `${element.status}` }
    ];

    columns = [];
    displayedColumns = [];

    ngOnInit() {
        if (this.tableType === TeilzahlungswerteTableType.BEARBEITEN || this.tableType === TeilzahlungswerteTableType.ERFASSEN) {
            this.columns = this.defaultColumnGroup;
            this.displayedColumns = this.defaultColumnGroup.map(c => c.columnDef);
            this.showFooter = true;
        } else if (this.tableType === TeilzahlungswerteTableType.ZUORDNEN) {
            this.columns = [...this.selection, ...this.defaultColumnGroup];
            this.displayedColumns = this.columns.map(c => c.columnDef);
            this.shouldFocusInitialRow = true;
            this.stateKey = 'teilzahlungswertZuordnen';
        } else if (this.tableType === TeilzahlungswerteTableType.SUCHEN) {
            this.columns = [
                ...this.selection,
                ...this.defaultColumnGroup.slice(0, 3),
                ...this.vorgaengerNachfolgerGroup,
                ...this.defaultColumnGroup.slice(3, 6),
                ...this.teilzahlungInfoGroup,
                this.defaultColumnGroup[this.defaultColumnGroup.length - 1]
            ];
            this.displayedColumns = this.columns.map(c => c.columnDef);
            this.shouldFocusInitialRow = true;
            this.stateKey = 'teilzahlungswertSuchen';
        }
        if (this.forPrinting) {
            this.displayedColumns = this.columns.filter(c => c.columnDef !== 'action' && c.columnDef !== 'selection').map(c => c.columnDef);
        }
    }

    remove(teilzahlungswertId) {
        this.onRemove.next(teilzahlungswertId);
    }

    itemSelected(row) {
        this.onItemSelected.next(row);
    }

    create(teilzahlungswertId) {
        this.onCreate.next(teilzahlungswertId);
    }

    checkboxChange(index) {
        this.onCheckboxChange.next(index);
    }
}
