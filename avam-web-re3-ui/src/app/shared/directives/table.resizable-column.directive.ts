import { Directive, Renderer2, HostListener, Input, NgZone, HostBinding, ElementRef, ChangeDetectorRef, AfterViewInit } from '@angular/core';

@Directive({
    selector: 'span[resizable]'
})
export class ResizableColumnDirective implements AfterViewInit {
    start: any = null;
    pressed = false;
    startX: any;
    startWidth: any;
    resizableFnMousemove: () => void;
    resizableFnMouseup: () => void;

    @Input() resizable: any;

    constructor(private renderer: Renderer2, private zone: NgZone, private elemRef: ElementRef, private cd: ChangeDetectorRef) {}

    ngAfterViewInit() {
        this.zone.runOutsideAngular(() => {
            this.elemRef.nativeElement.addEventListener('mousedown', this.resizeTable.bind(this), true);
        });
    }

    resizeTable(event: any) {
        this.start = event.target.parentElement;
        this.pressed = true;
        this.startX = event.pageX;
        this.startWidth = this.start ? this.start.clientWidth : 0;

        this.mouseMove(this.resizable);
    }

    mouseMove(header: any) {
        this.resizableFnMousemove = this.renderer.listen('document', 'mousemove', event => {
            if (this.pressed && event.pageX - this.startX !== 0) {
                const width = this.startWidth + (event.pageX - this.startX);
                header.columnWidth = width;
                this.cd.detectChanges();
            }
        });
        this.resizableFnMouseup = this.renderer.listen('document', 'mouseup', () => {
            if (this.pressed) {
                this.pressed = false;
                this.resizableFnMousemove();
                this.resizableFnMouseup();
                this.cd.detectChanges();
            }
        });
    }
}
