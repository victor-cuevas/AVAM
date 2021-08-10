import { Component, Input } from '@angular/core';

@Component({
    selector: 'avam-auszahlungen-zur-leistungsvereinbarung-table',
    templateUrl: './auszahlungen-zur-leistungsvereinbarung-table.component.html'
})
export class AuszahlungenZurLeistungsvereinbarungTableComponent {
    @Input() dataSource: [];
    @Input() summeTotal: string | number;

    stateKey = 'auszahlungen-zur-leistungsvereinbarung';

    columns = [
        { columnDef: 'vertragswertNr', header: 'amm.akquisition.label.vertragswertnr', footer: '', cell: (element: any) => `${element.vertragswertNr}` },
        { columnDef: 'gueltigVon', header: 'common.label.gueltig_von', footer: '', cell: (element: any) => `${element.gueltigVon}` },
        { columnDef: 'gueltigBis', header: 'common.label.gueltig_bis', footer: '', cell: (element: any) => `${element.gueltigBis}` },
        { columnDef: 'profilNr', header: 'amm.akquisition.label.profilnr', footer: '', cell: (element: any) => `${element.profilNr}` },
        { columnDef: 'titel', header: 'amm.zahlungen.label.massnahmedurchfuehrungseinheit', footer: '', cell: (element: any) => `${element.titel}` },
        {
            columnDef: 'teilzahlungswertAbrechnungswertNr',
            header: 'amm.zahlungen.label.teilzahlungswertAbrechnungswertnr',
            footer: '',
            cell: (element: any) => `${element.teilzahlungswertAbrechnungswertNr}`
        },
        { columnDef: 'auszahlungsNr', header: 'amm.akquisition.label.auszahlungsnr', footer: '', cell: (element: any) => `${element.auszahlungsNr}` },
        { columnDef: 'zahlungscode', header: 'amm.akquisition.label.zahlungscode', footer: '', cell: (element: any) => `${element.zahlungscode}` },
        {
            columnDef: 'entschaedigungsart',
            header: 'amm.akquisition.label.entschaedigungsart',
            footer: 'amm.akquisition.label.total',
            cell: (element: any) => `${element.entschaedigungsart}`
        },
        { columnDef: 'betrag', header: 'amm.akquisition.label.betraginchf', footer: '', cell: (element: any) => `${element.betrag}` },
        { columnDef: 'auszahlungsperiode', header: 'amm.akquisition.label.auszahlungsperiode', footer: '', cell: (element: any) => `${element.auszahlungsperiode}` },
        { columnDef: 'valuta', header: 'amm.akquisition.label.valuta', footer: '', cell: (element: any) => `${element.valuta}` }
    ];

    displayedColumns = this.columns.map(c => c.columnDef);

    sortFunction(event) {
        if (event.field === 'initial') {
            event.data.sort((value1, value2) => {
                const firstComparison = value2.profilNr - value1.profilNr;

                if (firstComparison !== 0) {
                    return firstComparison;
                }

                return value2.teilzahlungswertAbrechnungswertNr - value1.teilzahlungswertAbrechnungswertNr;
            });
        } else {
            const comparableValue = event.data && event.data.length > 0 && event.data[0][event.field];
            if (typeof comparableValue === 'string') {
                event.data.sort((value1, value2) => {
                    if (event.order === 1) {
                        return value1[event.field].localeCompare(value2[event.field]);
                    }
                    if (event.order === -1) {
                        return value2[event.field].localeCompare(value1[event.field]);
                    }
                });
            } else {
                event.data.sort((value1, value2) => {
                    if (event.order === 1) {
                        return value1[event.field] - value2[event.field];
                    }
                    if (event.order === -1) {
                        return value2[event.field] - value1[event.field];
                    }
                });
            }
        }
    }
}
