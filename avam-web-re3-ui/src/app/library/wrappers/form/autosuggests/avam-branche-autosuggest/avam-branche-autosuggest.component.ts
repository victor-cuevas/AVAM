import { Component, OnInit, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { NogaDTO } from '@app/shared/models/dtos-generated/nogaDTO';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

@Component({
    selector: 'avam-branche-autosuggest',
    templateUrl: './avam-branche-autosuggest.component.html',
    styleUrls: ['./avam-branche-autosuggest.component.scss']
})
export class AvamBrancheAutosuggestComponent implements OnInit {
    @Input() parentForm: FormGroup;
    @Input() controlName: any;
    @Input() placeholder: string;
    @Input() componentLabel: string;
    @Input() isDisabled: boolean;
    @Input() readOnly: boolean;
    @Input() tooltip: string;

    @Output() onKeyup: EventEmitter<any> = new EventEmitter();
    @Output() onInput: EventEmitter<any> = new EventEmitter();
    @Output() onChange: EventEmitter<any> = new EventEmitter();
    @Output() onBlur: EventEmitter<any> = new EventEmitter();
    @Output() onSelect: EventEmitter<any> = new EventEmitter();

    @ViewChild('ngForm') formInstance: FormGroupDirective;

    /**
     * Stores the last Branche data either from getting the initial data or from selecting an item from the result list.
     *
     * @private
     * @memberof AvamBrancheAutosuggestComponent
     */
    private selectedItem;

    /**
     * Indicates whether an item has been selected from the result list.
     *
     * @private
     * @memberof AvamBrancheAutosuggestComponent
     */
    private isSelectedItem = false;

    /**
     * Stores the Branche data for read-only input.
     *
     * @private
     * @memberof AvamBrancheAutosuggestComponent
     */
    private inputObject;

    /**
     * Stores the translated input value of the Branche data for read-only input.
     *
     * @private
     * @memberof AvamBrancheAutosuggestComponent
     */
    private inputValue = '';

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
                this.inputValue = this.dbTranslateService.translate(this.inputObject, 'textlang');
            }

            if (this.selectedItem) {
                this.parentForm.controls[this.controlName].setValue(this.selectedItem);
            }
        });
    }

    /**
     * Searches and returns all countries with matching search criteria.
     *
     * @param {string} term
     * @memberof AvamBrancheAutosuggestComponent
     */
    searchBranche = (term: string) =>
        this.stesDataRestService.getNoga(this.translateService.currentLang, term).pipe(
            map(a => {
                return a.map(item => {
                    return {
                        nogaCodeUp: item.nogaCodeUp,
                        nogaId: item.nogaId,
                        textlangDe: item.textlangDe,
                        textlangFr: item.textlangFr,
                        textlangIt: item.textlangIt,
                        translatedTextlang: this.dbTranslateService.translate(item, 'textlang')
                    };
                });
            })
        );

    /**
     * The formatter of the item in the input field.
     *
     * @param {NogaDTO} result
     * @memberof AvamBrancheAutosuggestComponent
     */
    inputFormatter = (result: NogaDTO) => (result.nogaId === -1 ? result.textlangDe : `${result.nogaCodeUp} / ${this.dbTranslateService.translate(result, 'textlang')}`);

    /**
     * The change event triggers when the element has finished changing that means that the event occurs when it loses focus.
     *
     * @param {Event} event
     * @memberof AvamBrancheAutosuggestComponent
     */
    change(event: Event) {
        const value = event && event.target ? (event.target as HTMLInputElement).value : event.target;

        this.onChange.emit(value);
    }

    /**
     * The input event triggers every time after a value is modified by the user.
     *
     * It sets the isSelectedItem flag to false if the user has typed anything in the input.
     *
     * @param {(Event | NogaDTO)} event
     * @memberof AvamBrancheAutosuggestComponent
     */
    input(event: Event | NogaDTO) {
        const value = event && event instanceof Event ? (event.target as HTMLInputElement).value : event;

        this.isSelectedItem = false;
        this.setInitialItem(value);
        this.setReadOnlyText(value);

        this.setItemToForm(value);
        this.onInput.emit(value);
    }

    /**
     * The blur event triggers when the element loses the focus.
     *
     * @param {FocusEvent} event
     * @memberof AvamBrancheAutosuggestComponent
     */
    blur(event: FocusEvent) {
        this.onBlur.emit(event);
    }

    /**
     * The keyup event triggers when a key is released.
     *
     * @param {KeyboardEvent} event
     * @memberof AvamBrancheAutosuggestComponent
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
     * @param {NogaDTO} value
     * @memberof AvamBrancheAutosuggestComponent
     */
    select(value: NogaDTO) {
        this.isSelectedItem = true;
        this.selectedItem = value;
        this.setItemToForm(value);
        this.setReadOnlyText(value);
    }

    /**
     * Sets the readonly text and object.
     *
     * @private
     * @param {*} value
     * @memberof AvamBrancheAutosuggestComponent
     */
    private setReadOnlyText(value) {
        if (value && value.nogaCodeUp) {
            this.inputValue = `${value.nogaCodeUp} / ${this.dbTranslateService.translate(value, 'textlang')}`;
        } else {
            this.inputValue = value;
        }
        this.inputObject = value;
    }

    /**
     * Sets the initial Land object to selectedItem since it is used for reset and translation.
     *
     * @private
     * @param {*} value
     * @memberof AvamLandAutosuggestComponent
     */
    private setInitialItem(value) {
        if (value && value.nogaId) {
            this.isSelectedItem = true;
            this.selectedItem = value;
        }
    }

    /**
     * Sets the value from the input to the form control.
     *
     * @private
     * @param {*} value
     * @memberof AvamBrancheAutosuggestComponent
     */
    private setItemToForm(value) {
        this.checkForValue(value);

        if (this.isSelectedItem) {
            this.parentForm.controls[this.controlName]['branchAutosuggestObj'] = this.selectedItem;
        } else {
            this.selectedItem = undefined;
            this.parentForm.controls[this.controlName]['branchAutosuggestObj'] = { nogaId: -1, textlangDe: value };
        }
    }

    /**
     * Checks if there is a value and updates the 'isSelectedItem' property.
     *
     * @private
     * @param {*} value
     * @memberof AvamBrancheAutosuggestComponent
     */
    private checkForValue(value) {
        // If there is no value, there is no selected item.
        if (!value) {
            this.isSelectedItem = false;
        }
    }
}
