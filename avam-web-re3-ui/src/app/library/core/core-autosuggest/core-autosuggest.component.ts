import { Component, OnInit, Input, Output, EventEmitter, TemplateRef, ViewChild, ElementRef, Optional, OnDestroy, Host, SkipSelf } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl, ControlContainer } from '@angular/forms';
import { InputTypes } from '../core-input/input-types.enum';
import { tap, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { StringHelper } from '@app/shared/helpers/string.helper';
import { ResultTemplateContext } from '@ng-bootstrap/ng-bootstrap/typeahead/typeahead-window';
import CoreUtils from '../utils/core.utils';
import DomHandler from '../utils/domhandler';
import ScrollUtils from '@app/library/core/utils/scroll.utils';

@Component({
    selector: 'core-autosuggest',
    templateUrl: './core-autosuggest.component.html',
    styleUrls: ['./core-autosuggest.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: CoreAutosuggestComponent,
            multi: true
        }
    ]
})
export class CoreAutosuggestComponent implements OnInit, OnDestroy, ControlValueAccessor {
    /**
     * Input to set different type on <input> element.
     *
     * @memberof CoreAutosuggestComponent
     */
    @Input() type = InputTypes.TEXT;

    /**
     * Input for placeholder.
     *
     * @type {string}
     * @memberof CoreAutosuggestComponent
     */
    @Input() placeholder: string;

    /**
     * The function that converts an item from the result list to a `string` to display in the `<input>` field.
     * It is called when the user selects something in the popup or the model value changes, so the input needs to
     * be updated.
     *
     * @memberof CoreAutosuggestComponent
     */
    @Input() inputFormatter: (item: any) => string;

    /**
     * The function that converts an item from the result list to a `string` to display in the popup.
     * Must be provided, if your `ngbTypeahead` returns something other than `Observable<string[]>`.
     *
     * Alternatively for more complex markup in the popup you should use resultTemplate.
     *
     * @memberof CoreAutosuggestComponent
     */
    @Input() resultFormatter: (item: any) => string;

    /**
     * The template overrides the way resulting items are provided.
     *
     * @type {*}
     * @memberof CoreAutosuggestComponent
     */
    @Input() template: TemplateRef<ResultTemplateContext>;

    /**
     * The function that searches for a specific item(s) based on the typed text in the input and return the result as an Observable.
     * Must be provided in order to return a result list.
     *
     * @memberof CoreAutosuggestComponent
     */
    @Input() searchFunction: (searchText: string) => Observable<any>;

    /**
     * Indicates whether the info icon should be shown or not.
     *
     * @type {boolean}
     * @memberof CoreAutosuggestComponent
     */
    @Input() showInfoIcon: boolean;

    /**
     * The template used for displaying data in the info icon button popover.
     *
     * @type {TemplateRef<any>}
     * @memberof CoreAutosuggestComponent
     */
    @Input() infoIconTemplate: TemplateRef<any>;

    /**
     * Input property which sets native input readonly attribute.
     *
     * @type {boolean}
     * @memberof CoreAutosuggestComponent
     */
    @Input() coreReadOnly: boolean;

    /**
     * Determine where to put the dropdown element in DOM.
     *
     * @memberof CoreAutosuggestComponent
     */
    @Input() container = '';

    /**
     * Default behavior of the autosuggest is to scrollIntoView when you type.
     *
     * @memberof CoreAutosuggestComponent
     */
    @Input() scrollIntoView = true;

    /**
     * Emit custom event asynchronously when the value is changed.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreAutosuggestComponent
     */
    @Output() onInput: EventEmitter<any> = new EventEmitter();

    /**
     * Emit custom event asynchronously when the value is changed.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreAutosuggestComponent
     */
    @Output() onChange: EventEmitter<any> = new EventEmitter();

    /**
     * Emits custom event asynchronously when the value is changed.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreAutosuggestComponent
     */
    @Output() onKeyup: EventEmitter<any> = new EventEmitter();

    /**
     * Emits custom event asynchronously when the value is changed.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreAutosuggestComponent
     */
    @Output() onBlur: EventEmitter<any> = new EventEmitter();

    /**
     * Emits custom event asynchronously when the a value from the dropdown result list is selected.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreAutosuggestComponent
     */
    @Output() onSelect: EventEmitter<any> = new EventEmitter();

    /**
     * Emits custom event asynchronously when the a value is deleted with the clear button.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreAutosuggestComponent
     */
    @Output() onClear: EventEmitter<any> = new EventEmitter();

    placement = ['bottom-left'];

    /**
     * Tracks the value and validation status of an individual form control.
     *
     * @memberof CoreInputComponent
     */
    control = new FormControl();

    /**
     * Indicates whether the searching is active. When true a spinner must be shown in the right end of the input.
     *
     * @memberof CoreAutosuggestComponent
     */
    searching = false;

    /**
     * Indicates whether the input is empty or not. It is used for determining whether the luppe icon should be shown or hidden.
     * On empty input the luppe icon must be shown, otherwise - hidden.
     *
     * @memberof CoreAutosuggestComponent
     */
    emptyInput = true;

    /**
     * Indicates whether the search has failed.
     *
     * @memberof CoreAutosuggestComponent
     */
    searchFailed = false;

    /**
     * Indicates whether the autosuggest is disabled.
     *
     * @memberof CoreAutosuggestComponent
     */
    disabled = false;

    /**
     * Selector for input element.
     *
     * @type {ElementRef}
     * @memberof CoreAutosuggestComponent
     */
    @ViewChild('inputElement') inputElement: ElementRef;

    /**
     * Input event listener.
     *
     * @type {EventListener}
     * @memberof CoreAutosuggestComponent
     */
    inputListener: EventListener;

    /**
     * Check if the component is autofocused.
     *
     * @type {boolean}
     * @memberof CoreAutosuggestComponent
     */
    autoFocused: boolean;

    /**
     * Input property which indicates should clear button to show itself while coreReadOnly input is true
     *
     * @type {boolean}
     * @memberof CoreAutosuggestComponent
     */
    @Input() coreReadOnlyClearButton: boolean;

    /**
     *Creates an instance of CoreAutosuggestComponent.
     * @memberof CoreAutosuggestComponent
     */
    constructor(
        @Optional()
        @Host()
        @SkipSelf()
        private controlContainer: ControlContainer,
        private elRef: ElementRef
    ) {}

    ngOnInit() {
        if (this.inputElement.nativeElement.dataset.focused) {
            this.autoFocused = true;
        }

        this.inputListener = this.elRef.nativeElement.addEventListener('input', CoreUtils.onInputWrapper(this.input.bind(this)), true);
    }

    /**
     * The function that converts a stream of text values from the `<input>` element to the stream of the array of items
     * to display in the typeahead popup.
     *
     * In order to work properly the `searchFunction` has to be provided.
     *
     * If the resulting observable emits a non-empty array - the popup will be shown. If it emits an empty array - the
     * popup will be closed. The function emits an empty array also when there was an error.
     *
     * @memberof CoreInputComponent
     */
    search = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => (this.searching = true)),
            switchMap(term => {
                //NOSONAR
                if (term) {
                    term = StringHelper.replaceAll(term, '/', '');
                    return this.searchFunction(term).pipe(
                        tap(() => (this.searchFailed = false)),
                        catchError(() => {
                            this.searchFailed = true;
                            return of([]);
                        })
                    );
                } else {
                    return of([]);
                }
            }),
            tap(() => {
                if (this.scrollIntoView) {
                    DomHandler.elementLoaded('ngb-typeahead-window', !this.searchFailed).then(element => {
                        ScrollUtils.scrollDropdownListIntoViewIfNeeded(element);
                    });
                }
                this.searching = false;
            })
        );

    /**
     * Callback triggered when the value has changed.
     *
     * @memberof CoreInputComponent
     */
    _onChange = (value: any) => {};

    /**
     * Callback triggered when the value has touched.
     *
     * @memberof CoreInputComponent
     */
    onTouched = () => {};

    /**
     * Sets the value of the input element. Implemented as part of ControlValueAccessor.
     *
     * @param {*} value
     * @memberof CoreInputComponent
     */
    writeValue(value: any): void {
        this.control.setValue(value);
        this.checkValue(value);
        this.onInput.emit(value);
    }

    /**
     * Registers a callback to be triggered when the value has changed.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {*} fn
     * @memberof CoreInputComponent
     */
    registerOnChange(fn: any): void {
        this._onChange = fn;
    }

    /**
     * Registers a callback to be triggered when the component is touched.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {*} fn
     * @memberof CoreInputComponent
     */
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    /**
     * Sets whether the component should be disabled.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {boolean} isDisabled
     * @memberof CoreInputComponent
     */
    setDisabledState(isDisabled: boolean): void {
        if (isDisabled) {
            this.control.disable();
        } else {
            this.control.enable();
        }

        this.disabled = isDisabled;
    }

    /**
     * The change event triggers when the element has finished changing that means that the event occurs when it loses focus.
     *
     * @param {*} value
     * @memberof CoreInputComponent
     */
    change(event) {
        this._onChange(event.target.value);

        this.checkValue(event.target.value);
        this.onChange.emit(event);
    }

    /**
     * The input event triggers every time after a value is modified by the user.
     *
     * @param {*} value
     * @memberof CoreInputComponent
     */
    input(event) {
        this.emptyInput = false;
        this._onChange(CoreUtils.checkIfEmpty(event.target.value));
        this.onInput.emit(event);
    }

    /**
     * The blur event triggers when the element loses the focus.
     *
     * @param {*} value
     * @memberof CoreInputComponent
     */
    blur(event) {
        this.searching = false; // hides the spinner in the input

        this.onTouched();
        this.onBlur.emit(event);
    }

    /**
     * The keyup event triggers when a key is released.
     *
     * @param {*} value
     * @memberof CoreInputComponent
     */
    keyup(event) {
        this.onKeyup.emit(event);
    }

    /**
     * The select event triggers when an item has been selected from the dropdown result list.
     *
     * @param {*} value
     * @memberof CoreInputComponent
     */
    select(value) {
        this._onChange(value);
        this.emptyInput = false;

        this.onSelect.emit(value);
    }

    /**
     * Clears the input.
     *
     * @memberof CoreInputComponent
     */
    clear(value) {
        this._onChange(value);

        this.checkValue(value);

        this.onClear.emit();
        this.onInput.emit(value);
    }

    /**
     * Checks if there is an value in the input of the autosuggest.
     *
     * @param {*} value
     * @memberof CoreAutosuggestComponent
     */
    checkValue(value) {
        this.emptyInput = !value;
    }

    /**
     * Trigger Oblique validation on focusout.
     *
     * @param {*} e
     * @returns
     * @memberof CoreAutosuggestComponent
     */
    focusout(e) {
        const formcontrolName = this.elRef.nativeElement.getAttribute('formcontrolname');
        const control = this.controlContainer.control['controls'][formcontrolName];

        if (e.relatedTarget) {
            const target = CoreUtils.isIE ? e.relatedTarget.parentElement.classList.contains('avam-nav-link') : e.relatedTarget.classList.contains('avam-nav-link');

            if (target && this.autoFocused) {
                return;
            }

            if (control.errors && control.errors.required) {
                this.triggerObliqueValidation(this.controlContainer['form'], control);
            }

            this.autoFocused = false;
        }
    }

    private triggerObliqueValidation(form, control) {
        let markAsPristine = form && !form.dirty && (control.value === null || control.value === '');
        this._onChange(null);
        if (markAsPristine) {
            // Mark the form as pristine if the user leaves the field without changing anything.
            // Examples:
            // - the first field is a required field and the user wants to close the form without any changes
            // - the user goes through the form with tab without any changes
            form.markAsPristine();
        }
    }

    ngOnDestroy() {
        document.removeEventListener('input', this.inputListener, false);
    }
}
