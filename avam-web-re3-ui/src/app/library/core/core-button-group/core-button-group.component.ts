import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { CoreButtonGroupInterface } from './core-button-group.interface';
import { BehaviorSubject } from 'rxjs';

/**
 * Implemented basic ControlValueAccessor functionality for button group.
 * Usage:
 *
 * @export
 * @class CoreButtonGroupComponent
 * @implements {ControlValueAccessor}
 * @implements {OnInit}
 */
@Component({
    selector: 'core-button-group',
    templateUrl: './core-button-group.component.html',
    styleUrls: ['./core-button-group.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: CoreButtonGroupComponent,
            multi: true
        }
    ]
})
export class CoreButtonGroupComponent implements ControlValueAccessor, OnInit {
    /**
     * Inner data used to bind to the template.
     *
     * @type {CoreButtonGroupInterface[]}
     * @memberof CoreButtonGroupComponent
     */
    data: CoreButtonGroupInterface[];

    /**
     * A Subject that requires an initial value and emits its current value to new subscribers.
     *
     * @memberof CoreButtonGroupComponent
     */
    group$ = new BehaviorSubject<any>([]);

    /**
     * Input property which emits event when the buttons are loaded.
     *
     * @type {CoreButtonGroupInterface[]}
     * @memberof CoreButtonGroupComponent
     */
    @Input('group') set group(data) {
        this.group$.next(data);
    }

    /**
     * Output property which is triggered when button is selected.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreButtonGroupComponent
     */
    @Output() onSelect: EventEmitter<any> = new EventEmitter();

    /**
     * Creates an instance of CoreButtonGroupComponent.
     * @memberof CoreButtonGroupComponent
     */
    constructor() {}

    /**
     * Wait for buttons, map data.
     *
     * @memberof CoreButtonGroupComponent
     */
    ngOnInit() {
        this.group$.subscribe((data: CoreButtonGroupInterface[]) => {
            this.data = data;
            if (Array.isArray(data)) {
                data.forEach(btn => {
                    if (!btn.selected) {
                        btn.selected = false;
                    } else {
                        setTimeout(() => {
                            const selectedButton = Object.assign({}, btn);
                            delete selectedButton.selected;
                            this.onSelect.emit(selectedButton);
                        }, 0);
                    }
                });
            }
        });
    }

    /**
     * Select current button and unselect all others.
     *
     * @param {CoreButtonGroupInterface} button
     * @memberof CoreButtonGroupComponent
     */
    select(button: CoreButtonGroupInterface) {
        this.data.forEach(btn => (btn.selected = false));
        button.selected = true;

        const selectedButton = Object.assign({}, button);
        delete selectedButton.selected;
        this.onSelect.emit(selectedButton);

        this._onChange(selectedButton);
        this.onTouched();
    }

    /**
     * Callback triggered when the value has changed.
     *
     * @memberof CoreButtonGroupComponent
     */
    _onChange = (value: any) => {};

    /**
     * Callback triggered when the value has touched.
     *
     * @memberof CoreButtonGroupComponent
     */
    onTouched = () => {};

    /**
     * Sets the value of the element. Implemented as part of ControlValueAccessor.
     *
     * @param {CoreButtonGroupInterface} button
     * @memberof CoreButtonGroupComponent
     */
    writeValue(button: CoreButtonGroupInterface): void {
        if (button) {
            this.data.forEach(currentButton => {
                if (currentButton.value === button.value) {
                    currentButton.selected = true;
                } else {
                    currentButton.selected = false;
                }
            });
        }
    }

    /**
     * Registers a callback to be triggered when the value has changed.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {*} fn
     * @memberof CoreButtonGroupComponent
     */
    registerOnChange(fn: any): void {
        this._onChange = fn;
    }

    /**
     * Registers a callback to be triggered when the value has changed.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {*} fn
     * @memberof CoreButtonGroupComponent
     */
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
