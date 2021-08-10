import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
    selector: '[orColumnLayoutExtension]'
})
export class OrColumnLayoutExtensionDirective implements AfterViewInit {
    constructor(private elRef: ElementRef) {}

    ngAfterViewInit() {
        this.addRouterOutletTop();
    }

    addRouterOutletTop() {
        const top = document.createElement('DIV');
        top.className = 'router-outlet-top';
        this.elRef.nativeElement.querySelector('.column-main').insertAdjacentElement('afterbegin', top);
    }
}
