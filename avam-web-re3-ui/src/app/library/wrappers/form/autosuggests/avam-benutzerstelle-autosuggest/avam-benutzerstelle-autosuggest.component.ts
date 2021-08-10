import { BenutzerstellenQueryDTO } from 'src/app/shared/models/dtos-generated/benutzerstellenQueryDTO';
import { Component, OnInit, Input, Output, ViewChild, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroupDirective, FormGroup } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { map } from 'rxjs/operators';
import { Unsubscribable, SpinnerService } from 'oblique-reactive';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { BenutzerstelleDetailInfoDTO } from '@app/shared/models/dtos-generated/benutzerstelleDetailInfoDTO';
import { BenutzerstellenRestService } from '@app/core/http/benutzerstellen-rest.service';
import { Observable } from 'rxjs';
import { BaseResponseWrapperListBenutzerstelleResultDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListBenutzerstelleResultDTOWarningMessages';
import { BenutzerstelleResultDTO } from '@app/shared/models/dtos-generated/benutzerstelleResultDTO';

export enum BenutzerstelleAutosuggestType {
    DEFAULT,
    BENUTZERSTELLE_AUS_VOLLZUGSREGION
}

@Component({
    selector: 'avam-benutzerstelle-autosuggest',
    templateUrl: './avam-benutzerstelle-autosuggest.component.html',
    styleUrls: ['./avam-benutzerstelle-autosuggest.component.scss']
})
export class AvamBenutzerstelleAutosuggestComponent extends Unsubscribable implements OnInit, OnDestroy {
    @Input() parentForm: FormGroup;
    @Input() controlName: any;
    @Input() placeholder: string;
    @Input() componentLabel: string;
    @Input() isDisabled: boolean;
    @Input() readOnly = false;
    @Input() tooltip: string;
    @Input() benutzerstelleSuchenTokens: {} = {};
    @Input() type: BenutzerstelleAutosuggestType;
    @Input() container = '';
    @Input() scrollIntoView = true;

    @Output() onKeyup: EventEmitter<any> = new EventEmitter();
    @Output() onInput: EventEmitter<any> = new EventEmitter();
    @Output() onChange: EventEmitter<any> = new EventEmitter();
    @Output() onBlur: EventEmitter<any> = new EventEmitter();
    @Output() onSelect: EventEmitter<any> = new EventEmitter();

    @ViewChild('ngForm') formInstance: FormGroupDirective;

    /**
     * Stores the data which is displayed on info-icon-btn hover.
     *
     * @public
     * @memberof AvamBenutzerstelleAutosuggestComponent
     */
    benutzerstellenInfo: BenutzerstelleDetailInfoDTO;

    /**
     * Spinner channel for the info icon popup.
     *
     * @private
     * @memberof AvamBenutzerstelleAutosuggestComponent
     */
    private infoIconChannel = 'info-icon-spinner-modal';

    /**
     * Stores the last Benutzerstelle data either from getting the initial data or from selecting an item from the result list.
     *
     * @private
     * @memberof AvamBenutzerstelleAutosuggestComponent
     */
    private selectedItem;

    /**
     * Indicates whether an item has been selected from the result list.
     *
     * @private
     * @memberof AvamBenutzerstelleAutosuggestComponent
     */
    private isSelectedItem = false;

    /**
     * Stores the Benutzerstelle data for read-only input.
     *
     * @private
     * @memberof AvamBenutzerstelleAutosuggestComponent
     */
    private inputObject;

    /**
     * Stores the translated input value of the Benutzerstelle data for read-only input.
     *
     * @private
     * @memberof AvamBenutzerstelleAutosuggestComponent
     */
    private inputValue = '';

    /**
     * Search functions for the autosuggest.
     *
     * @private
     * @memberof AvamBenutzerstelleAutosuggestComponent
     */
    private searchFunctions = {
        [BenutzerstelleAutosuggestType.DEFAULT](term): Observable<BaseResponseWrapperListBenutzerstelleResultDTOWarningMessages> {
            const benutzerstellenQueryDTO: BenutzerstellenQueryDTO = { code: term, gueltigkeit: 'all' };
            return this.benutzerstellenRestService.getBenutzerstellen(benutzerstellenQueryDTO, this.dbTranslateService.getCurrentLang());
        },
        [BenutzerstelleAutosuggestType.BENUTZERSTELLE_AUS_VOLLZUGSREGION](term): Observable<BaseResponseWrapperListBenutzerstelleResultDTOWarningMessages> {
            this.benutzerstelleSuchenTokens['q'] = term;
            return this.stesDataRestService.searchBenutzerstelleAusVollzugsregion(this.benutzerstelleSuchenTokens);
        }
    };

    constructor(
        private obliqueHelper: ObliqueHelperService,
        private stesDataRestService: StesDataRestService,
        private dbTranslateService: DbTranslateService,
        private benutzerstellenRestService: BenutzerstellenRestService,
        private spinnerService: SpinnerService
    ) {
        super();
    }

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);
        this.dbTranslateService.getEventEmitter().subscribe(() => {
            if (this.readOnly) {
                this.inputValue = this.inputObject;
            }
            if (this.selectedItem) {
                this.parentForm.controls[this.controlName].setValue(this.selectedItem);
            }
        });
    }

    /**
     * Searches and returns all Benutzerstellen with matching search criteria.
     * If there is no filter, only active users are displayed
     *
     * @memberof AvamBenutzerstelleAutosuggestComponent
     */
    searchBenutzerstellen = (term: string) => {
        return this.searchFunctions[this.type].call(this, term).pipe(
            map((resultsArrayWithWarnings: BaseResponseWrapperListBenutzerstelleResultDTOWarningMessages) => {
                return resultsArrayWithWarnings.data.map(item => {
                    return {
                        benutzerstelleId: item.benutzerstelleId,
                        code: item.code,
                        nameDe: item.nameDe,
                        nameFr: item.nameFr,
                        nameIt: item.nameIt,
                        strasseDe: item.strasseDe,
                        strasseFr: item.strasseDe,
                        strasseIt: item.strasseDe,
                        strasseNr: item.strasseNr,
                        plzObject: item.plzObject
                            ? {
                                  ortDe: item.plzObject.ortDe,
                                  ortFr: item.plzObject.ortFr,
                                  ortIt: item.plzObject.ortIt,
                                  postleitzahl: item.plzObject.postleitzahl
                              }
                            : {
                                  ortDe: '',
                                  ortFr: '',
                                  ortIt: '',
                                  postleitzahl: ''
                              },
                        translatedOrt: item.plzObject ? this.dbTranslateService.translate(item.plzObject, 'ort') : '',
                        translatedName: this.dbTranslateService.translate(item, 'name'),
                        translatedStrasse: this.dbTranslateService.translate(item, 'strasse')
                    };
                });
            })
        );
    };

    /**
     * The formatter of the item in the input field.
     *
     * @memberof AvamBenutzerstelleAutosuggestComponent
     */
    inputFormatter = (result: BenutzerstelleResultDTO) => `${result.code}`;

    /**
     * The change event triggers when the element has finished changing that means that the event occurs when it loses focus.
     *
     * @param {*} event
     * @memberof AvamBenutzerstelleAutosuggestComponent
     */
    change(event: Event) {
        const value = event.target ? (event.target as HTMLInputElement).value : event;

        this.onChange.emit(value);
    }

    /**
     * The input event triggers every time after a value is modified by the user.
     *
     * It sets the isSelectedItem flag to false if the user has typed anything in the input.
     *
     * @param {Event} event
     * @memberof AvamBenutzerstelleAutosuggestComponent
     */
    input(event: Event) {
        const value = event && event.target ? (event.target as HTMLInputElement).value : event;

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
     * @memberof AvamBenutzerstelleAutosuggestComponent
     */
    blur(event: FocusEvent) {
        this.onBlur.emit(event);
    }

    /**
     * The keyup event triggers when a key is released.
     *
     * @param {KeyboardEvent} event
     * @memberof AvamBenutzerstelleAutosuggestComponent
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
     * @param {BenutzerstelleResultDTO} value
     * @memberof AvamBenutzerstelleAutosuggestComponent
     */
    select(value: BenutzerstelleResultDTO) {
        this.isSelectedItem = true;
        this.selectedItem = value;
        this.setItemToForm(value);
        this.assignInfoIconData(value.code);

        this.onSelect.emit(value);
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    /**
     * Sets the readonly text and object.
     *
     * @private
     * @param {*} value
     * @memberof AvamBenutzerstelleAutosuggestComponent
     */
    private setReadOnlyText(value) {
        if (value) {
            this.inputValue = `${value.code} ${this.dbTranslateService.translate(value, 'name')} ${this.dbTranslateService.translate(value, 'strasse')} ${
                value.strasseNr
            } ${this.dbTranslateService.translate(value.plzObject, 'ort')}`;
        }
    }

    /**
     * Sets the initial Benutzer object to selectedItem since it is used for reset and translation.
     *
     * @private
     * @param {*} value
     * @memberof AvamBenutzerstelleAutosuggestComponent
     */
    private setInitialItem(value) {
        if (value && value.benutzerstelleId) {
            this.isSelectedItem = true;
            this.selectedItem = value;

            this.assignInfoIconData(value.code);
        }
    }

    /**
     * Sets the value from the input to the form control.
     *
     * The Benutzer object is not directly set to the value of the control, but it is set dynamically to a property of the control.
     * If there is a selectedItem, it is set directly to this property, otherwise the typed text in the input is wrapped into an object
     * with id -1 and then set it to this property of the control.
     *
     * @private
     * @param {*} value
     * @memberof AvamBenutzerstelleAutosuggestComponent
     */
    private setItemToForm(value) {
        this.checkForValue(value);

        if (this.isSelectedItem) {
            this.parentForm.controls[this.controlName]['benutzerstelleObject'] = this.selectedItem;
        } else {
            this.selectedItem = undefined;
            this.parentForm.controls[this.controlName]['benutzerstelleObject'] = {
                benutzerstelleId: -1,
                code: value
            };
        }
    }

    /**
     * Checks if there is a value and updates the 'isSelectedItem' property.
     *
     * @private
     * @param {*} value
     * @memberof AvamBenutzerstelleAutosuggestComponent
     */
    private checkForValue(value) {
        // If there is no value, there is no selected item.
        if (!value) {
            this.isSelectedItem = false;
        } else if (value && value.code) {
            this.assignInfoIconData(value.code);
        }
    }

    private assignInfoIconData(code: string) {
        const query: BenutzerstellenQueryDTO = { benutzerstelleCodeVon: code, benutzerstelleCodeBis: code, gueltigkeit: 'active' };
        this.spinnerService.activate(this.infoIconChannel);
        this.benutzerstellenRestService.getBenutzerstelleInfo(query, this.dbTranslateService.getCurrentLang()).subscribe(
            data => {
                this.benutzerstellenInfo = data;
                this.spinnerService.deactivate(this.infoIconChannel);
            },
            () => this.spinnerService.deactivate(this.infoIconChannel)
        );
    }
}
