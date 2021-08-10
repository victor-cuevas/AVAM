import { Component, OnInit, Renderer2, Input, ViewChild, ElementRef, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { OpenModalFensterService } from '../../services/open-modal-fenster.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { AutosuggestInputComponent } from '../autosuggest-input/autosuggest-input.component';

@Component({
    selector: 'app-autosuggest-two-fields',
    templateUrl: './autosuggest-two-fields.component.html',
    styleUrls: ['./autosuggest-two-fields.scss']
})
export class AutosuggestTwoFieldsComponent implements OnInit, OnDestroy {
    get value(): { id; inputElementOneValue; inputElementTwoValue } {
        return this._value;
    }
    @Input('value')
    set value(value: { id; inputElementOneValue; inputElementTwoValue }) {
        const normalizedValue = value == null ? { id: '', inputElementOneValue: '', inputElementTwoValue: '' } : value;
        if (this.inputElementOne && this.inputElementTwo) {
            this.inputElementOne.setSelectedItem(normalizedValue && normalizedValue.id !== '-1' ? normalizedValue : '');
            this.inputElementTwo.setSelectedItem(normalizedValue && normalizedValue.id !== '-1' ? normalizedValue : '');
            this.renderModelProperty(normalizedValue);
        }
        this._value = normalizedValue;
    }

    private renderModelProperty(normalizedValue) {
        if (!!normalizedValue) {
            this.renderer.setProperty(this.inputElementOne, 'model', normalizedValue.inputElementOneValue ? normalizedValue.inputElementOneValue : '');
            this.renderer.setProperty(this.inputElementTwo, 'model', normalizedValue.inputElementTwoValue ? normalizedValue.inputElementTwoValue : '');
        } else {
            this.renderer.setProperty(this.inputElementOne, 'model', null);
            this.renderer.setProperty(this.inputElementTwo, 'model', null);
        }
    }

    @Input() public id: string;
    @Input() public disabled: boolean;
    @Input() public readOnly: boolean;
    @Output() selectItem: EventEmitter<{ id; inputElementOneValue; inputElementTwoValue }> = new EventEmitter<{ id; inputElementOneValue; inputElementTwoValue }>();
    @ViewChild('inputElementOne') public inputElementOne: AutosuggestInputComponent;
    @ViewChild('inputElementTwo') public inputElementTwo: AutosuggestInputComponent;
    @Input() inputClassFirst: string;
    @Input() inputClassSecond: string;
    @Input() label: string;
    @Input() showButton: boolean;
    @Input() buttonTooltip: string;
    @Input() placeholderOne: string;
    @Input() placeholderTwo: string;
    @Input() showInfoIcon = false;
    @Input() labels: string[] = [];

    public _value: { id; inputElementOneValue; inputElementTwoValue };

    private modalFernsterSubscription: Subscription;

    constructor(
        protected renderer: Renderer2,
        private modalFensterService: OpenModalFensterService,
        protected stesDataRestService: StesDataRestService,
        protected translateService: TranslateService
    ) {}

    @Input() public searchFunctionAutosuggestOne = (term: string): Observable<any> => {
        throw new Error('You need to implement searchFunctionAutosuggestOne!');
    };
    @Input() public searchFunctionAutosuggestTwo = (term: number): Observable<any> => {
        throw new Error('You need to implement searchFunctionAutosuggestTwo!');
    };
    @Input() public resultFormatterAutosuggestOne = (result: { inputElementOne; inputElementTwo }): string => {
        throw new Error('You need to implement resultFormatterAutosuggestOne!');
    };
    @Input() public resultFormatterAutosuggestTwo = (result: { inputElementOne; inputElementTwo }): string => {
        throw new Error('You need to implement resultFormatterAutosuggestTwo!');
    };
    @Input() public inputFormatterAutosuggestOne = (result: { inputElementOne; inputElementTwo }): string => {
        throw new Error('You need to implement inputFormatterAutosuggestOne!');
    };
    @Input() public inputFormatterAutosuggestTwo = (result: { inputElementOne; inputElementTwo }): string => {
        throw new Error('You need to implement inputFormatterAutosuggestTwo!');
    };

    ngOnInit() {
        this.labels = this.getAlkZahlstelleInfoLabels();
        this.modalFernsterSubscription = this.modalFensterService.getModalFensterClosed().subscribe(() => (this.disabled = false));
    }

    ngOnDestroy(): void {
        this.modalFernsterSubscription.unsubscribe();
    }

    public getAlkZahlstelleInfoLabels() {
        const alkZahlstelleInfoLabels: string[] = [];
        alkZahlstelleInfoLabels.push('verzeichnisse.label.zahlstelle.alkZahlstelleNr');
        alkZahlstelleInfoLabels.push('stes.asal.label.alkZahlstelle');
        alkZahlstelleInfoLabels.push('common.label.empty');
        alkZahlstelleInfoLabels.push('common.label.empty');
        alkZahlstelleInfoLabels.push('benutzerverwaltung.label.standortadresse');
        alkZahlstelleInfoLabels.push('common.label.empty');
        alkZahlstelleInfoLabels.push('verzeichnisse.label.kassenstatus');
        alkZahlstelleInfoLabels.push('verzeichnisse.label.arbeitssprache');
        alkZahlstelleInfoLabels.push('verzeichnisse.label.telefon');
        alkZahlstelleInfoLabels.push('verzeichnisse.label.email');
        return alkZahlstelleInfoLabels;
    }

    itemWriteOne(item: string) {
        if (!this.isInputSame(item, this._value.inputElementOneValue)) {
            this.value = { id: '-1', inputElementOneValue: item, inputElementTwoValue: this._value.inputElementTwoValue };
            this.emitSelectEvent(this._value);
        }
    }

    itemWriteTwo(item: string) {
        if (!this.isInputSame(item, this._value.inputElementTwoValue)) {
            this.value = { id: '-1', inputElementOneValue: this._value.inputElementOneValue, inputElementTwoValue: item };
            this.emitSelectEvent(this._value);
        }
    }

    private isInputSame(inputValue: any, oldValue: any) {
        return String(inputValue) === String(oldValue);
    }

    emitSelectEvent(item) {
        this.value = item;
        this.selectItem.emit(this._value);
    }

    buttonClick() {
        this.modalFensterService.openModalFenster();
        this.disabled = true;
    }

    getAlkZahlstelleInfo = (term: string) => this.stesDataRestService.getZahlstelleDetailsById(this.translateService.currentLang, term);
}
