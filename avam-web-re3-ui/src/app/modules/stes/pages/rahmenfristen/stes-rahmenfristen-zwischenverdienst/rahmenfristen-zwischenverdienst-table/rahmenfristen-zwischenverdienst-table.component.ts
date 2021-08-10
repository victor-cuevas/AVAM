import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'avam-rahmenfristen-zwischenverdienst-table',
    templateUrl: './rahmenfristen-zwischenverdienst-table.component.html',
    styleUrls: ['./rahmenfristen-zwischenverdienst-table.component.scss']
})
export class RahmenfristenZwischenverdienstTableComponent implements OnInit {
    @Input() dataSource: [];
    columns = [
        { columnDef: 'kontrollperiode', header: 'stes.label.kontrollperiode', cell: (element: any) => (element.kontrollperiode ? `${element.kontrollperiode}` : '') },
        { columnDef: 'nameUnternehmen', header: 'stes.label.name', cell: (element: any) => (element.nameUnternehmen ? `${element.nameUnternehmen}` : '') },
        { columnDef: 'strasseNr', header: 'stes.label.adresse', cell: (element: any) => (element.strasseNr ? `${element.strasseNr}` : '') },
        { columnDef: 'plzOrt', header: 'stes.label.plzort', cell: (element: any) => (element.plzOrt ? `${element.plzOrt}` : '') },
        { columnDef: 'nogaCode', header: 'verzeichnisse.label.noga.code', cell: (element: any) => (element.nogaCode ? `${element.nogaCode}` : '') },
        { columnDef: 'nogaText', header: 'stes.label.branche', cell: (element: any) => (element.nogaText ? `${element.nogaText}` : '') },
        { columnDef: 'burNr', header: 'stes.label.burnummer', cell: (element: any) => (element.burNr ? `${element.burNr}` : '') },
        {
            columnDef: 'arbeitszeitregelung',
            header: 'stes.asal.table.arbeitszeitregelung',
            cell: (element: any) => (element.arbeitszeitregelung ? `${element.arbeitszeitregelung}` : '')
        },
        { columnDef: 'arbeitsstunden', header: 'stes.asal.table.anzahlGearbeiteteStunden', cell: (element: any) => (element.arbeitsstunden ? `${element.arbeitsstunden}` : '') },
        { columnDef: 'zvTaggeld', header: 'stes.asal.table.zwischenverdienstTaggelder', cell: (element: any) => (element.zvTaggeld ? `${element.zvTaggeld}` : '') },
        {
            columnDef: 'zwischenverdErsatzeink',
            header: 'stes.asal.table.zwischenverdienstErsatzeinkommen',
            cell: (element: any) => (element.zwischenverdErsatzeink ? `${element.zwischenverdErsatzeink}` : '')
        },
        { columnDef: 'betrag', header: 'stes.asal.table.taggelderBrutto', cell: (element: any) => (element.betrag ? `${element.betrag}` : '') },
        {
            columnDef: 'zwischenverdienstTage',
            header: 'stes.asal.table.zwischenverdienstTage',
            cell: (element: any) => (element.zwischenverdienstTage ? `${element.zwischenverdienstTage}` : '')
        }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {}
}
