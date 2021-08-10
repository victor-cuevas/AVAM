import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { map } from 'rxjs/operators';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ToolboxService } from '@app/shared/services/toolbox.service';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';

@Component({
    selector: 'avam-sprache-autosuggest',
    templateUrl: './avam-sprache-autosuggest.component.html',
    styleUrls: ['./avam-sprache-autosuggest.component.scss']
})
export class AvamSpracheAutosuggestComponent implements OnInit {
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

    @ViewChild('modal') modal: ElementRef;

    /**
     * Stores the is read only of the Sprache autosuggest for read-only input.
     *
     * @public
     * @memberof AvamSpracheAutosuggestComponent
     */
    isReadOnly = false;

    /**
     * Stores the data about all languages, used in the modal.
     *
     * @type {*}
     * @memberof AvamSpracheAutosuggestComponent
     */
    alleSprachen: any[];

    /**
     * Stores the last Sprache data either from getting the initial data or from selecting an item from the result list.
     *
     * @private
     * @memberof AvamSpracheAutosuggestComponent
     */
    private selectedItem;

    /**
     * Indicates whether an item has been selected from the result list.
     *
     * @private
     * @memberof AvamSpracheAutosuggestComponent
     */
    private isSelectedItem = false;

    /**
     * Stores the Sprache data for read-only input.
     *
     * @private
     * @memberof AvamSpracheAutosuggestComponent
     */
    private inputObject;

    /**
     * Stores the translated input value of the Sprache data for read-only input.
     *
     * @private
     * @memberof AvamSpracheAutosuggestComponent
     */
    private inputValue = '';

    /**
     * Reference to the modal window which opens when we have Sprache auswählen functionality.
     *
     * @private
     * @type {NgbModalRef}
     * @memberof AvamSpracheAutosuggestComponent
     */
    private modalWindow: NgbModalRef;

    /**
     * Options available when opening new modal windows.
     *
     * @private
     * @type {NgbModalOptions}
     * @memberof AvamUnternehmenAutosuggestComponent
     */
    private modalOptionsXL: NgbModalOptions;

    private modalToolboxId = 'table-modal';
    private originalChannel: string;

    constructor(
        private stesDataRestService: StesDataRestService,
        private translateService: TranslateService,
        private dbTranslateService: DbTranslateService,
        private obliqueHelper: ObliqueHelperService,
        private readonly modalService: NgbModal
    ) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);

        this.dbTranslateService.getEventEmitter().subscribe(() => {
            if (this.isReadOnly) {
                this.inputValue = this.dbTranslateService.translate(this.inputObject, 'kurzText');
            }

            if (this.selectedItem) {
                this.parentForm.controls[this.controlName].setValue(this.selectedItem);
            }
        });

        this.stesDataRestService.getSprachen(this.translateService.currentLang, '*').subscribe(data => {
            this.alleSprachen = data;
        });

        this.modalOptionsXL = { ariaLabelledBy: 'modal-basic-title', windowClass: 'test', backdrop: 'static' } as NgbModalOptions;
    }

    /**
     * Searches and returns all languages with matching search criteria.
     *
     * @param {string} term
     * @memberof AvamSpracheAutosuggestComponent
     */
    searchSprache = (term: string) =>
        this.stesDataRestService.getSprachen(this.translateService.currentLang, term).pipe(
            map(a => {
                return a.map(item => {
                    return {
                        codeId: item.codeId,
                        kurzTextDe: item.kurzTextDe,
                        kurzTextFr: item.kurzTextFr,
                        kurzTextIt: item.kurzTextIt,
                        value: this.dbTranslateService.translate(item, 'kurzText')
                    };
                });
            })
        );

    /**
     * The formatter of the item in the input field.
     *
     * @param {CodeDTO} result
     * @memberof AvamSpracheAutosuggestComponent
     */
    inputFormatter = (result: CodeDTO) =>
        result && result.kurzTextDe ? (result.codeId !== -1 ? `${this.dbTranslateService.translate(result, 'kurzText')}` : result.kurzTextDe) : '';

    /**
     * The change event triggers when the element has finished changing that means that the event occurs when it loses focus.
     *
     * @param {Event} event
     * @memberof AvamSpracheAutosuggestComponent
     */
    change(event: Event) {
        const value = event && event instanceof Event ? (event.target as HTMLInputElement).value : event;

        if (!this.isSelectedItem && (typeof value === 'string' || typeof value === 'number')) {
            this.parentForm.controls[this.controlName].setValue({ codeId: -1, kurzTextDe: value });
        }

        this.onChange.emit(value);
    }

    /**
     * The input event triggers every time after a value is modified by the user.
     *
     * It sets the isSelectedItem flag to false if the user has typed anything in the input.
     *
     * @param {(Event |CodeDTO )} event
     * @memberof AvamSpracheAutosuggestComponent
     */
    input(event: Event | CodeDTO) {
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
     * @memberof AvamSpracheAutosuggestComponent
     */
    blur(event: FocusEvent) {
        this.onBlur.emit(event);
    }

    /**
     * The keyup event triggers when a key is released.
     *
     * @param {KeyboardEvent} event
     * @memberof AvamSpracheAutosuggestComponent
     */
    keyup(event: KeyboardEvent) {
        if (!this.isSelectedItem) {
            this.parentForm.controls[this.controlName].setValue({ codeId: -1, kurzTextDe: (event.target as any).value });
        }

        this.onKeyup.emit(event);
    }

    /**
     * The select event triggers when an item has been selected from the dropdown result list.
     *
     * It sets the isSelectedItem flag to true since the item has been selected from the result list
     * and stores the selected item in selectedItem.
     *
     * @param {CodeDTO} value
     * @memberof AvamSpracheAutosuggestComponent
     */
    select(value: CodeDTO) {
        this.isSelectedItem = true;
        this.selectedItem = value;
        this.setItemToForm(value);
    }

    /**
     * Openes the modal for selecting a language.
     *
     * @memberof AvamSpracheAutosuggestComponent
     */
    openModal() {
        this.originalChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = this.modalToolboxId;
        this.modalService.open(this.modal, this.modalOptionsXL).result.then(
            () => {
                ToolboxService.CHANNEL = this.originalChannel;
            },
            () => {
                ToolboxService.CHANNEL = this.originalChannel;
            }
        );
    }

    /**
     * Closes the modal for selecting a language
     *
     * @memberof AvamSpracheAutosuggestComponent
     */
    closeModal() {
        ToolboxService.CHANNEL = this.originalChannel;
    }

    /**
     * The select event triggers when an item has been selected from the modal window.
     *
     * Sets the item to the control's value and to the dynamic property of the autosuggest's control.
     *
     * @param {*} row
     * @memberof AvamSpracheAutosuggestComponent
     */
    selectRow(row) {
        const selectedItem = this.alleSprachen.find(sprache => Number(sprache.code) === row.code);
        this.parentForm.controls[this.controlName].setValue(selectedItem);

        this.isSelectedItem = true;
        this.selectedItem = selectedItem;
        this.setItemToForm(selectedItem);

        this.onSelect.emit(selectedItem);

        this.parentForm.controls[this.controlName].markAsDirty();
    }

    /**
     * Sets the readonly text and object.
     *
     * @private
     * @param {*} value
     * @memberof AvamSpracheAutosuggestComponent
     */
    private setReadOnlyText(value) {
        this.inputObject = value;
        this.inputValue = this.dbTranslateService.translate(value, 'text');
    }

    /**
     * Sets the initial Sprache object to selectedItem since it is used for reset and translation.
     *
     * @private
     * @param {*} value
     * @memberof AvamSpracheAutosuggestComponent
     */
    private setInitialItem(value) {
        if (value && value.codeId) {
            this.isSelectedItem = true;
            this.selectedItem = value;
        }
    }

    /**
     * Sets the value from the input to the form control.
     *
     * The Sprache object is not directly set to the value of the control, but it is set dynamically to a property of the control.
     * If there is a selectedItem, it is set directly to this property, otherwise the typed text in the input is wrapped into an object
     * with id -1 and then set it to this property of the control.
     *
     * @private
     * @param {*} value
     * @memberof AvamSpracheAutosuggestComponent
     */
    private setItemToForm(value) {
        this.checkForValue(value);

        if (this.isSelectedItem) {
            this.parentForm.controls[this.controlName]['autosuggestObject'] = this.selectedItem;
        } else {
            this.selectedItem = undefined;
            if (value === null || value === '') {
                this.parentForm.controls[this.controlName]['autosuggestObject'] = undefined;
            } else {
                this.parentForm.controls[this.controlName]['autosuggestObject'] = { codeId: -1, kurzTextDe: value };
            }
        }
    }

    /**
     * Checks if there is a value and updates the 'isSelectedItem' property.
     *
     * @private
     * @param {*} value
     * @memberof AvamSpracheAutosuggestComponent
     */
    private checkForValue(value) {
        // If there is no value, there is no selected item.
        if (!value) {
            this.isSelectedItem = false;
        }
    }
}
