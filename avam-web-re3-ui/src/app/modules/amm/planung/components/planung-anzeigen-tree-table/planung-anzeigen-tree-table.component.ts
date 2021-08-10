import { AmmHelper } from '@shared/helpers/amm.helper';
import { Subscription } from 'rxjs';
import { FacadeService } from '@shared/services/facade.service';
import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild, OnChanges, OnDestroy } from '@angular/core';
import { AvamGenericTreeTableComponent } from '@app/library/wrappers/data/avam-generic-tree-table/avam-generic-tree-table.component';
import { INodeState } from '@app/library/wrappers/data/avam-generic-tree-table/node-state.interface';
import { TreeNodeInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-node.interface';
import { TreeOptionInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-option.interface';
import * as moment from 'moment';

@Component({
    selector: 'avam-planung-anzeigen-tree-table',
    templateUrl: './planung-anzeigen-tree-table.component.html',
    styleUrls: ['./planung-anzeigen-tree-table.component.scss']
})
export class PlanungAnzeigenTreeTableComponent implements OnChanges, OnDestroy {
    @ViewChild('treeTable') treeTable: AvamGenericTreeTableComponent;
    @Input() dataSource: TreeNodeInterface[];
    @Input() tableOptions: TreeOptionInterface;
    @Input() startDate: Date;
    @Output() itemSelected = new EventEmitter();

    displayedColumns: string[] = [];
    columns: any[] = [];
    langSubscription: Subscription;

    constructor(private facade: FacadeService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.startDate && changes.startDate.currentValue) {
            this.initializeColumns();
        }
    }

    getFlattenTreeData(): INodeState[] {
        return this.treeTable.treeTableService.getFlatTreeState();
    }

    onItemSelected(selectedRow) {
        // handle doubleclik navigation
    }

    ngOnDestroy() {
        if (this.langSubscription) {
            this.langSubscription.unsubscribe();
        }
    }

    customTrackBy(index) {
        return index;
    }

    private initializeColumns() {
        this.columns = [
            {
                columnDef: 'name',
                header: 'common.label.name',
                width: '440px',
                cell: element => `${this.facade.dbTranslateService.translateWithOrder(element, 'titel')}`
            },
            { columnDef: 'buttons', header: '', width: '90px', cell: element => element },
            // Set the twelve month-year columns.
            ...this.setDateColumns()
        ];

        this.displayedColumns = this.columns.map(c => c.columnDef);
    }

    private setDateColumns() {
        const dateCols = [];
        // This is the selected date from the form's datepicker planungAb.
        // It is the initial date from which we will start the for loop.
        let selectedPlanungAb = this.startDate;

        // Run 12 iterations to form a complete year
        for (let index = 0; index < 12; index++) {
            const momentObj = moment(selectedPlanungAb);
            // Month index is used to form a unique columnDef and to get the exact header from
            // the list AmmHelper.MONATSKUERZEL_KEYS. E.g. January is located at index 0, December at index 11.
            const monthIndex = momentObj.month();
            dateCols.push({
                columnDef: `month${monthIndex}`,
                header: `${AmmHelper.MONATSKUERZEL_KEYS[monthIndex]}`,
                headerYear: momentObj.format('YY'),
                width: '80px',
                cell: element => element
            });

            // Increment the month by 1
            selectedPlanungAb = moment(selectedPlanungAb)
                .add(1, 'month')
                .toDate();
        }

        return dateCols;
    }
}
