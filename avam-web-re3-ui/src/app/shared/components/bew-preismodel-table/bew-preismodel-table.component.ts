import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PlanwerttypEnum } from '@app/shared/enums/domain-code/planwerttyp.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';

@Component({
    selector: 'avam-bew-preismodel-table',
    templateUrl: './bew-preismodel-table.component.html',
    styleUrls: ['./bew-preismodel-table.component.scss']
})
export class BewPreismodelTableComponent implements OnChanges {
    @Input() parentForm: FormGroup;
    @Input() planwertType: CodeDTO;
    @Input() isRowDisabled = false;
    @Input() isDeDisabled = false;
    @Input() isTnDisabled = false;
    @Input() isLektionenDisabled = false;

    planwerttypEnum = PlanwerttypEnum;

    columns = [
        { columnDef: 'chf', header: 'common.label.chf', cell: (element: any) => element.chf },
        { columnDef: 'teilnehmerTage', header: 'common.label.tntage', cell: (element: any) => element.teilnehmerTage },
        { columnDef: 'teilnehmer', header: 'common.label.tn', cell: (element: any) => element.teilnehmer }
    ];
    displayedColumns: any[];
    dataSource = [{}, {}];

    constructor() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.planwertType && this.planwertType) {
            if (this.planwertType.code !== this.planwerttypEnum.PRODUKT && !this.columns.some(col => col.columnDef === 'de' || col.columnDef === 'lektionen')) {
                this.columns.push(
                    { columnDef: 'de', header: 'amm.abrechnungen.label.de', cell: (element: any) => element.de },
                    { columnDef: 'lektionen', header: 'amm.abrechnungen.label.lektionenkurz', cell: (element: any) => element.lektionen }
                );
            }
        }
        this.displayedColumns = this.columns.map(c => c.columnDef);
    }
}
