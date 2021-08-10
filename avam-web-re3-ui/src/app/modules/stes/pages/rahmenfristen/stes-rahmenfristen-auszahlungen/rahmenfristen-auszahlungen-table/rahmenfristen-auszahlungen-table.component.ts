import { Component, Input } from '@angular/core';

@Component({
    selector: 'avam-rahmenfristen-auszahlungen-table',
    templateUrl: './rahmenfristen-auszahlungen-table.component.html',
    styleUrls: ['./rahmenfristen-auszahlungen-table.component.scss']
})
export class RahmenfristenAuszahlungenTableComponent {
    @Input() dataSource: [];
    @Input() bezugstageFooter: string;
    @Input() auszahlungFooter: string;

    columns = [
        {
            columnDef: 'rahmenfristZahlstelle',
            header: 'stes.asal.table.alkzahlstelle',
            footer: '',
            cell: (element: any) => (element.rahmenfristZahlstelle ? `${element.rahmenfristZahlstelle}` : '')
        },
        { columnDef: 'journalNr', header: 'stes.asal.table.journalNr', footer: '', cell: (element: any) => (element.journalNr ? `${element.journalNr}` : '') },
        { columnDef: 'valutadatum', header: 'kaeswe.label.valuta', footer: '', cell: (element: any) => (element.valutadatum ? `${element.valutadatum}` : '') },
        { columnDef: 'kontrollperiode', header: 'stes.label.kontrollperiode', footer: '', cell: (element: any) => (element.kontrollperiode ? `${element.kontrollperiode}` : '') },

        {
            columnDef: 'entschaedigungskategorie',
            header: 'kaeswe.label.entschkategorie',
            footer: 'amm.abrechnungen.label.total',
            cell: (element: any) => (element.entschaedigungskategorie ? `${element.entschaedigungskategorie}` : '')
        },
        {
            columnDef: 'bezogeneTaggelder',
            header: 'stes.asal.table.bezugstage',
            footer: '',
            cell: (element: any) => (element.bezogeneTaggelder ? `${element.bezogeneTaggelder}` : '')
        },
        {
            columnDef: 'betrag',
            header: 'stes.asal.table.auszahlung',
            footer: '',
            cell: (element: any) => (element.betrag ? `${element.betrag}` : '')
        },
        { columnDef: 'ammNr', header: 'stes.asal.table.ammNr', footer: '', cell: (element: any) => (element.ammNr ? `${element.ammNr}` : '') },
        { columnDef: 'ammArt', header: 'stes.asal.table.ammArt', footer: '', cell: (element: any) => (element.ammArt ? `${element.ammArt}` : '') },
        {
            columnDef: 'leistungsvorschussExport',
            header: 'stes.asal.table.leistungsexport',
            footer: '',
            cell: (element: any) => (element.leistungsvorschussExport ? `${element.leistungsvorschussExport}` : '')
        },
        {
            columnDef: 'bezVerrechnungsland',
            header: 'common.label.land',
            footer: '',
            cell: (element: any) => (element.bezVerrechnungsland ? `${element.bezVerrechnungsland}` : '')
        }
    ];

    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}
}
