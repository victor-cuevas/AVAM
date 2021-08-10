import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormUtilsService } from '@app/shared';
import { PlanwertDTO } from '@app/shared/models/dtos-generated/planwertDTO';

@Component({
    selector: 'avam-bew-planwerte-uebersicht-table',
    templateUrl: './bew-planwerte-uebersicht-table.component.html',
    styleUrls: ['./bew-planwerte-uebersicht-table.component.scss']
})
export class BewPlanwerteUebersichtTableComponent implements OnInit {
    @Input() dataSource: PlanwertDTO[];
    @Input() forPrinting = false;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    columns = [
        { columnDef: 'planwertNr', header: 'amm.planung.label.planwertnr', cell: (element: PlanwertDTO) => `${element.planwertId}` },
        { columnDef: 'gueltigVon', header: 'amm.infotag.label.gueltigVon', cell: (element: PlanwertDTO) => `${element.gueltigVon}` },
        { columnDef: 'gueltigBis', header: 'amm.infotag.label.gueltigBis', cell: (element: PlanwertDTO) => `${element.gueltigBis}` },
        { columnDef: 'chf', header: 'common.label.chf', cell: (element: PlanwertDTO) => `${this.formatMoney(element.wertTripelObject.chfBetrag)}` },
        { columnDef: 'teilnehmerTage', header: 'common.label.tntage', cell: (element: PlanwertDTO) => `${this.formatMoney(element.wertTripelObject.teilnehmerTage)}` },
        { columnDef: 'teilnehmer', header: 'common.label.tn', cell: (element: PlanwertDTO) => `${this.formatMoney(element.wertTripelObject.teilnehmer)}` },

        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '60px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    stateKey = 'bew-planwerte-uebersicht-table';

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
