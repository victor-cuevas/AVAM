import { Directive, Renderer2, HostListener, NgZone, AfterViewInit } from '@angular/core';
import DomHandler from '@app/library/core/utils/domhandler';

@Directive({
    selector: '[sideNavigationResize]'
})
export class SideNavigationResizeDirective implements AfterViewInit {
    start: any = null;
    pressed = false;
    startX: any;
    startWidth: any;
    resizableFnMousemove: () => void;
    resizableFnMouseup: () => void;
    width: any;
    newWidth: any;
    sideNavToggle: any;
    leftColumn: any;
    columnContent: any;
    body: HTMLBodyElement;
    constructor(private renderer: Renderer2, private ngZone: NgZone) {}

    ngAfterViewInit(): void {
        this.sideNavToggle = document.querySelector('.column-toggle-left');
        this.leftColumn = document.querySelector('.column-left');
        this.columnContent = document.querySelector('.column-content');
        this.body = document.querySelector('body');

        this.sideNavToggle.addEventListener('click', () => {
            DomHandler.elementLoaded('.column-left').then(el => {
                if (el.classList.contains('collapsed')) {
                    el.style.marginLeft = `${-el.clientWidth}px`;
                } else {
                    el.style.marginLeft = 0 + 'px';
                }
            });
        });
    }

    @HostListener('mousedown', ['$event']) onMouseDown(event) {
        this.columnContent.style.overflow = 'hidden';
        this.body.style.userSelect = 'none';

        this.ngZone.runOutsideAngular(() => {
            this.resizeTable(event);
        });
    }

    resizeTable(event: any) {
        this.pressed = true;
        this.startX = event.pageX;
        this.startWidth = this.newWidth ? this.newWidth : this.leftColumn.offsetWidth;
        this.mouseMove();
    }

    mouseMove() {
        this.resizableFnMousemove = this.renderer.listen('body', 'mousemove', event => {
            if (this.pressed) {
                this.width = this.startWidth + event.pageX - this.startX;
                this.leftColumn.style.maxWidth = this.width + 'px';
                this.leftColumn.style.flex = `0 0 ${this.width}` + 'px';
            }
        });
        this.resizableFnMouseup = this.renderer.listen('body', 'mouseup', event => {
            this.columnContent.style.overflow = 'auto';
            this.body.style.userSelect = 'auto';
            this.newWidth = this.width;
            if (this.pressed) {
                this.pressed = false;
            }
        });
    }
}
