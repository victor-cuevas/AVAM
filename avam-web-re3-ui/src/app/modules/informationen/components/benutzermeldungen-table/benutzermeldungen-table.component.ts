import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TableEvent, TableHelper } from '@shared/helpers/table.helper';
import { BenutzerMeldungViewDTO } from '@dtos/benutzerMeldungViewDTO';

@Component({
    selector: 'avam-benutzermeldungen-table',
    templateUrl: './benutzermeldungen-table.component.html'
})
export class BenutzermeldungenTableComponent implements OnInit {
    @Input() withAction = true;
    @Input() stateKey: string;
    @Input() tableData: BenutzerMeldungViewDTO[];
    @Output() onPrimaryAction = new EventEmitter<BenutzerMeldungViewDTO>();
    readonly actions = TableHelper.ACTIONS;
    readonly typ = 'typ';
    readonly benutzerId = 'benutzerId';
    readonly name = 'name';
    readonly vorname = 'vorname';
    readonly benuStelleName = 'benuStelleName';
    readonly benuStelleOrt = 'benuStelleOrt';
    readonly kanton = 'kanton';
    readonly statusText = 'statusText';
    readonly gemeldetam = 'gemeldetam';
    tableColumns = [
        {
            columnDef: this.typ,
            header: 'common.label.typ',
            cell: (row: BenutzerMeldungViewDTO) => row.meldungsTyp
        },
        {
            columnDef: this.benutzerId,
            header: 'common.label.benutzerid',
            cell: (row: BenutzerMeldungViewDTO) => row.benutzermutationId
        },
        {
            columnDef: this.name,
            header: 'common.label.name',
            cell: (row: BenutzerMeldungViewDTO) => row.nachname
        },
        {
            columnDef: this.vorname,
            header: 'common.label.vorname',
            cell: (row: BenutzerMeldungViewDTO) => row.vorname
        },
        {
            columnDef: this.benuStelleName,
            header: 'common.label.benutzerstelle',
            cell: (row: BenutzerMeldungViewDTO) => this.helper.translate(row, this.benuStelleName)
        },
        {
            columnDef: this.benuStelleOrt,
            header: 'common.label.ort',
            cell: (row: BenutzerMeldungViewDTO) => this.helper.translate(row, this.benuStelleOrt)
        },
        {
            columnDef: this.kanton,
            header: 'common.label.kanton',
            cell: (row: BenutzerMeldungViewDTO) => row.kantonKuerzel
        },
        {
            columnDef: this.statusText,
            header: 'common.label.status',
            cell: (row: BenutzerMeldungViewDTO) => this.helper.translate(row, this.statusText)
        },
        {
            columnDef: this.gemeldetam,
            header: 'benutzerverwaltung.label.gemeldetam',
            cell: (row: BenutzerMeldungViewDTO) => row.erfasstAm
        },
        { columnDef: this.actions, header: '', width: '100px' }
    ];
    displayedTableColumns: string[] = this.tableColumns.map(c => c.columnDef);

    constructor(private helper: TableHelper<BenutzerMeldungViewDTO>) {}

    ngOnInit() {
        if (!this.withAction) {
            this.displayedTableColumns = this.displayedTableColumns.filter(d => d !== 'actions');
        }
    }

    onOpen(row: BenutzerMeldungViewDTO): void {
        this.onPrimaryAction.emit(row);
    }
}
