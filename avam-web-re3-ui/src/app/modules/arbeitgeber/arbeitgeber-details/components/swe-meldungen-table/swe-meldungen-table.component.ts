import { Component, OnInit } from '@angular/core';
import { TableEvent, TableHelper } from '@shared/helpers/table.helper';
import { MeldungSweDTO } from '@dtos/meldungSweDTO';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { VoranmeldungKaeDTO } from '@dtos/voranmeldungKaeDTO';
import { KaeSweBaseTableComponent } from '@modules/arbeitgeber/shared/components/kae-swe-base-table/kae-swe-base-table.component';
import { MonthPipe } from '@shared/pipes/month.pipe';

@Component({
    selector: 'avam-swe-meldungen-table',
    templateUrl: './swe-meldungen-table.component.html'
})
export class SweMeldungenTableComponent extends KaeSweBaseTableComponent<MeldungSweDTO> implements OnInit {
    tableColumns = [
        {
            columnDef: KaeSweBaseTableComponent.ENTSCHEID_NR,
            header: 'kaeswe.label.entscheidnr',
            cell: (row: MeldungSweDTO) => (row.entscheidNr ? `${row.entscheidNr}` : ''),
            sortable: true
        },
        {
            columnDef: KaeSweBaseTableComponent.STATUS,
            header: 'common.label.status',
            cell: (row: MeldungSweDTO) => row.statusObject,
            sortable: true
        },
        {
            columnDef: SweMeldungenTableComponent.MONAT_MIT_ZUSATZ,
            header: 'kaeswe.label.monatMitZusatz',
            cell: (row: MeldungSweDTO) => (row.ausfallMonat ? `${row.ausfallMonat}` : ''),
            sortable: true
        },
        {
            columnDef: SweMeldungenTableComponent.JAHR,
            header: 'kaeswe.label.jahr',
            cell: (row: MeldungSweDTO) => (row.ausfallJahr ? `${row.ausfallJahr}` : ''),
            sortable: true
        },
        {
            columnDef: KaeSweBaseTableComponent.BETRIEBSABTEILUNG,
            header: 'kaeswe.label.betriebsabteilung',
            cell: (row: MeldungSweDTO) => this.getBetriebsabteilung(row),
            sortable: true
        },
        {
            columnDef: SweMeldungenTableComponent.NR,
            header: 'kaeswe.label.nr',
            cell: (row: MeldungSweDTO) => this.getBetriebsabteilungNr(row, this.gesamtbetriebCode),
            sortable: true
        },
        {
            columnDef: KaeSweBaseTableComponent.KANTON,
            header: 'kaeswe.label.kanton',
            cell: (row: MeldungSweDTO) => this.getKanton(row),
            sortable: true
        },
        {
            columnDef: KaeSweBaseTableComponent.SACHBEARBEITUNG,
            header: 'kaeswe.label.sachbearbeitung',
            cell: (row: MeldungSweDTO) => this.getSachbearbeitung(row),
            sortable: true
        },
        { columnDef: TableHelper.ACTIONS, header: '', cell: (row: any) => `${row.actions}`, width: '60px' }
    ];
    displayedTableColumns = this.tableColumns.map(c => c.columnDef);

    private static readonly NR = 'nr';
    private static readonly MONAT_MIT_ZUSATZ = 'ausfallMonat';
    private static readonly JAHR = 'ausfallJahr';

    constructor(protected tableHelper: TableHelper<VoranmeldungKaeDTO>, protected dbTranslateService: DbTranslateService, private monthPipe: MonthPipe) {
        super(tableHelper, dbTranslateService);
    }

    sortFunction(event: TableEvent<MeldungSweDTO>): void {
        switch (event.field) {
            case KaeSweBaseTableComponent.STATUS:
                this.sortByStatus(event);
                break;
            case KaeSweBaseTableComponent.BETRIEBSABTEILUNG:
                this.sortByBetriebsabteilung(event);
                break;
            case KaeSweBaseTableComponent.KANTON:
                this.sortByKanton(event);
                break;
            case KaeSweBaseTableComponent.SACHBEARBEITUNG:
                this.sortBySachbearbeitung(event);
                break;
            case SweMeldungenTableComponent.NR:
                this.sortByBetriebsabteilungNr(event);
                break;
            case SweMeldungenTableComponent.MONAT_MIT_ZUSATZ:
                this.sortByMonat(event);
                break;
            default:
                this.dataSource = this.tableHelper.defaultSort(event);
                break;
        }
    }

    protected getSachbearbeitung(row: MeldungSweDTO): string {
        return row.entscheiderDetailObject ? row.entscheiderDetailObject.benutzerLogin : '';
    }

    private sortByBetriebsabteilungNr(event: TableEvent<MeldungSweDTO>): void {
        this.tableHelper.sortWithCustomValue(event, (row: MeldungSweDTO) => this.getBetriebsabteilungNr(row, this.gesamtbetriebCode));
    }

    private sortByMonat(event: TableEvent<MeldungSweDTO>): void {
        this.tableHelper.sortWithCustomValue(event, (row: MeldungSweDTO) => this.monthPipe.transform(row.ausfallMonat));
    }
}
