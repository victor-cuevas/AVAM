import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

@Component({
    selector: 'avam-label-percentage-input',
    templateUrl: './avam-label-percentage-input.component.html',
    styleUrls: ['./avam-label-percentage-input.component.scss']
})
export class AvamLabelPercentageInputComponent implements OnInit {
    @Input() parentForm: FormGroup;
    @Input() controlName: string;
    @Input() readOnly = false;
    @Input() selectLabel = '';
    @Input() toolTip: string;
    @Input() placeholder: string;
    @Input() isDisabled: boolean;
    @Input() type: string;
    @Input() inputClass: string;

    @Output() onInput: EventEmitter<any> = new EventEmitter();
    @Output() onBlur: EventEmitter<any> = new EventEmitter();
    @ViewChild('ngForm') formInstance: FormGroupDirective;

    inputValue = null;

    constructor(private obliqueHelper: ObliqueHelperService) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);
        if (this.parentForm.controls[this.controlName].value) {
            this.inputValue = this.parentForm.controls[this.controlName].value;
        }
    }

    /**
     * Allow only 0-9, backspace and dot/comma on keypress.
     *
     * @param {*} event
     * @memberof AvamLabelPercentageInputComponent
     */
    keypress(event: KeyboardEvent) {
        if (event.which !== 46 && event.which !== 8 && (event.which < 48 || event.which > 57)) {
            event.preventDefault();
        }
    }

    /**
     * Do not allow user to write value above 100 on input event.
     *
     * @param {*} event
     * @memberof AvamLabelPercentageInputComponent
     */
    input(event: UIEvent) {
        if (event && event.target) {
            if (Number((event.target as HTMLInputElement).value) > 100) {
                this.parentForm.controls[this.controlName].setValue(this.inputValue);
            } else {
                this.inputValue = (event.target as HTMLInputElement).value;
            }
        }
    }

    /**
     * Round the value on blur event.
     *
     * @param {*} event
     * @memberof AvamLabelPercentageInputComponent
     */
    blur(event: FocusEvent) {
        const roundValue = Math.floor(Number((event.target as HTMLInputElement).value));
        this.inputValue = roundValue;
        this.parentForm.controls[this.controlName].setValue(roundValue);
        this.onBlur.emit(roundValue);
    }

    /**
     * Clear inputValue and emit event.
     *
     * @memberof AvamLabelPercentageInputComponent
     */
    onClear() {
        this.inputValue = '';
        this.onInput.emit('');
    }
}
