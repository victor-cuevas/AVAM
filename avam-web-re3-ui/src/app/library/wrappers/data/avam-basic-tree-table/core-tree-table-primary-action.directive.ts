import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
    selector: '[coreTreeTablePrimaryAction]'
})
export class CoreTreeTablePrimaryActionDirective implements AfterViewInit {
    constructor(private elementRef: ElementRef) {}

    ngAfterViewInit() {
        if (this.elementRef.nativeElement) {
            this.elementRef.nativeElement.setAttribute('data-primary', true);
        }
    }
}
