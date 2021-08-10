import { Component, OnInit, Renderer2, Output, EventEmitter, Input, ViewChild, forwardRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BenutzerstellenRestService } from 'src/app/core/http/benutzerstellen-rest.service';
import { DbTranslateService } from '../../services/db-translate.service';
import { map } from 'rxjs/operators';
import { AutosuggestControlValueAccessor } from '../../classes/autosuggest-control-value-accessor';
import { Subscription } from 'rxjs';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-vollzugsregion-autosuggest',
    templateUrl: './vollzugsregion-autosuggest.component.html',
    styleUrls: ['./vollzugsregion-autosuggest.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => VollzugsregionAutosuggestComponent),
            multi: true
        }
    ]
})
export class VollzugsregionAutosuggestComponent extends AutosuggestControlValueAccessor implements OnInit {
    @Output() itemSelectedEventEmitter: EventEmitter<any> = new EventEmitter();
    @Input() readOnly: string;
    @Input() placeholder: string;
    @Input() disabledInput: boolean;
    @ViewChild('inputElement') inputElement: any;

    private languageSubscription: Subscription;

    constructor(
        private render: Renderer2,
        private benutzerstelleRestService: BenutzerstellenRestService,
        private translateService: TranslateService,
        private dbTranslateService: DbTranslateService
    ) {
        super(render);
    }

    ngOnInit() {
        this.languageSubscription = this.dbTranslateService.getEventEmitter().subscribe(event => {
            this.patchValue();
        });
    }

    ngOnDestroy() {
        this.languageSubscription.unsubscribe();
    }

    searchVollzugsregionen = (term: string) =>
        this.benutzerstelleRestService.getVollzugsregionen(this.translateService.currentLang, term).pipe(
            map(response => {
                return response.map(item => {
                    return { id: item.vollzugsregionId, value: this.dbTranslateService.translate(item, 'name') };
                });
            })
        );

    resultFormatter = (result: any) => `${result.id} ${result.value}`;
    inputFormatter = (result: any) => result.value;
    typingFormatter = text => {
        return { id: -1, value: text };
    };

    patchValue() {
        if (!this.value || !this.value.landBaseInfo) {
            return;
        }
        this.value.value = this.dbTranslateService.translate(this.value.landBaseInfo, 'name');
        this.inputElement.model = this.value.value;
    }

    itemSelected(value) {
        this.itemSelectedEventEmitter.emit(value);
        this.onChange(value);
    }

    writeValue(value: any): void {
        this.value = value;
        this.inputElement.model = this.value ? this.value.value : '';
    }
}
