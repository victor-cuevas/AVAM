import { Directive, AfterViewInit, ElementRef, Input, HostListener } from '@angular/core';
import { AvamGenericTableService } from './avam-generic-table.service';

@Directive({
    selector: '[avamTableTooltip]'
})
export class TableTooltipDirective implements AfterViewInit {
    toolTip: any;
    shouldOpen: boolean;

    @Input() set avamTableTooltip(data) {
        this.toolTip = data;
    }

    constructor(private elementRef: ElementRef, private avamGenericResize: AvamGenericTableService) {}

    ngAfterViewInit(): void {
        this.avamGenericResize.resizeSource$.subscribe(() => {
            this.shouldOpen = undefined;
        });
    }

    isEllipsisActive(e) {
        return e.offsetWidth < e.scrollWidth;
    }

    getShouldOpen() {
        if (this.shouldOpen === undefined) {
            if (this.isEllipsisActive(this.elementRef.nativeElement)) {
                this.shouldOpen = true;
            } else {
                this.shouldOpen = false;
            }
        }
        return this.shouldOpen;
    }

    @HostListener('mouseenter', ['$event'])
    show() {
        if (this.getShouldOpen()) {
            this.toolTip.open();
        }
    }

    @HostListener('mouseout')
    hide() {
        if (this.getShouldOpen()) {
            this.toolTip.close();
        }
    }
}
