import { Directive, HostListener, ElementRef } from '@angular/core';

/**
 * Allow only numbers directive.
 *
 * @export
 * @class NumberOnlyDirective
 */
@Directive({
    selector: '[numberOnly]'
})
export class NumberOnlyDirective {
    /**
     * RegExp allows positive and negative decimal values to be entered.
     *
     * @type {RegExp}
     * @memberof NumberOnlyDirective
     */
    regex: RegExp = new RegExp(/^-?[0-9]+(\.[0-9]*){0,1}$/g);

    /**
     * Don't allow Backspace', 'Tab', 'End', 'Home', '-' to be entred.
     *
     * @type {Array<string>}
     * @memberof NumberOnlyDirective
     */
    specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-'];

    /**
     *Creates an instance of NumberOnlyDirective.
     * @param {ElementRef} el
     * @memberof NumberOnlyDirective
     */
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
