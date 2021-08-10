import { Component, OnInit } from '@angular/core';
import { TableEvent, TableHelper } from '@shared/helpers/table.helper';
import { VoranmeldungKaeDTO } from '@dtos/voranmeldungKaeDTO';
import { CodeDTO } from '@dtos/codeDTO';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { KaeSweBaseTableComponent } from '@modules/arbeitgeber/shared/components/kae-swe-base-table/kae-swe-base-table.component';

@Component({
    selector: 'avam-voranmeldungen-table',
    templateUrl: './voranmeldungen-table.component.html'
})
export class VoranmeldungenTableComponent extends KaeSweBaseTableComponent<VoranmeldungKaeDTO> implements OnInit {
    tableColumns = [
        {
            columnDef: KaeSweBaseTableComponent.ENTSCHEID_NR,
            header: 'kaeswe.label.entscheidnr',
            cell: (row: VoranmeldungKaeDTO) => (row.entscheidNr ? `${row.entscheidNr}` : ''),
            sortable: true
        },
        {
            columnDef: KaeSweBaseTableComponent.STATUS,
            header: 'common.label.status',
            cell: (row: VoranmeldungKaeDTO) => row.statusObject,
            sortable: true
        },
        {
            columnDef: VoranmeldungenTableComponent.KURZARBEIT_VON,
            header: 'kaeswe.label.kurzarbeitvon',
            cell: (row: VoranmeldungKaeDTO) => row.kurzarbeitVon,
            sortable: true
        },
        {
            columnDef: VoranmeldungenTableComponent.KURZARBEIT_BIS,
            header: 'kaeswe.label.bis',
            cell: (row: VoranmeldungKaeDTO) => row.kurzarbeitBis,
            sortable: true
        },
        {
            columnDef: KaeSweBaseTableComponent.BETRIEBSABTEILUNG,
            header: 'kaeswe.label.betriebsabteilung',
            cell: (row: VoranmeldungKaeDTO) => this.getBetriebsabteilung(row),
            sortable: true
        },
        {
            columnDef: VoranmeldungenTableComponent.ABTEILUNG_NR,
            header: 'kaeswe.label.nr',
            cell: (row: VoranmeldungKaeDTO) => this.getBetriebsabteilungNr(row, this.gesamtbetriebCode),
            sortable: true
        },
        {
            columnDef: VoranmeldungenTableComponent.ENTSCHEID,
            header: 'kaeswe.label.entscheid',
            cell: (row: VoranmeldungKaeDTO) => row.entscheidKaeObject,
            sortable: true
        },
        {
            columnDef: VoranmeldungenTableComponent.KATEGORIE,
            header: 'kaeswe.label.kategorie',
            cell: (row: VoranmeldungKaeDTO) => row.kategorieObject,
            sortable: true
        },
        {
            columnDef: KaeSweBaseTableComponent.KANTON,
            header: 'kaeswe.label.kanton',
            cell: (row: VoranmeldungKaeDTO) => this.getKanton(row),
            sortable: true
        },
        {
            columnDef: KaeSweBaseTableComponent.SACHBEARBEITUNG,
            header: 'kaeswe.label.sachbearbeitung',
            cell: (row: VoranmeldungKaeDTO) => this.getSachbearbeitung(row),
            sortable: true
        },
        { columnDef: TableHelper.ACTIONS, header: '', cell: (row: any) => `${row.actions}`, width: '60px' }
    ];
    displayedTableColumns = this.tableColumns.map(c => c.columnDef);

    private static readonly KURZARBEIT_VON = 'kurzarbeitVon';
    private static readonly KURZARBEIT_BIS = 'kurzarbeitBis';
    private static readonly ABTEILUNG_NR = 'abteilungNr';
    private static readonly ENTSCHEID = 'entscheid';
    private static readonly KATEGORIE = 'kategorie';

    constructor(protected tableHelper: TableHelper<VoranmeldungKaeDTO>, protected dbTranslateService: DbTranslateService) {
        super(tableHelper, dbTranslateService);
    }

    sortFunction(event: TableEvent<VoranmeldungKaeDTO>): void {
        switch (event.field) {
            case KaeSweBaseTableComponent.STATUS:
                this.sortByStatus(event);
                break;
            case KaeSweBaseTableComponent.BETRIEBSABTEILUNG:
                this.sortByBetriebsabteilung(event);
                break;
            case VoranmeldungenTableComponent.ENTSCHEID:
                this.sortByEntscheid(event);
                break;
            case VoranmeldungenTableComponent.KATEGORIE:
                this.sortByKategorie(event);
                break;
            case KaeSweBaseTableComponent.KANTON:
                this.sortByKanton(event);
                break;
            case KaeSweBaseTableComponent.SACHBEARBEITUNG:
                this.sortBySachbearbeitung(event);
                break;
            default:
                this.dataSource = this.tableHelper.defaultSort(event);
                break;
        }
    }

    getStateKey(): string {
        return this.forPrinting ? this.stateKey + TableHelper.PRINT_STATE_SUFFIX : this.stateKey;
    }

    private static hasAbteilungName(row: VoranmeldungKaeDTO): boolean {
        return row.abteilungName && row.abteilungName.trim() !== '';
    }

    private static hasAbteilungNr(row: VoranmeldungKaeDTO): boolean {
        return row.abteilungNr && !isNaN(row.abteilungNr) && Number(row.abteilungNr).valueOf() > 0;
    }

    private static getBetriebsabteilung(row: VoranmeldungKaeDTO): string {
        let betriebsabteilung = '';
        if (VoranmeldungenTableComponent.hasAbteilungName(row)) {
            betriebsabteilung = row.abteilungName;
        } else if (row.betriebsabteilungObject) {
            betriebsabteilung = row.betriebsabteilungObject.abteilungName;
        }
        return betriebsabteilung;
    }

    /**
     *  Bedingte Systemverhalten und Plausibilitaeten BSP3
     */
    private static getBetriebasabteilungNr(row: VoranmeldungKaeDTO, dbTranslateService: DbTranslateService, gesamtbetriebCode: CodeDTO): string {
        const isNotGesamtbetrieb = VoranmeldungenTableComponent.getBetriebsabteilung(row) !== dbTranslateService.translate(gesamtbetriebCode, 'text');
        let betriebasabteilungNr = '';
        if (isNotGesamtbetrieb) {
            if (VoranmeldungenTableComponent.hasAbteilungNr(row)) {
                betriebasabteilungNr = String(row.abteilungNr);
            } else if (row.betriebsabteilungObject) {
                betriebasabteilungNr = String(row.betriebsabteilungObject.abteilungNr);
            }
        }
        return betriebasabteilungNr;
    }

    private static getKanton(row: VoranmeldungKaeDTO): string {
        if (!row.benutzerstelleObject || !row.benutzerstelleObject.plzObject || !row.benutzerstelleObject.plzObject.kantonsKuerzel) {
            return '';
        }

        return row.benutzerstelleObject.plzObject.kantonsKuerzel;
    }

    protected getSachbearbeitung(row: VoranmeldungKaeDTO): string {
        return row.entscheiderDetailObject ? row.entscheiderDetailObject.benutzerLogin : '';
    }

    private sortByKategorie(event: TableEvent<VoranmeldungKaeDTO>): void {
        this.dataSource = this.tableHelper.sortWithTranslateByObject(event, 'kategorieObject', 'text');
    }

    private sortByEntscheid(event: TableEvent<VoranmeldungKaeDTO>): void {
        this.dataSource = this.tableHelper.sortWithTranslateByObject(event, 'entscheidKaeObject', 'text');
    }
}
