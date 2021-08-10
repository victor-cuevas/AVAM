import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';

@Component({
    selector: 'avam-stes-matchingtreffer-table',
    templateUrl: './stes-matchingtreffer-table.component.html',
    styleUrls: ['./stes-matchingtreffer-table.component.scss']
})
export class StesMatchingtrefferTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() stateKey: string;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    columns = [
        { columnDef: 'name', header: 'stes.label.vermittlung.name', cell: (element: any) => `${element.name}` },
        { columnDef: 'vorname', header: 'stes.label.vermittlung.vorname', cell: (element: any) => `${element.vorname}` },
        { columnDef: 'wohnort', header: 'stes.vermittlung.label.adressewohnort', cell: (element: any) => `${element.wohnort}` },
        { columnDef: 'versichertenNr', header: 'stes.label.vermittlung.svNr', cell: (element: any) => `${element.versichertenNr}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor(private searchSession: SearchSessionStorageService) {}

    ngOnInit() {}

    itemSelected(stesId) {
        this.onItemSelected.emit(stesId);
    }

    public onReset(): void {
        this.searchSession.restoreDefaultValues(this.stateKey);
    }
}
