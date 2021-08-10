import { Component, Input, forwardRef } from '@angular/core';
import { switchMap, distinctUntilChanged, debounceTime, tap, catchError, takeUntil } from 'rxjs/operators'; //NOSONAR
import { of } from 'rxjs';
import { Observable } from 'rxjs';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AutosuggestBase } from '@shared/classes/autosuggest-base';
import { StringHelper } from '@shared/helpers/string.helper';
import { NgbTypeaheadConfig } from '@ng-bootstrap/ng-bootstrap';

export function ngbTypeaheadBottomPlacementConfig(): NgbTypeaheadConfig {
    const typeaheadConfig = new NgbTypeaheadConfig();
    typeaheadConfig.placement = ['bottom-left', 'bottom-right', 'bottom'];
    return typeaheadConfig;
}

@Component({
    selector: 'app-autosuggest-input',
    templateUrl: './autosuggest-input.component.html',
    styleUrls: ['./autosuggest-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AutosuggestInputComponent),
            multi: true
        },
        { provide: NgbTypeaheadConfig, useFactory: ngbTypeaheadBottomPlacementConfig }
    ]
})
export class AutosuggestInputComponent extends AutosuggestBase {
    displayInfoPopoverSpinner = true;
    data: {};

    constructor() {
        super();
    }

    @Input() search = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => (this.searching = true)),
            switchMap(term => {
                //NOSONAR
                if (term) {
                    term = StringHelper.replaceAll(term, '/', '');

                    return this.searchFunction(term).pipe(
                        tap(() => (this.searchFailed = false)),
                        catchError(() => {
                            this.searchFailed = true;
                            return of([]);
                        })
                    );
                } else {
                    return of([]);
                }
            }),
            tap(() => (this.searching = false))
        );

    fetchInfo() {
        this.displayInfoPopoverSpinner = true;
        this.data = {};

        this.dataFunction(this.selectedItem[this.selectedItemId])
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                data => {
                    this.data = data;
                },
                () => {
                    this.displayInfoPopoverSpinner = false;
                },
                () => {
                    this.displayInfoPopoverSpinner = false;
                }
            );
    }
}
