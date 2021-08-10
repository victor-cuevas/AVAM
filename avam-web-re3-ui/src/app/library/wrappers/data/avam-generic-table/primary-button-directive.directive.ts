import { Directive, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';
export const PRIMARY_ACTION_ATTRIBUTE_NAME = 'primaryaction';

@Directive({
    selector: '[avamPrimaryButtonDirective]'
})
export class PrimaryButtonDirective {
    @Output() primaryButtonClick: EventEmitter<any> = new EventEmitter();

    constructor(private hostElement: ElementRef) {
        this.hostElement.nativeElement.setAttribute(PRIMARY_ACTION_ATTRIBUTE_NAME, true);
    }

    @HostListener('click', ['$event'])
    onKeydownTab(e: Event) {
        this.hostElement.nativeElement.focus();
        setTimeout(() => {
            this.primaryButtonClick.emit(true);
        }, 0);
    }
}
