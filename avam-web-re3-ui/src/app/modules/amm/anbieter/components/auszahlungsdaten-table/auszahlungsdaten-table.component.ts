import { Component, Input, OnInit } from '@angular/core';

export enum AuszahlungsdatenTableType {
    TEILZAHLUNGSWERTE,
    ABRECHNUNGSWERTE
}

@Component({
    selector: 'avam-auszahlungsdaten-table',
    templateUrl: './auszahlungsdaten-table.component.html'
})
export class AuszahlungsdatenTableComponent implements OnInit {
    @Input() dataSource: [] = [];
    @Input() total: string | number;
    @Input() secondFooterTotal: string | number;
    @Input() tableType: AuszahlungsdatenTableType;
    @Input() footer2 = false;

    types = AuszahlungsdatenTableType;
    shouldFocusInitialRow = false;
    stateKey = 'auszahlungsdaten';

    columns = [];
    displayedColumns = [];
    displayedFooters = [];

    ngOnInit() {
        this.columns = [
            {
                columnDef: 'auszahlungsNr',
                footerDef: 'emptyAuszahlungsNr',
                header: 'amm.akquisition.label.auszahlungsnr',
                footer: '',
                footer2: '',
                cell: (element: any) => `${element.auszahlungsNr}`
            },
            {
                columnDef: 'entscheidNr',
                footerDef: 'emptyEntscheidNr',
                header: this.tableType === this.types.ABRECHNUNGSWERTE ? 'amm.akquisition.label.abrechnungswertnr' : 'amm.akquisition.label.teilzahlungswertnr',
                footer: '',
                footer2: '',
                cell: (element: any) => `${element.entscheidNr}`
            },
            {
                columnDef: 'entschaedigungsart',
                footerDef: 'total',
                header: 'amm.akquisition.label.entschaedigungsart',
                footer: this.tableType === this.types.ABRECHNUNGSWERTE ? 'amm.akquisition.label.totalschlusszahlungen' : 'amm.akquisition.label.totalteilzahlungen',
                footer2: 'amm.akquisition.label.totalzahlungen',
                cell: (element: any) => `${element.entschaedigungsart}`
            },
            { columnDef: 'betrag', footerDef: 'betragValue', header: 'amm.akquisition.label.betrag', footer: '', footer2: '', cell: (element: any) => `${element.betrag}` },
            {
                columnDef: 'auszahlungsperiode',
                footerDef: 'emptyAuszahlungsperiode',
                header: 'amm.akquisition.label.auszahlungsperiode',
                footer: '',
                footer2: '',
                cell: (element: any) => `${element.auszahlungsperiode}`
            },
            { columnDef: 'valuta', footerDef: 'emptyValuta', header: 'amm.akquisition.label.valuta', footer: '', footer2: '', cell: (element: any) => `${element.valuta}` },
            { columnDef: 'burNr', footerDef: 'emptyBurNr', header: 'amm.akquisition.label.burnummer', footer: '', footer2: '', cell: (element: any) => `${element.burNr}` }
        ];

        this.displayedColumns = this.columns.map(c => c.columnDef);
        this.displayedFooters = this.columns.map(c => c.footerDef);

        if (this.tableType === this.types.TEILZAHLUNGSWERTE) {
            this.shouldFocusInitialRow = true;
            this.stateKey = 'teilzahlungswerte-auszahlungsdaten';
        } else if (this.tableType === this.types.ABRECHNUNGSWERTE) {
            this.shouldFocusInitialRow = false;
            this.stateKey = 'abrechnungswerte-auszahlungsdaten';
        }
    }
}
