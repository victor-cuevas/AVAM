import { Component, forwardRef, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControlValueAccessor } from '../../classes/base-control-value-accessor';
import { map } from 'rxjs/operators';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '../../services/db-translate.service';
import { Subscription, of } from 'rxjs';

@Component({
    selector: 'app-gemeinde-autosuggest',
    templateUrl: './gemeinde-autosuggest.component.html',
    styleUrls: ['./gemeinde-autosuggest.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => GemeindeAutosuggestComponent),
            multi: true
        }
    ]
})
/**
 * Gemeinde component with TWO autosuggest fields
 */
export class GemeindeAutosuggestComponent extends BaseControlValueAccessor implements OnInit, OnDestroy {
    @Input() inputClassFirst: string;
    @Input() inputClassSecond: string;
    @Input() placeholderOne: string;
    @Input() placeholderTwo: string;
    @Input() disableControls: boolean;
    @Input() protected id: string;
    @ViewChild('autoSuggestComponent') protected compositeInput: any;

    private languageSubscription: Subscription;

    constructor(
        protected renderer: Renderer2,
        private stesDataRestService: StesDataRestService,
        private translateService: TranslateService,
        private dbTranslateService: DbTranslateService
    ) {
        super(renderer);
    }

    searchFunctionAutosuggestTwo = (gemeindeName: string) =>
        this.stesDataRestService.getGemeindeByName(this.translateService.currentLang, gemeindeName).pipe(
            map(a => {
                return a.map(item => {
                    return this.mapGemeinde(item);
                });
            })
        );
    searchFunctionAutosuggestOne = (gemeindeNr: number) => {
        if (!isNaN(gemeindeNr)) {
            return this.stesDataRestService.getGemeindeByNumber(this.translateService.currentLang, gemeindeNr).pipe(
                map(b => {
                    return b.map(i => {
                        return this.mapGemeinde(i);
                    });
                })
            );
        } else {
            return of('');
        }
    };
    resultFormatterAutosuggestOne = (result: { inputElementOneValue; inputElementTwoValue; plz; ortschaftsbezeichnung; kanton }) =>
        `${result.inputElementOneValue} ${result.inputElementTwoValue} ${result.plz} ${result.ortschaftsbezeichnung ? result.ortschaftsbezeichnung : ''} ${result.kanton}`;
    inputFormatterAutosuggestOne = (result: { inputElementOneValue; inputElementTwoValue }) => result.inputElementOneValue;
    resultFormatterAutosuggestTwo = (result: { inputElementOneValue; inputElementTwoValue; plz; ortschaftsbezeichnung; kanton }) =>
        `${result.inputElementOneValue} ${result.inputElementTwoValue} ${result.plz} ${result.ortschaftsbezeichnung ? result.ortschaftsbezeichnung : ''} ${result.kanton}`;
    inputFormatterAutosuggestTwo = (result: { inputElementOneValue; inputElementTwoValue }) => result.inputElementTwoValue;

    writeValue(value: any): void {
        this.value = value;
    }

    onChange(value: any): void {
        this._onChange(value);
    }

    ngOnInit() {
        this.languageSubscription = this.dbTranslateService.getEventEmitter().subscribe(event => {
            this.patchValue();
        });
    }

    ngOnDestroy() {
        this.languageSubscription.unsubscribe();
    }

    patchValue() {
        if (!this.value) {
            return;
        }
        this.value.inputElementTwoValue = this.dbTranslateService.translate(this.value.gemeindeBaseInfo, 'name');
        this.compositeInput.value = this.value;
    }

    inputChange(event: any) {
        this.onChange(event);
    }

    selectItem(item: any) {
        this.onChange(item);
    }

    /**
     * Receives a GemeindeSuchenDTO which contains
     * - serveral attributes such as plz
     * - gemeindeBaseInfo { nameDe, bfsNummer, ... }
     */
    private mapGemeinde(item: any) {
        return {
            id: item.gemeindeBaseInfo.gemeindeId,
            inputElementOneValue: item.gemeindeBaseInfo.bfsNummer,
            inputElementTwoValue: this.dbTranslateService.translate(item.gemeindeBaseInfo, 'name'),
            plz: item.plz,
            gemeindeBaseInfo: item.gemeindeBaseInfo,
            ortschaftsbezeichnung: item.ortschaftsbezeichnung,
            kanton: item.kanton
        };
    }
}
