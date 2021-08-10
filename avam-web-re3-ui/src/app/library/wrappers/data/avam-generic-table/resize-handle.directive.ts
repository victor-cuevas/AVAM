import { Directive, Renderer2, ElementRef, NgZone, AfterViewInit, Input, OnDestroy } from '@angular/core';
import { AvamGenericTableService } from './avam-generic-table.service';
import { Subscription } from 'rxjs';

@Directive({
    selector: '[resizable-handle]'
})
export class ResizableHandleDirective implements AfterViewInit, OnDestroy {
    @Input('resizable-handle') genericTable: HTMLElement;

    cursorPosition: number;
    resizableFnMousemove: () => void;
    resizableFnMouseup: () => void;

    nextWidth: number;
    dragStart: boolean;
    cursorStart: number;

    headerWidth: number;
    tableWidth: number;

    scrollableTableHeader: NodeListOf<Element>;
    cell: HTMLElement;
    nextCell: HTMLElement;

    genericTableheaders: HTMLElement[];
    header: HTMLElement;
    nextHeader: HTMLElement;
    onDataSubscription: Subscription;

    resizeEventListener: any;

    constructor(private renderer: Renderer2, private elementRef: ElementRef, private ngZone: NgZone, private avamGenericTableService: AvamGenericTableService) {}

    ngAfterViewInit(): void {
        this.onDataSubscription = this.avamGenericTableService.data$.subscribe(() => {
            this.tableUiInit();
        });
        this.resizeEventListener = this.onResizeEvent.bind(this);
        window.addEventListener('resize', this.resizeEventListener);
    }

    tableUiInit() {
        this.scrollableTableHeader = this.genericTable.querySelectorAll('.cdk-header-cell');
        this.genericTableheaders = this.elementRef.nativeElement.querySelectorAll('.cdk-header-cell');
        this.removeSecondButton();
        for (let i = 0; i < this.genericTableheaders.length; i++) {
            this.genericTableheaders[i].style.position = 'relative';
            this.createResizeUI(this.genericTableheaders[i], i);
        }
    }

    createResizeUI(th, loop) {
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

            this.cell = this.scrollableTableHeader[colIndex] as HTMLElement;
            this.nextCell = this.scrollableTableHeader[colIndex + 1] as HTMLElement;

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
                let newNextWidth = null;

                if (this.nextCell !== undefined) {
                    newNextWidth = this.nextWidth - mouseMoved;
                }

                if (newWidth > 20 && (newNextWidth > 30 || this.nextCell === undefined)) {
                    this.resizeColumn(this.cell, newWidth);
                    this.resizeColumn(this.header, newWidth);

                    if (this.nextHeader !== undefined) {
                        this.resizeColumn(this.nextCell, newNextWidth);
                        this.resizeColumn(this.nextHeader, newNextWidth);
                    }
                }
            }
        });

        this.resizableFnMouseup = this.renderer.listen('body', 'mouseup', event => {
            if (this.dragStart) {
                this.avamGenericTableService.onResizeSource(this.scrollableTableHeader);
                this.elementRef.nativeElement.classList.remove('unselectable-text');
                this.dragStart = false;
            }
        });
    }

    resizeColumn(element, width) {
        element.style.width = `${width}px`;
    }

    onResizeEvent(): void {
        this.avamGenericTableService.onResizeSource(this.scrollableTableHeader);
    }

    removeSecondButton() {
        const headerButtons = document.querySelectorAll('.headerButton');
        if (headerButtons.length === 2) {
            headerButtons.item(1).remove();
        }
    }

    ngOnDestroy(): void {
        this.onDataSubscription.unsubscribe();
        window.removeEventListener('resize', this.resizeEventListener);
    }
}
