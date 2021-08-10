import { Directive, Renderer2, ElementRef, NgZone, AfterViewInit, Input } from '@angular/core';
import { AvamGenericTreeTableService } from './avam-generic-tree-table.service';

@Directive({
    selector: '[resizable-handle]'
})
export class ResizableHandleDirective implements AfterViewInit {
    @Input('resizable-handle') genericTable: HTMLElement;

    cursorPosition: number;
    resizableFnMousemove: () => void;
    resizableFnMouseup: () => void;

    nextWidth: number;
    dragStart: boolean;
    cursorStart: number;

    headerWidth: number;
    tableWidth: number;

    genericTableheaders: HTMLElement[];
    header: HTMLElement;
    nextHeader: HTMLElement;

    constructor(private renderer: Renderer2, private elementRef: ElementRef, private ngZone: NgZone, private avamGenericTreeTableService: AvamGenericTreeTableService) {}

    ngAfterViewInit(): void {
        this.genericTableheaders = this.elementRef.nativeElement.querySelectorAll('.cdk-header-cell');
        for (let i = 0; i < this.genericTableheaders.length; i++) {
            this.genericTableheaders[i].style.position = 'relative';
            this.createResizeUI(this.genericTableheaders[i], i);
        }
    }

    createResizeUI(th: HTMLElement, loop) {
        const div = document.createElement('div');
        div.className = 'resize-container';
        div.dataset.number = loop;
        div.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        th.appendChild(div);
    }

    onMouseDown(event) {
        const element = event.target;
        if (element.classList.contains('resize-container')) {
            this.dragStart = true;

            const colIndex = parseInt(event.target.dataset.number, 10);

            this.header = this.genericTableheaders[colIndex];
            this.nextHeader = this.genericTableheaders[colIndex + 1];

            this.cursorStart = event.pageX;

            this.headerWidth = this.header.getBoundingClientRect().width;
            this.tableWidth = this.genericTable.offsetWidth;

            if (this.nextHeader !== undefined) {
                const nextBound = this.nextHeader.getBoundingClientRect();
                this.nextWidth = nextBound.width;
            }

            this.ngZone.runOutsideAngular(() => {
                this.mouseMove();
            });

            this.elementRef.nativeElement.classList.add('unselectable-text');
        }
    }

    mouseMove() {
        this.resizableFnMousemove = this.renderer.listen('body', 'mousemove', event => {
            if (this.dragStart) {
                this.cursorPosition = event.pageX;
                const mouseMoved = this.cursorPosition - this.cursorStart;
                const newWidth = this.headerWidth + mouseMoved;
                const newNextWidth = this.nextWidth - mouseMoved;

                if (newWidth > 20 && newNextWidth > 30) {
                    this.resizeColumn(this.header, newWidth);

                    if (this.nextHeader !== undefined) {
                        this.resizeColumn(this.nextHeader, newNextWidth);
                    }
                }
            }
        });

        this.resizableFnMouseup = this.renderer.listen('body', 'mouseup', event => {
            if (this.dragStart) {
                this.elementRef.nativeElement.classList.remove('unselectable-text');
                this.dragStart = false;
            }
        });
    }

    resizeColumn(element, width) {
        this.avamGenericTreeTableService.onResize.emit(element);
        element.style.width = `${width}px`;
    }
}
