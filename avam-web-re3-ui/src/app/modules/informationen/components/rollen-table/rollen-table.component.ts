import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RolleDTO } from '@dtos/rolleDTO';
import { TableEvent, TableHelper } from '@shared/helpers/table.helper';

@Component({
    selector: 'avam-rollen-table',
    templateUrl: './rollen-table.component.html'
})
export class RollenTableComponent implements OnInit {
    @Input() withAction = true;
    @Input() stateKey: string;
    @Input() tableData: RolleDTO[];
    @Output() onPrimaryAction = new EventEmitter<RolleDTO>();
    readonly actions = TableHelper.ACTIONS;
    readonly text = 'text';
    readonly code = 'code';
    readonly bezeichnung = 'bezeichnung';
    readonly vollzugsregiontyp = 'vollTypeObj';
    readonly gueltigAb = 'gueltigAb';
    readonly gueltigBis = 'gueltigBis';
    tableColumns = [
        {
            columnDef: this.code,
            header: 'benutzerverwaltung.label.rollenId',
            cell: (row: RolleDTO) => (row.code ? `${row.code}` : ''),
            sortable: true
        },
        {
            columnDef: this.bezeichnung,
            header: 'common.label.bezeichnung',
            cell: (row: RolleDTO) => this.getBezeichnung(row),
            sortable: true
        },
        {
            columnDef: this.vollzugsregiontyp,
            header: 'benutzerverwaltung.label.vollzugsregiontyp',
            cell: (row: RolleDTO) => this.getVollzugsregiontyp(row),
            sortable: true
        },
        {
            columnDef: this.gueltigAb,
            header: 'common.label.gueltig_von',
            cell: (row: RolleDTO) => (row.gueltigAb ? `${row.gueltigAb}` : ''),
            sortable: true
        },
        {
            columnDef: this.gueltigBis,
            header: 'common.label.gueltig_bis',
            cell: (row: RolleDTO) => (row.gueltigBis ? `${row.gueltigBis}` : ''),
            sortable: true
        },
        { columnDef: this.actions, header: '', width: '100px' }
    ];
    displayedTableColumns: string[] = this.tableColumns.map(c => c.columnDef);

    constructor(private helper: TableHelper<RolleDTO>) {}

    ngOnInit() {
        if (!this.withAction) {
            this.displayedTableColumns = this.displayedTableColumns.filter(d => d !== 'actions');
        }
    }

    onOpen(row: RolleDTO): void {
        this.onPrimaryAction.emit(row);
    }

    getBezeichnung(row: RolleDTO): string {
        const bezeichnung = this.helper.translate(row, this.text);
        return bezeichnung ? bezeichnung : '';
    }

    getVollzugsregiontyp(row: RolleDTO): string {
        const vollzugsregiontyp = this.helper.translate(row.vollTypeObj, this.text);
        return vollzugsregiontyp ? vollzugsregiontyp : '';
    }

    sortFunction(event: TableEvent<RolleDTO>): void {
        switch (event.field) {
            case this.bezeichnung:
                this.sortByBezeichnung(event);
                break;
            case this.vollzugsregiontyp:
                this.sortByVollzugsregiontyp(event);
                break;
            default:
                this.sort(event);
                break;
        }
    }

    private sortByBezeichnung(event: TableEvent<RolleDTO>): void {
        this.tableData = this.helper.sortWithTranslate(event, this.text);
    }

    private sortByVollzugsregiontyp(event: TableEvent<RolleDTO>): void {
        this.tableData = this.helper.sortWithTranslateByObject(event, this.vollzugsregiontyp, this.text);
    }

    private sort(event: TableEvent<RolleDTO>): void {
        this.tableData = this.helper.defaultSort(event);
    }
}
