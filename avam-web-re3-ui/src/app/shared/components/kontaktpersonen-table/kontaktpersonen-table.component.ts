import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { UnternehmenTypes } from '@shared/enums/unternehmen.enum';
import { KontakteViewDTO } from '@dtos/kontakteViewDTO';

export interface KontaktPersonTableRow extends KontakteViewDTO {
    checked?: boolean;
    allowMailTo?: boolean;
}

@Component({
    selector: 'avam-kontaktpersonen-table',
    templateUrl: './kontaktpersonen-table.component.html'
})
export class KontaktpersonenTableComponent implements OnInit {
    @ViewChildren('checkboxes') checkboxes: QueryList<any>;

    @Input() stateKey: string;
    @Input() showUnternehmen: boolean;
    @Input() forPrinting = false;
    @Input() unternehmenType: UnternehmenTypes;

    @Input() set sourceData(data: KontakteViewDTO[]) {
        this.tableData = data
            ? data.map(d => ({
                  ...{
                      checked: false,
                      allowMailTo: d.email && d.email !== ''
                  },
                  ...d
              }))
            : [];
        this.checkRows(this.idsToRestoreChecks);
    }

    @Output() onCheck = new EventEmitter<boolean>();
    @Output() onMail = new EventEmitter<KontaktPersonTableRow>();
    @Output() onPrimaryAction = new EventEmitter<KontaktPersonTableRow>();
    @Output() onDocumentManager = new EventEmitter<KontaktPersonTableRow>();

    printStateSuffix = '_forPrint';
    selectedRows: KontaktPersonTableRow[] = [];
    allchecked = false;
    tableData: KontaktPersonTableRow[];
    idsToRestoreChecks: number[] = null;

    tableColumns: TableHeader[];
    displayedTableColumns: string[];

    constructor(private dbTranslateService: DbTranslateService) {}

    ngOnInit() {
        this.defineTableColumns();
        this.displayedTableColumns = this.tableColumns.map(c => c.columnDef).filter(d => (this.showUnternehmen ? true : d !== 'unternehmen'));
        if (this.forPrinting) {
            this.displayedTableColumns = this.displayedTableColumns.filter(d => d !== 'checkbox' && d !== 'actions');
        }
    }

    getStateKey() {
        return this.forPrinting ? this.stateKey + this.printStateSuffix : this.stateKey;
    }

    onOpen(row) {
        this.onPrimaryAction.emit(row);
    }

    checkRows(idsToRestore: number[]) {
        if (idsToRestore && idsToRestore.length > 0) {
            this.tableData.filter(r => idsToRestore.indexOf(r.kontaktpersonId) > -1).forEach(row => (row.checked = true));
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

        this.tableData.filter(row => row.allowMailTo).forEach(row => (row.checked = this.allchecked));

        this.selectedRows = this.allchecked ? this.tableData.filter(r => r.allowMailTo).slice() : [];
        this.onCheck.emit(this.selectedRows.length > 0);
    }

    sortFunction(event: any) {
        switch (event.field) {
            case 'anrede':
                this.tableData = event.data.sort((data1, data2) => {
                    return this.sortWithTranslate(event, data1, data2, 'anrede');
                });
                break;
            case 'status':
                this.tableData = event.data.sort((data1, data2) => {
                    return this.sortWithTranslate(event, data1, data2, 'status');
                });
                break;
            case 'unternehmen':
                this.tableData = event.data.sort((data1, data2) => {
                    const value1 = `${data1.unternehmenName1} ${data1.unternehmenName2} ${data1.unternehmenName3}`;
                    const value2 = `${data2.unternehmenName1} ${data2.unternehmenName2} ${data2.unternehmenName3}`;
                    return KontaktpersonenTableComponent.sort(event, value1 ? value1 : '', value2 ? value2 : '');
                });
                break;
            default:
                this.tableData = event.data.sort((data1, data2) => {
                    const value1 = data1[event.field];
                    const value2 = data2[event.field];
                    return KontaktpersonenTableComponent.sort(event, value1 ? value1 : '', value2 ? value2 : '');
                });
                break;
        }
    }

    onOpenDocumentManager(row: any) {
        this.onDocumentManager.emit(row);
    }

    onMailTo(row: any) {
        this.onMail.emit(row);
    }

    private static sort(event: any, value1: any, value2: any): number {
        return event.order * (value1 < value2 ? -1 : value1 > value2 ? 1 : 0);
    }

    private trackAllChecked() {
        this.allchecked = this.checkboxes && this.selectedRows.length > 0 && this.selectedRows.length === this.tableData.filter(row => row.allowMailTo).length;
    }

    private sortWithTranslate(event: any, data1: any, data2: any, propertyPrefix: string): number {
        const value1 = this.dbTranslateService.translate(data1, propertyPrefix);
        const value2 = this.dbTranslateService.translate(data2, propertyPrefix);
        return KontaktpersonenTableComponent.sort(event, value1, value2);
    }

    private defineTableColumns(): void {
        this.tableColumns = [
            { columnDef: 'checkbox', header: 'Checkbox', cell: (element: any) => `${element.chekbox}`, width: '50px' },
            {
                columnDef: 'anrede',
                header: 'unternehmen.label.anrede',
                cell: (element: KontaktPersonTableRow) => element,
                sortable: true
            },
            {
                columnDef: 'name',
                header: 'common.label.name',
                cell: (element: KontaktPersonTableRow) => element.name,
                sortable: true
            },
            {
                columnDef: 'vorname',
                header: 'common.label.vorname',
                cell: (element: KontaktPersonTableRow) => element.vorname,
                sortable: true
            },
            {
                columnDef: 'funktion',
                header: 'unternehmen.label.funktion',
                cell: (element: KontaktPersonTableRow) => element.funktion,
                sortable: true
            },
            {
                columnDef: 'email',
                header: 'unternehmen.label.email',
                cell: (element: KontaktPersonTableRow) => element.email,
                sortable: true
            },
            {
                columnDef: 'telefonNr',
                header: 'unternehmen.label.telefon',
                cell: (element: KontaktPersonTableRow) => element.telefonNr,
                sortable: true
            },
            {
                columnDef: 'mobileNr',
                header: 'unternehmen.label.mobile',
                cell: (element: KontaktPersonTableRow) => element.mobileNr,
                sortable: true
            },
            {
                columnDef: 'status',
                header: 'common.label.status',
                cell: (element: KontaktPersonTableRow) => element,
                sortable: true
            },
            {
                columnDef: 'unternehmen',
                header: this.getUnternehmenNameLabel(),
                cell: this.getUnternehmenCell,
                sortable: true
            },
            { columnDef: 'actions', header: '', cell: (element: any) => `${element.actions}`, width: '120px' }
        ];
    }

    private getUnternehmenCell(kontaktPerson: KontaktPersonTableRow): string {
        if (kontaktPerson.unternehmenName2 && kontaktPerson.unternehmenName3) {
            return `${kontaktPerson.unternehmenName1} ${kontaktPerson.unternehmenName2} ${kontaktPerson.unternehmenName3}`;
        } else if (kontaktPerson.unternehmenName2) {
            return `${kontaktPerson.unternehmenName1} ${kontaktPerson.unternehmenName2}`;
        } else {
            return `${kontaktPerson.unternehmenName1}`;
        }
    }

    private getUnternehmenNameLabel(): string {
        switch (this.unternehmenType) {
            case UnternehmenTypes.ANBIETER:
                return 'unternehmen.label.anbieterName';
            case UnternehmenTypes.ARBEITGEBER:
                return 'unternehmen.label.arbeitgeberName';
            case UnternehmenTypes.FACHBERATUNG:
                return 'unternehmen.label.fachberatungsstelleName';
            default:
                return null;
        }
    }
}

interface TableHeader {
    columnDef: string;
    header: string;
    cell: (element: any) => string | KontaktPersonTableRow;
    sortable?: boolean;
    width?: string;
}
