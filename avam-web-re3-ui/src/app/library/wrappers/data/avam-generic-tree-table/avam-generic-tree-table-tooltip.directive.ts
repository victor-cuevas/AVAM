import { Directive, AfterViewInit, ElementRef, Input, HostListener } from '@angular/core';
import { AvamGenericTreeTableService } from './avam-generic-tree-table.service';

@Directive({
    selector: '[avamCoreTreeTableTooltip]'
})
export class AvamGenericTreeTableTooltipDirective implements AfterViewInit {
    shouldOpen: boolean;
    toolTip: any;

    @Input() set avamCoreTreeTableTooltip(data) {
        this.toolTip = data;
    }

    constructor(private elementRef: ElementRef, private tableService: AvamGenericTreeTableService) {}

    ngAfterViewInit(): void {
        this.tableService.onResize.subscribe(() => {
            this.shouldOpen = undefined;
        });
    }

    displayTooltip() {
        if (this.shouldOpen === undefined) {
            if (this.isEllipsisActive(this.elementRef.nativeElement)) {
                this.shouldOpen = true;
            } else {
                this.shouldOpen = false;
            }
        }
        return this.shouldOpen;
    }

    isEllipsisActive(e) {
        const tolerance = 2;
        const offsetWidth = e.offsetWidth + tolerance;
        return offsetWidth < e.scrollWidth;
    }

    @HostListener('mouseout')
    hide() {
        if (this.displayTooltip()) {
            this.toolTip.close();
        }
    }

    @HostListener('mouseenter', ['$event'])
    show() {
        if (this.displayTooltip()) {
            this.toolTip.open();
        }
    }
}
