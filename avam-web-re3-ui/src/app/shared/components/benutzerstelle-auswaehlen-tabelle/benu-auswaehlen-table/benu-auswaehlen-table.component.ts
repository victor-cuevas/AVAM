import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BenutzerstelleAuswaehlenTabelleInterface } from '../benutzerstelle-auswaehlen-tabelle.interface';

@Component({
    selector: 'avam-benu-auswaehlen-table',
    templateUrl: './benu-auswaehlen-table.component.html'
})
export class BenuAuswaehlenTableComponent implements OnInit {
    selectedRow: any;
    selectedRows: any[] = [];
    selection: any;
    allchecked = false;
    tableData: BenutzerstelleAuswaehlenTabelleInterface[];
    @Input() isMultiselect = false;
    @Input() withAction = true;
    @Input() showEyeAction = false;
    @Input() stateKey: string;
    @Input() inputBenutzerstellen: number[] = [];
    @Input() set dataSource(data: BenutzerstelleAuswaehlenTabelleInterface[]) {
        this.tableData = data;
        this.checkRows(this.inputBenutzerstellen);
    }
    @Output() onItemSelected: EventEmitter<BenutzerstelleAuswaehlenTabelleInterface> = new EventEmitter();
    @Output() newSelections: EventEmitter<boolean> = new EventEmitter();

    columns = [
        { columnDef: 'checkbox', header: 'Checkbox', cell: (element: any) => `${element}`, width: '50px' },
        { columnDef: 'benutzerstelle', header: 'benutzerverwaltung.label.benutzerstelle', cell: (element: any) => `${element.benutzerstelle}` },
        { columnDef: 'id', header: 'benutzerverwaltung.label.benutzerstellenid', cell: (element: any) => `${element.id}` },
        { columnDef: 'typ', header: 'benutzerverwaltung.label.benutzerstellentyp', cell: (element: any) => `${element.typ}` },
        { columnDef: 'strassenr', header: 'common.label.strassenrlong', cell: (element: any) => `${element.strassenr}` },
        { columnDef: 'ort', header: 'stes.label.ort', cell: (element: any) => `${element.ort}` },
        { columnDef: 'telefon', header: 'stes.label.telefon', cell: (element: any) => `${element.telefon}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {
        if (this.isMultiselect) {
            this.withAction = false;
        } else {
            this.displayedColumns = this.displayedColumns.filter(d => d !== 'checkbox');
        }
        if (!this.withAction) {
            this.displayedColumns = this.displayedColumns.filter(d => d !== 'action');
        }
    }

    itemSelected(data: BenutzerstelleAuswaehlenTabelleInterface) {
        this.onItemSelected.emit(data);
    }

    checkRows(ids: number[]) {
        if (ids && ids.length > 0) {
            this.tableData.filter(r => ids.indexOf(r.benutzerstelleObj.benutzerstelleId) > -1).forEach(row => (row.checked = true));
        }
        this.selectedRows = this.tableData.filter(r => r.checked === true);
        this.trackAllChecked();
    }

    checkbox(row): void {
        if (!row.checked) {
            row.checked = true;
            this.selectedRows.push(row);
            this.trackAllChecked();
        } else {
            row.checked = false;
            this.allchecked = false;
            this.selectedRows = this.selectedRows.filter(r => r.checked === true);
        }
        this.newSelections.next(this.newSelectionsPresent());
    }

    checkAll(): void {
        this.allchecked = !this.allchecked;
        if (this.allchecked) {
            this.handleCheckAll();
        } else {
            this.handleUncheckAll();
        }
        this.newSelections.next(this.newSelectionsPresent());
    }

    isRowSelectedByInput(benutzerstelleId: number): boolean {
        return this.inputBenutzerstellen.indexOf(benutzerstelleId) > -1;
    }

    private newSelectionsPresent(): boolean {
        return this.selectedRows.some(benustelle => this.inputBenutzerstellen.indexOf(benustelle.benutzerstelleObj.benutzerstelleId) < 0);
    }

    private trackAllChecked(): void {
        this.allchecked = this.selectedRows.length > 0 && this.selectedRows.length === this.tableData.length;
    }

    private handleCheckAll(): void {
        this.tableData.forEach(row => {
            if (!this.isRowSelectedByInput(row.benutzerstelleObj.benutzerstelleId)) {
                if (!row.checked) {
                    this.selectedRows.push(row);
                }
                row.checked = true;
            }
        });
    }

    private handleUncheckAll(): void {
        this.tableData.forEach(row => {
            if (!this.isRowSelectedByInput(row.benutzerstelleObj.benutzerstelleId)) {
                row.checked = false;
            }
            this.selectedRows = this.selectedRows.filter(r => r.checked === true);
        });
    }
}
