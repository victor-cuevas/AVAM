import { Directive, Input, HostListener } from '@angular/core';
import { AvamGenericTableComponent } from './avam-generic-table.component';

@Directive({
    selector: '[sortable-column]',
    host: { '[class.sortable-column]': 'true' }
})
export class SortableColumnDirective {
    @Input('sortable-column') field: any;

    constructor(private dt: AvamGenericTableComponent) {}

    @HostListener('click', ['$event'])
    onClick(event: any) {
        // TODO: We need to find a way to prevent event bubbling from 2 directives.
        const element = event.target;
        if (!element.classList.contains('resize-container')) {
            this.dt.sort({ originalEvent: event, field: this.field });
        }
    }
}
