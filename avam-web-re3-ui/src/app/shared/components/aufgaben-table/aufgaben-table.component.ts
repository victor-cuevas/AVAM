import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { GeKoAufgabeDTO } from '@dtos/geKoAufgabeDTO';
import { GekoAufgabenService } from '@shared/services/geko-aufgaben.service';
import { DbTranslateService } from '@shared/services/db-translate.service';

export interface AufgabeTableRow extends GeKoAufgabeDTO {
    checked?: boolean;
}

@Component({
    selector: 'avam-aufgaben-table',
    templateUrl: './aufgaben-table.component.html'
})
export class AufgabenTableComponent implements OnInit {
    @ViewChildren('checkboxes') checkboxes: QueryList<any>;
    @Input() stateKey: string;
    @Input() showName: boolean;
    @Input() forPrinting = false;

    @Input() set sourceData(data: GeKoAufgabeDTO[]) {
        this.tableData = data
            ? data.map(d => ({
                  ...{
                      checked: false
                  },
                  ...d
              }))
            : [];
        this.checkRows(this.idsToRestoreChecks);
    }

    @Output() onCheck = new EventEmitter<boolean>();
    @Output() onDeleteSingleRow = new EventEmitter<AufgabeTableRow>();
    @Output() onPrimaryAction = new EventEmitter<AufgabeTableRow>();

    selectedRows: AufgabeTableRow[] = [];
    allchecked = false;
    tableData: AufgabeTableRow[];
    idsToRestoreChecks: number[] = null;

    tableColumns = [
        { columnDef: 'checkbox', header: 'Checkbox', cell: (element: any) => `${element.chekbox}`, width: '50px' },
        {
            columnDef: 'terminueberschreitung',
            header: '',
            cell: (element: any) => `${element.terminueberschreitung}`,
            width: '75px',
            sortable: true
        },
        {
            columnDef: 'zuErledigenBis',
            header: 'geko.label.faelligAm',
            cell: (element: AufgabeTableRow) => element.zuErledigenBis,
            sortable: true
        },
        {
            columnDef: 'erledigt',
            header: 'geko.label.status',
            cell: (element: AufgabeTableRow) => (element.erledigt ? 'common.label.erledigt' : 'common.label.pendent'),
            sortable: true
        },
        {
            columnDef: 'geschaeftsart',
            header: 'geko.label.geschaeftsart',
            cell: (element: AufgabeTableRow) => element,
            sortable: true
        },
        {
            columnDef: 'aufgabeText',
            header: 'geko.label.aufgabentext',
            cell: (element: AufgabeTableRow) => element.aufgabeText,
            sortable: true
        },
        {
            columnDef: 'name',
            header: 'common.label.name',
            cell: (element: AufgabeTableRow) => `${element.name}`,
            sortable: true
        },
        {
            columnDef: 'zustandig',
            header: 'geko.label.zustandig',
            cell: (element: AufgabeTableRow) => element,
            sortable: true
        },
        {
            columnDef: 'aufgabeId',
            header: 'geko.label.identifikation',
            cell: (element: AufgabeTableRow) => `${element.aufgabeId}`,
            sortable: true
        },
        { columnDef: 'actions', header: '', cell: (element: any) => `${element.actions}`, width: '100px' }
    ];
    displayedTableColumns = this.tableColumns.map(c => c.columnDef);

    constructor(private gekoAufgabenService: GekoAufgabenService, private dbTranslateService: DbTranslateService) {}

    ngOnInit() {
        this.displayedTableColumns = this.tableColumns.map(c => c.columnDef).filter(d => (this.showName ? true : d !== 'name'));
        if (this.forPrinting) {
            this.displayedTableColumns = this.displayedTableColumns.filter(d => d !== 'checkbox' && d !== 'actions');
        }
    }

    getStateKey() {
        return this.forPrinting ? this.stateKey + this.gekoAufgabenService.printStateSuffix : this.stateKey;
    }

    onOpen(row) {
        this.onPrimaryAction.emit(row);
    }

    onDeleteRow(row) {
        this.onDeleteSingleRow.emit(row);
    }

    checkRows(idsToRestore: number[]) {
        if (idsToRestore && idsToRestore.length > 0) {
            this.tableData.filter(r => idsToRestore.indexOf(r.aufgabeId) > -1).forEach(row => (row.checked = true));
        }
        this.selectedRows = this.tableData.filter(r => r.checked === true);
        this.trackAllChecked();
        this.onCheck.emit(this.selectedRows.length > 0);
    }

    checkbox(row) {
        if (!row.checked) {
            row.checked = true;
            this.selectedRows.push(row);
            this.trackAllChecked();
        } else {
            row.checked = false;
            this.allchecked = false;
            this.selectedRows = this.selectedRows.filter(r => r.checked === true);
        }
        this.onCheck.emit(this.selectedRows.length > 0);
    }

    checkAll() {
        this.allchecked = !this.allchecked;

        this.tableData.forEach(row => (row.checked = this.allchecked));

        this.selectedRows = this.allchecked ? this.tableData.slice() : [];
        this.onCheck.emit(this.selectedRows.length > 0);
    }

    private trackAllChecked() {
        this.allchecked = this.checkboxes && this.selectedRows.length > 0 && this.selectedRows.length === this.tableData.length;
    }

    sortFunction(event: any) {
        switch (event.field) {
            case 'geschaeftsart':
                this.tableData = event.data.sort((data1, data2) => {
                    return this.sortWithTranslate(event, data1, data2, 'geschaeftsartText');
                });
                break;
            case 'zustandig':
                this.tableData = event.data.sort((data1, data2) => {
                    return this.sortWithTranslate(event, data1, data2, 'zustaendigkeitVerantwortlich');
                });
                break;
            default:
                this.tableData = event.data.sort((data1, data2) => {
                    const value1 = data1[event.field];
                    const value2 = data2[event.field];
                    return AufgabenTableComponent.sort(event, value1, value2);
                });
                break;
        }
    }

    private static sort(event: any, value1: any, value2: any): number {
        return event.order * (value1 < value2 ? -1 : value1 > value2 ? 1 : 0);
    }

    private sortWithTranslate(event: any, data1: any, data2: any, propertyPrefix: string): number {
        const value1 = this.dbTranslateService.translate(data1, propertyPrefix);
        const value2 = this.dbTranslateService.translate(data2, propertyPrefix);
        return AufgabenTableComponent.sort(event, value1, value2);
    }
}
