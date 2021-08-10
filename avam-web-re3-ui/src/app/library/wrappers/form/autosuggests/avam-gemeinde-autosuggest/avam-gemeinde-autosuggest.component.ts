import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { map } from 'rxjs/operators';
import { StesSearchRestService } from '@app/core/http/stes-search-rest.service';
import { GemeindeDTO } from '@app/shared/models/dtos-generated/gemeindeDTO';

@Component({
    selector: 'avam-gemeinde-autosuggest',
    templateUrl: './avam-gemeinde-autosuggest.component.html',
    styleUrls: ['./avam-gemeinde-autosuggest.component.scss']
})
export class AvamGemeindeAutosuggestComponent implements OnInit {
    /**
     * Sets read only state dynamically if we have selected item.
     *
     * @memberof AvamGemeindeAutosuggestComponent
     */
    @Input() set readOnly(state: boolean) {
        this.isReadOnly = state;
        this.setReadOnlyText(this.selectedItem);
    }

    @Input() parentForm: FormGroup;
    @Input() controlName: any;
    @Input() placeholder: string;
    @Input() componentLabel: string;
    @Input() isDisabled: boolean;
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
     * Stores the is read only of the Gemeinde autosuggest for read-only input.
     *
     * @public
     * @memberof AvamGemeindeAutosuggestComponent
     */
    isReadOnly = false;

    /**
     * Stores the last Gemeinde data either from getting the initial data or from selecting an item from the result list.
     *
     * @private
     * @memberof AvamGemeindeAutosuggestComponent
     */
    private selectedItem;

    /**
     * Indicates whether an item has been selected from the result list.
     *
     * @private
     * @memberof AvamGemeindeAutosuggestComponent
     */
    private isSelectedItem = false;

    /**
     * Stores the Gemeinde data for read-only input.
     *
     * @private
     * @memberof AvamGemeindeAutosuggestComponent
     */
    private inputObject;

    /**
     * Stores the translated input value of the Gemeinde data for read-only input.
     *
     * @private
     * @memberof AvamGemeindeAutosuggestComponent
     */
    private inputValue = '';

    constructor(
        private stesDataRestService: StesSearchRestService,
        private translateService: TranslateService,
        private dbTranslateService: DbTranslateService,
        private obliqueHelper: ObliqueHelperService
    ) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);

        this.dbTranslateService.getEventEmitter().subscribe(() => {
            if (this.isReadOnly) {
                this.setReadOnlyText(this.selectedItem);
            }

            if (this.selectedItem) {
                this.parentForm.controls[this.controlName].setValue(this.selectedItem);
            }
        });
    }

    /**
     * Searches and returns all Gemeinden with matching search criteria.
     *
     * @param {string} term
     * @memberof AvamGemeindeAutosuggestComponent
     */
    searchGemeinde = (term: string) => {
        return this.stesDataRestService.getGemeinde(this.translateService.currentLang, term).pipe(
            map(a => {
                return a.map(item => {
                    item['formattedValue'] = this.formatValue(item);
                    return item;
                });
            })
        );
    };

    /**
     * The formatter of the item in the input field.
     *
     * @param {GemeindeDTO} result
     * @memberof AvamGemeindeAutosuggestComponent
     */
    inputFormatter = (result: GemeindeDTO) => this.formatValue(result);

    /**
     * The change event triggers when the element has finished changing that means that the event occurs when it loses focus.
     *
     * @param {Event} event
     * @memberof AvamGemeindeAutosuggestComponent
     */
    change(event: Event) {
        const value = event && event.target ? (event.target as HTMLInputElement).value : event;

        this.onChange.emit(value);
    }

    /**
     * The input event triggers every time after a value is modified by the user.
     *
     * It sets the isSelectedItem flag to false if the user has typed anything in the input.
     *
     * @param {(Event | GemeindeDTO)} event
     * @memberof AvamGemeindeAutosuggestComponent
     */
    input(event: Event | GemeindeDTO) {
        const value = event && event instanceof Event ? (event.target as HTMLInputElement).value : event;

        this.isSelectedItem = false;
        this.setInitialItem(value);

        if (this.isReadOnly) {
            this.setReadOnlyText(value);
        }

        this.setItemToForm(value);
        this.onInput.emit(value);
    }

    /**
     * The blur event triggers when the element loses the focus.
     *
     * @param {FocusEvent} event
     * @memberof AvamGemeindeAutosuggestComponent
     */
    blur(event: FocusEvent) {
        this.onBlur.emit(event);
    }

    /**
     * The keyup event triggers when a key is released.
     *
     * @param {KeyboardEvent} event
     * @memberof AvamGemeindeAutosuggestComponent
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
     * @param {GemeindeDTO} value
     * @memberof AvamGemeindeAutosuggestComponent
     */
    select(value: GemeindeDTO) {
        this.isSelectedItem = true;
        this.selectedItem = value;
        this.setItemToForm(value);
    }

    /**
     * Sets the readonly text and object.
     *
     * @private
     * @param {*} value
     * @memberof AvamGemeindeAutosuggestComponent
     */
    private setReadOnlyText(value) {
        if (value) {
            this.inputObject = value;
            this.inputValue = this.formatValue(value);
        }
    }

    /**
     * Sets the initial Gemeinde object to selectedItem since it is used for reset and translation.
     *
     * @private
     * @param {*} value
     * @memberof AvamGemeindeAutosuggestComponent
     */
    private setInitialItem(value) {
        if (value && value.gemeindeBaseInfo) {
            this.isSelectedItem = true;
            this.selectedItem = value;
        }
    }

    /**
     * Sets the value from the input to the form control.
     *
     * The Gemeinde object is not directly set to the value of the control, but it is set dynamically to a property of the control.
     * If there is a selectedItem, it is set directly to this property, otherwise the typed text in the input is wrapped into an object
     * with id -1 and then set it to this property of the control.
     *
     * @private
     * @param {*} value
     * @memberof AvamGemeindeAutosuggestComponent
     */
    private setItemToForm(value) {
        this.checkForValue(value);

        if (this.isSelectedItem) {
            this.parentForm.controls[this.controlName]['gemeindeObj'] = this.selectedItem;
        } else {
            this.selectedItem = undefined;
            const gemeindeObj = {
                formattedValue: this.parentForm.controls[this.controlName].value,
                gemeindeBaseInfo: {
                    bfsNummer: -1,
                    gemeindeId: -1,
                    nameDe: this.parentForm.controls[this.controlName].value,
                    nameFr: this.parentForm.controls[this.controlName].value,
                    nameIt: this.parentForm.controls[this.controlName].value
                },
                kanton: '',
                ortschaftsbezeichnung: this.parentForm.controls[this.controlName].value,
                plz: null,
                value: this.parentForm.controls[this.controlName].value
            };
            this.parentForm.controls[this.controlName]['customGemeindeObj'] = gemeindeObj;
            this.parentForm.controls[this.controlName]['gemeindeObj'] = null;
        }
    }

    /**
     * Checks if there is a value and updates the 'isSelectedItem' property.
     *
     * @private
     * @param {*} value
     * @memberof AvamGemeindeAutosuggestComponent
     */
    private checkForValue(value) {
        // If there is no value, there is no selected item.
        if (!value) {
            this.isSelectedItem = false;
        }
    }

    private formatValue(value) {
        return value && value.gemeindeBaseInfo
            ? `${value.gemeindeBaseInfo.bfsNummer} / ${this.dbTranslateService.translate(value.gemeindeBaseInfo, 'name')} / ${value.plz} / ${value.ortschaftsbezeichnung} / ${
                  value.kanton
              }`
            : '';
    }
}
