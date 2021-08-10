import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormControlName, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

/**
 * Component with checkbox field and label.
 *
 * @export
 * @class AvamLabelCheckboxComponent
 * @implements {OnInit}
 */

@Component({
    selector: 'avam-label-checkbox',
    templateUrl: './avam-label-checkbox.component.html',
    styleUrls: ['./avam-label-checkbox.component.scss']
})
export class AvamLabelCheckboxComponent implements OnInit {
    @Input() componentId: any;
    @Input() parentForm: FormGroup;
    @Input() controlName: FormControlName;
    @Input() readOnly = false;
    @Input() selectLabel = '';
    @Input() isDisabled = false;
    @Input() inputClass: string;
    @Input() inputLabelClass: string;
    @Input() checkboxWrapperClass: string;
    @Input() isChecked: boolean;
    @Output() onChange: EventEmitter<any> = new EventEmitter();
    @Output() onBlur: EventEmitter<any> = new EventEmitter();
    @ViewChild('ngForm') formInstance: FormGroupDirective;

    constructor(private obliqueHelper: ObliqueHelperService) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);
        if (!this.parentForm) {
            throw new Error(
                `AvamLabelCheckboxComponent expects the FormGroup instance.
              Please pass one in.\n\n       Example:\n\n    <avam-label-checkbox [parentForm]="myForm.controls" ...></avam-label-checkbox>`
            );
        }

        if (!this.controlName) {
            throw new Error(
                `AvamLabelCheckboxComponent expects the controlName.
              Please pass one in.\n\n       Example:\n\n    <avam-label-checkbox controlName="myControlName" ...></avam-label-checkbox>`
            );
        }
    }

    change(value: Event) {
        this.onChange.emit(value);
    }

    blur(value: FocusEvent) {
        this.onBlur.emit(value);
    }
}
