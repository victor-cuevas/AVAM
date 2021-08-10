import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { map } from 'rxjs/operators';
import { ChIscoBerufDTO } from '@app/shared/models/dtos-generated/chIscoBerufDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';

@Component({
    selector: 'avam-berufsgruppe-autosuggest',
    templateUrl: './avam-berufsgruppe-autosuggest.component.html',
    styleUrls: ['./avam-berufsgruppe-autosuggest.component.scss']
})
export class AvamBerufsgruppeAutosuggestComponent implements OnInit {
    /**
     * The parent FormGroup name. Mandatory.
     *
     * @type {FormGroup}
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    @Input() parentForm: FormGroup;

    /**
     * The control name of the autosuggest. Mandatory.
     *
     * @type {*}
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    @Input() controlName: any;

    /**
     * The placeholder of the autosuggest.
     *
     * @type {string}
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    @Input() placeholder: string;

    /**
     * The label of the component.
     *
     * @type {string}
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    @Input() componentLabel: string;

    /**
     * Property which determines whether the component is disabled or not.
     *
     * @type {boolean}
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    @Input() isDisabled: boolean;

    /**
     * Property which determines whether the component is read-only or not.
     *
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    @Input() readOnly = false;

    /**
     * The tooltip of the autosuggest.
     *
     * @type {string}
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    @Input() tooltip: string;

    /**
     * Event emitter for keyup event.
     *
     * @type {EventEmitter<any>}
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    @Output() onKeyup: EventEmitter<any> = new EventEmitter();

    /**
     * Event emitter for input event.
     *
     * @type {EventEmitter<any>}
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    @Output() onInput: EventEmitter<any> = new EventEmitter();

    /**
     * Event emitter for change event.
     *
     * @type {EventEmitter<any>}
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    @Output() onChange: EventEmitter<any> = new EventEmitter();

    /**
     * Event emitter for blur event.
     *
     * @type {EventEmitter<any>}
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    @Output() onBlur: EventEmitter<any> = new EventEmitter();

    /**
     * Event emitter for select event.
     *
     * @type {EventEmitter<any>}
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    @Output() onSelect: EventEmitter<any> = new EventEmitter();

    @ViewChild('ngForm') formInstance: FormGroupDirective;

    /**
     * Stores the last Berufsgruppe data either from getting the initial data or from selecting an item from the result list.
     *
     * @private
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    private selectedItem;

    /**
     * Indicates whether an item has been selected from the result list.
     *
     * @private
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    private isSelectedItem = false;

    /**
     * Stores the Berufsgruppe data for read-only input.
     *
     * @private
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    private inputObject;

    /**
     * Stores the translated input value of the Berufsgruppe data for read-only input.
     *
     * @private
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    private inputValue = '';

    /**
     * An object with the properties and their values sent to the Backend as HttpParams.
     *
     * @private
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    private berufsgruppeSearchTokens = {};

    constructor(
        private stesDataRestService: StesDataRestService,
        private translateService: TranslateService,
        private dbTranslateService: DbTranslateService,
        private obliqueHelper: ObliqueHelperService
    ) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);

        this.dbTranslateService.getEventEmitter().subscribe(() => {
            if (this.readOnly) {
                this.inputValue = this.dbTranslateService.translate(this.inputObject, 'name');
            }

            if (this.selectedItem) {
                this.parentForm.controls[this.controlName].setValue(this.selectedItem);
            }
        });
    }

    /**
     * Searches and returns all Berufsgruppe items with matching search criteria.
     *
     * @param {string} term
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    searchBerufsgruppe = (term: string) => {
        this.berufsgruppeSearchTokens['q'] = term;
        this.berufsgruppeSearchTokens['language'] = this.translateService.currentLang;

        return this.stesDataRestService.searchBerufsgruppe(this.berufsgruppeSearchTokens).pipe(
            map(resultsArrayWithWarnings => {
                return resultsArrayWithWarnings.data.map(item => {
                    item['translatedBerufsGruppe'] = this.dbTranslateService.translate(item, 'berufsArt');
                    return item;
                });
            })
        );
    };

    /**
     * The formatter of the item in the input field.
     *
     * @param {ChIscoBerufDTO} result
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    inputFormatter = (result: ChIscoBerufDTO) => (result ? (result.chIscoBerufId !== -1 ? `${this.dbTranslateService.translate(result, 'berufsArt')}` : result.berufsArtDe) : null);

    /**
     * The change event triggers when the element has finished changing that means that the event occurs when it loses focus.
     *
     * @param {Event} event
     * @memberof AvamBerufsgruppeAutosuggestComponent
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
     * @param {(Event | CodeDTO)} event
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    input(event: Event | CodeDTO) {
        const value = event && event instanceof Event ? (event.target as HTMLInputElement).value : event;

        this.isSelectedItem = false;
        this.setInitialItem(value);

        if (this.readOnly) {
            this.setReadOnlyText(value);
        }

        this.setItemToForm(value);
        this.onInput.emit(value);
    }

    /**
     * The blur event triggers when the element loses the focus.
     *
     * @param {FocusEvent} event
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    blur(event: FocusEvent) {
        this.onBlur.emit(event);
    }

    /**
     * The keyup event triggers when a key is released.
     *
     * @param {KeyboardEvent} event
     * @memberof AvamBerufsgruppeAutosuggestComponent
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
     * @param {CodeDTO} value
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    select(value: CodeDTO) {
        this.isSelectedItem = true;
        this.selectedItem = value;
        this.setItemToForm(value);
    }

    /**
     * Sets the readonly text and object.
     *
     * @private
     * @param {*} value
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    private setReadOnlyText(value) {
        this.inputObject = value;
        this.inputValue = this.dbTranslateService.translate(value, 'berufsArt');
    }

    /**
     * Sets the initial Berufsgruppe object to selectedItem since it is used for reset and translation.
     *
     * @private
     * @param {*} value
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    private setInitialItem(value) {
        if (value && value.chIscoBerufId) {
            this.isSelectedItem = true;
            this.selectedItem = value;
        }
    }

    /**
     * Sets the value from the input to the form control.
     *
     * The Berufsgruppe object is not directly set to the value of the control, but it is set dynamically to a property of the control.
     * If there is a selectedItem, it is set directly to this property, otherwise the typed text in the input is wrapped into an object
     * with id -1 and then set it to this property of the control.
     *
     * @private
     * @param {*} value
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    private setItemToForm(value) {
        this.checkForValue(value);

        if (this.isSelectedItem) {
            this.parentForm.controls[this.controlName]['berufsgruppeAutosuggestObject'] = this.selectedItem;
        } else {
            this.selectedItem = undefined;
            this.parentForm.controls[this.controlName]['berufsgruppeAutosuggestObject'] = { chIscoBerufId: -1, chIscoCode: -1, berufsArtDe: value };
        }
    }

    /**
     * Checks if there is a value and updates the 'isSelectedItem' property.
     *
     * @private
     * @param {*} value
     * @memberof AvamBerufsgruppeAutosuggestComponent
     */
    private checkForValue(value) {
        // If there is no value, there is no selected item.
        if (!value) {
            this.isSelectedItem = false;
        }
    }
}
