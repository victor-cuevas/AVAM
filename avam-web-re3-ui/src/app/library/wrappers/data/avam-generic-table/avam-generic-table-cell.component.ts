import { Component, Input } from '@angular/core';

/**
 * This is a standard-table-cell for the avam-generic-table.
 * It supports the following dataType:
 *   undefined or empty: Uses the translate-pipe
 *   date: Uses the date-pipe to format the date in the format dd.MM.yyyy
 */
@Component({
    selector: 'avam-generic-table-cell',
    template: `
        <span
            [ngbTooltip]="column.dataType === 'date' ? (column.cell(row) | date: 'dd.MM.yyyy') : (column.cell(row) | translate)"
            triggers="manual"
            #t="ngbTooltip"
            [avamTableTooltip]="t"
            [disableTooltip]="disableTooltip"
        >
            <ng-container>{{ column.dataType === 'date' ? (column.cell(row) | date: 'dd.MM.yyyy') : (column.cell(row) | translate) }}</ng-container>
        </span>
    `
})
export class AvamGenericTableCellComponent {
    @Input() column: any;
    @Input() row: any;
    @Input() disableTooltip = false;
}
