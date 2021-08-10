import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, Optional, Host, SkipSelf } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ControlContainer } from '@angular/forms';
import { InputTypes } from './input-types.enum';
import CoreUtils from '../utils/core.utils';

/**
 * Implemented basic ControlValueAccessor functionality for form <input> element.
 * Usage: <core-input formControlName="name" (onInput)="onInput($event)"></core-input>
 *
 * @export
 * @class CoreInputComponent
 * @implements {ControlValueAccessor}
 * @implements {OnInit}
 */
@Component({
    selector: 'core-input',
    templateUrl: './core-input.component.html',
    styleUrls: ['./core-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: CoreInputComponent,
            multi: true
        }
    ]
})
export class CoreInputComponent implements ControlValueAccessor, OnInit {
    /**
     * Input to set different type on <input> element.
     *
     * @memberof CoreInputComponent
     */
    @Input() type = InputTypes.TEXT;

    /**
     * Input for placeholder.
     *
     * @type {string}
     * @memberof CoreInputComponent
     */
    @Input() placeholder: string;

    /**
     * Input for max length.
     *
     * @type {number}
     * @memberof CoreInputComponent
     */
    @Input() max: number;

    /**
     * Input property which sets native input readonly attribute.
     *
     * @type {boolean}
     * @memberof CoreCalendarComponent
     */
    @Input() coreReadOnly: boolean;

    /**
     * Input property which indicates should clear button to show itself while coreReadOnly input is true
     *
     * @type {boolean}
     * @memberof CoreCalendarComponent
     */
    @Input() coreReadOnlyClearButton: boolean;

    /**
     * Emit custom event asynchronously
     * when the value is changed.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreInputComponent
     */
    @Output() onInput: EventEmitter<any> = new EventEmitter();

    /**
     * Emit custom event asynchronously
     * when the value is changed.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreInputComponent
     */
    @Output() onChange: EventEmitter<any> = new EventEmitter();

    /**
     * Emit custom event asynchronously
     * when the value is changed.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreInputComponent
     */
    @Output() onKeyup: EventEmitter<any> = new EventEmitter();

    /**
     * Emit custom event asynchronously
     * when the value is changed.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreInputComponent
     */
    @Output() onBlur: EventEmitter<any> = new EventEmitter();

    /**
     * Emit custom event asynchronously
     * when the value is deleted with the clear button.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreInputComponent
     */
    @Output() onClear: EventEmitter<any> = new EventEmitter();

    /**
     * Selector for input element.
     *
     * @type {ElementRef}
     * @memberof CoreInputComponent
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
     * @memberof CoreInputComponent
     */
    autoFocused: boolean;

    /**
     *Creates an instance of CoreInputComponent.
     * @memberof CoreInputComponent
     */
    constructor(
        @Optional()
        @Host()
        @SkipSelf()
        private controlContainer: ControlContainer,
        private elRef: ElementRef
    ) {}

    /**
     * @memberof CoreInputComponent
     */
    ngOnInit() {
        if (this.inputElement.nativeElement.dataset.focused) {
            this.autoFocused = true;
        }
        this.inputListener = this.elRef.nativeElement.addEventListener('input', CoreUtils.onInputWrapper(this.input.bind(this)), true);
    }

    /**
     * Tracks the value and validation status of an individual form control.
     *
     * @memberof CoreInputComponent
     */
    control = new FormControl();

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
    }

    /**
     * The change event triggers when the element has finished changing
     * that means that the event occurs when it loses focus.
     *
     * @param {*} event
     * @memberof CoreInputComponent
     */
    change(event) {
        this._onChange(event.target.value);
        this.onChange.emit(event);
    }

    /**
     * The input event triggers every time after a value is modified by the user.
     *
     * @param {*} event
     * @memberof CoreInputComponent
     */
    input(event) {
        const value = event.target.value;
        this._onChange(value);
        this.onInput.emit(event);
    }

    /**
     * The blur event triggers when the element loses the focus.
     *
     * @param {*} event
     * @memberof CoreInputComponent
     */
    blur(event) {
        this.onTouched();
        this.onBlur.emit(event);
    }

    /**
     * The keyup event triggers when a key is released.
     *
     * @param {*} event
     * @memberof CoreInputComponent
     */
    keyup(event) {
        this.onKeyup.emit(event);
    }

    /**
     * Trigger Oblique validation on focusout.
     *
     * @memberof CoreInputComponent
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

    /**
     * Clears the input.
     *
     * @memberof CoreInputComponent
     */
    clear() {
        this.change({ target: { value: '' } });
        this.onClear.emit();
    }

    ngOnDestroy() {
        document.removeEventListener('input', this.inputListener, false);
    }
}
