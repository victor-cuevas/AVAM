import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RegelGeKoDTO } from '@dtos/regelGeKoDTO';
import { TableEvent, TableHelper } from '@shared/helpers/table.helper';

@Component({
    selector: 'avam-geschaeftsregeln-table',
    templateUrl: './geschaeftsregeln-table.component.html'
})
export class GeschaeftsregelnTableComponent implements OnInit {
    @Input() forPrinting = false;
    @Input() set sourceData(data: RegelGeKoDTO[]) {
        this.tableData = data;
    }
    @Output() onPrimaryAction = new EventEmitter<RegelGeKoDTO>();
    readonly geschaeftsartObj = 'geschaeftsartObj';
    readonly sachstandObj = 'sachstandObj';
    readonly folgeschrittObj = 'folgeschrittObj';
    readonly erinnerungstage = 'erinnerungstage';
    readonly zusatzangabe = 'zusatzangabe';
    readonly text = 'text';
    readonly actions = TableHelper.ACTIONS;
    tableData: RegelGeKoDTO[];
    tableColumns = [
        {
            columnDef: this.geschaeftsartObj,
            header: 'common.label.geschaeftsart',
            cell: (row: RegelGeKoDTO) => row.geschaeftsartObj,
            sortable: true
        },
        {
            columnDef: this.sachstandObj,
            header: 'geko.label.aktsachstand',
            cell: (row: RegelGeKoDTO) => row.sachstandObj,
            sortable: true
        },
        {
            columnDef: this.folgeschrittObj,
            header: 'geko.label.folgeschritt',
            cell: (row: RegelGeKoDTO) => row.folgeschrittObj,
            sortable: true
        },
        {
            columnDef: this.erinnerungstage,
            header: 'geko.label.durchlaufzeit',
            cell: (row: RegelGeKoDTO) => `${row.erinnerungstage}`,
            sortable: true
        },
        {
            columnDef: this.zusatzangabe,
            header: 'benutzerverwaltung.label.bemerkung',
            cell: (row: RegelGeKoDTO) => `${row.zusatzangabe}`,
            sortable: true
        },
        { columnDef: this.actions, header: '', cell: (element: any) => `${element.actions}`, width: '100px' }
    ];
    displayedTableColumns = this.tableColumns.map(c => c.columnDef);

    constructor(protected tableHelper: TableHelper<RegelGeKoDTO>) {}

    ngOnInit(): void {
        if (this.forPrinting) {
            this.displayedTableColumns = this.displayedTableColumns.filter(d => d !== this.actions);
        }
    }

    onOpen(row): void {
        this.onPrimaryAction.emit(row);
    }

    sortFunction(event: TableEvent<RegelGeKoDTO>): void {
        switch (event.field) {
            case this.geschaeftsartObj:
                this.sourceData = this.tableHelper.sortWithTranslateByObject(event, this.geschaeftsartObj, this.text);
                break;
            case this.sachstandObj:
                this.sourceData = this.tableHelper.sortWithTranslateByObject(event, this.sachstandObj, this.text);
                break;
            case this.folgeschrittObj:
                this.sourceData = this.tableHelper.sortWithTranslateByObject(event, this.folgeschrittObj, this.text);
                break;
            case this.erinnerungstage:
            case this.zusatzangabe:
            default:
                this.sourceData = this.tableHelper.defaultSort(event);
                break;
        }
    }
}
