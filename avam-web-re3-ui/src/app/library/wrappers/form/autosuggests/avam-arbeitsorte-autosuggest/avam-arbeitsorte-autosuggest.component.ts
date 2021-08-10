import { Component, OnInit, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { map } from 'rxjs/operators';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegionDTO } from '@dtos/regionDTO';

@Component({
    selector: 'avam-arbeitsorte-autosuggest',
    templateUrl: './avam-arbeitsorte-autosuggest.component.html',
    styleUrls: ['./avam-arbeitsorte-autosuggest.component.scss']
})
export class AvamArbeitsorteAutosuggestComponent implements OnInit {
    @Input() parentForm: FormGroup;
    @Input() controlName: any;
    @Input() placeholder: string;
    @Input() componentLabel: string;
    @Input() isDisabled: boolean;
    @Input() readOnly = false;
    @Input() tooltip: string;
    @Input() container = '';
    @Input() scrollIntoView = true;

    @Output() onKeyup: EventEmitter<any> = new EventEmitter();
    @Output() onInput: EventEmitter<any> = new EventEmitter();
    @Output() onChange: EventEmitter<any> = new EventEmitter();
    @Output() onBlur: EventEmitter<any> = new EventEmitter();
    @Output() onSelect: EventEmitter<any> = new EventEmitter();

    @ViewChild('ngForm') formInstance: FormGroupDirective;

    // Autosuggest - AS016

    /**
     * Stores the last data either from getting the initial data or from selecting an item from the result list.
     *
     * @private
     * @memberof AvamArbeitsorteAutosuggestComponent
     */
    private selectedItem: RegionDTO;

    /**
     * Indicates whether an item has been selected from the result list.
     *
     * @private
     * @memberof AvamArbeitsorteAutosuggestComponent
     */
    private isSelectedItem = false;

    /**
     * Stores the region data for read-only input.
     *
     * @private
     * @memberof AvamArbeitsorteAutosuggestComponent
     */
    private inputObject;

    /**
     * Stores the translated input value of the region data for read-only input.
     *
     * @private
     * @memberof AvamArbeitsorteAutosuggestComponent
     */
    private inputValue = '';

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
            if (this.readOnly) {
                this.inputValue = this.dbTranslateService.translate(this.inputObject, 'region');
            }

            if (this.selectedItem) {
                this.parentForm.controls[this.controlName].setValue(this.selectedItem);
            }
        });
    }

    open(content) {
        this.modalService.open(content, { ariaLabelledBy: 'regionen-basic-title', windowClass: 'modal-md' });
    }

    fillData(event) {
        this.isSelectedItem = true;
        this.setInitialItem(event.data);
        this.setItemToForm(event.data);
        this.parentForm.controls[this.controlName].setValue(this.selectedItem);
    }

    /**
     * Searches and returns all elements with matching search criteria.
     *
     * @memberof AvamArbeitsorteAutosuggestComponent
     */
    searchRegion = (term: string) =>
        this.stesDataRestService.getRegion(this.translateService.currentLang, term).pipe(
            map(a => {
                return a.map(item => {
                    return {
                        code: item.code,
                        kanton: item.kanton,
                        merkmal: item.merkmal,
                        regionDe: item.regionDe,
                        regionFr: item.regionFr,
                        regionId: item.regionId,
                        regionIt: item.regionIt,
                        translatedName: this.dbTranslateService.translate(item, 'region')
                    };
                });
            })
        );
    /**
     * The formatter of the item in the input field.
     *
     * @memberof AvamArbeitsorteAutosuggestComponent
     */
    inputFormatter = (result: RegionDTO) => `${result.code.trim()} - ${this.dbTranslateService.translate(result, 'region')}`;

    /**
     * The change event triggers when the element has finished changing that means that the event occurs when it loses focus.
     *
     * @param {Event} event
     * @memberof AvamArbeitsorteAutosuggestComponent
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
     * @param {Event} event
     * @memberof AvamArbeitsorteAutosuggestComponent
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
     * @memberof AvamArbeitsorteAutosuggestComponent
     */
    blur(event: FocusEvent) {
        this.onBlur.emit(event);
    }

    /**
     * The keyup event triggers when a key is released.
     *
     * @param {KeyboardEvent} event
     * @memberof AvamArbeitsorteAutosuggestComponent
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
     * @param {*} value
     * @memberof AvamArbeitsorteAutosuggestComponent
     */
    select(value: RegionDTO) {
        this.isSelectedItem = true;
        this.selectedItem = value;
        this.setItemToForm(value);
    }

    /**
     * Sets the readonly text and object.
     *
     * @private
     * @param {*} value
     * @memberof AvamArbeitsorteAutosuggestComponent
     */
    private setReadOnlyText(value) {
        this.inputObject = value;
        this.inputValue = this.dbTranslateService.translate(value, 'region');
    }

    /**
     * Sets the initial object to selectedItem since it is used for reset and translation.
     *
     * @private
     * @param {*} value
     * @memberof AvamArbeitsorteAutosuggestComponent
     */
    private setInitialItem(value) {
        if (value && value.code) {
            this.selectedItem = value;
        }
    }

    /**
     * Sets the value from the input to the form control.
     *
     *
     * @private
     * @param {*} value
     * @memberof AvamArbeitsorteAutosuggestComponent
     */
    private setItemToForm(value) {
        if (typeof value === 'string') {
            this.selectedItem = undefined;
            this.parentForm.controls[this.controlName]['arbeitsorteAutosuggestObject'] = { code: -1, regionDe: value };
        } else {
            this.parentForm.controls[this.controlName]['arbeitsorteAutosuggestObject'] = this.selectedItem;
        }
    }
}
