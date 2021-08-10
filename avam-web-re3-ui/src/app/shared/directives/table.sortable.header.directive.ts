import { Directive, ElementRef, EventEmitter, Input, Output, Renderer2 } from '@angular/core';
import { SortOrderEnum } from '../enums/sort-order.enum';

const rotate: { [key: string]: SortDirection } = {
    ASC: SortOrderEnum.DESCENDING,
    DESC: SortOrderEnum.ASCENDING,
    '': SortOrderEnum.ASCENDING
};

@Directive({
    selector: 'span[sortable]',
    host: { '(click)': 'rotate()' }
})
export class SortableHeader {
    @Input() sortable: string;
    @Input() direction: SortDirection = SortOrderEnum.NONE;
    @Input() columnsToSort: string[];
    @Output() sort = new EventEmitter<SortEvent>();
    arrowIcon: any;

    constructor(private renderer: Renderer2, public hostElement: ElementRef) {
        this.arrowIcon = this.renderer.createElement('i');
    }

    rotate() {
        this.direction = rotate[this.direction];

        if (this.direction === SortOrderEnum.ASCENDING) {
            this.renderCaret('up');
        } else if (this.direction === SortOrderEnum.DESCENDING) {
            this.renderCaret('down');
        }

        this.sort.emit({ direction: this.direction, column: this.sortable, columnsToSort: this.columnsToSort });
    }

    renderCaret(direction: string) {
        this.renderer.setAttribute(this.arrowIcon, 'class', `fa fa-caret-${direction} fa-lg ml-2`);
        if (this.hostElement.nativeElement.children.length > 0) {
            let i: number;
            for (i = this.hostElement.nativeElement.children.length - 1; i >= 0; i--) {
                if ((this.hostElement.nativeElement.children[i] as HTMLElement).className.indexOf('fa-caret-') >= 0) {
                    this.renderer.removeChild(this.hostElement.nativeElement, this.hostElement.nativeElement.children[i]);
                } else {
                    this.renderer.setStyle(this.hostElement.nativeElement.children[i] as HTMLElement, 'width', '50%');
                }
            }
        }
        this.renderer.appendChild(this.hostElement.nativeElement, this.arrowIcon);
    }
}

export type SortDirection = SortOrderEnum.ASCENDING | SortOrderEnum.DESCENDING | SortOrderEnum.NONE;

/**
 * Defines how the table has to be sorted
 *
 * - direction defines the direction of sort which is applied to a sort columns
 * - column defines the column to be marked as search column (if columnsToSort is left uninitialized column will be added to columnsToSort)
 * - columnsToSort contains an array of column names which are used to sort.
 *   Please observe that the array must contain the columns starting with the least significant column and end with the most significant column)
 */
export interface SortEvent {
    direction: SortDirection;
    column: string;
    columnsToSort?: string[];
}
