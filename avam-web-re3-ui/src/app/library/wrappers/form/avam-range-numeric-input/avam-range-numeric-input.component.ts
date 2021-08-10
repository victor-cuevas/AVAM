import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { CoreInputComponent } from '@app/library/core/core-input/core-input.component';

@Component({
    selector: 'avam-range-numeric-input',
    templateUrl: './avam-range-numeric-input.component.html',
    styleUrls: ['./avam-range-numeric-input.component.scss']
})
export class AvamRangeNumericInputComponent implements OnInit {
    @Input() parentForm: FormGroup;
    @Input() minInputControlName: string;
    @Input() maxInputControlName: string;
    @Input() maxValueMinInput: number;
    @Input() maxValueMaxInput: number;
    @Input() minLabel = 'amm.abrechnungen.label.von';
    @Input() maxLabel = 'amm.abrechnungen.label.bis';
    @Input() label: string;
    @Input() placeholderMin: string;
    @Input() placeholderMax: string;
    @Input() minFieldType = 'number';
    @Input() maxFieldType = 'number';
    @Input() coreReadOnly: boolean;
    @Input() coreReadOnlyClearButton: boolean;
    @Input() isDisabled: boolean;

    @Input() mainWrapperClass: string;
    @Input() labelWrapperClass: string;
    @Input() labelClass: string;
    @Input() inputFieldsWrapperClass: string;
    @Input() minInputWrapperClass: string;
    @Input() minLabelClass: string;
    @Input() maxInputWrapperClass: string;
    @Input() maxLabelClass: string;

    @Input() set readOnly(isReadOnly: boolean) {
        this.isReadOnly = isReadOnly;

        if (this.isReadOnly) {
            this.minReadOnlyValue = this.getControlValue(this.minInputControlName);
            this.maxReadOnlyValue = this.getControlValue(this.maxInputControlName);
        }
    }

    @Output() onInputMin: EventEmitter<any> = new EventEmitter();
    @Output() onClearMin: EventEmitter<any> = new EventEmitter();
    @Output() onChangeMin: EventEmitter<any> = new EventEmitter();
    @Output() onKeyupMin: EventEmitter<any> = new EventEmitter();
    @Output() onBlurMin: EventEmitter<any> = new EventEmitter();

    @Output() onInputMax: EventEmitter<any> = new EventEmitter();
    @Output() onClearMax: EventEmitter<any> = new EventEmitter();
    @Output() onChangeMax: EventEmitter<any> = new EventEmitter();
    @Output() onKeyupMax: EventEmitter<any> = new EventEmitter();
    @Output() onBlurMax: EventEmitter<any> = new EventEmitter();

    @ViewChild('ngForm') formInstance: FormGroupDirective;
    @ViewChild('coreInputMin') coreInputComponentMin: CoreInputComponent;
    @ViewChild('coreInputMax') coreInputComponentMax: CoreInputComponent;

    isReadOnly: boolean;
    minReadOnlyValue: string;
    maxReadOnlyValue: string;

    constructor(public obliqueHelper: ObliqueHelperService) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);
    }

    getControlValue(controlName: string) {
        if (!this.parentForm || !this.parentForm.controls[controlName]) {
            return '';
        }

        return this.parentForm.controls[controlName].value;
    }

    inputMin(event: string) {
        this.minReadOnlyValue = event;
        this.onInputMin.emit(event);
    }

    inputMax(event: string) {
        this.maxReadOnlyValue = event;
        this.onInputMax.emit(event);
    }

    clearMin(event: Event) {
        this.onClearMin.emit(event);
    }

    clearMax(event: Event) {
        this.onClearMax.emit(event);
    }

    changeMin(event: Event) {
        this.onChangeMin.emit(event);
    }

    changeMax(event: Event) {
        this.onChangeMax.emit(event);
    }

    keyupMin(event: KeyboardEvent) {
        this.onKeyupMin.emit(event);
    }

    keyupMax(event: KeyboardEvent) {
        this.onKeyupMax.emit(event);
    }

    blurMin(event: FocusEvent) {
        this.onBlurMin.emit(event);
    }

    blurMax(event: FocusEvent) {
        this.onBlurMax.emit(event);
    }
}
