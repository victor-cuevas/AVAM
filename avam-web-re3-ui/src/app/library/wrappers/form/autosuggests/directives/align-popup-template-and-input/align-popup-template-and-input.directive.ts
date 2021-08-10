import { Directive, ElementRef, OnInit, OnDestroy } from '@angular/core';

@Directive({
    selector: '[avamAlignPopupTemplateAndInput]'
})
export class AlignPopupTemplateAndInputDirective implements OnInit, OnDestroy {
    onScrollDocument;
    popupElement;
    scrollInterval;
    interval = 0;

    constructor(private hostElement: ElementRef) {}

    ngOnInit() {
        this.popupElement = document.querySelector('ngb-typeahead-window');

        if (this.popupElement.hasAttribute('align-popup-and-input')) {
            return;
        }

        this.popupElement.setAttribute('align-popup-and-input', 'true');
        this.onScrollDocument = this.scrollDocument.bind(this);
        window.addEventListener('wheel', this.onScrollDocument);
    }

    ngOnDestroy() {
        this.popupElement.removeAttribute('align-popup-and-input');
        window.removeEventListener('wheel', this.onScrollDocument);
    }

    scrollDocument(event) {
        if (this.scrollInterval) {
            this.resetInterval();
        }

        const mouseoverEvent = this.createNewEvent('mouseover');

        const initialInterval = 50;

        this.scrollInterval = setInterval(() => {
            const parentElement = this.hostElement.nativeElement.parentElement;
            const triggerEvent = parentElement.dispatchEvent || parentElement.fireEvent;
            triggerEvent(mouseoverEvent);
            this.interval += initialInterval;

            if (this.interval >= 2000) {
                this.resetInterval();
            }
        }, initialInterval);
    }

    resetInterval() {
        clearInterval(this.scrollInterval);
        this.interval = 0;
    }

    createNewEvent(eventName) {
        let event;

        if (typeof Event === 'function') {
            event = new Event(eventName);
        } else {
            event = document.createEvent('Event');
            event.initEvent(eventName, true, true);
        }

        return event;
    }
}
