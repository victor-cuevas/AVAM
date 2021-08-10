import { Directive, ElementRef, HostListener } from '@angular/core';

/**
 * Catches any keyboard event and negates it.
 * Prevents any manual value change.
 */
@Directive({
    selector: '[negateInput]'
})
export class NegateInputDirective {
    constructor(private el: ElementRef) {}

    /**
     * Decorator that declares a DOM event to listen for
     * and provides a handler method to run when that event occurs.
     *
     * @param {KeyboardEvent} event
     * @returns
     * @memberof NumberOnlyDirective
     */
    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Tab') {
            return;
        }
        event.preventDefault();
    }
}
