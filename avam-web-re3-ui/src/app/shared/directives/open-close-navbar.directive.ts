import { Directive, ElementRef, Renderer2, HostListener, HostBinding } from '@angular/core';

@Directive({
    selector: '[openclosenavbar]'
})
export class OpenCloseNavbarDirective {
    targetElement: Event;

    constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

    @HostListener('click', ['$event']) onClick($event) {
        if (!this.elementRef.nativeElement.classList.contains('show')) {
            this.renderer.addClass(this.elementRef.nativeElement, 'show');
            this.targetElement = $event.target;
        } else {
            this.renderer.removeClass(this.elementRef.nativeElement, 'show');
        }
    }

    @HostListener('document:click', ['$event.target']) clickout(target) {
        if (target !== this.targetElement) {
            this.renderer.removeClass(this.elementRef.nativeElement, 'show');
        }
    }
}
