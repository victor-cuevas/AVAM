import { AfterViewInit, Directive, ElementRef, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { resizeTextArea } from '@shared/helpers/autosize.helper';
@Directive({
    selector: 'textarea[autosize]',
    host: {
        rows: '1',
        style: 'overflow: hidden'
    }
})
export class AutosizeDirective implements AfterViewInit, OnChanges {
    textarea = this.elem.nativeElement as HTMLTextAreaElement;
    baseScrollHeight = null;
    @Input() value;
    @Input() visibleMaxRows = 5;

    constructor(private elem: ElementRef) {}

    ngAfterViewInit() {
        this.textarea = this.elem.nativeElement;
        this.baseScrollHeight = getComputedStyle(this.textarea).lineHeight;
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.resize();
    }

    @HostListener('input')
    @HostListener('resize') // custom
    resize() {
        resizeTextArea(this.textarea, this.baseScrollHeight, this.visibleMaxRows);
    }
}
