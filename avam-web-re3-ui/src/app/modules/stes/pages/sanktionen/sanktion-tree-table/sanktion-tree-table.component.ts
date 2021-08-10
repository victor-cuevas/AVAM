import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { TreeOptionInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-option.interface';
import { SanktionSachverhaltDTO } from '@dtos/sanktionSachverhaltDTO';
import { TableHelperService } from '@stes/pages/sanktionen/helpers/table-helper.service';
import { TreeNodeInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-node.interface';

@Component({
    selector: 'avam-sanktion-tree-table',
    templateUrl: './sanktion-tree-table.component.html',
    styleUrls: ['./sanktion-tree-table.component.scss']
})
export class SanktionTreeTableComponent implements OnInit {
    @Input()
    set data(val: SanktionSachverhaltDTO) {
        this._data = val;
        if (val) {
            this.treeArray = this.tableHelper.buildRows(val);
        }
    }

    treeArray: TreeNodeInterface[];
    treeOptions: TreeOptionInterface;
    @ViewChild('actionColumnTemplate') actionColumnTemplate: TemplateRef<any>;
    @Output() onViewObjektClicked = new EventEmitter();
    private _data: SanktionSachverhaltDTO;

    public constructor(private tableHelper: TableHelperService) {
        this.treeArray = [];
    }

    public ngOnInit() {
        this.setInitialTreeOptions();
    }

    public onRowSelected(node: { model: TreeNodeInterface }) {
        this.onViewObjektClicked.emit(node.model.data);
    }

    private setInitialTreeOptions() {
        this.treeOptions = {
            columnOrder: ['objekte', 'erfassungsdatum', 'status', 'frist', 'entscheiddatum', 'einstelltage', 'einstellungsbeginn'],
            columnTitle: [
                'stes.sanktionen.header.objekte',
                'stes.sanktionen.header.erfassungsdatum',
                'stes.sanktionen.header.status',
                'stes.sanktionen.header.frist',
                'stes.sanktionen.header.entscheiddatum',
                'stes.sanktionen.header.einstelltage',
                'stes.sanktionen.header.einstellungsbeginn'
            ],
            actions: { template: this.actionColumnTemplate }
        };
    }
}
