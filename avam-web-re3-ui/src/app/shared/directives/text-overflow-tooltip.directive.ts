import { Directive, Injector, ElementRef, ViewContainerRef, ComponentFactoryResolver, NgZone, ChangeDetectorRef, Renderer2, OnInit, HostListener, Input } from '@angular/core';
import { NgbTooltip, NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';

/**
 * TextOverfowTooltipDirective (textOverflowTooltip) wird einen Tooltip anzeigen wenn und nur wenn der Text a text-overflow hat.
 */
@Directive({
    selector: '[textOverflowTooltip]'
})
export class TextOverflowTooltipDirective extends NgbTooltip implements OnInit {
    @Input() textTooltip: any;

    constructor(
        private elementRef: ElementRef,
        private renderer: Renderer2,
        injector: Injector,
        componentFactoryResolver: ComponentFactoryResolver,
        viewContainerRef: ViewContainerRef,
        config: NgbTooltipConfig,
        ngZone: NgZone,
        changeDetector: ChangeDetectorRef
    ) {
        super(elementRef, renderer, injector, componentFactoryResolver, viewContainerRef, config, ngZone, document, changeDetector);
    }

    @HostListener('mouseenter')
    onMouseEnter() {
        if (this.textTooltip && this.hasOverflow(this.textTooltip) && this.textTooltip.value.length > 0) {
            this.ngbTooltip = this.textTooltip.value;
        } else if (!this.textTooltip && this.hasOverflow(this.elementRef.nativeElement) && this.elementRef.nativeElement.innerText) {
            this.ngbTooltip = this.elementRef.nativeElement.innerText;
        }
    }

    @HostListener('mouseleave')
    onMouseLeave() {
        this.ngbTooltip = null;
    }

    private hasOverflow(element: any): boolean {
        return element.offsetWidth < element.scrollWidth;
    }
}
