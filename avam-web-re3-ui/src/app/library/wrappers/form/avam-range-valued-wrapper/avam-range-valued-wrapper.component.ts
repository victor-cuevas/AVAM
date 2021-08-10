import { Subscription } from 'rxjs';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { Component, OnInit, OnDestroy, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective, AbstractControl } from '@angular/forms';
import { SpinnerService } from 'oblique-reactive';

@Component({
    selector: 'avam-range-valued-wrapper',
    templateUrl: './avam-range-valued-wrapper.component.html',
    styleUrls: ['./avam-range-valued-wrapper.component.scss']
})
export class AvamRangeValuedWrapperComponent implements OnInit, OnDestroy {
    rangeValues: number[];

    fromControl: AbstractControl;
    toControl: AbstractControl;

    isSpinnerStopped = false;
    spinnerSubscriber: Subscription;

    @Input() minVal: number;
    @Input() maxVal: number;

    @Input() percentage = false;
    @Input() selectLabel = '';
    @Input() parentForm: FormGroup;
    @Input() rangeSliderControlName: string;
    @Input() fromInputControlName: string;
    @Input() toInputControlName: string;
    @Input() readOnly = false;
    @Input() isDisabled = false;

    /**
     * Allow to set same value
     *
     * @type {boolean}
     * @memberof AvamRangeValuedWrapperComponent
     */
    @Input() allowSameValue = false;

    @ViewChild('ngForm') formInstance: FormGroupDirective;

    /**
     * Event triggered when any change occures (while being dragged)
     */
    @Output('onChange') onChange = new EventEmitter<number[]>();

    /**
     * Event that occurs when the value is selected (thumb stops being dragged, mouse is released)
     */
    @Output('onSelect') onSelect = new EventEmitter<number[]>();

    constructor(public obliqueHelper: ObliqueHelperService, public spinnerService: SpinnerService) {}

    ngOnInit(): void {
        this.obliqueHelper.generateState(this.formInstance);

        if (!this.parentForm) {
            throw new Error(
                `AvamRangeValuedWrapperComponent expects the FormGroup instance.
                Please pass one in.\n\n       Example:\n\n    <avam-range-valued-wrapper [parentForm]="myForm.controls" ...></avam-range-valued-wrapper>`
            );
        }

        if (!this.rangeSliderControlName || !this.fromInputControlName || !this.toInputControlName) {
            throw new Error(
                `AvamRangeValuedWrapperComponent expects rangeSliderControlName, fromInputControlName and toInputControlName.
                Please pass them in.\n\n       Example:\n\n
                <avam-range-valued-wrapper rangeSliderControlName="myControlName" fromInputControlName="myControlName" toInputControlName="myControlName" ...>`
            );
        }

        this.fromControl = this.parentForm.controls[this.fromInputControlName];
        this.toControl = this.parentForm.controls[this.toInputControlName];

        this.rangeValues = [
            this.isValueCorrect(this.fromControl.value) ? this.minVal : this.fromControl.value,
            this.isValueCorrect(this.toControl.value) ? this.maxVal : this.toControl.value
        ];

        this.spinnerSubscriber = this.spinnerService.events.subscribe(event => {
            this.isSpinnerStopped = !event.active;
            this.rangeValues = [...this.rangeValues];
        });
    }

    isValueCorrect(value: number) {
        return value === undefined || value === null || (isNaN(value) && value !== null);
    }

    onInput(event, index: number) {
        if (event && event.data && isNaN(Number(event.data))) {
            event.preventDefault();
            return;
        }

        if (event === undefined) {
            return;
        }

        if (event === null) {
            this.setNewValue(this.rangeValues, null, index, 'onChange');
            return;
        }

        const value = event.target ? (event.target as HTMLInputElement).value : event;
        if (value === '') {
            this.rangeValues[index] = null;
        }

        if (isNaN(Number(value))) {
            if (Number(value) !== this.rangeValues[index]) {
                this.rangeValues[index] = null;
            }

            this.updateFormControls(this.rangeValues);
            return;
        }

        this.setNewValue(this.rangeValues, parseInt(value.toString(), 0), index, 'onChange');
    }

    onValueChange(event: Event, index: number) {
        if (event === null || event === undefined) {
            return;
        }

        const value = (event.target as HTMLInputElement).value ? parseInt((event.target as HTMLInputElement).value, 0) : null;

        this.updateFormControl(value, index);

        this.setNewValue(this.rangeValues, value, index, 'onSelect');
    }

    changeHandler(rangeValues: number[]) {
        this.setNewRangeValues(rangeValues, 'onChange');
    }

    selectHandler(rangeValues: number[]) {
        this.setNewRangeValues(rangeValues, 'onSelect');
    }

    areNewValues(rangeValues: number[], fromControl: AbstractControl, toControl: AbstractControl) {
        return rangeValues[0] !== fromControl.value || rangeValues[1] !== toControl.value;
    }

    setNewRangeValues(rangeValues: number[], eventName: string) {
        if (rangeValues[0] !== this.fromControl.value || rangeValues[1] !== this.toControl.value) {
            this.rangeValues = Object.assign([], rangeValues);
            this.updateFormControls(this.rangeValues);
            this.triggerEvent(eventName, this.rangeValues);
        }
    }

    setNewValue(rangeValues: number[], value, index, eventName: string) {
        if (value !== rangeValues[index]) {
            const newRangeValue = [rangeValues[index ? 0 : 1]];
            newRangeValue.splice(index, 0, value);
            this.rangeValues = newRangeValue;
            this.updateFormControl(value, index);
            this.triggerEvent(eventName, this.rangeValues);
        }
    }

    triggerEvent(eventName: string, rangeValues: number[]) {
        if (this[eventName]) {
            this[eventName].emit(rangeValues);
        }
    }

    updateFormControls(rangeValues: number[]) {
        this.updateFormControl(rangeValues[0], 0);
        this.updateFormControl(rangeValues[1], 1);
    }

    updateFormControl(value: number, index: number) {
        index ? this.toControl.setValue(value) : this.fromControl.setValue(value);
    }

    ngOnDestroy() {
        this.spinnerSubscriber.unsubscribe();
    }
}
