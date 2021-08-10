import { Component, OnInit, Input, Host } from '@angular/core';

import { AvamGenericTreeTableComponent } from '../avam-generic-tree-table.component';

@Component({
    selector: 'tree-table-toggler',
    template: `
        <div class="value-cell">
            <div [innerHTML]="formatIndentation(element)"></div>
            <div class="element-label">
                <i
                    class="far"
                    [ngStyle]="{
                        visibility: element.children.length ? 'visible' : 'hidden'
                    }"
                    [ngClass]="element.isExpanded ? 'fa-minus-square' : 'fa-plus-square'"
                    (click)="onClick(element)"
                ></i>
                <span ngbTooltip="{{ column.cell(element.model.data) | translate }}"> <ng-content></ng-content> {{ column.cell(element.model.data) | translate }} </span>
            </div>
        </div>
    `,
    styleUrls: ['./avam-generic-tree-table-toggler.component.scss']
})
export class AvamGenericTreeTableTogglerComponent implements OnInit {
    @Input() element: any;

    @Input() column: any;

    constructor(@Host() private parent: AvamGenericTreeTableComponent) {}

    ngOnInit() {}

    onClick(node) {
        this.parent.treeTableService.onRowClick(node);
    }

    formatIndentation(node, step = 5): string {
        return '&nbsp;'.repeat(node.getPath().length * step);
    }
}
