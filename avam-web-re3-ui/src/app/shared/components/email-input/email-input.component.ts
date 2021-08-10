import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControlName, FormGroup, FormGroupDirective } from '@angular/forms';
import { StringHelper } from '@shared/helpers/string.helper';

/**
 * Email compnent with label, input, button
 *
 * @export
 * @class EmailInputComponent
 * @implements {OnInit}
 * @implements {AfterViewInit}
 */
@Component({
    selector: 'app-email-input',
    templateUrl: './email-input.component.html',
    styleUrls: ['./email-input.component.scss']
})
export class EmailInputComponent implements OnInit {
    @Input() parentForm: FormGroup;
    @Input() controlName: FormControlName;
    @Input() readOnly = false;
    // label is always E-Mail
    @Input() toolTip: string;
    @Input() placeholder: string;

    /**
     * component cares about disable on formControl too
     */
    @Input() isDisabled: boolean;
    @Input() type: string;
    @Input() inputClass: string;
    @Input() emailButton = true;

    @Output() onKeyup: EventEmitter<any> = new EventEmitter();
    @Output() onInput: EventEmitter<any> = new EventEmitter();
    @Output() onChange: EventEmitter<any> = new EventEmitter();
    @Output() onBlur: EventEmitter<any> = new EventEmitter();

    @ViewChild('ngForm') formInstance: FormGroupDirective;
    @ViewChild('emailUrl') emailUrl: any;

    private inputValue = '';

    ngOnInit() {
        if (!this.parentForm) {
            throw new Error(
                `EmailInputComponent expects the FormGroup instance.
                Please pass one in.\n\n       Example:\n\n    <avam-label-input [parentForm]="myForm.controls" ...></avam-label-input>`
            );
        }

        if (!this.controlName) {
            throw new Error(
                `EmailInputComponent expects the controlName.
                Please pass one in.\n\n       Example:\n\n    <avam-label-input controlName="myControlName" ...></avam-label-input>`
            );
        }
    }

    /**
     * called by core-input
     */
    change(data: Event) {
        this.onChange.emit(data);
    }

    /**
     * called by core-input (used in fire fox)
     */
    input(data: Event | string) {
        if (data && data instanceof Event) {
            this.inputValue = (data.target as HTMLInputElement).value;
        } else {
            this.inputValue = data as string;
        }
        this.onInput.emit(data);
    }

    /**
     * called by core-input
     */
    blur(value: FocusEvent) {
        this.onBlur.emit(value);
    }

    /**
     * called by core-input (internet explorer)
     */
    keyup(value: KeyboardEvent) {
        this.onKeyup.emit(value);
    }

    updateEmailUrl() {
        if (StringHelper.isBlank(this.inputValue)) {
            return false;
        }
        this.emailUrl.nativeElement.href = 'mailto:' + this.inputValue;
        return true;
    }
}
