import { Directive, DoCheck, ElementRef } from '@angular/core';
import { AvamActionService } from './avam-action.service';

/**
 * Ckeck if nav-menu is collapsed.
 *
 * @export
 * @class NavCollapsedCheckDirective
 * @implements {DoCheck}
 */
@Directive({
    selector: '[avamNavCollapsedCheck]'
})
export class NavCollapsedCheckDirective implements DoCheck {
    constructor(private elRef: ElementRef, private avamActionService: AvamActionService) {}

    ngDoCheck() {
        const children = this.elRef.nativeElement.children[0].children;

        if (children[0].classList.contains('collapsed')) {
            this.avamActionService.sendCollapsed(true);
        } else {
            this.avamActionService.sendCollapsed(false);
        }
    }
}
