import { Component, Input, OnInit } from '@angular/core';
import { ZahlungProRahmenfristDTO } from '@dtos/zahlungProRahmenfristDTO';

@Component({
    selector: 'avam-rahmenfrist-zahlungen-table',
    templateUrl: './rahmenfrist-zahlungen-table.component.html',
    styleUrls: ['./rahmenfrist-zahlungen-table.component.scss']
})
export class RahmenfristZahlungenTableComponent implements OnInit {
    @Input() dataSource: ZahlungProRahmenfristDTO[];
    @Input() forPrinting = false;

    private readonly leistungsartLabel = 'kaeswe.label.leistungsart';
    private readonly valutaLabel = 'kaeswe.label.valuta';
    private readonly abrechnungsperiodeLabel = 'kaeswe.label.abrechnungsperiode';
    private readonly entschkategorieLabel = 'kaeswe.label.entschkategorie';
    private readonly anzahlBetroffeneMitarbeiterLabel = 'kaeswe.label.anzahlBetroffeneMitarbeiter';
    private readonly betragLabel = 'kaeswe.label.betrag';
    private readonly anteilAgLabel = 'kaeswe.label.anteilag';

    tableColumns: { columnDef: string; header: string; cell: any; sortable: boolean; dataType?: any }[] = [
        { columnDef: 'leistungsart', header: this.leistungsartLabel, cell: (element: any) => `${this.decodeLeistungsart(element.leistungsart)}`, sortable: true },
        { columnDef: 'valutadatum', header: this.valutaLabel, dataType: 'date', cell: (element: any) => `${element.valutadatum}`, sortable: true },
        { columnDef: 'abrechnungsperiode', header: this.abrechnungsperiodeLabel, dataType: 'date', cell: (element: any) => `${element.abrechnungsperiode}`, sortable: true },
        {
            columnDef: 'entschaedigungskategorie',
            header: this.entschkategorieLabel,
            cell: (element: any) => `${this.decodeEntschaedigungskategorie(element.entschaedigungskategorie)}`,
            sortable: true
        },
        { columnDef: 'bezApKs', header: this.anzahlBetroffeneMitarbeiterLabel, cell: (element: any) => `${element.bezApKs}`, sortable: true },
        { columnDef: 'betrag', header: this.betragLabel, cell: (element: any) => `${element.betrag}`, sortable: true },
        { columnDef: 'kaeSweAgAnteil', header: this.anteilAgLabel, cell: (element: any) => `${this.emptyIfZero(element.kaeSweAgAnteil)}`, sortable: true }
    ];

    displayedColumns: string[] = this.tableColumns.map(c => c.columnDef);
    stateKey = 'rahmenfrist-zahlungen-table-stateKey';

    constructor() {}

    ngOnInit() {}

    private emptyIfZero(numericData: number): string {
        return numericData && numericData > 0 ? numericData.toString() : '';
    }

    private decodeLeistungsart(leistungsartCode: string): string {
        switch (leistungsartCode) {
            case '2':
                return 'kaeswe.label.kae';
            case '3':
                return 'kaeswe.label.swe';
            default:
                return '';
        }
    }

    private decodeEntschaedigungskategorie(entschaedigungskategorie: number): string {
        switch (entschaedigungskategorie) {
            case 1:
                return 'kaeswe.label.entschaedigung';
            case 2:
                return 'kaeswe.label.storno';
            case 5:
                return 'kaeswe.label.erlassZLFonds';
            case 6:
                return 'kaeswe.label.erlassZLTraeger';
            default:
                return '';
        }
    }
}
