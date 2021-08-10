import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';

/**
 * Allows users to select from a range of values by moving the slider thumb
 * it is wrapping the native `<input type="range">` html element.
 *
 * @export
 * @class CoreSliderComponent
 * @implements {OnInit}
 * @implements {ControlValueAccessor}
 */
@Component({
    selector: 'core-slider',
    templateUrl: './core-slider.component.html',
    styleUrls: ['./core-slider.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: CoreSliderComponent,
            multi: true
        }
    ]
})
export class CoreSliderComponent implements OnInit, ControlValueAccessor {
    /**
     * The minimum value that the slider can have.
     *
     * @type {number}
     * @memberof CoreSliderComponent
     */
    @Input() min = 0;

    /**
     * The maximum value that the slider can have.
     *
     * @type {number}
     * @memberof CoreSliderComponent
     */
    @Input() max = 100;

    /**
     * Specifies the size of each movement of the slider.
     * Default is "1"
     *
     * @type {number}
     * @memberof CoreSliderComponent
     */
    @Input() step: number;

    /**
     * Specifies if the <input> element should be disabled
     * disabled input element is unusable and un-clickable.
     *
     * @type {boolean}
     * @memberof CoreSliderComponent
     */
    @Input() isDisabled = false;

    /**
     * Emit custom event asynchronously
     * of each movement of the slider.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreSliderComponent
     */
    @Output() onChangeSlide: EventEmitter<any> = new EventEmitter();

    /**
     * Current value of the slider.
     *
     * @type {number}
     * @memberof CoreSliderComponent
     */
    value = 0;

    /**
     * Tracks the value and validation status of an individual form control.
     *
     * @memberof CoreInputComponent
     */
    control = new FormControl({ value: '', disabled: this.isDisabled });

    /**
     *Creates an instance of CoreSliderComponent.
     * @memberof CoreSliderComponent
     */
    constructor() {}

    ngOnInit() {}

    /**
     * Callback triggered when the value has changed
     *
     * @memberof CoreSliderComponent
     */
    onChange = (num: number) => {};

    /**
     * Callback triggered when the value has touched
     *
     * @memberof CoreSliderComponent
     */
    onTouched = () => {};

    /**
     * Sets the value of the slider. Implemented as part of ControlValueAccessor
     *
     * @param {number} value
     * @memberof CoreSliderComponent
     */
    writeValue(value: number): void {
        if (value) {
            this.value = value;
        } else {
            this.value = 0;
        }
    }

    /**
     * Registers a callback to be triggered when the value has changed.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {*} fn
     * @returns {void}
     * @memberof CoreSliderComponent
     */
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    /**
     * Registers a callback to be triggered when the component is touched.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {*} fn
     * @returns {void}
     * @memberof CoreSliderComponent
     */
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    /**
     * Sets whether the component should be disabled.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {boolean} isDisabled
     * @returns {void}
     * @memberof CoreSliderComponent
     */
    setDisabledState(isDisabled: boolean): void {
        if (isDisabled) {
            this.control.disable();
        } else {
            this.control.enable();
        }
    }

    /**
     * Emit onChange event on user (input) event.
     *
     * @param {*} event
     * @returns
     * @memberof CoreSliderComponent
     */
    onSlide(event: any) {
        if (this.isDisabled) {
            return;
        }
        this.onChange(event.target.value);
        this.onChangeSlide.emit(event);
    }
}
