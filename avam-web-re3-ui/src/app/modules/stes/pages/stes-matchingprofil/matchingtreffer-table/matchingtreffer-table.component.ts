import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MeldepflichtEnum, SuitableEnum } from '@app/shared/enums/table-icon-enums';

@Component({
    selector: 'avam-matchingtreffer-table',
    templateUrl: './matchingtreffer-table.component.html',
    styleUrls: ['./matchingtreffer-table.component.scss']
})
export class MatchingtrefferTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() forPrinting = false;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    @Output() onRemoveMarking: EventEmitter<any> = new EventEmitter();
    columns = [
        { columnDef: 'nichtGeeignet', header: 'arbeitgeber.oste.button.zuweisungnichtgeeignet', cell: (element: any) => element.nichtGeeignet, width: '65px' },
        { columnDef: 'meldepflicht', header: 'arbeitgeber.oste.label.stelleMeldepflicht', cell: (element: any) => element.meldepflicht, width: '65px' },
        { columnDef: 'taetigkeit', header: 'arbeitgeber.oste.label.beruftaetigkeit', cell: (element: any) => `${element.taetigkeit}` },
        { columnDef: 'beschaeftigungsgrad', header: 'common.label.prozentzeichen', cell: (element: any) => `${element.beschaeftigungsgrad}`, width: '90px' },
        { columnDef: 'qualifikation', header: 'arbeitgeber.oste.label.qualifikation', cell: (element: any) => `${element.qualifikation}`, width: '150px' },
        { columnDef: 'arbeitsort', header: 'arbeitgeber.oste.label.arbeitsort', cell: (element: any) => `${element.arbeitsort}` },
        { columnDef: 'unternehmenName', header: 'arbeitgeber.label.namearbeitgeber', cell: (element: any) => `${element.unternehmenName}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '100px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    meldepflichtEnum = MeldepflichtEnum;
    suitableEnum = SuitableEnum;
    stateKey = 'matching-table-sort';

    constructor() {}

    ngOnInit() {
        if (this.forPrinting) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    itemSelected(osteId, stesMatchingProfilId) {
        this.onItemSelected.emit({ osteId, stesMatchingProfilId });
    }

    removeMarking(osteId) {
        this.onRemoveMarking.emit(osteId);
    }
}
