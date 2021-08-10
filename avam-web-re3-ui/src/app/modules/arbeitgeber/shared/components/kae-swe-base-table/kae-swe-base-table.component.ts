import { EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MeldungSweDTO } from '@dtos/meldungSweDTO';
import { VoranmeldungKaeDTO } from '@dtos/voranmeldungKaeDTO';
import { CodeDTO } from '@dtos/codeDTO';
import { TableEvent, TableHelper } from '@shared/helpers/table.helper';
import { DbTranslateService } from '@shared/services/db-translate.service';

export abstract class KaeSweBaseTableComponent<T extends MeldungSweDTO | VoranmeldungKaeDTO> implements OnInit {
    @Input() gesamtbetriebCode: CodeDTO;
    @Input() dataSource: T[];
    @Input() stateKey: string;
    @Input() forPrinting = false;
    @Output() onPrimaryAction = new EventEmitter<T>();
    displayedTableColumns = [];
    protected static readonly ENTSCHEID_NR = 'entscheidNr';
    protected static readonly STATUS = 'status';
    protected static readonly BETRIEBSABTEILUNG = 'betriebsabteilung';
    protected static readonly KANTON = 'kanton';
    protected static readonly SACHBEARBEITUNG = 'sachbearbeitung';

    protected constructor(protected tableHelper: TableHelper<T>, protected dbTranslateService: DbTranslateService) {}

    ngOnInit(): void {
        if (this.forPrinting) {
            this.displayedTableColumns = this.displayedTableColumns.filter(d => d !== TableHelper.ACTIONS);
        }
    }

    getStateKey(): string {
        return this.forPrinting ? this.stateKey + TableHelper.PRINT_STATE_SUFFIX : this.stateKey;
    }

    onOpen(row: T): void {
        this.onPrimaryAction.emit(row);
    }

    getBetriebsabteilung(row: T): string {
        let betriebsabteilung = '';
        if (row.abteilungName && row.abteilungName.trim() !== '') {
            betriebsabteilung = row.abteilungName;
        } else if (row.betriebsabteilungObject) {
            betriebsabteilung = row.betriebsabteilungObject.abteilungName;
        }
        return betriebsabteilung;
    }

    /**
     *  Bedingte Systemverhalten und Plausibilitaeten BSP3
     */
    getBetriebsabteilungNr(row: T, gesamtbetriebCode: CodeDTO): string {
        const isNotGesamtbetrieb = this.getBetriebsabteilung(row) !== this.dbTranslateService.translate(gesamtbetriebCode, 'text');
        let betriebasabteilungNr = '';
        if (isNotGesamtbetrieb) {
            if (row.abteilungNr && !isNaN(row.abteilungNr) && Number(row.abteilungNr).valueOf() > 0) {
                betriebasabteilungNr = String(row.abteilungNr);
            } else if (row.betriebsabteilungObject && row.betriebsabteilungObject.abteilungNr > 0) {
                betriebasabteilungNr = String(row.betriebsabteilungObject.abteilungNr);
            }
        }
        return betriebasabteilungNr;
    }

    getKanton(row: T): string {
        return row.benutzerstelleObject ? row.benutzerstelleObject.plzObject.kantonsKuerzel : '';
    }

    sortByKanton(event: TableEvent<T>): void {
        this.dataSource = this.tableHelper.sortWithCustomValue(event, this.getKanton);
    }

    sortByBetriebsabteilung(event: TableEvent<T>): void {
        this.dataSource = this.tableHelper.sortWithCustomValue(event, this.getBetriebsabteilung);
    }

    sortByStatus(event: TableEvent<T>): void {
        this.dataSource = this.tableHelper.sortWithTranslateByObject(event, 'statusObject', 'text');
    }

    sortBySachbearbeitung(event: TableEvent<T>): void {
        this.dataSource = this.tableHelper.sortWithCustomValue(event, this.getSachbearbeitung);
    }

    protected abstract getSachbearbeitung(row: T): string;
}
