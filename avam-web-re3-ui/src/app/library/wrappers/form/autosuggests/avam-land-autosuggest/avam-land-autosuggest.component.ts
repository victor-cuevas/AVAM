import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { StaatDTO } from '@app/shared/models/dtos-generated/staatDTO';

@Component({
    selector: 'avam-land-autosuggest',
    templateUrl: './avam-land-autosuggest.component.html',
    styleUrls: ['./avam-land-autosuggest.component.scss']
})
export class AvamLandAutosuggestComponent implements OnInit {
    @Input() parentForm: FormGroup;
    @Input() controlName: string;
    @Input() placeholder: string;
    @Input() componentLabel: string;
    @Input() isDisabled: boolean;
    @Input() set readOnly(isReadOnly: boolean) {
        this._readOnly = isReadOnly;

        if (isReadOnly && this.parentForm) {
            const value: any = (this.parentForm.controls[this.controlName] && this.parentForm.controls[this.controlName].value) || {};
            this.setReadOnlyText(value);
        }
    }
    @Input() tooltip: string;
    @Input() container = '';
    @Input() scrollIntoView = true;

    @Output() onKeyup: EventEmitter<any> = new EventEmitter();
    @Output() onInput: EventEmitter<any> = new EventEmitter();
    @Output() onChange: EventEmitter<any> = new EventEmitter();
    @Output() onBlur: EventEmitter<any> = new EventEmitter();
    @Output() onSelect: EventEmitter<any> = new EventEmitter();

    @ViewChild('ngForm') formInstance: FormGroupDirective;

    /**
     * Stores the last Land data either from getting the initial data or from selecting an item from the result list.
     *
     * @private
     * @memberof AvamLandAutosuggestComponent
     */
    private selectedItem;

    /**
     * Indicates whether an item has been selected from the result list.
     *
     * @private
     * @memberof AvamLandAutosuggestComponent
     */
    private isSelectedItem = false;

    /**
     * Stores the Land data for read-only input.
     *
     * @private
     * @memberof AvamLandAutosuggestComponent
     */
    private inputObject;

    /**
     * Stores the translated input value of the Land data for read-only input.
     *
     * @private
     * @memberof AvamLandAutosuggestComponent
     */
    private inputValue = '';

    /**
     * Stores the is read only of the Land autosuggest for read-only input.
     *
     * @public
     * @memberof AvamLandAutosuggestComponent
     */
    _readOnly = false;

    constructor(
        private stesDataRestService: StesDataRestService,
        private translateService: TranslateService,
        private dbTranslateService: DbTranslateService,
        private obliqueHelper: ObliqueHelperService
    ) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);

        this.dbTranslateService.getEventEmitter().subscribe(() => {
            if (this._readOnly) {
                this.inputValue = this.dbTranslateService.translate(this.inputObject, 'name');
            }

            if (this.selectedItem) {
                this.parentForm.controls[this.controlName].setValue(this.selectedItem);
            }
        });
    }

    /**
     * Searches and returns all countries with matching search criteria.
     *
     * @param {string} result
     * @memberof AvamLandAutosuggestComponent
     */
    searchLand = (term: string) =>
        this.stesDataRestService.getStaaten(this.translateService.currentLang, term).pipe(
            map(a => {
                return a.map(item => {
                    return {
                        staatId: item.staatId,
                        iso2Code: item.iso2Code,
                        nameDe: item.nameDe,
                        nameIt: item.nameIt,
                        nameFr: item.nameFr,
                        translatedName: this.dbTranslateService.translate(item, 'name')
                    };
                });
            })
        );

    /**
     * The formatter of the item in the input field.
     *
     * @param {StaatDTO} result
     * @memberof AvamLandAutosuggestComponent
     */
    inputFormatter = (result: StaatDTO) => `${this.dbTranslateService.translate(result, 'name')}`;

    /**
     * The change event triggers when the element has finished changing that means that the event occurs when it loses focus.
     *
     * @param {*} event
     * @memberof AvamLandAutosuggestComponent
     */
    change(event: Event) {
        const value = event && event instanceof Event ? (event.target as HTMLInputElement).value : event;

        this.onChange.emit(value);
    }

    /**
     * The input event triggers every time after a value is modified by the user.
     *
     * It sets the isSelectedItem flag to false if the user has typed anything in the input.
     *
     * @param {(Event | StaatDTO)} event
     * @memberof AvamLandAutosuggestComponent
     */
    input(event: Event | StaatDTO) {
        const value = event && event instanceof Event ? (event.target as HTMLInputElement).value : event;

        this.isSelectedItem = false;
        this.setInitialItem(value);

        if (this._readOnly) {
            this.setReadOnlyText(value);
        }

        this.setItemToForm(value);
        this.onInput.emit(value);
    }

    /**
     * The blur event triggers when the element loses the focus.
     *
     * @param {FocusEvent} event
     * @memberof AvamLandAutosuggestComponent
     */
    blur(event: FocusEvent) {
        this.onBlur.emit(event);
    }

    /**
     * The keyup event triggers when a key is released.
     *
     * @param {KeyboardEvent} event
     * @memberof AvamLandAutosuggestComponent
     */
    keyup(event: KeyboardEvent) {
        this.onKeyup.emit(event);
    }

    /**
     * The select event triggers when an item has been selected from the dropdown result list.
     *
     * It sets the isSelectedItem flag to true since the item has been selected from the result list
     * and stores the selected item in selectedItem.
     *
     * @param {StaatDTO} value
     * @memberof AvamLandAutosuggestComponent
     */
    select(value: StaatDTO) {
        this.isSelectedItem = true;
        this.selectedItem = value;
        this.setItemToForm(value);
    }

    /**
     * Sets the readonly text and object.
     *
     * @private
     * @param {*} value
     * @memberof AvamLandAutosuggestComponent
     */
    private setReadOnlyText(value) {
        this.inputObject = value;
        this.inputValue = this.dbTranslateService.translate(value, 'name');
    }

    /**
     * Sets the initial Land object to selectedItem since it is used for reset and translation.
     *
     * @private
     * @param {*} value
     * @memberof AvamLandAutosuggestComponent
     */
    private setInitialItem(value) {
        if (value && value.staatId) {
            this.isSelectedItem = true;
            this.selectedItem = value;
        }
    }

    /**
     * Sets the value from the input to the form control.
     *
     * The Land object is not directly set to the value of the control, but it is set dynamically to a property of the control.
     * If there is a selectedItem, it is set directly to this property, otherwise the typed text in the input is wrapped into an object
     * with id -1 and then set it to this property of the control.
     *
     * @private
     * @param {*} value
     * @memberof AvamLandAutosuggestComponent
     */
    private setItemToForm(value) {
        this.checkForValue(value);

        if (this.isSelectedItem) {
            this.parentForm.controls[this.controlName]['landAutosuggestObject'] = this.selectedItem;
        } else {
            this.selectedItem = undefined;
            this.parentForm.controls[this.controlName]['landAutosuggestObject'] = { staatId: -1, nameDe: value, nameIt: value, nameFr: value, translatedName: value };
        }
    }

    /**
     * Checks if there is a value and updates the 'isSelectedItem' property.
     *
     * @private
     * @param {*} value
     * @memberof AvamLandAutosuggestComponent
     */
    private checkForValue(value) {
        // If there is no value, there is no selected item.
        if (!value) {
            this.isSelectedItem = false;
        }
    }
}
