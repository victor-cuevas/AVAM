import { Component, Input, TemplateRef } from '@angular/core';

/**
 * This is the standard-header-cell for the avam-generic-table.
 */
@Component({
    selector: 'avam-generic-table-header-cell',
    template: `
        <div class="header-container">
            <span *ngIf="!content" [ngbTooltip]="column.header | translate" triggers="manual" #t="ngbTooltip" [avamTableTooltip]="t" [disableTooltip]="disableTooltip">
                <sort-icon *ngIf="!hideSortIcon" [column]="column.columnDef"></sort-icon>
                {{ column.header | translate }}
            </span>
            <span *ngIf="!!content" [ngbTooltip]="column.header | translate" triggers="manual" #t="ngbTooltip" [avamTableTooltip]="t" [disableTooltip]="disableTooltip">
                <ng-container>
                    <ng-template *ngTemplateOutlet="content"></ng-template>
                </ng-container>
            </span>
        </div>
    `
})
export class AvamGenericTableHeaderCellComponent {
    @Input() column: any;
    @Input() disableTooltip = false;
    @Input() hideSortIcon = false;
    @Input() content: TemplateRef<any>;
}
