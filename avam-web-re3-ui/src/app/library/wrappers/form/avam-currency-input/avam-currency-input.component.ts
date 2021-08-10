import localeCh from '@angular/common/locales/de-CH';
import { registerLocaleData } from '@angular/common';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { Component, OnInit, Input, AfterViewInit, OnDestroy, ViewChild, LOCALE_ID, Output, EventEmitter } from '@angular/core';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { CoreInputComponent } from '@app/library/core/core-input/core-input.component';
import { LocaleEnum } from '@app/shared/enums/locale.enum';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';

registerLocaleData(localeCh);

@Component({
    selector: 'avam-currency-input',
    templateUrl: './avam-currency-input.component.html',
    styleUrls: ['./avam-currency-input.component.scss'],
    providers: [
        {
            provide: LOCALE_ID,
            useValue: LocaleEnum.SWITZERLAND
        }
    ]
})
export class AvamCurrencyInputComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() parentForm: FormGroup;
    @Input() controlName: string;
    @Input() isDisabled: boolean;
    @Input() placeholder: string;
    @Input() label: string;
    @Input() secondaryLabel: string;
    @Input() ternaryLabel: boolean;
    @Input() max: number;
    @Input() coreReadOnly: boolean;
    @Input() coreReadOnlyClearButton: boolean;
    @Input() customWrapperClass: string;
    @Input() customLabelClass: string;
    @Input() customInputClass: string;
    @Input() customSecondaryLabelClass: string;
    @Input() customTernaryLabelClass: string;
    @Input() customInputContainerClass: string;
    @Input() customReadOnlyClass: string;
    @Input() textDirection = 'rtl';
    @Input() integerOnly = false;
    @Input() highlightNegative = false;
    @Input() integralPartLen: number;
    @Input() set readOnly(isReadOnly: boolean) {
        this.isReadOnly = isReadOnly;

        if (this.isReadOnly) {
            this.readOnlyValue = this.toApostrophFromString();
        }
    }

    @Output() onClear: EventEmitter<any> = new EventEmitter();
    @Output() onInput: EventEmitter<any> = new EventEmitter();
    @Output() onChange: EventEmitter<any> = new EventEmitter();
    @Output() onKeyup: EventEmitter<any> = new EventEmitter();
    @Output() onBlur: EventEmitter<any> = new EventEmitter();

    @ViewChild('ngForm') formInstance: FormGroupDirective;
    @ViewChild('coreInput') coreInputComponent: CoreInputComponent;

    readOnlyValue: string | number;
    isReadOnly: boolean;
    focusEventListener: any;
    negativeValue: boolean;

    constructor(private obliqueHelper: ObliqueHelperService, private formUtils: FormUtilsService) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);
        this.checkNegative(this.parentForm.controls[this.controlName].value);
    }

    ngAfterViewInit() {
        this.focusEventListener = this.showNumberValue.bind(this);
        this.coreInputComponent.inputElement.nativeElement.addEventListener('focus', this.focusEventListener);
    }

    ngOnDestroy() {
        this.coreInputComponent.inputElement.nativeElement.removeEventListener('focus', this.focusEventListener);
    }

    showNumberValue() {
        this.coreInputComponent.inputElement.nativeElement.value = this.parentForm.controls[this.controlName].value;
    }

    onHandleInput(event: Event) {
        if (this.isReadOnly) {
            this.readOnlyValue = this.toApostrophFromString();
        }

        if (document.activeElement !== this.coreInputComponent.inputElement.nativeElement) {
            setTimeout(() => {
                this.coreInputComponent.inputElement.nativeElement.value = this.toApostrophFromString();
            });
        }

        this.onInput.emit(event);
    }

    onHandleChange(event: Event) {
        this.onChange.emit(event);
    }

    onClearField(event: Event) {
        this.showNumberValue();
        this.formatCurrecnyObject();
        this.onClear.emit(event);
    }

    onHandleKeyUp(event: KeyboardEvent) {
        this.checkNegative(this.coreInputComponent.inputElement.nativeElement.value);
        if (this.integralPartLen > 0) {
            const value = this.checkInput();
            this.coreInputComponent.inputElement.nativeElement.value = value;
            if (this.parentForm.controls[this.controlName].value !== value) {
                this.parentForm.controls[this.controlName].setValue(value);
            }
        }

        this.onKeyup.emit(event);
    }

    onHandleBlur(event: FocusEvent) {
        this.coreInputComponent.inputElement.nativeElement.value = this.toApostrophFromString();
        this.formatCurrecnyObject();
        this.onBlur.emit(event);
    }

    toApostrophFromString(): string | number {
        const money: string = this.parentForm.controls[this.controlName].value;

        if (money === '' || money === null || money === undefined || isNaN(Number(money))) {
            return money;
        }

        const output: string = this.formUtils.formatAmountOfMoney(money.toString());
        const outputParts: string[] = output.split('.');
        const outputInteger: number = Number(outputParts[0].replace(/’/g, ''));
        const outputDecimal: string = outputParts[1] ? outputParts[1] : '00';
        const outputFormValue = this.integerOnly ? `${outputInteger}` : `${outputInteger}.${outputDecimal}`;

        if (this.parentForm.controls[this.controlName].value !== outputFormValue) {
            this.parentForm.controls[this.controlName].setValue(outputFormValue);
        }

        return this.integerOnly ? outputParts[0] : output;
    }

    formatCurrecnyObject() {
        this.parentForm.controls[this.controlName]['currencyObject'] = {
            numberValue: Number(this.parentForm.controls[this.controlName].value),
            inputValue: this.parentForm.controls[this.controlName].value,
            stringValue: this.coreInputComponent.inputElement.nativeElement.value
        };
    }

    checkInput() {
        let value = this.coreInputComponent.inputElement.nativeElement.value;

        if (value !== '' && value !== null && value !== undefined && !isNaN(Number(value))) {
            value = this.fixLength(value);
        }

        return value;
    }

    checkNegative(value) {
        this.negativeValue = value < 0;
    }

    fixLength(value) {
        const realLen = this.negativeValue ? this.integralPartLen + 1 : this.integralPartLen;

        if (!value.includes('.') && value.length > realLen) {
            value = value.slice(0, value.length - 1) + '.00';
        }

        return value;
    }
}
