import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CoreMultiselectInterface } from './core-multiselect.interface';
import DomHandler from '../utils/domhandler';
import ScrollUtils from '@app/library/core/utils/scroll.utils';

/**
 * Implemented basic ControlValueAccessor functionality for oblique multiselect.
 *
 * @export
 * @class CoreMultiselectComponent
 * @implements {ControlValueAccessor}
 * @implements {OnInit}
 */
@Component({
    selector: 'core-multiselect',
    templateUrl: './core-multiselect.component.html',
    styleUrls: ['./core-multiselect.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: CoreMultiselectComponent,
            multi: true
        }
    ]
})
export class CoreMultiselectComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy {
    /**
     * A Subject that requires an initial value and emits its current value to new subscribers.
     *
     * @memberof CoreMultiselectComponent
     */
    options$ = new BehaviorSubject<any>([]);

    /**
     * Options which populate the multiselect.
     *
     * @memberof CoreMultiselectComponent
     */
    @Input('options') set options(data: CoreMultiselectInterface[]) {
        this.options$.next(data);
    }

    /**
     * Whether to display the search field.
     *
     * @type {boolean}
     * @memberof CoreMultiselectComponent
     */
    @Input('enableSearch') enableSearch: boolean;

    /**
     * Whether checkAll should be shown.
     *
     * @type {boolean}
     * @memberof CoreMultiselectComponent
     */
    @Input('showCheckAll') showCheckAll: boolean;

    /**
     * Whether uncheckAll should be shown.
     *
     * @type {boolean}
     * @memberof CoreMultiselectComponent
     */
    @Input('showUncheckAll') showUncheckAll: boolean;

    /**
     * Max amount of selected items for which a dynamic title will be generated.
     *
     * @type {number}
     * @memberof CoreMultiselectComponent
     */
    @Input('dynamicTitleMaxItems') dynamicTitleMaxItems = 3;

    /**
     * Template for specific multiselect.
     *
     * @type {*}
     * @memberof CoreMultiselectComponent
     */
    @Input('template') template: any;

    /**
     * Property which tell us if we have tree mode on.
     *
     * @memberof CoreMultiselectComponent
     */
    @Input('treeMode') treeMode = false;

    /**
     * Property which holds the placeholder.
     *
     * @memberof CoreMultiselectComponent
     */
    @Input('placeholder') placeholder = false;

    /**
     * Emit custom event asynchronously
     * when the options are loaded.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreInputComponent
     */
    @Output() onLoaded: EventEmitter<any> = new EventEmitter();

    /**
     * Emit custom event asynchronously
     * when the value is removed.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreInputComponent
     */
    @Output() onRemoveElement: EventEmitter<any> = new EventEmitter();

    /**
     * Emit custom event asynchronously
     * when the value is added.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreInputComponent
     */
    @Output() onAddedElement: EventEmitter<any> = new EventEmitter();

    /**
     * Emit custom event asynchronously when dropdown is opened.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreMultiselectComponent
     */
    @Output() onOpenDropdown: EventEmitter<any> = new EventEmitter();

    /**
     * Emit custom event asynchronously when dropdown is closed.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreMultiselectComponent
     */
    @Output() onDropdownClosed: EventEmitter<any> = new EventEmitter();

    /**
     * Selector to accsess oblique multiselect =(
     *
     * @type {ElementRef}
     * @memberof CoreMultiselectComponent
     */
    @ViewChild('orMultiselect') orMultiselect: any;

    /**
     * Selector to accsess oblique multiselect body =(
     *
     * @type {ElementRef}
     * @memberof CoreMultiselectComponent
     */
    @ViewChild('multiselectBody') multiselectBody: ElementRef;

    /**
     * Inner value for ngModel.
     *
     * @type {*}
     * @memberof CoreMultiselectComponent
     */
    innerValue: any;

    /**
     * Container with dropdown options.
     *
     * @type {*}
     * @memberof CoreMultiselectComponent
     */
    dropdownOptions: any;

    /**
     * Set disabled state.
     *
     * @type {boolean}
     * @memberof CoreMultiselectComponent
     */
    isDisabled: boolean;

    /**
     * Subscription for translate.
     *
     * @type {Subscription}
     * @memberof CoreMultiselectComponent
     */
    translateSubscription: Subscription;

    /**
     * Creates an instance of CoreMultiselectComponent.
     * @memberof CoreMultiselectComponent
     */
    constructor(private dbTranslateService: DbTranslateService) {}

    /**
     * A function to transform an option to a label that will be shown in the multiselect.
     * This will be used in favor of the labelProperty.
     *
     * @type {*}
     * @memberof CoreMultiselectComponent
     */
    labelFormatter(option: any) {
        return this.dbTranslateService.translate(option, 'text');
    }

    /**
     * @memberof CoreMultiselectComponent
     */
    ngOnInit() {
        this.translateSubscription = this.dbTranslateService.getEventEmitter().subscribe(() => {
            this.orMultiselect.updateTitle();
        });

        this.options$.subscribe((option: CoreMultiselectInterface[]) => {
            if (Array.isArray(option)) {
                this.dropdownOptions = option;
                this.innerValue = option.filter(o => {
                    return o.value === true;
                });
                this.onLoaded.emit(this.dropdownOptions);
            }
        });
    }

    ngAfterViewInit(): void {
        this.orMultiselect['title'] = this.placeholder ? this.placeholder : this.orMultiselect['title'];
        this.orMultiselect['texts'].defaultTitle = this.placeholder ? this.placeholder : this.orMultiselect['texts'].defaultTitle;
    }

    /**
     * Bind model to intterValue;
     *
     * @memberof CoreMultiselectComponent
     */
    get model() {
        return this.innerValue;
    }

    /**
     * Trigger on change when model is set.
     *
     * @memberof CoreMultiselectComponent
     */
    set model(v: any) {
        this.innerValue = v;
        this._onChange(v);
    }

    /**
     * Callback triggered when the value has changed.
     *
     * @memberof CoreInputComponent
     */
    _onChange = (value: any) => {};

    /**
     * Callback triggered when the value has touched.
     *
     * @memberof CoreInputComponent
     */
    onTouched = () => {};

    /**
     * Sets the value of the input element. Implemented as part of ControlValueAccessor.
     *
     * @param {CoreMultiselectInterface[]} value
     * @memberof CoreInputComponent
     */
    writeValue(value: CoreMultiselectInterface[]): void {
        if (value) {
            this.dropdownOptions = value;
            this.innerValue = value.filter(o => {
                return o.value === true;
            });
        }
    }

    /**
     * Sets whether the component should be disabled.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {boolean} isDisabled
     * @memberof CoreInputComponent
     */
    setDisabledState(isDisabled: boolean): void {
        if (isDisabled) {
            this.isDisabled = true;
        } else {
            this.isDisabled = false;
        }
    }

    /**
     * Registers a callback to be triggered when the value has changed.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {*} fn
     * @memberof CoreInputComponent
     */
    registerOnChange(fn: any): void {
        this._onChange = fn;
    }

    /**
     * Registers a callback to be triggered when the component is touched.
     * Implemented as part of ControlValueAccessor.
     *
     * @param {*} fn
     * @memberof CoreInputComponent
     */
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    /**
     * An event fired when an option gets selected. Event's payload equals the selected option.
     *
     *@param {CoreMultiselectInterface} option
     * @memberof CoreMultiselectComponent
     */
    onAdded(option: CoreMultiselectInterface) {
        option.value = true;
        this.options$.next(this.dropdownOptions.slice());
        this.onAddedElement.emit(option);
    }

    /**
     * An event fired when an option gets unselected. event's payload equals the unselected option.
     *
     * @param {CoreMultiselectInterface} option
     * @memberof CoreMultiselectComponent
     */
    onRemoved(option: CoreMultiselectInterface) {
        option.value = false;
        this.options$.next(this.dropdownOptions.slice());
        this.onRemoveElement.emit(option);
    }

    /**
     * An event fired when the dropdown is closed.
     *
     * @param {*} event
     * @memberof CoreMultiselectComponent
     */
    dropdownClosed(event) {
        this.onDropdownClosed.emit(true);
    }

    /**
     * An event fired when the dropdown is opened.
     *
     * @param {*} event
     * @memberof CoreMultiselectComponent
     */
    onOpen(event) {
        const classList = event.srcElement.classList;
        ScrollUtils.scrollDropdownListIntoViewIfNeeded(DomHandler.findSingle(document, '.dropdown-menu'));
        if (classList.contains('multiselect-toggle') || classList.contains('multiselect-label') || classList.contains('toggle toggle-down-up')) {
            this.onOpenDropdown.emit(true);
        }
    }

    /**
     * Unsubscribe when component is destroyed.
     *
     * @memberof CoreMultiselectComponent
     */
    ngOnDestroy(): void {
        this.options$.unsubscribe();
        this.translateSubscription.unsubscribe();
    }
}
