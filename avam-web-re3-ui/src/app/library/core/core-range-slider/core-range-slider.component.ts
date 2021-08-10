import { EventEmitter, Component, OnInit, ViewChild, AfterViewInit, OnDestroy, Input, ElementRef, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

const VALUE_DEFAULTS = {
    minVal: 1,
    maxVal: 100
};

@Component({
    selector: 'core-range-slider',
    templateUrl: './core-range-slider.component.html',
    styleUrls: ['./core-range-slider.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: CoreRangeSliderComponent,
            multi: true
        }
    ]
})
export class CoreRangeSliderComponent implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor {
    /**
     * An array with 2 values, denoting the start and end of the range.
     * Eg. [33, 66]
     *
     * @memberof RangeSliderComponent
     */
    @Input('rangeValues') set rangeValues(values: number[]) {
        this._prevRangeValues = Object.assign([], this._rangeValues);
        this._rangeValues = Object.assign([], values);

        const clearMinValue = this.isValueCorrect(this._rangeValues[0]);
        const clearMaxValue = this.isValueCorrect(this._rangeValues[1]);

        this._rangeValues[0] = clearMinValue ? this.minVal : this._rangeValues[0];
        this._rangeValues[1] = clearMaxValue ? this.maxVal : this._rangeValues[1];

        this.shouldEmitChange = this._prevRangeValues[0] !== this._rangeValues[0] && this._prevRangeValues[1] !== this._rangeValues[1];

        this.assignRange(this._rangeValues);
    }

    @Input() set resizeOnSpinnerStop(isSpinnerStopped: boolean) {
        if (isSpinnerStopped && this._rangeValues[0] >= this.minVal && this._rangeValues[1] <= this.maxVal) {
            this.resize();
        }
    }

    /**
     * Sets the component to disabled
     *
     * @type {boolean}
     * @memberof RangeSliderComponent
     */
    @Input() isDisabled: boolean;

    /**
     * Allow to set same value
     *
     * @type {boolean}
     * @memberof RangeSliderComponent
     */
    @Input() allowSameValue = false;

    /**
     * Exposed variables to allow minimal styling from a parent component
     *
     * @memberof RangeSliderComponent
     */
    @Input('minVal') minVal = VALUE_DEFAULTS.minVal;
    @Input('maxVal') maxVal = VALUE_DEFAULTS.maxVal;

    // DOM element refs
    @ViewChild('root') root: ElementRef;
    @ViewChild('track') track: ElementRef;
    /**
     * The thumbs are the two circular divs that the user drags left and right
     * Starting Value
     */
    @ViewChild('thumb1') thumb1: ElementRef;
    /**
     * The thumbs are the two circular divs that the user drags left and right
     * Starting Value
     */
    @ViewChild('thumb2') thumb2: ElementRef;

    /**
     * Event triggered when any change occures (while being dragged)
     */
    @Output('onChange') onChange = new EventEmitter<number[]>();

    /**
     * Event that occurs when the value is selected (thumb stops being dragged, mouse is released)
     */
    @Output('onSelect') onSelect = new EventEmitter<number[]>();

    private _rangeValues: number[];
    private _prevRangeValues: number[];
    private shouldEmitChange = true;
    private browserResizeCallback: any;
    private mouseMoveCallback: any;
    private mouseUpCallback: any;
    private rootElementRect: any;
    private thumbSize: number;

    /**
     * Tracks the value and validation status of an individual form control.
     *
     * @memberof RangeSliderComponent
     */
    control = new FormControl();

    constructor() {}

    ngOnInit() {
        if (this.allowSameValue) {
            this.allowSameValueSetter();
        } else {
            if (this._rangeValues[0] !== null) {
                this._rangeValues[0] = this._rangeValues[0] < this.minVal || this._rangeValues[0] >= this._rangeValues[1] ? this.minVal : this._rangeValues[0];
            }

            if (this._rangeValues[1] !== null) {
                this._rangeValues[1] = this._rangeValues[1] > this.maxVal || this._rangeValues[1] <= this._rangeValues[0] ? this.maxVal : this._rangeValues[1];
            }
        }

        this.browserResizeCallback = this.resize.bind(this);
        window.addEventListener('resize', this.browserResizeCallback);
    }

    allowSameValueSetter() {
        if (this._rangeValues[0] !== null) {
            this._rangeValues[0] = this._rangeValues[0] < this.minVal || this._rangeValues[0] > this._rangeValues[1] ? this.minVal : this._rangeValues[0];
        }

        if (this._rangeValues[1] !== null) {
            this._rangeValues[1] = this._rangeValues[1] > this.maxVal || this._rangeValues[1] < this._rangeValues[0] ? this.maxVal : this._rangeValues[1];
        }
    }

    ngAfterViewInit(): void {
        this.thumbSize = this.thumb1.nativeElement.getBoundingClientRect().width;

        this.resize();
    }

    isValueCorrect(value: number) {
        return value === undefined || (isNaN(value) && value !== null);
    }

    resize() {
        this.rootElementRect = this.root.nativeElement.getBoundingClientRect();

        const rangeValues: number[] = this.switchRangeValues();

        const offset1 = this.convertValueToSize(rangeValues[0], 0);
        const offset2 = this.convertValueToSize(rangeValues[1], 1);

        this.setRange(offset1, offset2, rangeValues);
        this.writeValue(rangeValues);
    }

    assignRange(rangeValues: number[]) {
        this.onThumbPositionChange(rangeValues);
        this.writeValue(rangeValues);
    }

    dragMouseDown = (event, thumbIndex) => {
        if (this.isDisabled) {
            return;
        }

        event.preventDefault();

        this.mouseUpCallback = this.stopDragThumb;
        this.mouseMoveCallback = moveEvent => {
            this.elementDrag(moveEvent, thumbIndex);
        };

        document.addEventListener('mouseup', this.mouseUpCallback);
        document.addEventListener('mousemove', this.mouseMoveCallback);
    };

    private stopDragThumb = () => {
        this.removeMouseEvents();
        this.onSelect.emit(this._rangeValues);
    };

    private removeMouseEvents = () => {
        document.removeEventListener('mouseup', this.mouseUpCallback);
        document.removeEventListener('mousemove', this.mouseMoveCallback);
    };

    private elementDrag = (event, thumbIndex: number) => {
        event.preventDefault();
        const rangeValues: number[] = this.switchRangeValues(thumbIndex);
        const maxMunisMin: number = this.maxVal - this.minVal;
        const sizeValueProportion: number = maxMunisMin / this.rootElementRect.width;
        const mousePosition: number = event.clientX - this.rootElementRect.left;
        const realValue: number = mousePosition * sizeValueProportion + this.minVal;
        const arrIndex: number = thumbIndex ? 0 : 1;
        const existingValue: number = rangeValues[arrIndex] || (arrIndex ? this.maxVal : this.minVal);
        const calculatedValue: number = thumbIndex ? (realValue <= existingValue ? existingValue + 1 : realValue) : realValue >= existingValue ? existingValue - 1 : realValue;
        const newValue: number[] = [Math.round(calculatedValue < this.minVal ? this.minVal : calculatedValue > this.maxVal ? this.maxVal : calculatedValue)];
        newValue.splice(arrIndex, 0, rangeValues[arrIndex]);
        this.shouldEmitChange = newValue[0] !== this._prevRangeValues[0] || newValue[1] !== this._prevRangeValues[1];
        this._prevRangeValues = Object.assign([], this._rangeValues);
        this._rangeValues = Object.assign([], newValue);
        this.writeValue(newValue);
        this._onChange(newValue);
    };

    private onThumbPositionChange(inputNewValues: number[]) {
        if (this.isValueCorrect(inputNewValues[0]) || this.isValueCorrect(inputNewValues[1])) {
            return;
        }

        const newValues: number[] = [this.nullOrNumber(inputNewValues, 0), this.nullOrNumber(inputNewValues, 1)];

        const offset1 = newValues[0] === newValues[1] ? this.convertValueToSize(newValues[0] - 1, 0) : this.convertValueToSize(newValues[0], 0);
        const offset2 = this.convertValueToSize(newValues[1], 1);

        const isLowerThanMin = offset1 < 0;
        const isOverOtherThumb = offset1 >= offset2 || offset2 <= offset1;
        const isMoreThanMax = newValues[0] > this.maxVal || newValues[1] > this.maxVal;

        if (!isOverOtherThumb && !isLowerThanMin && !isMoreThanMax) {
            this._rangeValues = Object.assign([], inputNewValues);

            this.setRange(offset1, offset2, newValues);

            if (this.shouldEmitChange) {
                this.onChange.emit(this._rangeValues);
            }
        }
    }

    private nullOrNumber(values: number[], index: number) {
        return values[index] === null ? (index ? this.maxVal : this.minVal) : values[index];
    }

    private switchRangeValues(thumbIndex?: number) {
        if (!this._prevRangeValues || !this._prevRangeValues.length || this._rangeValues.indexOf(null) >= 0) {
            return Object.assign([], this._rangeValues);
        }

        if (this._rangeValues[0] >= this._rangeValues[1]) {
            return Object.assign([], this._prevRangeValues);
        }

        if (this._prevRangeValues[0] >= this._prevRangeValues[1] && this._prevRangeValues.indexOf(null) < 0) {
            return thumbIndex ? [this._prevRangeValues[0], this._prevRangeValues[0] + 1] : [this._prevRangeValues[1] - 1, this._prevRangeValues[1]];
        }

        return Object.assign([], this._rangeValues);
    }

    private setRange(offset1, offset2, rangeValues) {
        this.thumb1.nativeElement.style.left = `${offset1}px`;
        this.thumb2.nativeElement.style.left = `${offset2}px`;

        this.formatRangeBackground(rangeValues);
    }

    private convertValueToSize(inputValue: number, index: number) {
        if (!this.rootElementRect) {
            return null;
        }

        const leftMinusRight: number = this.rootElementRect.width - this.thumbSize;
        let maxMunisMin: number;
        if (this.maxVal && this.minVal) {
            maxMunisMin = this.maxVal - this.minVal;
        } else {
            this.maxVal = VALUE_DEFAULTS.maxVal;
            this.minVal = VALUE_DEFAULTS.minVal;
        }
        const valueSizeProportion: number = leftMinusRight / maxMunisMin;
        const value: number = inputValue === null ? (index === 1 ? this.maxVal : this.minVal) : inputValue;
        return (value - this.minVal) * valueSizeProportion;
    }

    private formatRangeBackground(rangeValues: number[]) {
        const offset1 = this.convertValueToSize(rangeValues[0], 0);
        const offset2 = this.convertValueToSize(rangeValues[1], 1);
        const maxOffset = this.convertValueToSize(this.maxVal, 1);

        const blueStart = offset1 === 0 ? maxOffset : maxOffset / offset1;
        const blueEnd = (maxOffset / offset2) * 2;

        this.track.nativeElement.style['backgroundSize'] = `calc(1 * (100% / ${blueStart})) 100%, calc(2 * (100% / ${blueEnd})) 100%, calc(3 * (100% / 3)) 100%`;
    }

    /**
     * Callback triggered when the value has changed.
     *
     * @memberof RangeSliderComponent
     */
    _onChange = (value: any) => {};

    /**
     * Callback triggered when the value has touched.
     *
     * @memberof RangeSliderComponent
     */
    onTouched = () => {};

    /**
     * Sets the value of the input element. Implemented as part of ControlValueAccessor.
     *
     * @param {*} value
     * @memberof RangeSliderComponent
     */
    writeValue(value): void {
        this.control.setValue(value);

        if (value) {
            this.onThumbPositionChange(value);
        }
    }

    /**
     * Registers a callback to be triggered when the value has changed.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {*} fn
     * @memberof RangeSliderComponent
     */
    registerOnChange(fn: any): void {
        this._onChange = fn;
    }

    /**
     * Registers a callback to be triggered when the component is touched.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {*} fn
     * @memberof RangeSliderComponent
     */
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    /**
     * Sets whether the component should be disabled.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {boolean} isDisabled
     * @memberof RangeSliderComponent
     */
    setDisabledState(isDisabled: boolean): void {
        if (isDisabled) {
            this.control.disable();
        } else {
            this.control.enable();
        }
    }

    ngOnDestroy() {
        window.removeEventListener('resize', this.browserResizeCallback);

        this.removeMouseEvents();
    }
}
