import { Component, forwardRef, Input, OnInit, Renderer2, ViewChild, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormGroup } from '@angular/forms';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { AutosuggestControlValueAccessor } from '../../classes/autosuggest-control-value-accessor';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { StatusEnum } from '@shared/classes/fixed-codes';
import { SchlagwortDTO } from '@shared/models/dtos-generated/schlagwortDTO';

export enum geschaeftsartEnum {
    STES = '1',
    OSTE = '4'
}

@Component({
    selector: 'app-schlagworte-autosuggest',
    templateUrl: './schlagworte-autosuggest.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SchlagworteAutosuggestInputComponent),
            multi: true
        }
    ]
})
export class SchlagworteAutosuggestInputComponent extends AutosuggestControlValueAccessor implements OnInit {
    @Input() showLabel: boolean;
    @Input() alignLeft = false;
    @Input() label = 'stes.label.schlagwort';
    @Input() labels: string[] = [];
    @Input() selectedItemId: string;
    @Input() placeholder = 'stes.label.schlagwort';
    @Input() filterDisabled = false;
    @Input() geschaeftsart = geschaeftsartEnum.STES;
    @Input() useBenutzer: boolean;
    @Input() parentForm: FormGroup;
    @Input() controlName: string;
    @Output() onSelectItem: EventEmitter<any> = new EventEmitter();
    @Output() onSelectFilterItem: EventEmitter<any> = new EventEmitter();
    @Output() onKeyUp: EventEmitter<any> = new EventEmitter();
    @ViewChild('filterDropdown') filterDropdown;
    status: string = StatusEnum.AKTIV;
    schlagworteList: SchlagwortDTO[] = [];
    currentPlaceholder = '';

    constructor(
        private render: Renderer2,
        private stesDataRestService: StesDataRestService,
        private translateService: TranslateService,
        private dataService: StesDataRestService,
        private dbTranslateService: DbTranslateService
    ) {
        super(render);
    }

    searchSchlagworte = (term: any) => this.getSchlagworte(term);
    resultFormatter = (result: any) => result.value;
    inputFormatter = (result: any) => result.value;
    filterOptions = [
        { value: StatusEnum.AKTIV, labelFr: 'actif', labelIt: 'attivo', labelDe: 'aktiv' },
        { value: StatusEnum.INACTIVE, labelFr: 'inactif', labelIt: 'inattivo', labelDe: 'inaktiv' }
    ];

    ngOnInit() {
        if (this.showLabel) {
            this.currentPlaceholder = 'stes.label.schlagwort';
        } else {
            this.currentPlaceholder = this.placeholder;
        }
    }

    getSchlagworte(term$: Observable<any>) {
        return term$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            switchMap((term: string) => {
                if (term === '') {
                    return [];
                } else {
                    return this.getSchlagworteList().then(() => this.searchText(term));
                }
            })
        );
    }

    itemSelected(guiEntry): void {
        this.inputElement.model = guiEntry.value;
        this.onChange(guiEntry);
        this.setControlObjectValue('schlagworteObject', guiEntry);
        this.onSelectItem.emit(guiEntry.schlagwortDTO);
    }

    onChangeFilter(event: any): void {
        let value: string = event;

        if (event && event.target) {
            value = event.target.value;
        }

        this.setControlObjectValue('schlagworteObjectFilter', value);
        this.onSelectFilterItem.emit(value);
    }

    setControlObjectValue(objectName: string, objectValue: any): void {
        if (this.parentForm && this.parentForm.controls[this.controlName]) {
            this.parentForm.controls[this.controlName][objectName] = objectValue;
        }
    }

    disableComponent(): void {
        this.inputElement.disabled = true;
    }

    enableComponent(): void {
        this.inputElement.disabled = false;
    }

    writeValue(value: any): void {
        this.setControlObjectValue('schlagworteObject', value);
        this.onKeyUp.emit(value);
        this.inputElement.model = value ? value : '';
        this.onChange(value);
    }

    /**
     * Method for lazy loading triggered by focusin Event.
     */
    private getSchlagworteList(): Promise<any> {
        if (this.isLoadingSchlagworteNeeded()) {
            this.inputElement.searching = true;
            return this.dataService
                .getSchlagworte(this.status, this.geschaeftsart, this.useBenutzer)
                .toPromise()
                .then(response => {
                    this.schlagworteList = response;
                    this.inputElement.searching = false;
                });
        }
        return Promise.all(this.schlagworteList);
    }

    private isLoadingSchlagworteNeeded(): boolean {
        if (!this.schlagworteList || this.schlagworteList.length === 0 || this.filterDropdown.nativeElement.value !== this.status) {
            this.status = this.filterDropdown.nativeElement.value;
            return true;
        }
        return false;
    }

    private searchText(text: string): any {
        if (text && text.trim() === '*') {
            return this.getAllSchlagworte();
        } else if (text && text.includes('*')) {
            return this.filterSchlagworteList(this.replaceAllStars(text));
        } else {
            return this.filterSchlagworteList(text);
        }
    }

    private getAllSchlagworte() {
        return this.schlagworteList.map((schlagwort: SchlagwortDTO) => {
            return { schlagwortDTO: schlagwort, value: this.dbTranslateService.translate(schlagwort, 'schlagwort') };
        });
    }

    private filterSchlagworteList(text: string) {
        return this.schlagworteList
            .filter(
                (schlagwortDto: SchlagwortDTO) =>
                    this.dbTranslateService
                        .translate(schlagwortDto, 'schlagwort')
                        .toLowerCase()
                        .search(text.toLowerCase()) !== -1
            )
            .map((schlagwort: SchlagwortDTO) => {
                return { schlagwortDTO: schlagwort, value: this.dbTranslateService.translate(schlagwort, 'schlagwort') };
            });
    }

    private replaceAllStars(text): string {
        return text.replace(/\*+/, '');
    }
}
