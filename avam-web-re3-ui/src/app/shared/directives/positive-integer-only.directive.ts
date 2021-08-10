import { Directive, HostListener, ElementRef } from '@angular/core';

/**
 * Allow only numbers directive.
 *
 * @export
 * @class PositiveIntegerOnlyDirective
 */
@Directive({
    selector: '[positiveIntegerOnly]'
})
export class PositiveIntegerOnlyDirective {
    /**
     * RegExp allows positive integer values to be entered.
     *
     * @type {RegExp}
     * @memberof PositiveIntegerOnlyDirective
     */
    regex: RegExp = new RegExp(/^[0-9]+$/g);

    /**
     * Allow following special keys.
     *
     * @type {Array<string>}
     * @memberof PositiveIntegerOnlyDirective
     */
    specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'Left', 'ArrowLeft', 'Right', 'ArrowRight', 'Del', 'Delete'];

    /**
     *Creates an instance of NumberOnlyDirective.
     * @param {ElementRef} el
     * @memberof PositiveIntegerOnlyDirective
     */
    constructor(private el: ElementRef) {}

    /**
     * Decorator that declares a DOM event to listen for
     * and provides a handler method to run when that event occurs.
     *
     * @param {KeyboardEvent} event
     * @returns
     * @memberof PositiveIntegerOnlyDirective
     */
    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (this.specialKeys.indexOf(event.key) !== -1) {
            return;
        }
        const current = this.el.nativeElement.value;
        const next = current.concat(event.key);
        if (next && !String(next).match(this.regex)) {
            event.preventDefault();
        }
    }
}
