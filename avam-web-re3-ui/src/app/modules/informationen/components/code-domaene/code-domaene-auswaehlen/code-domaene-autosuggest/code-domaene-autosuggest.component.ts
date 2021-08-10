import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { CodeDataRestService } from '@app/core/http/code-data-rest.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DomainDTO } from '@app/shared/models/dtos-generated/domainDTO';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { map } from 'rxjs/operators';

@Component({
    selector: 'avam-code-domaene-autosuggest',
    templateUrl: './code-domaene-autosuggest.component.html',
    styleUrls: ['./code-domaene-autosuggest.component.scss']
})
export class CodeDomaeneAutosuggestComponent implements OnInit {
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

    // Autosuggest - AS018

    /**
     * Stores the last data either from getting the initial data, from selecting an item from the result list or from the modal window.
     *
     * @private
     * @memberof CodeDomaeneAutosuggestComponent
     */
    private selectedItem: DomainDTO;

    /**
     * Indicates whether an item has been selected from the result list.
     *
     * @private
     * @memberof CodeDomaeneAutosuggestComponent
     */
    private isSelectedItem = false;

    constructor(private readonly modalService: NgbModal, private obliqueHelper: ObliqueHelperService, private codeDataRest: CodeDataRestService) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);
    }

    open(content) {
        this.modalService.open(content, { ariaLabelledBy: 'regionen-basic-title', windowClass: 'modal-md' });
    }

    fillData(event) {
        this.isSelectedItem = true;
        this.setInitialItem(event);
        this.setItemToForm(event);
        this.parentForm.controls[this.controlName].setValue(this.selectedItem);
    }

    /**
     * Searches and returns all elements with matching search criteria.
     *
     * @memberof CodeDomaeneAutosuggestComponent
     */
    searchRegion = (term: string) =>
        this.codeDataRest.codeDomainSearch({ domain: term }).pipe(
            map(a => {
                return a.data.map(item => {
                    return {
                        domain: item.domain,
                        domainId: item.domainId,
                        erfasstAm: item.erfasstAm,
                        erfasstDurch: item.erfasstDurch,
                        geaendertAm: item.geaendertAm,
                        geaendertDurch: item.geaendertDurch,
                        ojbVersion: item.ojbVersion,
                        ownerId: item.ownerId
                    };
                });
            })
        );

    /**
     * The formatter of the item in the input field.
     *
     * @memberof CodeDomaeneAutosuggestComponent
     */
    inputFormatter = (result: CodeDTO) => `${result.domain}`;

    /**
     * The change event triggers when the element has finished changing that means that the event occurs when it loses focus.
     *
     * @param {Event} event
     * @memberof CodeDomaeneAutosuggestComponent
     */
    change(event: Event) {
        const value = event && event.target ? (event.target as HTMLInputElement).value : event;

        this.selectedItem = this.parentForm.controls[this.controlName].value;
        this.onChange.emit(value);
    }

    /**
     * The input event triggers every time after a value is modified by the user.
     *
     * It sets the isSelectedItem flag to false if the user has typed anything in the input.
     *
     * @param {Event} event
     * @memberof CodeDomaeneAutosuggestComponent
     */
    input(event: Event) {
        const value = event && event.target ? (event.target as HTMLInputElement).value : event;

        this.isSelectedItem = false;
        this.setInitialItem(value);
        this.setItemToForm(value);
        this.onInput.emit(value);
        this.selectedItem = this.parentForm.controls[this.controlName].value;
    }

    /**
     * The blur event triggers when the element loses the focus.
     *
     * @param {FocusEvent} event
     * @memberof CodeDomaeneAutosuggestComponent
     */
    blur(event: FocusEvent) {
        this.onBlur.emit(event);
    }

    /**
     * The keyup event triggers when a key is released.
     *
     * @param {KeyboardEvent} event
     * @memberof CodeDomaeneAutosuggestComponent
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
     * @memberof CodeDomaeneAutosuggestComponent
     */
    select(value: DomainDTO) {
        this.isSelectedItem = true;
        this.selectedItem = value;
        this.setItemToForm(value);
    }

    /**
     * Sets the initial object to selectedItem since it is used for reset and translation.
     *
     * @private
     * @param {*} value
     * @memberof CodeDomaeneAutosuggestComponent
     */
    private setInitialItem(value) {
        this.selectedItem = value;
    }

    /**
     * Sets the value from the input to the form control.
     *
     *
     * @private
     * @param {*} value
     * @memberof CodeDomaeneAutosuggestComponent
     */
    private setItemToForm(value) {
        if (typeof value === 'string') {
            this.selectedItem = undefined;
            this.parentForm.controls[this.controlName]['domainAutosuggestObject'] = { domainId: -1, domain: value };
        } else {
            this.parentForm.controls[this.controlName]['domainAutosuggestObject'] = this.selectedItem;
        }
    }
}
