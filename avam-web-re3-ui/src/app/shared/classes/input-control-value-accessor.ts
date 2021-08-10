import { BaseControlValueAccessor } from './base-control-value-accessor';
import { ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { resizeTextArea } from '@shared/helpers/autosize.helper';

export class InputControlValueAccessor extends BaseControlValueAccessor {
    @ViewChild('inputElement') public inputElement: ElementRef;

    protected isDisabled: boolean;

    constructor(protected renderer: Renderer2) {
        super(renderer);
        this.renderer = renderer;
    }

    public onChange(value) {
        this.value = value;
        if (this.inputElement) {
            const normalizedValue = value == null ? '' : value;
            this.renderer.setProperty(this.inputElement.nativeElement, 'value', normalizedValue);
        }
        this._onChange(value);
    }

    public writeValue(value: any): void {
        this.value = value;
        if (this.inputElement) {
            const normalizedValue = value == null ? '' : value;
            this.renderer.setProperty(this.inputElement.nativeElement, 'value', normalizedValue);
        }
    }

    /**
     * would not work in IE11: nativeElement.dispatchEvent(new Event('input'));
     */
    static dispatchEvent(eventType: string, nativeElement) {
        const event = document.createEvent('Event');
        event.initEvent(eventType, false, true);
        nativeElement.dispatchEvent(event);
    }

    static dispatchEventTextarea(eventType: string, nativeElement) {
        if (typeof Event === 'function') {
            const event = document.createEvent('Event');
            event.initEvent(eventType, false, true);
            nativeElement.dispatchEvent(event);
        } else {
            resizeTextArea(nativeElement, getComputedStyle(nativeElement).lineHeight, 5);
        }
    }
}
