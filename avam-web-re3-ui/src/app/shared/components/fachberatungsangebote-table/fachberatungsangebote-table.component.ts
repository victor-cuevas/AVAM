import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FachberatungsangebotViewDTO } from '@dtos/fachberatungsangebotViewDTO';
import { TableEvent, TableHelper } from '@shared/helpers/table.helper';

@Component({
    selector: 'avam-fachberatungsangebote-table',
    templateUrl: './fachberatungsangebote-table.component.html'
})
export class FachberatungsangeboteTableComponent implements OnInit {
    @Input() stateKey: string;
    @Input() forPrinting = false;
    @Input() showFachberatungsstelle = false;
    @Input() set sourceData(data: FachberatungsangebotViewDTO[]) {
        this.tableData = data;
    }
    @Output() onPrimaryAction = new EventEmitter<any>();
    tableData: FachberatungsangebotViewDTO[];
    tableColumns = [
        {
            columnDef: FachberatungsangeboteTableComponent.BERATUNGSBEREICH,
            header: 'stes.label.fachberatungsangebote.beratungsbereich',
            cell: (v: FachberatungsangebotViewDTO) => v
        },
        {
            columnDef: FachberatungsangeboteTableComponent.BEZEICHNUNG,
            header: 'stes.label.fachberatungsangebote.bezeichnung',
            cell: (v: FachberatungsangebotViewDTO) => `${v.bezeichnung}`
        },
        {
            columnDef: FachberatungsangeboteTableComponent.ANGEBOTNR,
            header: 'stes.label.fachberatungsangebote.angebotnr',
            cell: (v: FachberatungsangebotViewDTO) => `${v.angebotNr}`
        },
        {
            columnDef: FachberatungsangeboteTableComponent.FACHBERATUNGSSTELLE,
            header: 'stes.label.fachberatung.fachberatungsstelle',
            cell: (v: FachberatungsangebotViewDTO) => this.tableHelper.append([v.unternehmenName1, v.unternehmenName2, v.unternehmenName3])
        },
        {
            columnDef: FachberatungsangeboteTableComponent.STRASSE,
            header: 'stes.label.fachberatung.strasse',
            cell: (v: FachberatungsangebotViewDTO) => this.tableHelper.append([v.unternehmenStrasse, v.unternehmenHausNummer])
        },
        {
            columnDef: FachberatungsangeboteTableComponent.PLZORT,
            header: 'stes.label.fachberatung.plzort',
            cell: (v: FachberatungsangebotViewDTO) => this.tableHelper.append([v.unternehmenPlz, this.tableHelper.translate(v, 'unternehmenOrt')])
        },
        { columnDef: FachberatungsangeboteTableComponent.STATUS, header: 'stes.label.status', cell: (v: FachberatungsangebotViewDTO) => v },
        { columnDef: FachberatungsangeboteTableComponent.ACTION, header: '', cell: (v: FachberatungsangebotViewDTO) => v, width: '65px' }
    ];
    displayedTableColumns = this.tableColumns.map(c => c.columnDef);
    private static readonly BERATUNGSBEREICH = 'fachberatungsbereichText';
    private static readonly STATUS = 'status';
    private static readonly BEZEICHNUNG = 'bezeichnung';
    private static readonly ANGEBOTNR = 'angebotnr';
    private static readonly FACHBERATUNGSSTELLE = 'fachberatungsstelle';
    private static readonly STRASSE = 'strasse';
    private static readonly PLZORT = 'plzOrt';
    private static readonly ACTION = 'action';
    private static readonly NOT_IN_SUCHEN_COLUMNS = [FachberatungsangeboteTableComponent.STATUS];
    private static readonly NOT_IN_ANZEIGEN_COLUMNS = [
        FachberatungsangeboteTableComponent.FACHBERATUNGSSTELLE,
        FachberatungsangeboteTableComponent.STRASSE,
        FachberatungsangeboteTableComponent.PLZORT
    ];
    private static readonly COLUMNS_TO_TRANSLATE = [FachberatungsangeboteTableComponent.BERATUNGSBEREICH, FachberatungsangeboteTableComponent.STATUS];
    private static readonly UNTERNEHMEN_ORT = 'unternehmenOrt';

    constructor(private tableHelper: TableHelper<FachberatungsangebotViewDTO>) {}

    ngOnInit(): void {
        this.displayedTableColumns = this.filterFachberatungsstelleColumnDefs();
        if (this.forPrinting) {
            this.displayedTableColumns = this.displayedTableColumns.filter(d => d !== FachberatungsangeboteTableComponent.ACTION);
        }
    }

    getStateKey(): string {
        return this.forPrinting ? this.stateKey + TableHelper.PRINT_STATE_SUFFIX : this.stateKey;
    }

    onOpen(row): void {
        this.onPrimaryAction.emit(row);
    }

    sortFunction(event: TableEvent<FachberatungsangebotViewDTO>): void {
        switch (event.field) {
            case FachberatungsangeboteTableComponent.BERATUNGSBEREICH:
                this.sortByBeratungsbereich(event);
                break;
            case FachberatungsangeboteTableComponent.STATUS:
                this.sortByStatus(event);
                break;
            case FachberatungsangeboteTableComponent.ANGEBOTNR:
                this.sortByAngebotNr(event);
                break;
            case FachberatungsangeboteTableComponent.FACHBERATUNGSSTELLE:
                this.sortByFachberatungsstelle(event);
                break;
            case FachberatungsangeboteTableComponent.STRASSE:
                this.sortByStrasse(event);
                break;
            case FachberatungsangeboteTableComponent.PLZORT:
                this.sortByPlzOrt(event);
                break;
            default:
                this.tableData = this.tableHelper.defaultSort(event);
                break;
        }
    }

    isBeratungsbereichOrStatusColumn(columnDef: string): boolean {
        return columnDef && FachberatungsangeboteTableComponent.COLUMNS_TO_TRANSLATE.includes(columnDef);
    }

    private sortByPlzOrt(event: TableEvent<FachberatungsangebotViewDTO>): void {
        const getplzOrt = (v: FachberatungsangebotViewDTO) =>
            this.tableHelper.append([v.unternehmenPlz, this.tableHelper.translate(v, FachberatungsangeboteTableComponent.UNTERNEHMEN_ORT)]);
        this.tableData = this.tableHelper.sortWithCustomValue(event, getplzOrt);
    }

    private sortByStrasse(event: TableEvent<FachberatungsangebotViewDTO>): void {
        const getStrasse = (v: FachberatungsangebotViewDTO) => this.tableHelper.append([v.unternehmenStrasse, v.unternehmenHausNummer]);
        this.tableData = this.tableHelper.sortWithCustomValue(event, getStrasse);
    }

    private sortByFachberatungsstelle(event: TableEvent<FachberatungsangebotViewDTO>): void {
        const getFachberatungsstelle = (v: FachberatungsangebotViewDTO) => this.tableHelper.append([v.unternehmenName1, v.unternehmenName2, v.unternehmenName3]);
        this.tableData = this.tableHelper.sortWithCustomValue(event, getFachberatungsstelle);
    }

    private sortByAngebotNr(event: TableEvent<FachberatungsangebotViewDTO>): void {
        const getAngebotNr = (v: FachberatungsangebotViewDTO) => `${v.angebotNr}`;
        this.tableData = this.tableHelper.sortWithCustomValue(event, getAngebotNr);
    }

    private sortByStatus(event: TableEvent<FachberatungsangebotViewDTO>): void {
        this.tableData = this.tableHelper.sortWithTranslate(event, FachberatungsangeboteTableComponent.STATUS);
    }

    private sortByBeratungsbereich(event: TableEvent<FachberatungsangebotViewDTO>): void {
        this.tableData = this.tableHelper.sortWithTranslate(event, FachberatungsangeboteTableComponent.BERATUNGSBEREICH);
    }

    private filterFachberatungsstelleColumnDefs(): string[] {
        const columnDefs = this.tableColumns.map(c => c.columnDef);
        if (this.showFachberatungsstelle) {
            return columnDefs.filter(c => c && !FachberatungsangeboteTableComponent.NOT_IN_SUCHEN_COLUMNS.includes(c));
        } else {
            return columnDefs.filter(c => c && !FachberatungsangeboteTableComponent.NOT_IN_ANZEIGEN_COLUMNS.includes(c));
        }
    }
}
