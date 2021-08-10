import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CallbackDTO } from '@dtos/callbackDTO';

export interface GeschaefteTableRow {
    id: string;
    exclamationMark: boolean;
    erfasstAm: Date;
    nameVornameOrt?: string;
    geschaeftsart: string;
    sachstand: string;
    termin: Date;
    callback: CallbackDTO;
}

@Component({
    selector: 'avam-geschaefte-table',
    templateUrl: './geschaefte-table.component.html'
})
export class GeschaefteTableComponent implements OnInit {
    @Input() rows: GeschaefteTableRow[];
    @Input() forStes = false;
    @Input() stateKey;
    @Input() print = false;
    @Output() onPrimaryAction = new EventEmitter<CallbackDTO>();
    columns: any[] = [];
    displayedColumns = [];
    readonly dateFormat = 'dd.MM.yyyy';

    ngOnInit(): void {
        this.columns = [
            { columnDef: 'exclamationMark', header: '', cell: (element: any) => `${element.exclamationMark}`, sortable: true, width: '75px' },
            {
                columnDef: 'erfasstAm',
                header: 'geko.label.erstelltAm',
                cell: (element: any) => (element.erfasstAm ? `${element.erfasstAm}` : ''),
                width: '142px',
                sortable: true
            },
            { columnDef: 'nameVornameOrt', header: 'geko.label.namevornameort', cell: (element: any) => `${element.nameVornameOrt}`, sortable: true },
            { columnDef: 'geschaeftsart', header: 'geko.label.geschaeftsart', cell: (element: any) => `${element.geschaeftsart}`, width: '250px', sortable: true },
            { columnDef: 'sachstand', header: 'geko.label.sachstand', cell: (element: any) => `${element.sachstand}`, width: '280px', sortable: true },
            { columnDef: 'termin', header: 'geko.label.termin', cell: (element: any) => (element.termin ? `${element.termin}` : ''), width: '142px', sortable: true },
            { columnDef: 'actions', header: '', cell: (element: any) => `${element.actions}`, width: '60px' }
        ];
        if (this.forStes) {
            this.columns = this.columns.filter(c => c.columnDef !== 'nameVornameOrt');
        }
        this.displayedColumns = this.columns.map(c => c.columnDef);
        if (this.print) {
            this.displayedColumns = this.displayedColumns.filter(d => d !== 'actions');
        }
    }

    onOpen(callback: CallbackDTO) {
        this.onPrimaryAction.emit(callback);
    }
}
