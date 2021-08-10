import { Component, OnInit, ViewChild, Input, ElementRef, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NgbTypeahead, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Observable, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { TableHeaderObject } from '../table/table.header.object';

import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

const DEBOUNCE_TIME = 200;

@Component({
    selector: 'avam-country-autosuggest-dropdown',
    templateUrl: './land-autosuggest-dropdown.component.html',
    styleUrls: ['./land-autosuggest-dropdown.component.scss']
})
export class LandAutosuggestDropdownComponent implements OnInit, OnDestroy {
    @Input() countriesList: CodeDTO[];
    @Input() parentForm: FormGroup;
    @Input() controlName: string;
    @Input() autosuggestLabel: string;
    @Output() selectItem: EventEmitter<any> = new EventEmitter();
    @Output() writeItem: EventEmitter<any> = new EventEmitter();
    @ViewChild('zielstaat') zielstaat: NgbTypeahead;
    @ViewChild('modalZielstaat') modalZielstaat: ElementRef;
    @ViewChild('ngForm') formInstance: FormGroupDirective;

    countryDropdownFocus = new Subject<string>();
    countryDropdownClick = new Subject<string>();
    headers: TableHeaderObject[] = [];

    selectedItem: CodeDTO | number;

    languageSubscription: Subscription;

    constructor(private dbTranslateService: DbTranslateService, private modalService: NgbModal, private obliqueHelper: ObliqueHelperService) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);
        this.languageSubscription = this.dbTranslateService.getEventEmitter().subscribe(event => {
            this.patchValue();
        });
    }

    ngOnDestroy() {
        this.languageSubscription.unsubscribe();
    }

    patchValue() {
        this.parentForm.get(this.controlName).setValue(this.parentForm.get(this.controlName).value);
    }

    countrySearch = (text: Observable<string>): Observable<number[]> => {
        const debouncedText = text.pipe(
            debounceTime(DEBOUNCE_TIME),
            distinctUntilChanged()
        );
        const clicksWithClosedPopup = this.countryDropdownClick.pipe(filter(() => !this.zielstaat.isPopupOpen()));
        const inputcountryDropdownFocus = this.countryDropdownFocus;

        return merge(debouncedText, inputcountryDropdownFocus, clicksWithClosedPopup).pipe(
            map(term =>
                term === ''
                    ? []
                    : this.countriesList
                          .filter((country: CodeDTO) =>
                              this.countryResultFormatter(country)
                                  .toLowerCase()
                                  .includes(term.toLowerCase())
                          )
                          .map(country => country.codeId)
            )
        );
    };

    getCountyById = (countryId: number): CodeDTO => this.countriesList.filter(country => country.codeId === countryId)[0];

    countryResultFormatter = (country: CodeDTO) => `${country.code} ${this.dbTranslateService.translate(country, 'text')}`;

    countryInputFormatter = (country: CodeDTO) => `${this.dbTranslateService.translate(country, 'text')}`;

    inputFormatter = (countryId: number): string => this.countryInputFormatter(this.getCountyById(countryId));

    resultFormatter = (countryId: number): string => this.countryResultFormatter(this.getCountyById(countryId));

    openModal(content) {
        this.modalService.open(content, { ariaLabelledBy: '', windowClass: 'modal-xs', centered: true, backdrop: 'static' });
    }

    selectFromModal(selectedItem: CodeDTO) {
        this.parentForm.get(this.controlName).setValue(selectedItem.codeId);
    }

    onClear(name) {
        this.parentForm.get(name).reset();
        this.writeItem.emit(null);
    }

    emitSelectItem(item: number) {
        this.setSelectedItem(item);
        this.selectItem.emit(item);
    }

    setSelectedItem(item: number) {
        this.selectedItem = item;
    }
}
