import { Directive, ElementRef, OnDestroy } from '@angular/core';
import { SpinnerService, SpinnerEvent } from 'oblique-reactive';
import { Subscription } from 'rxjs';

/**
 * Directive that disable element when spinner is activated.
 *
 * @export
 * @class DisableOnSpinnerDirective
 * @implements {OnDestroy}
 */
@Directive({
    selector: '[avamDisableOnSpinner]'
})
export class DisableOnSpinnerDirective implements OnDestroy {
    private observeAction: Subscription;

    /**
     * Set 'disable' on the element.
     *
     * @memberof DisableOnSpinnerDirective
     */
    constructor(private spinnerService: SpinnerService, private el: ElementRef) {
        this.observeAction = this.spinnerService.events.subscribe((event: SpinnerEvent) => {
            Promise.resolve().then(() => {
                this.el.nativeElement.disabled = event.active;
            });
        });
    }

    ngOnDestroy(): void {
        this.observeAction.unsubscribe();
    }
}
