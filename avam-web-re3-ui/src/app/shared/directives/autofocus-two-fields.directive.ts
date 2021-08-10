import { Directive, ElementRef, AfterViewInit, Input } from '@angular/core';

/**
 * Directive that add autofocus on child elements when the selected component has more than one input.
 *
 * @export
 * @class AutofocusTwoFieldsDirective
 * @implements {AfterViewInit}
 */
@Directive({
    selector: '[avamAutofocusTwoFields]'
})
export class AutofocusTwoFieldsDirective implements AfterViewInit {
    @Input() scrollIntoView = false;

    constructor(private el: ElementRef) {}

    /**
     * Set 'autofocus' on first child element when there are more than one.
     *
     * @memberof AutofocusTwoFieldsDirective
     */
    ngAfterViewInit(): void {
        this.triggerFocus();
    }

    public triggerFocus() {
        const defaultElements = ['input', 'select'];

        const elements = this.el.nativeElement.querySelectorAll(defaultElements);

        if (elements.length > 0) {
            elements[0].focused = true;
            elements[0].focus();
            if (this.scrollIntoView) {
                elements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
}
