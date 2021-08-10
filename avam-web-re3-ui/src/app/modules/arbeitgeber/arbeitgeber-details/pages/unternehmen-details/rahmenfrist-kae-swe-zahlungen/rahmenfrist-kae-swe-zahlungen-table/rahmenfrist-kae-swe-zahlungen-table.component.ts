import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { F1000OutputDTO } from '@dtos/f1000OutputDTO';
import { TableHelper } from '@shared/helpers/table.helper';
import { MonthsCodeEnum } from '@shared/enums/domain-code/months-code.enum';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'avam-rahmenfrist-kae-swe-zahlungen-table',
    templateUrl: './rahmenfrist-kae-swe-zahlungen-table.component.html'
})
export class RahmenfristKaeSweZahlungenTableComponent implements OnInit {
    private static readonly MONTHS = {
        '01': MonthsCodeEnum.JAN,
        '02': MonthsCodeEnum.FEB,
        '03': MonthsCodeEnum.MAR,
        '04': MonthsCodeEnum.APR,
        '05': MonthsCodeEnum.MAI,
        '06': MonthsCodeEnum.JUN,
        '07': MonthsCodeEnum.JUL,
        '08': MonthsCodeEnum.AUG,
        '09': MonthsCodeEnum.SEPT,
        '10': MonthsCodeEnum.OKT,
        '11': MonthsCodeEnum.NOV,
        '12': MonthsCodeEnum.DEZ
    };

    @Input() dataSource: F1000OutputDTO[];
    @Input() forPrinting = false;
    @Output() actionClicked = new EventEmitter();
    readonly stateKey = 'rahmenfrist-kae-swe-zahlungen-table-stateKey';
    readonly buchungsDatum = 'buchungsDatum';
    readonly leistungsartHeader = 'kaeswe.label.leistungsart';
    readonly valutaHeader = 'kaeswe.label.valuta';
    readonly abrechnungsperiodeHeader = 'kaeswe.label.abrechnungsperiode';
    readonly entschaedigungskategorieHeader = 'kaeswe.label.entschkategorie';
    readonly betroffeneMAHeader = 'kaeswe.label.betroffenema';
    readonly betragHeader = 'kaeswe.label.betrag';
    readonly anteilAGHeader = 'kaeswe.label.anteilag';
    tableColumns: { columnDef: string; header: string; cell: any; sortable: boolean; dataType?: any }[] = [
        { columnDef: 'leistungsArt', header: this.leistungsartHeader, cell: (element: any) => `${element.leistungsArt}`, sortable: true },
        { columnDef: this.buchungsDatum, header: this.valutaHeader, cell: (element: any) => `${new Date(element.buchungsDatum)}`, sortable: true, dataType: 'date' },
        {
            columnDef: 'abrechnungsPeriode',
            header: this.abrechnungsperiodeHeader,
            cell: (element: any) => this.formatAbrechnungsPeriode(element.abrechnungsPeriode),
            sortable: true
        },
        {
            columnDef: 'entschaedigungsKategorie',
            header: this.entschaedigungskategorieHeader,
            cell: (element: any) => `${element.entschaedigungsKategorie}`,
            sortable: true
        },
        { columnDef: 'anzahlBetroffeneArbeitnehmer', header: this.betroffeneMAHeader, cell: (element: any) => `${element.anzahlBetroffeneArbeitnehmer}`, sortable: true },
        { columnDef: 'betrag', header: this.betragHeader, cell: (element: any) => `${element.betrag}`, sortable: true },
        { columnDef: 'kaeSweAGAnteil', header: this.anteilAGHeader, cell: (element: any) => `${element.kaeSweAGAnteil}`, sortable: true },
        { columnDef: TableHelper.ACTIONS, header: '', cell: (element: any) => `${element.actions}`, sortable: false }
    ];
    displayedColumns: string[] = this.tableColumns.map(c => c.columnDef);

    constructor(private translateService: TranslateService) {}

    ngOnInit(): void {
        if (this.forPrinting) {
            this.displayedColumns = this.displayedColumns.filter(d => d !== TableHelper.ACTIONS);
        }
    }

    onAction(): void {
        this.actionClicked.emit();
    }

    getStateKey(): string {
        return this.forPrinting ? this.stateKey + TableHelper.PRINT_STATE_SUFFIX : this.stateKey;
    }

    private formatAbrechnungsPeriode(abrechnungsPeriode: number): string {
        if (abrechnungsPeriode) {
            return this.renderMonthDate(abrechnungsPeriode.toString());
        }
        return '';
    }

    private renderMonthDate(abrechnungsPeriode: string) {
        const year = abrechnungsPeriode.substr(0, 4);
        const month = abrechnungsPeriode.substr(4, 2);
        const monthKey = RahmenfristKaeSweZahlungenTableComponent.MONTHS[month];
        const monthText = this.translateService.instant(monthKey);
        return `${monthText} ${year}`;
    }
}
