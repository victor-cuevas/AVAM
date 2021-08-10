import { Component, OnInit, Input } from '@angular/core';

export enum AuszahlungenType {
    ABRECHNUNG,
    TEILZAHLUNG
}
@Component({
    selector: 'avam-auszahlungen-zur-abrechnung-table',
    templateUrl: './auszahlungen-zur-abrechnung-table.component.html',
    styleUrls: ['./auszahlungen-zur-abrechnung-table.component.scss']
})
export class AuszahlungenZurAbrechnungTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() summeTotal: number;
    @Input() tableType: AuszahlungenType;
    stateKey = 'auszahlungen-zur-abrechnung';
    tableTypes = AuszahlungenType;

    abrechnungswertNr = [
        {
            columnDef: 'abrechnungswertNr',
            header: 'amm.abrechnungen.label.abrechnungswertnr',
            footer: '',
            cell: (element: any) => `${element.abrechnungswertNr}`
        }
    ];
    teilzahlungswertNr = [
        {
            columnDef: 'teilzahlungswertNr',
            header: 'amm.zahlungen.label.teilzahlungsnr',
            footer: '',
            cell: (element: any) => `${element.teilzahlungswertNr}`
        }
    ];
    defaultColumnGroup = [
        { columnDef: 'vertragswertNr', header: 'amm.akquisition.label.vertragswertnr', footer: '', cell: (element: any) => `${element.vertragswertNr}` },
        { columnDef: 'gueltigVon', header: 'common.label.gueltig_von', footer: '', cell: (element: any) => `${element.gueltigVon}` },
        { columnDef: 'gueltigBis', header: 'common.label.gueltig_bis', footer: '', cell: (element: any) => `${element.gueltigBis}` },
        { columnDef: 'profilNr', header: 'amm.abrechnungen.label.profilnr', footer: '', cell: (element: any) => `${element.profilNr}` },
        { columnDef: 'titel', header: 'amm.zahlungen.label.massnahmedurchfuehrungseinheit', footer: '', cell: (element: any) => `${element.titel}` },
        { columnDef: 'auszahlungsNr', header: 'amm.akquisition.label.auszahlungsnr', footer: '', cell: (element: any) => `${element.auszahlungsNr}` },
        {
            columnDef: 'aamArt',
            header: 'amm.akquisition.label.entschaedigungsart',
            footer: 'amm.abrechnungen.label.total',
            cell: (element: any) => `${element.aamArt}`
        },
        { columnDef: 'betrag', header: 'amm.akquisition.label.betraginchf', footer: '', cell: (element: any) => `${element.betrag}` },
        { columnDef: 'abrechnungsperiode', header: 'amm.akquisition.label.auszahlungsperiode', footer: '', cell: (element: any) => `${element.abrechnungsperiode}` },
        { columnDef: 'valutadatum', header: 'amm.akquisition.label.valuta', footer: '', cell: (element: any) => `${element.valutadatum}` }
    ];
    columns = [];
    displayedColumns = [];

    constructor() {}

    ngOnInit() {
        if (this.tableType === AuszahlungenType.ABRECHNUNG) {
            this.columns = [...this.abrechnungswertNr, ...this.defaultColumnGroup];
            this.displayedColumns = this.columns.map(c => c.columnDef);
        } else if (this.tableType === AuszahlungenType.TEILZAHLUNG) {
            this.columns = [...this.teilzahlungswertNr, ...this.defaultColumnGroup];
            this.displayedColumns = this.columns.map(c => c.columnDef);
            this.stateKey = 'auszahlungen-zur-teilzahlung';
        }
    }
}
