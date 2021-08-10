import { Directive, Renderer2, HostListener, ElementRef, NgZone } from '@angular/core';
import { AvamGenericTreeTableService } from './avam-generic-tree-table.service';

@Directive({
    selector: '[coreTreeTableResize]'
})
export class AvamGenericTreeTableResizeDirective {
    start: any = null;
    pressed = false;
    startX: any;
    startWidth: any;
    resizableFnMousemove: () => void;
    resizableFnMouseup: () => void;
    element: any;

    constructor(private renderer: Renderer2, private tableService: AvamGenericTreeTableService, private ngZone: NgZone) {}

    @HostListener('mousedown', ['$event']) onMouseDown(event) {
        this.ngZone.runOutsideAngular(() => {
            this.resizeTable(event);
        });
    }

    resizeTable(event: any) {
        this.start = event.target;
        this.pressed = true;
        this.startX = event.pageX;
        this.startWidth = this.start.parentElement.clientWidth;
        this.mouseMove();
    }

    mouseMove() {
        this.resizableFnMousemove = this.renderer.listen('body', 'mousemove', event => {
            if (this.pressed) {
                const width = this.startWidth + (event.pageX - this.startX);
                this.start.parentElement.style.width = width + 'px';
            }
        });
        this.resizableFnMouseup = this.renderer.listen('body', 'mouseup', event => {
            if (this.pressed) {
                this.tableService.onResize.next(event);
                this.pressed = false;
            }
        });
    }
}
