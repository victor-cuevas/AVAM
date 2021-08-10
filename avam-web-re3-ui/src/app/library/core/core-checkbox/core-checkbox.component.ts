import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';

/**
 * Implemented basic ControlValueAccessor functionality for form <select> element.
 * Usage:
 *
 * @export
 * @class CoreCheckboxComponent
 * @implements {OnInit}
 * @implements {ControlValueAccessor}
 */
@Component({
    selector: 'core-checkbox',
    templateUrl: './core-checkbox.component.html',
    styleUrls: ['./core-checkbox.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: CoreCheckboxComponent,
            multi: true
        }
    ]
})
export class CoreCheckboxComponent implements OnInit, ControlValueAccessor {
    /**
     * Emit custom event asynchronously
     * when the value is changed.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreCheckboxComponent
     */
    @Output() onChange: EventEmitter<any> = new EventEmitter();

    /**
     * Emit custom event asynchronously
     * when the value is changed.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreCheckboxComponent
     */
    @Output() onBlur: EventEmitter<any> = new EventEmitter();

    /**
     * Id of component
     *
     * @type {EventEmitter<any>}
     * @memberof CoreCheckboxComponent
     */
    @Input() componentId: any;

    /**
     * Selects the checkbox by a given boolean value
     *
     * @type {boolean}
     * @memberof CoreCheckboxComponent
     */
    @Input() isChecked: boolean;

    /**
     * Sets the component to disabled
     *
     * @type {boolean}
     * @memberof CoreCheckboxComponent
     */
    @Input() isDisabled: boolean;

    /**
     * Tracks the value and validation status of an individual form control.
     *
     * @memberof CoreCheckboxComponent
     */
    control = new FormControl({ value: '', disabled: this.isDisabled });

    /**
     * Creates an instance of CoreCheckboxComponent.
     * @memberof CoreCheckboxComponent
     */
    constructor() {}

    /**
     * @memberof CoreCheckboxComponent
     */
    ngOnInit() {}

    /**
     * Callback triggered when the value has changed.
     *
     * @memberof CoreCheckboxComponent
     */
    _onChange = (value: any) => {};

    /**
     * Callback triggered when the value has touched.
     *
     * @memberof CoreCheckboxComponent
     */
    onTouched = () => {};

    /**
     * Sets the value of the input element. Implemented as part of ControlValueAccessor.
     *
     * @param {*} value
     * @memberof CoreCheckboxComponent
     */
    writeValue(value: any): void {
        this.isChecked = value;
        this.control.setValue(value);
        this.onChange.emit(value);
    }

    /**
     * Registers a callback to be triggered when the value has changed.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {*} fn
     * @memberof CoreCheckboxComponent
     */
    registerOnChange(fn: any): void {
        this._onChange = fn;
    }

    /**
     * Registers a callback to be triggered when the component is touched.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {*} fn
     * @memberof CoreCheckboxComponent
     */
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    /**
     * Sets whether the component should be disabled.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {boolean} isDisabled
     * @memberof CoreCheckboxComponent
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
     * @param {*} value
     * @memberof CoreCheckboxComponent
     */
    change(value) {
        this._onChange(value);
        this.onChange.emit(value);
    }

    /**
     * The blur event triggers when the element loses the focus.
     *
     * @param {*} value
     * @memberof CoreCheckboxComponent
     */
    blur(value) {
        this.onTouched();
        this.onBlur.emit(value);
    }
}
