import { FacadeService } from '@shared/services/facade.service';
import { TreeOptionInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-option.interface';
import { VertragswertErfassenWizardService } from '@shared/components/new/avam-wizard/vertragswert-erfassen-wizard.service';
import { Component, Input, SimpleChanges, OnChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { TreeNodeInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-node.interface';
import { AvamGenericTreeTableComponent } from '@app/library/wrappers/data/avam-generic-tree-table/avam-generic-tree-table.component';
import { INodeState } from '@app/library/wrappers/data/avam-generic-tree-table/node-state.interface';

export interface VwErfassenTableDataRow {
    elementName: string;
    gueltigVon: Date;
    gueltigBis: Date;
    voId: number;
    voClass: string;
    voIdAttribute: string;
    titelDe: string;
    titelFr: string;
    titelIt: string;
    isChecked?: boolean;
    inVertragswertVerwaltungAuswaehlbar?: boolean;
}

@Component({
    selector: 'avam-vertragswert-erfassen-tree-table',
    templateUrl: './vertragswert-erfassen-tree-table.component.html',
    styleUrls: ['./vertragswert-erfassen-tree-table.component.scss']
})
export class VertragswertErfassenTreeTableComponent implements OnChanges {
    @ViewChild('treeTable') treeTable: AvamGenericTreeTableComponent;
    @Input() dataSource: TreeNodeInterface[];
    @Input() tableOptions: TreeOptionInterface;
    @Output() itemSelected = new EventEmitter();

    data: TreeNodeInterface[];

    columns = [
        {
            columnDef: 'object',
            header: 'common.button.objekt',
            cell: element => {
                return this.parseElementName(element);
            }
        },
        { columnDef: 'checkbox', header: '', width: '60px', cell: element => element.model.data.isChecked },
        { columnDef: 'gueltigVon', header: 'amm.akquisition.label.gueltigvon', cell: element => element.model.data.gueltigVon, width: '150px' },
        { columnDef: 'gueltigBis', header: 'amm.akquisition.label.gueltigbis', cell: element => element.model.data.gueltigBis, width: '150px' }
    ];

    displayedColumns = this.columns.map(c => c.columnDef);

    constructor(private wizardService: VertragswertErfassenWizardService, private facade: FacadeService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.dataSource && changes.dataSource.currentValue) {
            this.data = this.dataSource;
        }
    }

    onCheckboxChange(isChecked: boolean, rowData: VwErfassenTableDataRow) {
        if (isChecked) {
            if (this.wizardService.lastTreeTableSelection) {
                this.wizardService.lastTreeTableSelection.isChecked = false;
            }

            rowData.isChecked = true;
            this.wizardService.lastTreeTableSelection = rowData;
            this.itemSelected.emit(rowData);
        } else {
            rowData.isChecked = false;
            this.itemSelected.emit(null);
        }
    }

    getFlattenTreeData(): INodeState[] {
        return this.treeTable.treeTableService.getFlatTreeState();
    }

    private parseElementName(element): string {
        if (element.voId) {
            return `${this.facade.translateService.instant('amm.planundakqui.label.nr')} ${element.voId} ${this.facade.dbTranslateService.translateWithOrder(element, 'titel')}`;
        }

        return `${this.facade.dbTranslateService.translateWithOrder(element, 'titel')}`;
    }
}
