import { Directive, HostListener, ElementRef, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { AvamGenericTreeTableService } from '../avam-generic-tree-table/avam-generic-tree-table.service';

@Directive({
    selector: '[coreTreeTablePrimaryActionNavigation]'
})
export class CoreTreeTablePrimaryActionNavigationDirective implements AfterViewInit {
    isPrimaryButton = false;

    @Input('row') row;
    @Output() onDoubleClick: EventEmitter<any> = new EventEmitter();
    @Output() onEnter: EventEmitter<any> = new EventEmitter();

    constructor(private elementRef: ElementRef, private table: AvamGenericTreeTableService) {}

    ngAfterViewInit() {
        // const primaryButton = this.elementRef.nativeElement.querySelectorAll('td [data-primary]')[0];
        // if (primaryButton) {
        //     this.isPrimaryButton = true;
        // }
    }

    @HostListener('dblclick', ['$event']) doubleClick() {
        // if (this.isPrimaryButton) {
        this.onDoubleClick.emit(this.row);
        // }
    }

    @HostListener('keydown.enter', ['$event']) keydownEnter() {
        // if (this.isPrimaryButton) {
        this.onEnter.emit(this.row);
        // }
    }
}
