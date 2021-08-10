import { Directive, Input, Renderer2, ElementRef, AfterViewInit } from '@angular/core';

/**
 * Directive that add dynamically formcontrolname.
 *
 * @export
 * @class DynamicControlNameDirective
 * @implements {AfterViewInit}
 */
@Directive({
    selector: '[dynamicControlName]'
})
export class DynamicControlNameDirective implements AfterViewInit {
    /**
     * Input for formControlName.
     *
     * @type {*}
     * @memberof DynamicControlNameDirective
     */
    @Input() formControlName: any;

    /**
     * Creates an instance of DynamicControlNameDirective.
     * @param {ElementRef} elementRef
     * @param {Renderer2} renderer
     * @memberof DynamicControlNameDirective
     */
    constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

    /**
     * Set 'formControlName' on nativeElement.
     * Set 'ng-reflect-name' on nativeElement.
     *
     * @memberof DynamicControlNameDirective
     */
    ngAfterViewInit(): void {
        this.renderer.setAttribute(this.elementRef.nativeElement, 'formControlName', this.formControlName);
        this.renderer.setAttribute(this.elementRef.nativeElement, 'ng-reflect-name', this.formControlName);
    }
}
