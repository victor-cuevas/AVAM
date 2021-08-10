import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PlanwertDTO } from '@dtos/planwertDTO';
import { FormatSwissFrancPipe } from '@app/shared';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-vertragswert-planwert-table',
    templateUrl: './vertragswert-planwert-table.component.html',
    providers: [FormatSwissFrancPipe]
})
export class VertragswertPlanwertTableComponent implements OnInit {
    @Input() dataSource: any[];
    @Input() printable = false;
    @Output() onItemSelected: EventEmitter<PlanwertDTO> = new EventEmitter();

    columns = [
        { columnDef: 'planwertId', header: 'amm.planung.label.planwertnr', cell: (element: PlanwertDTO) => `${element.planwertId}`, width: '400px' },
        { columnDef: 'gueltigVon', header: 'amm.infotag.label.gueltigVon', cell: (element: PlanwertDTO) => `${element.gueltigVon}` },
        { columnDef: 'gueltigBis', header: 'amm.infotag.label.gueltigBis', cell: (element: PlanwertDTO) => `${element.gueltigBis}` },
        {
            columnDef: 'preismodell',
            header: 'amm.akquisition.label.preismodell',
            cell: (element: PlanwertDTO) => `${this.facade.dbTranslateService.translateWithOrder(element.preismodell, 'text')}`
        },
        { columnDef: 'chfBetrag', header: 'common.label.chf', cell: (element: PlanwertDTO) => `${this.formatSwissFrancPipe.transform(element.wertTripelObject.chfBetrag)}` },
        { columnDef: 'teilnehmerTage', header: 'common.label.tntage', cell: (element: PlanwertDTO) => `${element.wertTripelObject.teilnehmerTage}` },
        { columnDef: 'teilnehmer', header: 'common.label.tn', cell: (element: PlanwertDTO) => `${element.wertTripelObject.teilnehmer}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '60px' }
    ];

    displayedColumns = this.columns.map(c => c.columnDef);

    constructor(private formatSwissFrancPipe: FormatSwissFrancPipe, private facade: FacadeService) {}

    ngOnInit() {
        if (this.printable) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    itemSelected(data: PlanwertDTO) {
        this.onItemSelected.emit(data);
    }
}
