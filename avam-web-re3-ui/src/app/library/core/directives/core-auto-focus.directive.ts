import { Directive, ElementRef, Input } from '@angular/core';
import DomHandler from '@app/library/core/utils/domhandler';

@Directive({
    selector: '[coreAutofocus]'
})
export class CorefocusDirective {
    @Input() set coreAutofocus(focus: boolean) {
        this.toggleFocus(focus);
    }

    constructor(private el: ElementRef) {}

    toggleFocus(focus: boolean) {
        DomHandler.multipleElementLoaded(this.el.nativeElement, ['input, select']).then(el => {
            if (focus) {
                el[0].dataset.focused = true;
                el[0].focus();
            } else {
                delete el[0].dataset.focused;
                el[0].blur();
            }
        });
    }
}
