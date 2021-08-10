import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Directive, HostListener, Input, Renderer2 } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Directive({
    selector: '[appCustomPopover]'
})
export class CustomPopoverDirective {
    @Input() ngpPopoverRef: NgbPopover;

    isMouseLeaveEventTriggered = false;

    /**
     * whether the next click is the second - if true most MOUSE events are blocked
     */
    isSecondClick = false;

    public readonly MOUSE_ENTER_TIMEOUT = 550;
    public readonly MOUSE_LEAVE_TIMEOUT = 1200;
    public readonly MOUSE_OUT_TIMEOUT = 1200;

    private mouseEnterSubject = new Subject();
    private mouseEnterSub: Subscription;
    private mouseLeaveSubject = new Subject();
    private mouseLeaveSub: Subscription;
    private mouseOutSubject = new Subject();
    private mouseOutSub: Subscription;

    constructor(private _render: Renderer2) {}

    ngOnInit(): void {
        this.mouseEnterSub = this.mouseEnterSubject.pipe(debounceTime(this.MOUSE_ENTER_TIMEOUT)).subscribe((e: any) => {
            if (!this.canClosePopover() && !this.isMouseLeaveEventTriggered) {
                this.openPopover(e.srcElement);
                this.isSecondClick = false;
            }
        });

        this.mouseLeaveSub = this.mouseLeaveSubject.pipe(debounceTime(this.MOUSE_LEAVE_TIMEOUT)).subscribe(() => {
            if (!this.isSecondClick && this.canClosePopover()) {
                this.closePopover();
            }
        });

        this.mouseOutSub = this.mouseOutSubject.pipe(debounceTime(this.MOUSE_OUT_TIMEOUT)).subscribe(() => {
            if (this.canClosePopover() && !this.isSecondClick) {
                this.closePopover();
            }
        });
    }

    openPopover(srcElement) {
        this.ngpPopoverRef.open();
        if (srcElement) {
            let popoverContent = srcElement.nextSibling === null ? srcElement.parentNode.nextSibling : srcElement.nextSibling;
            let popoverContainer = document.getElementById('popover-container');
            popoverContent = popoverContent === null ? (popoverContainer ? popoverContainer : srcElement) : popoverContent;

            this._render.listen(popoverContent, 'mouseout', () => {
                this.mouseOutSubject.next(srcElement);
            });
        }
    }

    closePopover() {
        this.ngpPopoverRef.close();
    }

    canClosePopover(): boolean {
        return this.ngpPopoverRef.isOpen();
    }

    @HostListener('click', ['$event'])
    clickEvent(event) {
        if (this.canClosePopover() && this.isSecondClick) {
            this.closePopover();
            this.isSecondClick = false;
        } else {
            this.openPopover(event.srcElement);
            this.isSecondClick = true;
        }
    }

    @HostListener('mouseenter', ['$event'])
    mouseenterEvent(event) {
        this.isMouseLeaveEventTriggered = false;
        this.mouseEnterSubject.next(event);
    }

    @HostListener('mouseleave', ['$event'])
    mouseleaveEvent(event) {
        this.isMouseLeaveEventTriggered = true;
        this.mouseLeaveSubject.next(event);
    }

    /**
     * listen to TAB key
     */
    @HostListener('window:keyup.tab', ['$event'])
    onKey(event) {
        if (this.canClosePopover()) {
            this.closePopover();
        }
    }
}
