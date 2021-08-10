import { Component, OnInit, Input, Output, ViewChild, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroupDirective, FormGroup, AbstractControl } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { BenutzerDetailDTO } from '@app/shared/models/dtos-generated/benutzerDetailDTO';
import { map, takeUntil } from 'rxjs/operators';
import { BenutzerDTO } from '@app/shared/models/dtos-generated/benutzerDTO';
import { TBenutzerDetailDTO } from '@app/shared/models/dtos-generated/tBenutzerDetailDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { Unsubscribable } from 'oblique-reactive';
import { forkJoin, Observable } from 'rxjs';
import { BaseResponseWrapperBenutzerDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperBenutzerDTOWarningMessages';
import { BaseResponseWrapperTBenutzerDetailDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperTBenutzerDetailDTOWarningMessages';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { UserDto } from '@shared/models/dtos-generated/userDto';
import { BaseResponseWrapperListBenutzerDetailDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListBenutzerDetailDTOWarningMessages';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { StringHelper } from '@app/shared/helpers/string.helper';
import { BaseResponseWrapperObjectWarningMessages } from '@dtos/baseResponseWrapperObjectWarningMessages';

/**BENUTZER_ALLE returns users without restrictions
 * BENUTZER returns authorized users (where token myVollzugsregionTyp = null) OR users from Vollzugsregion  (where token myVollzugsregionTyp != null) where restrictions apply
 */
export enum BenutzerAutosuggestType {
    BENUTZER_ALLE,
    BENUTZER
}

@Component({
    selector: 'avam-personalberater-autosuggest',
    templateUrl: './avam-personalberater-autosuggest.component.html',
    styleUrls: ['./avam-personalberater-autosuggest.component.scss']
})
export class AvamPersonalberaterAutosuggestComponent extends Unsubscribable implements OnInit, OnDestroy {
    /**
     * set read only state dynamiclly if we have selected item.
     *
     * @memberof AvamPersonalberaterAutosuggestComponent
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
    @Input() showFilter = false;
    @Input() showEmail = false;
    @Input() type: BenutzerAutosuggestType;
    @Input() set selectedFilterOption(filterOption: string) {
        this.currentFilterOption = filterOption;
    }

    @Input() benutzerSuchenTokens: {} = {};
    @Input() container = '';
    @Input() scrollIntoView = true;

    @Output() onKeyup: EventEmitter<any> = new EventEmitter();
    @Output() onInput: EventEmitter<any> = new EventEmitter();
    @Output() onChange: EventEmitter<any> = new EventEmitter();
    @Output() onBlur: EventEmitter<any> = new EventEmitter();
    @Output() onSelect: EventEmitter<any> = new EventEmitter();

    @Output() onPersonalEmailClick: EventEmitter<any> = new EventEmitter();

    @ViewChild('ngForm') formInstance: FormGroupDirective;
    @ViewChild('filterDropdown') filterDropdown;
    @ViewChild('emailUrl') emailUrl: any;

    benutzer: BenutzerDTO;
    benutzerDetail: TBenutzerDetailDTO;
    sprache: CodeDTO;
    geschlecht: CodeDTO;
    isReadOnly: boolean;

    currentFilterOption: string;

    aktivValue: DomainEnum = DomainEnum.BENUTZER_STATUS_AKTIV;
    inaktivValue: string = [DomainEnum.BENUTZER_STATUS_BLOCKIERT, DomainEnum.BENUTZER_STATUS_INARBEIT].join(',');

    filterOptions = [
        { value: this.aktivValue, labelFr: 'actif', labelIt: 'attivo', labelDe: 'aktiv', stringValue: this.aktivValue },
        { value: this.inaktivValue, labelFr: 'inactif', labelIt: 'inattivo', labelDe: 'inaktiv', stringValue: this.inaktivValue }
    ];

    /**
     * Stores the data which is displayed on info-icon-btn hover.
     *
     * @public
     * @memberof AvamPersonalberaterAutosuggestComponent
     */
    userInfoData: BenutzerDetailDTO;

    /**
     * Stores the last Personalberater data either from getting the initial data or from selecting an item from the result list.
     *
     * @private
     * @memberof AvamPersonalberaterAutosuggestComponent
     */
    private selectedItem;

    /**
     * Indicates whether an item has been selected from the result list.
     *
     * @private
     * @memberof AvamPersonalberaterAutosuggestComponent
     */
    private isSelectedItem = false;

    /**
     * Stores the Personalberater data for read-only input.
     *
     * @private
     * @memberof AvamPersonalberaterAutosuggestComponent
     */
    private inputObject;

    /**
     * Stores the translated input value of the Benutzer data for read-only input.
     *
     * @private
     * @memberof AvamPersonalberaterAutosuggestComponent
     */
    private inputValue = '';

    /**
     * Search functions for the autosuggest.
     *
     * @private
     * @memberof AvamBenutzerstelleAutosuggestComponent
     */
    private searchFunctions = {
        [BenutzerAutosuggestType.BENUTZER_ALLE](term): Observable<BaseResponseWrapperListBenutzerDetailDTOWarningMessages> {
            this.benutzerSuchenTokens['q'] = term;
            this.benutzerSuchenTokens['selectedStati'] = this.filterDropdown ? this.filterDropdown.nativeElement.value : DomainEnum.BENUTZER_STATUS_AKTIV;
            return this.stesDataRestService.searchBenutzer(this.benutzerSuchenTokens);
        },
        [BenutzerAutosuggestType.BENUTZER](term): Observable<BaseResponseWrapperListBenutzerDetailDTOWarningMessages> {
            this.benutzerSuchenTokens['q'] = term;
            this.benutzerSuchenTokens['stati'] = this.filterDropdown ? this.filterDropdown.nativeElement.value : DomainEnum.BENUTZER_STATUS_AKTIV;
            return this.stesDataRestService.searchBenutzerAusVollzugsregion(this.benutzerSuchenTokens);
        }
    };

    constructor(private obliqueHelper: ObliqueHelperService, private stesDataRestService: StesDataRestService, private authenticationService: AuthenticationService) {
        super();
    }

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);
    }

    /**
     * Searches and returns all Benutzer with matching search criteria.
     * If there is no filter, only active users are displayed
     *
     * @param {string} term
     * @memberof AvamPersonalberaterAutosuggestComponent
     */
    searchBenutzer = (term: string) => {
        return this.searchFunctions[this.type].call(this, term).pipe(
            map((resultsArrayWithWarnings: BaseResponseWrapperListBenutzerDetailDTOWarningMessages) => {
                return resultsArrayWithWarnings.data.map(item => {
                    return {
                        benutzerId: item.benutzerId,
                        benutzerDetailId: item.benutzerDetailId,
                        benutzerLogin: item.benutzerLogin,
                        nachname: item.nachname,
                        vorname: item.vorname,
                        benuStelleCode: item.benuStelleCode,
                        benutzerstelleId: item.benutzerstelleId
                    };
                });
            })
        );
    };

    /**
     * The formatter of the item in the input field.
     *
     * @param {BenutzerDetailDTO} result
     * @memberof AvamPersonalberaterAutosuggestComponent
     */
    inputFormatter = (result: BenutzerDetailDTO) =>
        result
            ? result.benuStelleCode
                ? `${result.benutzerLogin} ${result.nachname} ${result.vorname} ${result.benuStelleCode}`
                : `${result.benutzerLogin} ${result.nachname} ${result.vorname}`
            : '';

    /**
     * The change event triggers when the element has finished changing that means that the event occurs when it loses focus.
     *
     * @param {Event} event
     * @memberof AvamPersonalberaterAutosuggestComponent
     */
    change(event: Event | BenutzerDetailDTO) {
        const value = event && event instanceof Event ? (event.target as HTMLInputElement).value : event;

        this.onChange.emit(value);
    }

    /**
     * The input event triggers every time after a value is modified by the user.
     *
     * It sets the isSelectedItem flag to false if the user has typed anything in the input.
     *
     * @param {(Event | BenutzerDetailDTO)} event
     * @memberof AvamPersonalberaterAutosuggestComponent
     */
    input(event: Event | BenutzerDetailDTO) {
        const value = event && event instanceof Event ? (event.target as HTMLInputElement).value : event;

        this.isSelectedItem = false;
        this.userInfoData = null;
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
     * @memberof AvamPersonalberaterAutosuggestComponent
     */
    blur(event: FocusEvent) {
        this.onBlur.emit(event);
    }

    /**
     * The keyup event triggers when a key is released.
     *
     * @param {KeyboardEvent} event
     * @memberof AvamPersonalberaterAutosuggestComponent
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
     * @param {BenutzerDetailDTO} value
     * @memberof AvamPersonalberaterAutosuggestComponent
     */
    select(value: BenutzerDetailDTO) {
        this.fetchUserInfo(value);
        this.isSelectedItem = true;
        this.selectedItem = value;
        this.setItemToForm(value);
        this.onSelect.emit(this.selectedItem);
    }

    /**
     * Triggered when 'select logged in user' button is clicked.
     *
     * Gets the current user and selects it.
     *
     * @param {boolean} isManualTriggered
     * @memberof AvamPersonalberaterAutosuggestComponent
     */
    appendCurrentUser(isManualTriggered?: boolean) {
        const control: AbstractControl = this.parentForm.controls[this.controlName];
        const populatedUser: UserDto = control.value;
        const currentUser = this.getCurrentUserForAutosuggestDto();

        if (populatedUser && populatedUser.benutzerDetailId && populatedUser.benutzerDetailId.toString() === currentUser.benutzerDetailId.toString()) {
            return;
        }

        control.setValue(currentUser);
        this.change(currentUser);

        if (isManualTriggered) {
            control.markAsDirty();
        }
    }

    /**
     * Updates the email URL with the actual user's email.
     *
     * @memberof AvamPersonalberaterAutosuggestComponent
     */
    updateEmailUrl() {
        if (this.userInfoData && StringHelper.isBlank(this.userInfoData.email)) {
            return false;
        }
        this.emailUrl.nativeElement.href = 'mailto:' + this.userInfoData.email;
        return true;
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    onEmailClick() {
        this.onPersonalEmailClick.emit();
    }

    /**
     * Sets the readonly text and object.
     *
     * @private
     * @param {*} value
     * @memberof AvamPersonalberaterAutosuggestComponent
     */
    private setReadOnlyText(value) {
        if (value) {
            this.inputValue = value.benuStelleCode
                ? `${value.benutzerLogin} ${value.nachname} ${value.vorname} ${value.benuStelleCode}`
                : `${value.benutzerLogin} ${value.nachname} ${value.vorname}`;
        }
    }

    /**
     * Sets the initial Benutzer object to selectedItem since it is used for reset and translation.
     *
     * @private
     * @param {*} value
     * @memberof AvamPersonalberaterAutosuggestComponent
     */
    private setInitialItem(value) {
        if (value && value.benutzerId) {
            this.isSelectedItem = true;
            this.selectedItem = value;
            this.fetchUserInfo(value);
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
     * @memberof AvamPersonalberaterAutosuggestComponent
     */
    private setItemToForm(value) {
        this.checkForValue(value);

        if (this.isSelectedItem) {
            this.parentForm.controls[this.controlName]['benutzerObject'] = this.selectedItem;
        } else {
            this.selectedItem = undefined;
            this.parentForm.controls[this.controlName]['benutzerObject'] = {
                benutzerId: -1,
                benutzerDetailId: -1,
                benutzerLogin: value,
                nachname: value,
                vorname: value
            };
        }
    }

    /**
     * Gets the data shown in the info icon for the selected benutzer
     *
     * @private
     * @param {*} value
     * @memberof AvamPersonalberaterAutosuggestComponent
     */
    private fetchUserInfo(value) {
        const sources = [];
        if (value.benutzerId > 0) {
            sources.push(this.stesDataRestService.getBenutzer(value.benutzerId));
        }
        if (value.benutzerDetailId > 0) {
            sources.push(this.stesDataRestService.getBenutzerDetail(value.benutzerDetailId));
        }
        forkJoin(sources)
            .pipe(
                map((result: BaseResponseWrapperObjectWarningMessages[]) => {
                    this.benutzer = result[0].data;
                    if (value.benutzerDetailId) {
                        this.benutzerDetail = result[1].data;
                    }
                })
            )
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.sprache = this.benutzer.sprache ? this.benutzer.sprache : {};
                this.geschlecht = this.benutzer.geschlecht ? this.benutzer.geschlecht : {};
                this.userInfoData = this.createUserInfoData();
            });
    }

    private formatAddress(locale: string) {
        let strasseUndNummer = '';
        let plzUndOrt = '';

        if (this.benutzerDetail && this.benutzerDetail.benutzerstelleObject) {
            strasseUndNummer = `${this.benutzerDetail.benutzerstelleObject['strasse' + locale]} ${this.benutzerDetail.benutzerstelleObject.strasseNr}`;
            if (this.benutzerDetail.benutzerstelleObject.plzObject) {
                plzUndOrt = `${this.benutzerDetail.benutzerstelleObject.plzObject.postleitzahl} ${this.benutzerDetail.benutzerstelleObject.plzObject['ort' + locale]}`;
            }
        }

        return `${strasseUndNummer}\n${plzUndOrt}`;
    }

    private createUserInfoData() {
        return {
            benutzerLogin: this.benutzer.benutzerLogin,
            nachname: this.benutzer.nachname,
            vorname: this.benutzer.vorname,
            geschlechtDe: this.geschlecht.textDe,
            geschlechtFr: this.geschlecht.textFr,
            geschlechtIt: this.geschlecht.textIt,
            arbeitsspracheDe: this.sprache.textDe,
            arbeitsspracheFr: this.sprache.textFr,
            arbeitsspracheIt: this.sprache.textIt,
            telefon: this.benutzerDetail ? this.benutzerDetail.telefonnr : '',
            mobile: this.benutzerDetail ? this.benutzerDetail.telefonmobile : '',
            email: this.benutzerDetail ? this.benutzerDetail.email : '',
            benuStelleCode: this.benutzerDetail ? this.benutzerDetail.benutzerstelleObject.code : '',
            benuStelleNameDe: this.benutzerDetail ? this.benutzerDetail.benutzerstelleObject.nameDe : '',
            benuStelleNameFr: this.benutzerDetail ? this.benutzerDetail.benutzerstelleObject.nameFr : '',
            benuStelleNameIt: this.benutzerDetail ? this.benutzerDetail.benutzerstelleObject.nameIt : '',
            standortadresseDe: this.formatAddress('De'),
            standortadresseFr: this.formatAddress('Fr'),
            standortadresseIt: this.formatAddress('It')
        };
    }

    /**
     * Gets the data for the logged in user
     *
     * @private
     * @memberof AvamPersonalberaterAutosuggestComponent
     */
    private getCurrentUserForAutosuggestDto() {
        const currentUser = this.authenticationService.getLoggedUser();

        const currentUserForAutosuggestDto = {
            benutzerId: currentUser.benutzerId,
            benutzerDetailId: Number(currentUser.benutzerDetailId),
            benutzerLogin: currentUser.benutzerLogin,
            nachname: currentUser.name,
            vorname: currentUser.vorname,
            benuStelleCode: currentUser.benutzerstelleCode,
            benutzerstelleId: currentUser.benutzerstelleId
        };

        return currentUserForAutosuggestDto;
    }

    /**
     * Checks if there is a value and updates the 'isSelectedItem' property.
     *
     * @private
     * @param {*} value
     * @memberof AvamPersonalberaterAutosuggestComponent
     */
    private checkForValue(value) {
        // If there is no value, there is no selected item.
        if (!value) {
            this.isSelectedItem = false;
        }
    }
}
