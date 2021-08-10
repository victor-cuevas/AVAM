import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormUtilsService } from '@app/shared';

@Component({
    selector: 'avam-planwert-suchen-table',
    templateUrl: './planwert-suchen-table.component.html',
    styleUrls: ['./planwert-suchen-table.component.scss']
})
export class PlanwertSuchenTableComponent implements OnInit {
    static readonly STATE_KEY = 'planwert-suchen-table-state-key';
    @Input() dataSource: any[];
    @Input() forPrinting = false;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns = [
        { columnDef: 'planwertNr', header: 'amm.planung.label.planwertnr', cell: element => `${element.planwertNr}`, width: '200px' },
        { columnDef: 'planwerttyp', header: 'amm.planung.label.planwerttyp', cell: element => `${element.planwerttyp}` },
        { columnDef: 'titelpmd', header: 'amm.planung.label.titelpmd', cell: element => `${element.titelpmd}`, width: '350px' },
        { columnDef: 'gueltigVon', header: 'amm.infotag.label.gueltigVon', cell: element => `${element.gueltigVon}` },
        { columnDef: 'gueltigBis', header: 'amm.infotag.label.gueltigBis', cell: element => `${element.gueltigBis}` },
        { columnDef: 'chfBetrag', header: 'common.label.chf', cell: element => `${this.formatMoney(element.chfBetrag)}` },
        { columnDef: 'teilnehmerTage', header: 'common.label.tntage', cell: element => `${this.formatMoney(element.teilnehmerTage)}` },
        { columnDef: 'teilnehmer', header: 'common.label.tn', cell: element => `${this.formatMoney(element.teilnehmer)}` },

        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '60px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    stateKey = PlanwertSuchenTableComponent.STATE_KEY;

    constructor(private formUtils: FormUtilsService) {}

    ngOnInit() {
        if (this.forPrinting) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    formatMoney(element: number): string {
        return this.formUtils.formatAmountOfMoney(element).split('.')[0];
    }

    itemSelected(data) {
        this.onItemSelected.emit(data);
    }
}
