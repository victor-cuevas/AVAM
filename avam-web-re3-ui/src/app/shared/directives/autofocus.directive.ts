import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

/**
 * Directive that add autofocus on child elements.
 *
 * @export
 * @class AutofocusDirective
 * @implements {AfterViewInit}
 */
@Directive({
    selector: '[avamAutofocus]'
})
export class AutofocusDirective {
    /**
     * By default the shouldRemoveFocus is false and the method will set the focus on the element.
     *
     * @memberof AutofocusDirective
     */
    @Input() set avamAutofocus(shouldRemoveFocus: boolean) {
        this.toggleFocus(shouldRemoveFocus);
    }

    constructor(private el: ElementRef) {}

    private toggleFocus(shouldRemoveFocus: boolean) {
        const defaultElements = ['input', 'select', 'textarea'];

        const elements = this.el.nativeElement.querySelectorAll(defaultElements);

        for (const key in elements) {
            if (elements.hasOwnProperty(key)) {
                const element = elements[key];
                element.dataset.focused = true;
                shouldRemoveFocus ? element.blur() : element.focus();
            }
        }
    }
}
