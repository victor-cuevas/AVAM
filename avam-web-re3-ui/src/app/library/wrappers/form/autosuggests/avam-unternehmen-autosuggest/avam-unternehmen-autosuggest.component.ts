import { Component, OnInit, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UnternehmenRestService } from '@app/core/http/unternehmen-rest.service';
import { SpinnerService } from 'oblique-reactive';
import { UnternehmenDetailsDTO } from '@app/shared/models/dtos-generated/unternehmenDetailsDTO';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { BurOertlicheEinheitDTO } from '@dtos/burOertlicheEinheitDTO';
import { AvamUnternehmenSucheComponent } from '@app/library/wrappers/form/autosuggests/avam-unternehmen-autosuggest/avam-unternehmen-suche/avam-unternehmen-suche.component';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { BurOertlicheEinheitXDTO } from '@app/shared/models/dtos-generated/burOertlicheEinheitXDTO';

@Component({
    selector: 'avam-unternehmen-autosuggest',
    templateUrl: './avam-unternehmen-autosuggest.component.html',
    styleUrls: ['./avam-unternehmen-autosuggest.component.scss']
})
export class AvamUnternehmenAutosuggestComponent implements OnInit {
    /**
     * The parent FormGroup name. Mandatory.
     *
     * @type {FormGroup}
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    @Input() parentForm: FormGroup;

    /**
     * The control name of the autosuggest. Mandatory.
     *
     * @type {*}
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    @Input() controlName: any;

    /**
     * The placeholder of the autosuggest.
     *
     * @type {string}
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    @Input() placeholder: string;

    /**
     * The label of the component.
     *
     * @type {string}
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    @Input() componentLabel: string;

    /**
     * Property which determines whether the component is read-only or not.
     *
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    @Input() set readOnly(isReadOnly: boolean) {
        this.isReadOnly = isReadOnly;

        this.setReadonlyText();
    }

    /**
     * Class for styling the component.
     *
     * @type {string}
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    @Input() inputClass: string;

    /**
     * The label of the SuchePlus Modal window.
     *
     * @type {string}
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    @Input() suchePlusLabel: string;

    /**
     * A property which indicates if the autosuggest is used as simple input.
     *
     * @type {boolean}
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    @Input() simpleInput: boolean;

    /**
     * Property which determines whether the SuchePlus supports search only in Avam or in both Avam and BUR
     *
     * @type {boolean}
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    @Input() isAvamOnly: boolean;

    /**
     * Determine where to put the dropdown element in DOM.
     *
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    @Input() container = '';

    /**
     * Default behavior of the autosuggest is to scrollIntoView when you type.
     *
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    @Input() scrollIntoView = true;

    @Input() ngTooltip: string;

    /**
     * Event emitter for keyup event.
     *
     * @type {EventEmitter<any>}
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    @Output() onKeyup: EventEmitter<any> = new EventEmitter();

    /**
     *  Event emitter for change event.
     */
    @Output() onInput: EventEmitter<any> = new EventEmitter();

    /**
     * Event emitter for change event
     *
     * @type {EventEmitter<any>}
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    @Output() onChange: EventEmitter<any> = new EventEmitter();

    /**
     * Event emitter for blur event.
     *
     * @type {EventEmitter<any>}
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    @Output() onBlur: EventEmitter<any> = new EventEmitter();

    /**
     * Event emitter for select event.
     *
     * @type {EventEmitter<any>}
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    @Output() onSelect: EventEmitter<any> = new EventEmitter();

    /**
     * Event emitter for clear event.
     *
     * @type {EventEmitter<any>}
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    @Output() onClear: EventEmitter<any> = new EventEmitter();

    @ViewChild('ngForm') formInstance: FormGroupDirective;

    /**
     * Stores the last Unternehmen data either from getting the initial data or from selecting an item from the result list.
     *
     * @private
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    selectedItem;

    /**
     * Determine is the component readonly or ready or interaction.
     * It is dynamically set by the readOnly Input setter
     *
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    isReadOnly: boolean;

    /**
     * Stores the details about the selected Unternehmen.
     *
     * @type {UnternehmenDetailsDTO}
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    unternehmenDetailsDTO: UnternehmenDetailsDTO;

    /**
     *  Address of the admin.ch UID website
     *
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    uidWebAddress = 'https://www.uid.admin.ch/Detail.aspx?uid_id=';

    /**
     * Stores the details about the selected BUR-Extrakt Unternehmen.
     *
     * @type {BurOertlicheEinheitDetailsDTO}
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    burOertEinheitDTO: BurOertlicheEinheitDTO;

    /**
     * Indicates whether an item has been selected from the result list.
     *
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    isSelectedItem = false;

    /**
     * Stores the input value of the Unternehmen data for read-only input.
     *
     * @private
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    private inputValue = '';

    /**
     * An object with the properties and their values sent to the Backend as HttpParams.
     *
     * @private
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    private unternehmenSuchenTokens = {};

    /**
     * Options available when opening new modal windows.
     *
     * @private
     * @type {NgbModalOptions}
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    private modalOptionsXL: NgbModalOptions;

    /**
     * Stores the data that will be displayed in the info icon popup.
     *
     * @private
     * @type {*}
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    private infoIconDetails;

    /**
     * Spinner channel for the info icon popup.
     *
     * @private
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    private infoIconChannel = 'info-icon-spinner-modal';

    constructor(
        private obliqueHelper: ObliqueHelperService,
        private stesDataRestService: StesDataRestService,
        private unternehmenRestService: UnternehmenRestService,
        private dbTranslateService: DbTranslateService,
        private spinnerService: SpinnerService,
        private readonly modalService: NgbModal,
        private fehlermeldungenService: FehlermeldungenService
    ) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);

        this.dbTranslateService.getEventEmitter().subscribe(() => {
            if (this.selectedItem) {
                if (this.selectedItem.unternehmenId) {
                    this.mapInfoIconDetails(this.unternehmenDetailsDTO);
                } else if (this.selectedItem.burOrtEinheitId) {
                    this.mapBurInfoIconDetails(this.burOertEinheitDTO);
                }
            }
        });

        this.modalOptionsXL = { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-xl', backdrop: 'static' } as NgbModalOptions;
    }

    /**
     * The formatter of the item in the input field.
     *
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    inputFormatter = (result: UnternehmenDTO | BurOertlicheEinheitXDTO) => `${result.name1 ? result.name1 : result}`;

    /**
     * The change event triggers when the element has finished changing that means that the event occurs when it loses focus.
     *
     * @param {Event} event
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    change(event: Event) {
        const value = event && event.target ? (event.target as HTMLInputElement).value : event;

        if (!(value as UnternehmenDTO).unternehmenId && !(value as BurOertlicheEinheitXDTO).burOrtEinheitId) {
            this.isSelectedItem = false;
            this.unternehmenDetailsDTO = null;
            this.burOertEinheitDTO = null;
            this.setItemToForm(value);
        }

        this.clearInfoIconDetails();

        this.onChange.emit(value);
    }

    /**
     * The input event triggers every time after a value is modified by the user.
     *
     * It sets the isSelectedItem flag to false if the user has typed anything in the input.
     *
     * @param {Event} event
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    input(event: Event) {
        const value = event && event.target ? (event.target as HTMLInputElement).value : event;

        this.isSelectedItem = false;
        this.setInitialItem(value);
        this.setInitialInputValue(value);
        this.setItemToForm(value);
        this.setReadonlyText();

        this.onInput.emit(value);
    }

    /**
     * The blur event triggers when the element loses the focus.
     *
     * @param {FocusEvent} event
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    blur(event: FocusEvent) {
        this.onBlur.emit(event);
    }

    /**
     * The keyup event triggers when a key is released.
     *
     * @param {KeyboardEvent} event
     * @memberof AvamUnternehmenAutosuggestComponent
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
     * @param {(BurOertlicheEinheitXDTO | UnternehmenDTO)} value
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    select(value: BurOertlicheEinheitXDTO | UnternehmenDTO) {
        this.isSelectedItem = true;
        this.selectedItem = value;

        this.setItemToForm(value);
        this.loadInfoIconData();

        this.onSelect.emit(value);
    }

    /**
     * The clear event triggers when the text is cleared with clear button.
     *
     * @param {*} event
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    clear() {
        this.onClear.emit();
    }

    /**
     *  Clears the infoIconDetails object used for displaying data in the info icon popover.
     *
     * @memberof AvamUnternehmenAutosuggestComponent
     * */
    clearInfoIconDetails() {
        if (this.infoIconDetails && this.infoIconDetails.name !== this.parentForm.controls[this.controlName]['unternehmenAutosuggestObject'].name1) {
            this.infoIconDetails = undefined;
        }
    }

    /**
     * The select event triggers when an item has been selected from the SuchePlus result table.
     *
     * Sets the item to the control's value and to the dynamic property of the autosuggest's control.
     *
     * @param {(UnternehmenDTO | BurOertlicheEinheitXDTO)} value
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    selectFromSuchePlus(item: UnternehmenDTO | BurOertlicheEinheitXDTO) {
        this.parentForm.controls[this.controlName].setValue(item.name1);

        this.isSelectedItem = true;
        this.selectedItem = item;
        if ((item as UnternehmenDTO).unternehmenId || item.burOrtEinheitId) {
            this.loadInfoIconData();
        }
        this.setItemToForm(item);

        this.onSelect.emit(item);

        this.parentForm.controls[this.controlName].markAsDirty();
    }

    /**
     * Opens the modal window when we have SuchePlus functionality.
     *
     * @param {*} suchePlus
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    openSuchePlus() {
        this.fehlermeldungenService.closeMessage();
        const suchePlus = this.modalService.open(AvamUnternehmenSucheComponent, this.modalOptionsXL);
        suchePlus.result
            .then(result => {
                if (result) {
                    this.selectFromSuchePlus(result);
                }
            })
            .catch(() => {});
        suchePlus.componentInstance.label = this.suchePlusLabel;
        suchePlus.componentInstance.isAvamOnly = this.isAvamOnly;
    }

    /**
     * Sets the initial Unternehmen object to selectedItem since it is used for reset and translation.
     *
     * @private
     * @param {*} value
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    private setInitialItem(value) {
        const objID = value ? value.unternehmenId || value.burOrtEinheitId : null;
        this.unternehmenDetailsDTO = null;
        this.burOertEinheitDTO = null;

        if (objID) {
            this.isSelectedItem = true;
            this.selectedItem = value;
            if (value.unternehmenId || value.burOrtEinheitId) {
                this.loadInfoIconData();
            }
        }
    }

    /**
     * Sets the value from the input to the form control.
     *
     * The  Unternehmen object is not directly set to the value of the control, but it is set dynamically to a property of the control.
     * If there is a selectedItem, it is set directly to this property, otherwise the typed text in the input is wrapped into an object
     * with id -1 and then set it to this property of the control.
     *
     * @private
     * @param {*} value
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    private setItemToForm(value) {
        this.checkForValue(value);
        if (this.isSelectedItem) {
            this.parentForm.controls[this.controlName]['unternehmenAutosuggestObject'] = this.selectedItem;
        } else {
            this.selectedItem = undefined;
            this.parentForm.controls[this.controlName]['unternehmenAutosuggestObject'] = {
                unternehmenId: -1,
                name1: value
            };
        }
    }

    /**
     * Set the text in the input field in case of read-only text.
     *
     * @private
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    private setReadonlyText() {
        if (this.isReadOnly) {
            this.inputValue = this.selectedItem && this.selectedItem.name1 ? this.selectedItem.name1 : '';
        }
    }

    private setInitialInputValue(value) {
        if (this.simpleInput && value && value.name1) {
            this.parentForm.controls[this.controlName].setValue(value.name1);
            this.selectedItem = value;
            this.isSelectedItem = true;
            this.loadInfoIconData();
        }
    }

    /**
     * Gets the formatted representation of the Unternehmen object, used in the dropdown result list of the autosuggest.
     *
     * @private
     * @param {*} item
     * @returns
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    private getTranslatedUnternehmen(item) {
        let name = item.name1;

        if (item.name2) {
            name = `${name} ${item.name2}`;
        }

        if (item.name3) {
            name = `${name} ${item.name3}`;
        }

        const strasseNr = item.strasse ? (item.strasseNr ? `${item.strasse} ${item.strasseNr}` : item.strasse) : '';
        const plzOrt = item.plz && item.ortDe ? `${item.plz} ${this.dbTranslateService.translate(item, 'ort')}` : '';

        return {
            name,
            strasseNr,
            plzOrt
        };
    }

    /**
     * Checks if there is a value and updates the 'isSelectedItem' property.
     *
     * @private
     * @param {*} value
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    private checkForValue(value) {
        // If there is no value, there is no selected item.
        if (!value) {
            this.isSelectedItem = false;
        }
    }

    /**
     * Loads the detailed information about the selected Unternehmen.
     *
     * @private
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    private loadInfoIconData() {
        this.spinnerService.activate(this.infoIconChannel);
        if (this.selectedItem.unternehmenId) {
            this.loadDataForUnternehmen();
        } else if (this.selectedItem.burOrtEinheitId) {
            this.loadDataForBurOrtEinheit();
        }
    }

    private loadDataForUnternehmen() {
        this.unternehmenRestService.getUnternehmenDetailsById(this.selectedItem.unternehmenId).subscribe(
            result => {
                this.unternehmenDetailsDTO = result;
                this.mapInfoIconDetails(result);
                this.spinnerService.deactivate(this.infoIconChannel);
            },
            () => {
                this.spinnerService.deactivate(this.infoIconChannel);
            }
        );
    }

    private loadDataForBurOrtEinheit() {
        this.stesDataRestService.getBurOrtEinheitById(this.selectedItem.burOrtEinheitId).subscribe(
            response => {
                this.burOertEinheitDTO = response.data;
                this.mapBurInfoIconDetails(response.data);
                this.spinnerService.deactivate(this.infoIconChannel);
            },
            () => {
                this.spinnerService.deactivate(this.infoIconChannel);
            }
        );
    }

    /**
     * Maps the defailed information about the selected Unternehmen for an appropriate format for the info icon popup.
     *
     * @private
     * @param {*} data
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    private mapInfoIconDetails(data) {
        this.infoIconDetails = {};

        this.infoIconDetails['name'] = this.formatName(data.unternehmen);
        this.infoIconDetails['standortadresse'] = `${data.strasse || ''} ${data.strasseNr || ''}`;
        this.infoIconDetails['plz'] = this.formatPlz(data.unternehmen.plz);
        this.infoIconDetails['gemeinde'] = this.formatGemeinde(data.gemeindeObject);
        this.infoIconDetails['postfach'] = data.postfach || '';
        this.infoIconDetails['postfachplzort'] = this.dbTranslateService.translate(data.postfachPlzObject, 'ort');
        this.infoIconDetails['land'] = data.unternehmen && data.unternehmen.staat ? this.dbTranslateService.translate(data.unternehmen.staat, 'name') : '';
        this.infoIconDetails['telefon'] = data.telefonNr;
        this.infoIconDetails['fax'] = data.telefaxNr;
        this.infoIconDetails['email'] = data.email;
        this.infoIconDetails['webadresse'] = data.url;
        this.infoIconDetails['uidnummer'] = this.formatUID(data.uidOrganisationIdCategorie, data.uidOrganisationId);
        this.infoIconDetails['bur'] = data.unternehmen ? data.unternehmen.burNummer : '';
        this.infoIconDetails['branche'] = this.formatBranche(data.unternehmen.nogaDTO);
        this.infoIconDetails['status'] = data.statusObject ? this.dbTranslateService.translate(data.statusObject, 'text') : '';
        this.infoIconDetails['verweiser'] = data.nachfolgerObject ? data.nachfolgerObject.burNummer : '';
    }

    /**
     * Maps the defailed information about the selected BUR-Extrakt Unternehmen for an appropriate format for the info icon popup.
     *
     * @private
     * @param {*} burData
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    private mapBurInfoIconDetails(burData: BurOertlicheEinheitDTO) {
        this.infoIconDetails = {};

        this.infoIconDetails['name'] = this.formatBurName(burData.letzterAGName1, burData.letzterAGName2, burData.letzterAGName3);
        this.infoIconDetails['standortadresse'] = burData.street && burData.streetNr ? `${burData.street} ${burData.streetNr}` : '';
        this.infoIconDetails['plz'] = this.formatPlz(burData.letzterAGPlzDTO);
        this.infoIconDetails['gemeinde'] = burData.municipalityCode && burData.town ? `${burData.municipalityCode} ${burData.town}` : '';
        this.infoIconDetails['postfach'] = burData.postfachNr || '';
        this.infoIconDetails['postfachplzort'] = burData.postfachPlzDTO
            ? `${burData.postfachPlzDTO.postleitzahl} ${this.dbTranslateService.translate(burData.postfachPlzDTO, 'ort')}`
            : '';
        this.infoIconDetails['land'] = this.dbTranslateService.translate(burData.letzterAGLand, 'name');
        this.infoIconDetails['telefon'] = burData.phoneNumber;
        this.infoIconDetails['uidnummer'] = this.formatUID(burData.uidOrganisationIdCategorie, burData.uidOrganisationId);
        this.infoIconDetails['bur'] = burData.letzterAGBurNummer;
        this.infoIconDetails['verweiser'] = burData.verweiserNr || '';
    }

    /**
     * Formats the Gemeinde for the info icon popup.
     *
     * @private
     * @param {*} gemeindeObject
     * @returns
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    private formatGemeinde(gemeindeObject) {
        return gemeindeObject ? `${gemeindeObject.bfsNummer} ${this.dbTranslateService.translate(gemeindeObject, 'name')}` : '';
    }

    /**
     * Formats the UID for the info icon popup.
     *
     * @private
     * @param {*} uidOrganisationIdCategorie
     * @param {*} uidOrganisationId
     * @returns
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    private formatUID(uidOrganisationIdCategorie, uidOrganisationId) {
        return uidOrganisationIdCategorie && uidOrganisationId ? `${uidOrganisationIdCategorie}-${uidOrganisationId.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}` : '';
    }

    /**
     * Formats the Branche for the info icon popup.
     *
     * @private
     * @param {*} nogaDTO
     * @returns
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    private formatBranche(nogaDTO) {
        return nogaDTO ? `${this.dbTranslateService.translate(nogaDTO, 'textlang')} - ID ${nogaDTO.nogaCodeUp}` : '';
    }

    /**
     * Formats the Name of the Unternehmen for the info icon popup.
     *
     * @private
     * @param {*} unternehmen
     * @returns
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    private formatName(unternehmen) {
        if (!unternehmen) {
            return null;
        }

        let name = `${unternehmen.name1} `;
        if (unternehmen.name2) {
            name += ' ' + unternehmen.name2;
        }

        if (unternehmen.name3) {
            name += ' ' + unternehmen.name3;
        }

        return name;
    }

    /**
     * Formats the Name of the BUR-Extrakt Unternehmen for the info icon popup.
     *
     * @private
     * @param name1
     * @param name2
     * @param name3
     * @memberOf AvamUnternehmenAutosuggestComponent
     */
    private formatBurName(name1: string, name2: string, name3: string): string {
        let name = name1;
        if (name2) {
            name += ' ' + name2;
        }
        if (name3) {
            name += ' ' + name3;
        }
        return name;
    }

    /**
     * Formats the Plz for the info icon popup.
     *
     * @private
     * @param {*} plzObject
     * @returns
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    private formatPlz(plzObject) {
        const ort = plzObject ? this.dbTranslateService.translate(plzObject, 'ort') : '';
        return plzObject ? `${plzObject.postleitzahl} ${ort}` : '';
    }
}
