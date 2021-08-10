import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import {
    Component,
    OnInit,
    AfterContentInit,
    OnDestroy,
    Input,
    ChangeDetectorRef,
    Output,
    EventEmitter,
    ViewChild,
    ElementRef,
    AfterViewInit,
    Optional,
    Host,
    SkipSelf,
    HostListener
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl, NgControl, ControlContainer } from '@angular/forms';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { getLocale } from 'ngx-bootstrap';
import CoreUtils from '../utils/core.utils';
import * as moment from 'moment';

/**
 * Wraps ngx-bootrap datepicker basic functionality.
 * Usage: <core-calendar formControlName="beantragtAm" (dateChange)="dateChange($event)"></core-calendar>
 *
 * @export
 * @class CoreCalendarComponent
 * @implements {ControlValueAccessor}
 * @implements {OnInit}
 * @implements {AfterContentInit}
 * @implements {OnDestroy}
 */
@Component({
    selector: 'core-calendar',
    templateUrl: './core-calendar.component.html',
    styleUrls: ['./core-calendar.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: CoreCalendarComponent,
            multi: true
        }
    ]
})
export class CoreCalendarComponent implements ControlValueAccessor, OnInit, AfterViewInit, AfterContentInit, OnDestroy {
    /**
     * Configure options.
     *
     * @type {string}
     * @memberof CoreCalendarComponent
     */
    @Input() bsConfig: any;

    /**
     * Input for placeholder.
     *
     * @type {string}
     * @memberof CoreCalendarComponent
     */
    @Input() inputPlaceholder: string;

    /**
     * Minimum date which is available for selection.
     *
     * @type {Date}
     * @memberof CoreCalendarComponent
     */
    @Input() minDate: Date;

    /**
     * Maximum date which is available for selection.
     *
     * @type {Date}
     * @memberof CoreCalendarComponent
     */
    @Input() maxDate: Date;

    /**
     * Specifies is the date input
     * should be focused on load
     *
     * @type {boolean}
     * @memberof CoreCalendarComponent
     */
    @Input() isFocused: boolean;

    /**
     * Input property which sets native input readonly attribute.
     *
     * @type {boolean}
     * @memberof CoreCalendarComponent
     */
    @Input() coreReadOnly: boolean;

    /**
     *  Set custom string for tooltip.
     *
     * @type {string}
     * @memberof CoreCalendarComponent
     */
    @Input() tooltip: string;

    /**
     * Emit custom event asynchronously
     * when the date is changed.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreCalendarComponent
     */
    @Output() dateChange: EventEmitter<any> = new EventEmitter();

    /**
     * Selector for input element.
     * @type {HTMLInputElement}
     * @memberof CoreCalendarComponent
     */
    @ViewChild('inputElement') inputElement: ElementRef;

    /**
     *
     *
     * @type {*}
     * @memberof CoreCalendarComponent
     */
    translateServiceSubscription: any;

    /**
     *
     *
     * @type {*}
     * @memberof CoreCalendarComponent
     */
    date: any = false;

    /**
     *
     *
     * @type {boolean}
     * @memberof CoreCalendarComponent
     */
    disabled: boolean;

    /**
     *
     *
     * @memberof CoreCalendarComponent
     */
    bsEvent = false;

    /**
     * Check if the component is autofocused.
     *
     * @type {boolean}
     * @memberof CoreCalendarComponent
     */
    autoFocused: boolean;

    /**
     * Input event listener.
     *
     * @type {EventListener}
     * @memberof CoreCalendarComponent
     */
    inputListener: EventListener;

    private inputValue: Date = undefined;

    /**
     *Creates an instance of CoreCalendarComponent.
     * @param {ChangeDetectorRef} cdref
     * @param {BsLocaleService} localeService
     * @param {TranslateService} translateService
     * @memberof CoreCalendarComponent
     */
    constructor(
        private cdref: ChangeDetectorRef,
        private localeService: BsLocaleService,
        private translateService: TranslateService,
        @Optional()
        @Host()
        @SkipSelf()
        private controlContainer: ControlContainer,
        private elRef: ElementRef
    ) {}

    /**
     * @memberof CoreCalendarComponent
     */
    ngOnInit() {
        this.setDefaultTheme();
        this.localeService.use(this.translateService.currentLang);
        this.translateServiceSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
            this.localeService.use(event.lang);
        });

        if (this.inputElement.nativeElement.dataset.focused) {
            this.autoFocused = true;
        }

        this.inputListener = this.elRef.nativeElement.addEventListener(
            'input',
            (event: any) => {
                CoreUtils.onInputWrapper(this.onValueChange.bind(this, event));
            },
            true
        );
    }

    /**
     * @memberof CoreCalendarComponent
     */
    ngAfterViewInit() {
        if (this.isFocused) {
            this.inputElement.nativeElement.focus();
        }
    }

    /**
     * Callback triggered when the value has changed.
     *
     * @memberof CoreCalendarComponent
     */
    onChange = (value: any) => {};

    /**
     * Callback triggered when the value has touched.
     *
     * @memberof CoreCalendarComponent
     */
    onTouched = () => {};

    /**
     * Sets the value of the calendar. Implemented as part of ControlValueAccessor.
     * Components are normally marked as dirty (in need of rerendering)
     * when inputs have changed or events have fired in the view.
     * We call markForCheck method to ensure that a component is checked
     * even if these triggers have not occured.
     *
     * @param {*} value
     * @memberof CoreCalendarComponent
     */
    writeValue(value: any): void {
        Promise.resolve().then(() => (this.date = value));
        this.dateChange.emit(value);
        if (this.bsEvent) {
            this.bsEvent = false;
            return;
        }
        this.cdref.markForCheck();
    }

    /**
     * Registers a callback to be triggered when the value has changed.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {*} fn
     * @memberof CoreCalendarComponent
     */
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    /**
     * Registers a callback to be triggered when the component is touched.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {*} fn
     * @memberof CoreCalendarComponent
     */
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    /**
     * Sets whether the component should be disabled.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {boolean} isDisabled
     * @memberof CoreCalendarComponent
     */
    setDisabledState(isDisabled: boolean): void {
        if (isDisabled) {
            this.disabled = true;
        } else {
            this.disabled = false;
        }
    }

    /**
     * Set default theme of calendar.
     *
     * @memberof CoreCalendarComponent
     */
    setDefaultTheme() {
        const themeDefault = { containerClass: 'theme-default', customTodayClass: 'datepicker-today', selectFromOtherMonth: true };
        if (this.bsConfig) {
            this.bsConfig = Object.assign(this.bsConfig, themeDefault);
        } else {
            this.bsConfig = themeDefault;
        }
    }

    /**
     * Emit bsOnValueChange on date change.
     *
     * @param {*} value
     * @memberof CoreCalendarComponent
     */
    bsOnValueChange(value) {
        if (this.isMonthDatepicker()) {
            if (this.inputValue && this.inputValue.getTime() !== value.getTime() && !(this.isInvalidDate(this.inputValue) && this.isInvalidDate(value))) {
                // Get the inputValue because bsDatepicker parses wrong dates as January
                value = this.inputValue;
            }
        }
        this.date = value;
        this.onValueChange(value);
    }

    /**
     * Emit onValueChange on (input) change.
     * Do not trigger validation if empty value gets set on initial phase in IE.
     * If value is empty by user input, the flag for checkUndefinedValue is set true,
     * hence validation is triggered.
     *
     * @param {*} value
     * @memberof CoreCalendarComponent
     */
    onValueChange(event, checkUndefinedValue = false) {
        let value = event && event.target ? event.target.value : event;
        if (value || (value === '' && this.inputValue !== undefined) || checkUndefinedValue) {
            if (this.isMonthDatepicker() && document.activeElement === this.inputElement.nativeElement) {
                // Don't update inputValue if the month was picked in the popup-window
                this.inputValue = moment(value, 'MMMM YYYY', this.translateService.currentLang, true).toDate();
                if (this.isInvalidDate(this.inputValue)) {
                    this.inputValue = moment(value, ['M.YY', 'M.YYYY', 'MM.YY', 'MM.YYYY'], true).toDate();
                }
            }
            this.bsEvent = true;

            this.onChange(value);

            this.dateChange.emit(value);
        }
    }

    private isInvalidDate(value: Date): boolean {
        return isNaN(value.getTime());
    }

    /**
     * Handle month-datepicker specially
     * It will accept only:
     *   Juni 2020
     *   06.2020
     *   6.2020
     *   06.20
     *   6.20
     * Everything else will be marked as invalid date
     */
    private isMonthDatepicker(): boolean {
        return this.bsConfig && 'MMMM YYYY' === this.bsConfig.dateInputFormat;
    }

    /**
     * Trigger change detection when content is ready.
     *
     * @memberof CoreCalendarComponent
     */
    ngAfterContentInit(): void {
        this.cdref.detectChanges();
    }

    /**
     * Clears the input
     *
     * @memberof CoreCalendarComponent
     */
    onClear() {
        this.onValueChange('', true);
    }

    /**
     * Sets Invalid Date message for all locales to the input value
     *
     * @memberof CoreCalendarComponent
     */
    onKeyup(event) {
        getLocale('de').invalidDate = event.target.value;
        getLocale('fr').invalidDate = event.target.value;
        getLocale('it').invalidDate = event.target.value;
        this.localeService.use(this.translateService.currentLang);
    }

    /**
     * Listen to Keyboard events and handles deleting input from user
     * Used for validation Bug in IE (AVB-20358 & AVB-20389)
     *
     * @param keyboard event
     */
    @HostListener('keyup', ['$event'])
    onKeyUp(event): void {
        if (this.isInputRemovingKeyEvent(event) && event.target.value === '') {
            this.onValueChange(event.target.value, true);
        }
    }

    private isInputRemovingKeyEvent(event): boolean {
        if (event.key === 'Backspace' || event.key === 'Back' || (event.keyCode && event.keyCode === 8)) {
            return true;
        }

        if (event.key === 'Delete' || event.key === 'Del' || (event.keyCode && event.keyCode === 46)) {
            return true;
        }
        return false;
    }

    /**
     * Trigger Oblique validation on focusout.
     *
     * @param {*} e
     * @returns
     * @memberof CoreCalendarComponent
     */
    focusout(e) {
        this.inputValue = undefined;
        const formcontrolName = this.elRef.nativeElement.getAttribute('formcontrolname');
        const control = this.controlContainer.control['controls'][formcontrolName];

        if (e.relatedTarget) {
            const target = CoreUtils.isIE ? e.relatedTarget.parentElement.classList.contains('avam-nav-link') : e.relatedTarget.classList.contains('avam-nav-link');

            if (target && this.autoFocused) {
                return;
            }

            if (control.errors && control.errors.required) {
                this.onChange(null);
            }

            this.autoFocused = false;
        }
    }

    /**
     * Unsubscribe from translate service.
     *
     * @memberof CoreCalendarComponent
     */
    ngOnDestroy(): void {
        this.translateServiceSubscription.unsubscribe();
        document.removeEventListener('input', this.inputListener, false);
    }
}
