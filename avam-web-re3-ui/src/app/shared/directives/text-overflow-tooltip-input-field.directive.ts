import { Directive, Injector, ElementRef, ViewContainerRef, ComponentFactoryResolver, NgZone, ChangeDetectorRef, Renderer2, OnInit, HostListener } from '@angular/core';
import { NgbTooltip, NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';

/**
 * TextOverfowTooltipDirective (textOverflowTooltip) wird einen Tooltip anzeigen wenn und nur wenn der Text a text-overflow hat.
 */
@Directive({
    selector: '[textOverflowTooltipInputField]'
})
export class TextOverflowTooltipInputFieldDirective extends NgbTooltip implements OnInit {
    private elementTextContent: string;
    private elementTextWidth: number;
    private elementWidth: number;
    private readonly nonVisibleWidth = 45;

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
        if (this.elementRef.nativeElement instanceof HTMLSelectElement) {
            const htmlSelectElement = this.elementRef.nativeElement as HTMLSelectElement;
            if (htmlSelectElement.selectedOptions.item(0)) {
                this.elementTextContent = htmlSelectElement.selectedOptions.item(0).innerHTML;
            }
        } else {
            this.elementTextContent = this.elementRef.nativeElement.value;
        }

        this.elementWidth = this.elementRef.nativeElement.offsetWidth - this.nonVisibleWidth;
        this.elementTextWidth = this.getSelectTextWidth(this.elementRef.nativeElement as HTMLElement);

        if (this.hasOverflow() && this.elementTextContent) {
            this.ngbTooltip = this.elementTextContent;
        }
    }

    @HostListener('mouseleave')
    onMouseLeave() {
        this.ngbTooltip = null;
    }

    private getSelectTextWidth(inputElement: HTMLElement) {
        const hiddenDiv = document.createElement('div');
        inputElement.insertAdjacentElement('afterend', hiddenDiv);
        hiddenDiv.style.visibility = 'hidden';
        hiddenDiv.style.width = 'auto';
        hiddenDiv.style.display = 'inline-block';
        hiddenDiv.style.overflow = 'auto';
        hiddenDiv.style.position = 'fixed';
        hiddenDiv.innerText = this.elementTextContent;
        return hiddenDiv.clientWidth;
    }

    private hasOverflow(): boolean {
        return this.elementWidth < this.elementTextWidth;
    }
}
