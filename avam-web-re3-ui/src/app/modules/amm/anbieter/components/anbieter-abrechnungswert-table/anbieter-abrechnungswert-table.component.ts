import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

export enum TableType {
    ERFASSEN,
    BEARBEITEN,
    ZUORDNEN,
    SUCHEN
}
@Component({
    selector: 'avam-anbieter-abrechnungswert-table',
    templateUrl: './anbieter-abrechnungswert-table.component.html',
    styleUrls: ['./anbieter-abrechnungswert-table.component.scss']
})
export class AnbieterAbrechnungswertTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() summeTotal = '';
    @Input() tableType: TableType;
    @Input() forPrinting: boolean;
    @Input() parentForm: FormGroup;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    @Output() onRemove: EventEmitter<number> = new EventEmitter();
    @Output() onCreate: EventEmitter<number> = new EventEmitter();
    @Output() onCheckboxChange: EventEmitter<number> = new EventEmitter();

    types = TableType;
    showFooter = false;
    shouldFocusInitialRow = false;
    sortField = 'gueltigVon';
    sortOrder = -1;
    stateKey = 'abrechnungswertDefault';
    maxHeight = 1000;

    columns = [];
    selection = [
        {
            columnDef: 'selection',
            header: '',
            width: '50px'
        }
    ];
    defaultColumnGroup = [
        {
            columnDef: 'abrechnungswertNr',
            header: 'amm.abrechnungen.label.abrechnungswertnr',
            footer: 'amm.abrechnungen.label.total',
            cell: (element: any) => `${element.abrechnungswertNr}`
        },
        { columnDef: 'saldochf', header: 'amm.abrechnungen.label.chfsaldo', footer: '', cell: (element: any) => `${element.saldochf}` },
        { columnDef: 'faelligAm', header: 'amm.abrechnungen.label.faelligam', footer: '', cell: (element: any) => `${element.faelligAm}` },
        { columnDef: 'titel', header: 'amm.abrechnungen.label.titelmassnahmede', footer: '', cell: (element: any) => `${element.titel}` },
        { columnDef: 'gueltigVon', header: 'amm.abrechnungen.label.vertragswertgueltigvon', footer: '', cell: (element: any) => `${element.gueltigVon}` },
        { columnDef: 'gueltigBis', header: 'common.label.gueltig_bis', footer: '', cell: (element: any) => `${element.gueltigBis}` },
        { columnDef: 'profilNr', header: 'amm.abrechnungen.label.profilnr', footer: '', cell: (element: any) => `${element.profilNr}` }
    ];
    vorgaengerNachfolgerGroup = [
        { columnDef: 'vorgaenger', header: 'amm.abrechnungen.label.vorgaenger', footer: '', cell: (element: any) => `${element.vorgaenger}` },
        { columnDef: 'nachfolger', header: 'amm.abrechnungen.label.nachfolger', footer: '', cell: (element: any) => `${element.nachfolger}` }
    ];
    abrechnungInfoGroup = [
        { columnDef: 'anbieter', header: 'amm.abrechnungen.label.anbieter', footer: '', cell: (element: any) => `${element.anbieter}` },
        { columnDef: 'abrechnungsNr', header: 'amm.abrechnungen.label.abrechnungsnr', footer: '', cell: (element: any) => `${element.abrechnungsNr}` },
        { columnDef: 'status', header: 'amm.abrechnungen.label.status', footer: '', cell: (element: any) => `${element.status}` }
    ];
    action = [{ columnDef: 'action', header: '', width: '100px' }];
    displayedColumns = [];

    constructor() {}

    ngOnInit() {
        if (this.tableType === TableType.ERFASSEN || this.tableType === TableType.BEARBEITEN) {
            this.displayedColumns = this.buildForAbrechnung();
            this.showFooter = true;
        } else if (this.tableType === TableType.ZUORDNEN) {
            this.displayedColumns = this.buildForZuordnen();
            this.shouldFocusInitialRow = true;
            this.sortField = 'faelligAm';
            this.stateKey = 'abrechnungswertSelection';
        } else if (this.tableType === TableType.SUCHEN) {
            this.displayedColumns = this.buildForSuchen();
            this.shouldFocusInitialRow = true;
            this.sortField = 'anbieter';
            this.sortOrder = 1;
            this.stateKey = 'abrechnungswertSearch';
            this.maxHeight = 675;
        }
        if (this.forPrinting) {
            this.displayedColumns = this.columns.filter(c => c.columnDef !== 'action' && c.columnDef !== 'selection').map(c => c.columnDef);
        }
    }

    create(abrechnungswertId) {
        this.onCreate.next(abrechnungswertId);
    }

    remove(abrechnungswertId) {
        this.onRemove.next(abrechnungswertId);
    }

    itemSelected(item) {
        this.onItemSelected.next(item);
    }

    checkboxChange(index) {
        this.onCheckboxChange.next(index);
    }

    private buildForAbrechnung() {
        this.columns = [...this.defaultColumnGroup, ...this.action];
        return this.columns.map(c => c.columnDef);
    }

    private buildForZuordnen() {
        this.columns = [...this.selection, ...this.defaultColumnGroup, ...this.action];
        return this.columns.map(c => c.columnDef);
    }

    private buildForSuchen() {
        this.columns = [
            ...this.selection,
            ...this.defaultColumnGroup.slice(0, 3),
            ...this.vorgaengerNachfolgerGroup,
            ...this.defaultColumnGroup.slice(3, 6),
            ...this.abrechnungInfoGroup,
            ...this.action
        ];
        return this.columns.map(c => c.columnDef);
    }
}
