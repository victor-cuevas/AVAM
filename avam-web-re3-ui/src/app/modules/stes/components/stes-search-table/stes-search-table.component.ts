import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'avam-stes-search-table',
    templateUrl: './stes-search-table.component.html',
    styleUrls: ['./stes-search-table.component.scss']
})
export class StesSearchTableComponent {
    @Input() dataSource: [];
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    columns = [
        { columnDef: 'svNr', header: 'stes.label.svnr', cell: (element: any) => `${element.svNr}` },
        { columnDef: 'nachname', header: 'common.label.nachname', cell: (element: any) => `${element.nachname}` },
        { columnDef: 'vorname', header: 'common.label.vorname', cell: (element: any) => `${element.vorname}` },
        { columnDef: 'geschlecht', header: 'common.label.geschlecht', cell: (element: any) => `${element.geschlecht}` },
        { columnDef: 'geburtsdatum', header: 'stes.label.geburtsdatum', dataType: 'date', cell: (element: any) => `${element.geburtsdatum}` },
        { columnDef: 'plz', header: 'stes.label.plz', cell: (element: any) => `${element.plz}` },
        { columnDef: 'ort', header: 'stes.label.ort', cell: (element: any) => `${element.ort}` },
        { columnDef: 'strasseNr', header: 'common.label.strassenrlong', cell: (element: any) => `${element.strasseNr}` },
        { columnDef: 'anmeldung', header: 'stes.label.anmeldung', dataType: 'date', cell: (element: any) => `${element.anmeldung}` },
        { columnDef: 'abmeldeDatum', header: 'stes.label.abmeldung', dataType: 'date', cell: (element: any) => `${element.abmeldeDatum}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '60px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor(private router: Router) {}

    itemSelected(row) {
        this.router.navigate([`stes/details/${row.id}/personalien`]);
    }

    openTooltip(e) {
        e._elementRef.nativeElement.offsetWidth < e._elementRef.nativeElement.scrollWidth ? e.open() : e.close();
    }
}
