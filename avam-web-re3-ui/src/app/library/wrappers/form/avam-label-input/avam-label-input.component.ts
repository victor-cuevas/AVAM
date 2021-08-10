import { Component, OnInit, Input, ViewChild, AfterViewInit, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormGroupDirective, FormControlName } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { WrappersBaseComponent } from '../../wrappers-base';
import { CoreInputComponent } from '@app/library/core/core-input/core-input.component';

/**
 * Component with input field and label.
 *
 * @export
 * @class AvamLabelInputComponent
 * @implements {OnInit}
 * @implements {AfterViewInit}
 */
@Component({
    selector: 'avam-label-input',
    templateUrl: './avam-label-input.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvamLabelInputComponent extends WrappersBaseComponent implements OnInit {
    @Input() selectLabel = '';

    @Input() toolTip: string;

    @Input() placeholder: string;

    @Input() type: string;

    @Input() inputClass: string;

    @Input() labelClass: string;

    @Input() customClassReadOnlyText: string;

    @Input() customClassReadOnlyTextContainer: string;

    @Input() customClassComponentWrapper: string;

    @Input() customClassControlWrapper: string;

    @Input() customClassCoreInputWrapper: string;

    @Input() customClassCoreInput: string;

    @Input() textDirection = 'ltr';

    @Output() onKeyup: EventEmitter<any> = new EventEmitter();

    @Output() onInput: EventEmitter<any> = new EventEmitter();

    @Output() onChange: EventEmitter<any> = new EventEmitter();

    @Output() onBlur: EventEmitter<any> = new EventEmitter();

    @ViewChild('ngForm') formInstance: FormGroupDirective;

    @ViewChild('coreInput') coreInput: CoreInputComponent;

    inputValue = '';

    constructor(private obliqueHelper: ObliqueHelperService, private cd: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance, () => {
            this.cd.detectChanges();
        });

        if (!this.parentForm) {
            throw new Error(
                `AvamLabelInputComponent expects the FormGroup instance.
                Please pass one in.\n\n       Example:\n\n    <avam-label-input [parentForm]="myForm.controls" ...></avam-label-input>`
            );
        }

        if (!this.controlName) {
            throw new Error(
                `AvamLabelInputComponent expects the controlName.
                Please pass one in.\n\n       Example:\n\n    <avam-label-input controlName="myControlName" ...></avam-label-input>`
            );
        }
    }

    change(data) {
        this.onChange.emit(data);
    }

    input(data) {
        if (data && data.target) {
            this.inputValue = data.target.value;
        } else {
            this.inputValue = data;
        }

        this.onInput.emit(data);
    }

    blur(event) {
        this.onBlur.emit(event);
    }

    keyup(event) {
        this.onKeyup.emit(event);
    }
}
