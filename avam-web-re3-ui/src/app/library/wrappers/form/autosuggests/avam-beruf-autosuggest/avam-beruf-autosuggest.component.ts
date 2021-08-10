import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { GeschlechtPipe } from '@app/shared/pipes/geschlecht.pipe';
import { StesStoreService } from '@app/modules/stes/stes-store.service';
import { Observable, of, Subject } from 'rxjs';
import { BerufDTO } from '@dtos/berufDTO';
import { isNumeric } from 'rxjs/internal-compatibility';
import { CoreAutosuggestComponent } from '@app/library/core/core-autosuggest/core-autosuggest.component';

@Component({
    selector: 'avam-beruf-autosuggest',
    templateUrl: './avam-beruf-autosuggest.component.html',
    styleUrls: ['./avam-beruf-autosuggest.component.scss']
})
export class AvamBerufAutosuggestComponent implements OnInit {
    /**
     * Sets read only state dynamically if we have selected item.
     *
     * @memberof AvamBerufAutosuggestComponent
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
    @Input() showAllFilterOptions = false;
    @Input() container = '';
    @Input() scrollIntoView = true;

    @Input() set selectedFilterOption(filterOption: string) {
        this.gueltigkeitStatus = filterOption;
    }

    @Output() onKeyup: EventEmitter<any> = new EventEmitter();
    @Output() onInput: EventEmitter<any> = new EventEmitter();
    @Output() onChange: EventEmitter<any> = new EventEmitter();
    @Output() onBlur: EventEmitter<any> = new EventEmitter();
    @Output() onSelect: EventEmitter<any> = new EventEmitter();

    @ViewChild('ngForm') formInstance: FormGroupDirective;
    @ViewChild('filterDropdown') filterDropdown;
    @ViewChild('inputElement') inputElement: CoreAutosuggestComponent;

    isReadOnly: boolean;
    gueltigkeitStatus = 'active';

    filterOptions = [
        { value: 'active', labelFr: 'actif', labelIt: 'attivo', labelDe: 'aktiv' },
        { value: 'inactive', labelFr: 'inactif', labelIt: 'inattivo', labelDe: 'inaktiv' }
    ];

    /**
     * Stores the last Beruf data either from getting the initial data or from selecting an item from the result list.
     *
     * @private
     * @memberof AvamBerufAutosuggestComponent
     */
    private selectedItem;

    /**
     * Indicates whether an item has been selected from the result list.
     *
     * @private
     * @memberof AvamBerufAutosuggestComponent
     */
    private isSelectedItem = false;

    /**
     * Stores the Beruf data for read-only input.
     *
     * @private
     * @memberof AvamBerufAutosuggestComponent
     */
    private inputObject;

    /**
     * Stores the translated input value of the Beruf data for read-only input.
     *
     * @private
     * @memberof AvamBerufAutosuggestComponent
     */

    private inputValue = '';

    /**
     * The gender of the current STES.
     *
     * @private
     * @memberof AvamBerufAutosuggestComponent
     */
    private gender;

    /**
     * Max numeber of results proposed in the autosuggest
     *
     * @private
     * @memberof AvamBerufAutosuggestComponent
     */
    private MAX_AUTOSUGGEST_RESULTS = 50;

    /**
     * Subject used to store the results of the service call. Initialised empty.
     *
     * @private
     * @memberof AvamBerufAutosuggestComponent
     */
    private berufeSubject: Subject<BerufDTO[]> = new Subject<BerufDTO[]>();

    /**
     * Flag to avoid multiple service calls as long as the Berufe are not locally stored
     *
     * @private
     * @memberof AvamBerufAutosuggestComponent
     */
    private searchDone = false;

    constructor(
        private stesDataRestService: StesDataRestService,
        private dbTranslateService: DbTranslateService,
        private translateService: TranslateService,
        private obliqueHelper: ObliqueHelperService,
        private geschlechtPipe: GeschlechtPipe,
        private stesStore: StesStoreService
    ) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);

        this.dbTranslateService.getEventEmitter().subscribe(() => {
            if (this.readOnly) {
                this.inputValue = this.formatValue(this.inputObject);
            }

            if (this.selectedItem) {
                this.parentForm.controls[this.controlName].setValue(this.selectedItem);
            }
        });

        this.stesStore.data$.subscribe((stes: any) => {
            if (stes.length > 0) {
                this.gender = stes[0].data.geschlecht;
            }
        });

        if (this.showAllFilterOptions) {
            this.filterOptions.push({ value: 'all', labelFr: 'tous', labelIt: 'tutti', labelDe: 'alle' });
        }
    }

    /**
     * Searches and returns all jobs with matching search criteria.
     *
     * @param {string} term
     * @memberof AvamBerufAutosuggestComponent
     */
    searchBeruf = (term: string) => {
        if (this.stesStore.allBerufeList && this.stesStore.allBerufeList.length > 0 && !this.showFilter) {
            return this.processBerufeList(of(this.stesStore.allBerufeList), term);
        } else {
            if (!this.searchDone || this.showFilter) {
                this.getAllBerufe();
            }
            return this.processBerufeList(this.berufeSubject.asObservable(), term);
        }
    };

    /**
     * The formatter of the item in the input field.
     *
     * @param {BerufDTO} result
     * @memberof AvamBerufAutosuggestComponent
     */
    inputFormatter = (result: BerufDTO) => this.formatValue(result);

    /**
     * The change event triggers when the element has finished changing that means that the event occurs when it loses focus.
     *
     * @param {*} event
     * @memberof AvamBerufAutosuggestComponent
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
     * @param {(Event | BerufDTO)} event
     * @memberof AvamBerufAutosuggestComponent
     */
    input(event: Event | BerufDTO) {
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
     * @memberof AvamBerufAutosuggestComponent
     */
    blur(event: FocusEvent) {
        this.onBlur.emit(event);
    }

    /**
     * The keyup event triggers when a key is released.
     *
     * @param {KeyboardEvent} event
     * @memberof AvamBerufAutosuggestComponent
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
     * @param {BerufDTO} value
     * @memberof AvamLandAutosuggestComponent
     */
    select(value: BerufDTO) {
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
        this.inputValue = this.formatValue(value);
    }

    /**
     * Sets the initial Land object to selectedItem since it is used for reset and translation.
     *
     * @private
     * @param {*} value
     * @memberof AvamLandAutosuggestComponent
     */
    private setInitialItem(value) {
        if (value && value.berufId) {
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
        if (this.isSelectedItem) {
            this.parentForm.controls[this.controlName]['berufAutosuggestObject'] = this.selectedItem;
        } else {
            this.selectedItem = undefined;
            this.parentForm.controls[this.controlName]['berufAutosuggestObject'] = { berufId: -1, nameDe: value, bezeichnungMaDe: value };
        }
    }

    /**
     * Converts the BE object to an object with properties, set according the selected language and the gender of the STES.
     *
     * @private
     * @param {BerufDTO} item
     * @returns
     * @memberof AvamBerufAutosuggestComponent
     */
    private getGenderSpecificTranslatedObject(item: BerufDTO) {
        const bezeichnung = this.dbTranslateService.translate(item, this.geschlechtPipe.transform('bezeichnung', this.gender));
        const anerkennung =
            item.anerkennungsformObject && item.anerkennungsformObject.textDe
                ? this.dbTranslateService.translate(item.anerkennungsformObject, 'text')
                : this.dbTranslateService.instant('amm.beruf.anerkennungNichtDefiniert');
        const bfsStammcode = item.chIscoBeruf ? item.chIscoBeruf.bfsStammcode : '';
        const chIscoBeruf = item.chIscoBeruf
            ? this.dbTranslateService.translate(item.chIscoBeruf, 'berufsArt')
            : this.dbTranslateService.instant('amm.beruf.chIscoBerufNichtDefiniert');

        return {
            bezeichnung,
            anerkennung,
            bfsStammcode,
            chIscoBeruf
        };
    }

    /**
     * Formats the selected value.
     *
     * @private
     * @param {BerufDTO} item
     * @returns {string}
     * @memberof AvamBerufAutosuggestComponent
     */
    private formatValue(item: BerufDTO): string {
        return `${this.dbTranslateService.translate(item, this.geschlechtPipe.transform('bezeichnung', this.gender))}`;
    }

    /**
     * Processes (filters) the Berufe list through the search term to give the suggested options.
     *
     * @private
     * @param {Observable<BerufDTO[]>} observableOfBerufe
     * @param {string} term
     * @returns {Observable<any>}
     * @memberof AvamBerufAutosuggestComponent
     */
    private processBerufeList(observableOfBerufe: Observable<BerufDTO[]>, term: string): Observable<any> {
        return observableOfBerufe.pipe(
            map(berufeList => {
                return berufeList
                    .filter(b => this.filterBerufeByTerm(b, term))
                    .sort((b1, b2) => this.compareByLanguageAndGender(b1, b2))
                    .slice(0, berufeList.length > this.MAX_AUTOSUGGEST_RESULTS ? this.MAX_AUTOSUGGEST_RESULTS : berufeList.length)
                    .map(item => {
                        item['genderSpecificTranslatedObject'] = this.getGenderSpecificTranslatedObject(item);
                        return item;
                    });
            })
        );
    }

    /**
     * Filter function to check if the search term matches the Beruf.
     * It term is numeric the bfsStammcode is checked, otherwise a match is searched in the Beruf bezeichnung and berufsArt.
     *
     * @private
     * @param {BerufDTO} beruf
     * @param {string} term
     * @returns {boolean}
     * @memberof AvamBerufAutosuggestComponent
     */
    private filterBerufeByTerm(beruf: BerufDTO, term: string): boolean {
        if (isNumeric(term) && beruf.chIscoBeruf) {
            return beruf.chIscoBeruf.bfsStammcode.toString().includes(term.trim());
        } else {
            return (
                this.dbTranslateService
                    .translate(beruf, this.getBezeichnung())
                    .toLowerCase()
                    .search(term.toLowerCase()) !== -1 ||
                (beruf.chIscoBeruf
                    ? this.dbTranslateService
                          .translate(beruf.chIscoBeruf, 'berufsArt')
                          .toLowerCase()
                          .search(term.toLowerCase()) !== -1
                    : false)
            );
        }
    }

    /**
     * Compares two Berufe on the bezeichnung field based on current language and gender
     *
     * @private
     * @param {BerufDTO} b1
     * @param {BerufDTO} b2
     * @returns {number}
     * @memberof AvamBerufAutosuggestComponent
     */
    private compareByLanguageAndGender(b1: BerufDTO, b2: BerufDTO): number {
        return b1[this.getBezeichnung() + this.capitalize(this.translateService.currentLang)].localeCompare(
            b2[this.getBezeichnung() + this.capitalize(this.translateService.currentLang)]
        );
    }

    /**
     * Turns to uppercase the first letter of the string
     *
     * @private
     * @param {string} str
     * @returns {string}
     * @memberof AvamBerufAutosuggestComponent
     */
    private capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Executes the service call to fill the list of all Berufe.
     *
     * @private
     * @memberof AvamBerufAutosuggestComponent
     */
    private getAllBerufe(): void {
        this.stesDataRestService.searchAllBerufe(this.filterDropdown ? this.filterDropdown.nativeElement.value : this.gueltigkeitStatus).subscribe(response => {
            this.stesStore.allBerufeList = response;
            this.berufeSubject.next(response);
        });
        this.searchDone = true;
    }

    /**
     * Returns the right text field depending on the gender.
     *
     * @private
     * @returns {string}
     * @memberof AvamBerufAutosuggestComponent
     */
    private getBezeichnung(): string {
        if (!this.gender) {
            this.gender = this.stesStore.stesAnmeldungGeschlecht;
        }
        return this.gender === 'F' ? 'bezeichnungWe' : 'bezeichnungMa';
    }
}
