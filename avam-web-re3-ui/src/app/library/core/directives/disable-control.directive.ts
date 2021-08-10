import { Directive, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Directive which disables formControl.
 * Usage: <input formControlName="email" [disableControl]="true" />
 *
 * @export
 * @class DisableControlDirective
 */
@Directive({
    selector: '[disableControl]'
})
export class DisableControlDirective {
    /**
     * Get a reference of the form control via DI
     * and we use disable() or enable() based on the condition.
     *
     * @memberof DisableControlDirective
     */
    @Input() set disableControl(condition: boolean) {
        const action = condition ? 'disable' : 'enable';
        this.ngControl.control[action]();
    }

    /**
     *Creates an instance of DisableControlDirective.
     * @param {NgControl} ngControl
     * @memberof DisableControlDirective
     */
    constructor(private ngControl: NgControl) {}
}
