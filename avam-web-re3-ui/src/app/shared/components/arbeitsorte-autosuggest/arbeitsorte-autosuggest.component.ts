import { DbTranslateService } from './../../services/db-translate.service';
import { Component, Input, Output, EventEmitter, Renderer2, forwardRef, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { switchMap, distinctUntilChanged, debounceTime, tap, catchError, map } from 'rxjs/operators'; //NOSONAR
import { of, Subscription, Observable } from 'rxjs';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { ArbeitsorteAutosuggestInterface } from './arbeitsorte-autosuggest.interface';

@Component({
    selector: 'app-arbeitsorte-autosuggest',
    templateUrl: './arbeitsorte-autosuggest.component.html',
    styleUrls: ['./arbeitsorte-autosuggest.component.scss']
})
export class ArbeitsorteAutosuggestComponent implements OnInit, OnDestroy {
    @Input() searchFunction: (term: string) => Observable<any>;
    @Input() dataFunction: (term: string) => Observable<any>;
    @Input() typingFormatter: (item) => string;
    @Input() disabled = false;
    @Input() model = null;
    @Input() placeholder: string;
    @Input() labels: string[];
    @Input() selectedItemId: string;

    @ViewChild('inputElement') public inputElement: ElementRef;
    @Input() readOnly: string;

    @Output() selectItem: EventEmitter<any> = new EventEmitter();
    @Output() writeItem: EventEmitter<any> = new EventEmitter();

    searching = false;
    searchFailed = false;
    selectedItem: any;

    @Input() parentForm: FormGroup;
    @Input() formGroupDirective: FormGroupDirective;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    private languageSubscription: Subscription;

    constructor(
        private renderer: Renderer2,
        private stesDataService: StesDataRestService,
        private translateService: TranslateService,
        private dbTranslateService: DbTranslateService
    ) {}

    ngOnInit() {
        this.model = this.translateModel();
        this.formGroupDirective.ngSubmit.subscribe(() => {
            this.ngForm.onSubmit(undefined);
        });

        this.languageSubscription = this.dbTranslateService.getEventEmitter().subscribe(() => {
            this.model = this.translateModel();
        });
    }

    ngOnDestroy() {
        this.languageSubscription.unsubscribe();
    }

    search = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => (this.searching = true)),
            switchMap(term => {
                if (term) {
                    return this.stesDataService.getRegion(this.translateService.currentLang, term).pipe(
                        map(terma => {
                            return terma.map(res => {
                                return {
                                    code: res.code,
                                    kanton: res.kanton,
                                    merkmal: res.merkmal,
                                    regionDe: res.regionDe,
                                    regionFr: res.regionFr,
                                    regionId: res.regionId,
                                    regionIt: res.regionIt,
                                    value: this.dbTranslateService.translate(res, 'region')
                                };
                            });
                        }),
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

    formatValue(x: ArbeitsorteAutosuggestInterface) {
        return x.value;
    }

    translateModel() {
        return this.parentForm.value.item ? this.dbTranslateService.translate(this.parentForm.value.item, 'region') : '';
    }

    onClear() {
        this.model = '';
        this.parentForm.reset();
        this.emmitWriteEvent(null);
    }

    writeValue(value: string) {
        this.model = value;
    }

    onKeyup(event: KeyboardEvent) {
        if (event.key !== 'Enter') {
            const targetValue: string = (event.target as HTMLInputElement).value;
            const emitValue: string | null = targetValue ? (this.typingFormatter ? this.typingFormatter(targetValue) : targetValue) : null;

            this.emmitWriteEvent(emitValue);
        }
    }

    emmitSelectItem(event: ArbeitsorteAutosuggestInterface) {
        this.setSelectedItem(event);
    }

    emmitWriteEvent(event: string) {
        this.writeItem.emit(event);
    }

    dismiss() {
        this.searching = false;
    }

    setSelectedItem(item: ArbeitsorteAutosuggestInterface) {
        this.selectedItem = item;
    }
}
