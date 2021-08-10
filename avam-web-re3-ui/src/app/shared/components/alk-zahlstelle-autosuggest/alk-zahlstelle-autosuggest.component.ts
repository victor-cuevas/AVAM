import { Component, forwardRef, Input, OnInit, Renderer2 } from '@angular/core';
import { BaseControlValueAccessor } from '../../classes/base-control-value-accessor';
import { map } from 'rxjs/operators';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '../../services/db-translate.service';

@Component({
    selector: 'app-alk-zahlstelle-autosuggest',
    templateUrl: './alk-zahlstelle-autosuggest.component.html',
    styleUrls: ['./alk-zahlstelle-autosuggest.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AlkZahlstelleAutosuggestComponent),
            multi: true
        }
    ]
})
export class AlkZahlstelleAutosuggestComponent extends BaseControlValueAccessor implements OnInit {
    @Input() readOnly = false;
    @Input() disabled = false;
    @Input() protected id: string;

    constructor(
        protected renderer: Renderer2,
        private stesDataRestService: StesDataRestService,
        private translateService: TranslateService,
        private dbTranslateService: DbTranslateService
    ) {
        super(renderer);
    }
    searchFunctionAutosuggestTwo = (zahlstelleText: string) =>
        this.stesDataRestService.getZahlstelleByKurzname(this.translateService.currentLang, zahlstelleText).pipe(
            map(a => {
                return a.map(item => {
                    return {
                        id: item.zahlstelleId,
                        inputElementOneValue: item.alkZahlstellenNr,
                        inputElementTwoValue: this.dbTranslateService.translate(item, 'kurzname')
                    };
                });
            })
        );
    searchFunctionAutosuggestOne = (alkCode: string) =>
        this.stesDataRestService.getZahlstelleByNummer(this.translateService.currentLang, alkCode).pipe(
            map(b => {
                return b.map(i => {
                    return {
                        id: i.zahlstelleId,
                        inputElementOneValue: i.alkZahlstellenNr,
                        inputElementTwoValue: this.dbTranslateService.translate(i, 'kurzname')
                    };
                });
            })
        );
    resultFormatterAutosuggestOne = (result: { inputElementOneValue; inputElementTwoValue }) => `${result.inputElementOneValue} ${result.inputElementTwoValue}`;
    inputFormatterAutosuggestOne = (result: { inputElementOneValue; inputElementTwoValue }) => result.inputElementOneValue;
    resultFormatterAutosuggestTwo = (result: { inputElementOneValue; inputElementTwoValue }) => `${result.inputElementTwoValue} ${result.inputElementOneValue}`;
    inputFormatterAutosuggestTwo = (result: { inputElementOneValue; inputElementTwoValue }) => result.inputElementTwoValue;

    ngOnInit() {}

    writeValue(value: any): void {
        this.value = value;
    }

    onChange(value: any): void {
        this._onChange(value);
    }

    inputChange(event: any) {
        this.onChange(event);
    }

    selectItem(item: any) {
        this.onChange(item);
    }
}
