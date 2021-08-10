import { ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';

export class AutosuggestBase extends Unsubscribable {
    @Input() searchFunction: (term: string) => Observable<any>;
    @Input() searchFilterFunction: (term: string, status: boolean) => Observable<any>;
    @Input() dataFunction: (term: string) => Observable<any>;
    @Input() inputFormatter: () => string;
    @Input() resultFormatter: () => string;
    @Input() typingFormatter: (item) => string;
    @Input() disabled = false;
    @Input() model = null;
    @Input() placeholder: string;
    @Input() labels: string[];
    @Input() selectedItemId: string;
    @Input() displayInfoBtn: boolean;
    @Input() id = null;

    @ViewChild('inputElement') public inputElement: ElementRef;
    @ViewChild('typeAhead') public typeAhead: NgbTypeahead;
    @Input() readOnly: string;

    @Output() selectItem: EventEmitter<any> = new EventEmitter();
    @Output() writeItem: EventEmitter<any> = new EventEmitter();

    searching = false;
    searchFailed = false;
    selectedItem: any;
    protected eventSubject: Subject<any> = new Subject();
    private enterDown = false;

    constructor() {
        super();
        this.eventSubject.pipe(debounceTime(500)).subscribe(event => {
            const typeaheadWindow: HTMLElement = document.getElementsByTagName('ngb-typeahead-window').item(0) as HTMLElement;
            const isEventKeyNotDownOrUp = event && event.key && !event.key.toLowerCase().endsWith('down') && !event.key.toLowerCase().endsWith('up');
            if (typeaheadWindow && isEventKeyNotDownOrUp && !AutosuggestBase.isElementBottomVisible(typeaheadWindow)) {
                typeaheadWindow.scrollIntoView({ behavior: 'smooth', block: 'end' } as ScrollIntoViewOptions);
            }
        });
    }

    onEnterDown(event: any) {
        if (this.typeAhead && this.typeAhead.isPopupOpen()) {
            // enter key pressed with opened suggestions, waiting for key release
            this.enterDown = true;
        }
    }

    onKeyup(event: any) {
        this.eventSubject.next(event);
        if (event.key !== 'Enter') {
            if (event.target.value) {
                this.emmitWriteEvent(this.typingFormatter ? this.typingFormatter(event.target.value) : event.target.value);
            } else {
                this.emmitWriteEvent(null);
            }
        } else {
            if (this.enterDown) {
                // enter key has been pressed before, do not propagate the keyup event to the top component
                this.enterDown = false;
                event.stopPropagation();
            }
        }
    }

    onClear() {
        this.model = '';
        this.emmitWriteEvent(null);
    }

    emmitSelectItem(event: any) {
        this.setSelectedItem(event);
        this.selectItem.emit(event);
    }

    emmitWriteEvent(event: any) {
        this.writeItem.emit(event);
    }

    dismiss() {
        this.searching = false;
    }

    setSelectedItem(item) {
        this.selectedItem = item;
        this.model = item.value;
    }

    private static isElementBottomVisible(element: Element): boolean {
        return !AutosuggestBase.isOutOfViewport(element);
    }

    private static isOutOfViewport(element) {
        const boundingClientRect = element.getBoundingClientRect();
        return (
            boundingClientRect.top < 0 ||
            boundingClientRect.left < 0 ||
            boundingClientRect.right > (window.innerWidth || document.documentElement.clientWidth) ||
            boundingClientRect.bottom > (window.innerHeight || document.documentElement.clientHeight)
        );
    }
}
