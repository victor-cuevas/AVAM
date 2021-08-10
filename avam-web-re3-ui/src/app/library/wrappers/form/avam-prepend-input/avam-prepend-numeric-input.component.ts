import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

@Component({
    selector: 'avam-prepend-numeric-input',
    templateUrl: './avam-prepend-numeric-input.component.html',
    styleUrls: ['./avam-prepend-numeric-input.component.scss']
})
export class AvamPrependNumericInputComponent implements OnInit {
    @Input() prependLabel: string;
    @Input() selectLabel: string;
    @Input() placeholder: string;
    @Input() inputClass: string;
    @Input() customWrapperClass: string;
    @Input() customInputWrapperClass: string;
    @Input() customInputClass: string;
    @Input() customReadOnlyClass: string;
    @Input() customInputContainerClass: string;
    @Input() customPrependLabelClass: string;
    @Input() customLabelClass: string;
    @Input() toolTip: string;
    @Input() parentForm: FormGroup;
    @Input() controlName: string;
    @Input() isDisabled: boolean;
    @Input() readOnly = false;
    @Input() id: string;
    @Output() onChange: EventEmitter<any> = new EventEmitter();
    @Output() onKeyup: EventEmitter<any> = new EventEmitter();
    @Output() onInput: EventEmitter<any> = new EventEmitter();
    @Output() onBlur: EventEmitter<any> = new EventEmitter();

    @ViewChild('ngForm') formInstance: FormGroupDirective;

    inputValue = '';

    constructor(private obliqueHelper: ObliqueHelperService) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);
    }

    change(data: Event) {
        this.onChange.emit(data);
    }

    input(data: Event | string) {
        if (data && data instanceof Event) {
            this.inputValue = (data.target as HTMLInputElement).value;
        } else {
            this.inputValue = data as string;
        }

        this.onInput.emit(data);
    }

    blur(event: FocusEvent) {
        this.onBlur.emit(event);
    }

    keyup(event: KeyboardEvent) {
        this.onKeyup.emit(event);
    }
}
