import { Component, OnInit, Input, Output, EventEmitter, Optional, ViewChild, ElementRef, Host, SkipSelf, Injector } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ControlContainer, NgControl } from '@angular/forms';
import CoreUtils from '../utils/core.utils';

/**
 * Implemented basic ControlValueAccessor functionality for form <select> element.
 * Usage:
 *
 * @export
 * @class CoreDropdownComponent
 * @implements {OnInit}
 * @implements {ControlValueAccessor}
 */
@Component({
    selector: 'core-dropdown',
    templateUrl: './core-dropdown.component.html',
    styleUrls: ['./core-dropdown.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: CoreDropdownComponent,
            multi: true
        }
    ]
})
export class CoreDropdownComponent implements OnInit, ControlValueAccessor {
    /**
     *
     *
     * @type {any[]}
     * @memberof CoreDropdownComponent
     */
    @Input() set options(data) {
        if (data && data.length > 0) {
            this._options = data;
            if (this.autoDisplayFirst) {
                this.displayFirst(data);
            }
        }
    }

    @Input() autoDisplayFirst = false;

    /**
     *
     *
     * @type {any[]}
     * @memberof CoreDropdownComponent
     */
    @Input() placeholder: any[];

    /**
     * If true hide first empty option of select list.
     *
     * @type {boolean}
     * @memberof CoreDropdownComponent
     */
    @Input() hideEmptyOption: boolean;

    /**
     * Emit custom event asynchronously
     * when the value is changed.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreDropdownComponent
     */
    @Output() onChange: EventEmitter<any> = new EventEmitter();

    /**
     * Tracks the value and validation status of an individual form control.
     *
     * @memberof CoreDropdownComponent
     */
    control = new FormControl();

    /**
     * Selector for input element
     *
     * @type {ElementRef}
     * @memberof CoreDropdownComponent
     */
    @ViewChild('inputElement') inputElement: ElementRef;

    /**
     * Check if the component is autofocused.
     *
     * @type {*}
     * @memberof CoreDropdownComponent
     */
    autoFocused: any;

    _options: any;

    selectedOption: any;

    ngControl: NgControl;

    /**
     * Creates an instance of CoreDropdownComponent.
     * @memberof CoreDropdownComponent
     */
    constructor(
        @Optional()
        @Host()
        @SkipSelf()
        private controlContainer: ControlContainer,
        private elRef: ElementRef,
        private inj: Injector
    ) {}

    /**
     * @memberof CoreDropdownComponent
     */
    ngOnInit() {
        this.ngControl = this.inj.get(NgControl);
        if (this.inputElement.nativeElement.dataset.focused) {
            this.autoFocused = true;
        }
    }

    displayFirst(data) {
        this.selectedOption = data[0].value;
        this._onChange(this.selectedOption);

        this.control.setValue(this.selectedOption);

        setTimeout(() => {
            this.controlContainer.control['controls'][this.ngControl.name].markAsPristine();
            this.onChange.emit(data[0].value);
        }, 0);
    }

    /**
     * Callback triggered when the value has changed.
     *
     * @memberof CoreDropdownComponent
     */
    _onChange = (value: any) => {};

    /**
     * Callback triggered when the value has touched.
     *
     * @memberof CoreDropdownComponent
     */
    onTouched = () => {};

    /**
     * Sets the value of the input element. Implemented as part of ControlValueAccessor.
     *
     * @param {*} value
     * @memberof CoreDropdownComponent
     */
    writeValue(value: any): void {
        if (this.placeholder && !value) {
            this.control.setValue('');
        } else {
            this.control.setValue(value);
            this.onChange.emit(value);
        }
    }

    /**
     * Registers a callback to be triggered when the value has changed.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {*} fn
     * @memberof CoreDropdownComponent
     */
    registerOnChange(fn: any): void {
        this._onChange = fn;
    }

    /**
     * Registers a callback to be triggered when the component is touched.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {*} fn
     * @memberof CoreDropdownComponent
     */
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    /**
     * Sets whether the component should be disabled.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {boolean} isDisabled
     * @memberof CoreDropdownComponent
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
     * @memberof CoreDropdownComponent
     */
    change(value) {
        this._onChange(value);
        this.onChange.emit(value);
    }

    /**
     * Trigger Oblique validation on focusout.
     *
     * @memberof CoreDropdownComponent
     */
    focusout(event) {
        const formcontrolName = this.elRef.nativeElement.getAttribute('formcontrolname');
        const control = this.controlContainer.control['controls'][formcontrolName];

        if (event.relatedTarget) {
            const target = CoreUtils.isIE ? event.relatedTarget.parentElement.classList.contains('avam-nav-link') : event.relatedTarget.classList.contains('avam-nav-link');

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
}
