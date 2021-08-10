import { Directive, AfterViewInit, ElementRef, Input, HostListener } from '@angular/core';

@Directive({
    selector: '[avamParticipationTooltip]'
})
export class ParticipationTooltipDirective implements AfterViewInit {
    toolTip: any;
    shouldOpen: boolean;

    @Input() set avamParticipationTooltip(data) {
        this.toolTip = data;
    }

    constructor(private elementRef: ElementRef) {}

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.displayTooltip();
        }, 0);
    }

    isEllipsisActive(e) {
        return e.offsetWidth < e.scrollWidth;
    }

    displayTooltip() {
        if (this.isEllipsisActive(this.elementRef.nativeElement)) {
            this.shouldOpen = true;
        } else {
            this.shouldOpen = false;
        }
    }

    @HostListener('mouseenter', ['$event'])
    show() {
        if (this.shouldOpen) {
            this.toolTip.open();
        }
    }

    @HostListener('mouseout')
    hide() {
        if (this.shouldOpen) {
            this.toolTip.close();
        }
    }
}
