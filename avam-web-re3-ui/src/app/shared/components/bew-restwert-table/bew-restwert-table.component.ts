import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormUtilsService } from '@app/shared';
import { PlanwerttypEnum } from '@app/shared/enums/domain-code/planwerttyp.enum';

@Component({
    selector: 'avam-bew-restwert-table',
    templateUrl: './bew-restwert-table.component.html'
})
export class BewRestwertTableComponent implements OnInit, OnChanges {
    @Input() dataSource: any[];
    @Input() planwertType: any;
    @Input() isVertragswert = false;

    columns = [];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor(private translateService: TranslateService, private formUtils: FormUtilsService) {}

    ngOnInit() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.planwertType && changes.planwertType.currentValue) {
            this.columns = [
                { columnDef: 'jahr', header: 'common.label.jahr', cell: (element: any) => `${element.jahr}` },
                { columnDef: 'chfBudget', header: 'common.label.budget', cell: (element: any) => `${this.formatMoney(element.chfBudget)}` },
                { columnDef: 'prozentBudget', header: 'common.label.prozentzeichen', cell: (element: any) => `${element.prozentBudget}`, width: '55px' },
                { columnDef: 'chfWerte', header: this.getPlanwertType(), cell: (element: any) => `${this.formatMoney(element.chfWerte)}` },
                { columnDef: 'prozentWerte', header: 'common.label.prozentzeichen', cell: (element: any) => `${element.prozentWerte}`, width: '55px' },
                { columnDef: 'chfSaldo', header: 'common.label.saldo', cell: (element: any) => `${this.formatMoney(element.chfSaldo)}` },
                { columnDef: 'prozentSaldo', header: 'common.label.prozentzeichen', cell: (element: any) => `${element.prozentSaldo}`, width: '55px' }
            ];
        }

        this.displayedColumns = this.columns.map(c => c.columnDef);
    }

    formatMoney(element: number): string {
        return this.formUtils.formatAmountOfMoney(element).split('.')[0];
    }

    getPlanwertType(): string {
        if (this.isVertragswert) {
            return this.translateService.instant('amm.akquisition.label.vertragswerte');
        }

        const produktLabel = this.translateService.instant('amm.planung.subnavmenuitem.planwerte');
        let typeLabel;

        switch (this.planwertType.code) {
            case PlanwerttypEnum.PRODUKT:
                typeLabel = this.translateService.instant('amm.planung.label.produkt');
                return `${produktLabel} (${typeLabel})`;
            case PlanwerttypEnum.STANDORT:
                typeLabel = this.translateService.instant('amm.planung.label.standort');
                return `${produktLabel} (${typeLabel})`;
            case PlanwerttypEnum.MASSNAHME:
                typeLabel = this.translateService.instant('amm.planung.label.massnahme');
                return `${produktLabel} (${typeLabel})`;
            case PlanwerttypEnum.KURS:
                typeLabel = this.translateService.instant('amm.planung.label.kurs');
                return `${produktLabel} (${typeLabel})`;
        }
        return null;
    }
}
