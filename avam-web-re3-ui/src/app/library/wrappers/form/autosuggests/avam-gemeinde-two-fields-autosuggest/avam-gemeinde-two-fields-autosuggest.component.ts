import { defaultNameValue, defaultGemeindeBaseInfo } from './avam-gemeinde-two-fields-autosuggest-constants';
import { Component, OnInit, Input, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, FormGroupDirective, AbstractControl } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { map } from 'rxjs/operators';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { of, Subscription } from 'rxjs';
import { INameItem } from './name-item.interface';
import { CoreAutosuggestComponent } from '@app/library/core/core-autosuggest/core-autosuggest.component';
import { GemeindeDTO } from '@app/shared/models/dtos-generated/gemeindeDTO';

@Component({
    selector: 'avam-gemeinde-two-fields-autosuggest',
    templateUrl: './avam-gemeinde-two-fields-autosuggest.component.html',
    styleUrls: ['./avam-gemeinde-two-fields-autosuggest.component.scss']
})
export class AvamGemeindeTwoFieldsAutosuggestComponent implements OnInit, OnDestroy {
    @Input() parentForm: FormGroup;
    @Input() bfsNrControlName: string;
    @Input() nameControlName: string;
    @Input() bfsNrPlaceholder: string;
    @Input() namePlaceholder: string;
    @Input() label: string;
    @Input() isDisabled: boolean;
    @Input() coreReadOnly: boolean;
    @Input() coreReadOnlyClearButton: boolean;

    @Input() wrapperInputClass: string;
    @Input() labelContainerInputClass: string;
    @Input() inputFieldsContainerInputClass: string;
    @Input() bfsNrFieldInputClass: string;
    @Input() nameFieldInputClass: string;
    @Input() readOnlyContainerInputClass: string;

    @Input() set readOnly(isReadOnly: boolean) {
        this.isReadOnly = isReadOnly;
    }

    @Output() onSelectBfsNr: EventEmitter<any> = new EventEmitter();
    @Output() onChangeBfsNr: EventEmitter<any> = new EventEmitter();
    @Output() onInputBfsNr: EventEmitter<any> = new EventEmitter();
    @Output() onKeyupBfsNr: EventEmitter<any> = new EventEmitter();
    @Output() onBlurBfsNr: EventEmitter<any> = new EventEmitter();

    @Output() onSelectName: EventEmitter<any> = new EventEmitter();
    @Output() onChangeName: EventEmitter<any> = new EventEmitter();
    @Output() onInputName: EventEmitter<any> = new EventEmitter();
    @Output() onKeyupName: EventEmitter<any> = new EventEmitter();
    @Output() onBlurName: EventEmitter<any> = new EventEmitter();

    @ViewChild('ngForm') formInstance: FormGroupDirective;
    @ViewChild('bfsNrAutosuggest') bfsNrAutosuggest: CoreAutosuggestComponent;
    @ViewChild('nameAutosuggest') nameAutosuggest: CoreAutosuggestComponent;

    isReadOnly = false;

    selectedValue: INameItem = JSON.parse(JSON.stringify(defaultNameValue));

    bfsNrInputReadOnlyValue: string | number;
    nameInputReadOnlyValue: string;

    transtaleSubscription: Subscription;

    constructor(private obliqueHelper: ObliqueHelperService, private stesDataRestService: StesDataRestService, private dbTranslateService: DbTranslateService) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);

        this.transtaleSubscription = this.dbTranslateService.getEventEmitter().subscribe(() => {
            if (!this.parentForm || !this.parentForm.controls[this.nameControlName]) {
                return;
            }

            const control: AbstractControl = this.parentForm.controls[this.nameControlName];
            control.setValue(this.selectedValue);
        });
    }

    ngOnDestroy() {
        this.transtaleSubscription.unsubscribe();
    }

    searchBfsNr = (nameNr: number) => (!isNaN(nameNr) ? this.stesDataRestService.getGemeindeByNumber(this.dbTranslateService.getCurrentLang(), nameNr).pipe(map(a => a)) : of(''));

    searchName = (nameName: string) => this.stesDataRestService.getGemeindeByName(this.dbTranslateService.getCurrentLang(), nameName).pipe(map(a => a));

    resultFormatter = (result: INameItem) =>
        `${result.gemeindeBaseInfo.bfsNummer} ${this.dbTranslateService.translate(result.gemeindeBaseInfo, 'name')} ${result.plz} ${
            result.ortschaftsbezeichnung ? result.ortschaftsbezeichnung : ''
        } ${result.kanton}`;

    inputBfsNrFormatter = (result: INameItem | GemeindeDTO | any) =>
        !result.gemeindeBaseInfo && !result.gemeindeId ? null : result.gemeindeBaseInfo ? result.gemeindeBaseInfo.bfsNummer : result.bfsNummer;

    inputNameFormatter = (result: INameItem | GemeindeDTO | any) =>
        !result.gemeindeBaseInfo && !result.gemeindeId ? null : this.dbTranslateService.translate(result.gemeindeBaseInfo ? result.gemeindeBaseInfo : result, 'name');

    selectBfsNr(event: INameItem) {
        this.selectedValue = event;
        this.parentForm.controls[this.nameControlName].setValue(this.inputNameFormatter(event));
        this.nameAutosuggest.inputElement.nativeElement.value = this.inputNameFormatter(event);
        this.bfsNrInputReadOnlyValue = this.inputBfsNrFormatter(event).toString();
        this.nameInputReadOnlyValue = this.inputNameFormatter(event).toString();

        this.setSelectedItemToForm();
        this.onSelectBfsNr.emit(event);
    }

    changeBfsNr(event: Event) {
        this.onChangeBfsNr.emit(event);
    }

    inputBfsNr(event: Event | INameItem | GemeindeDTO | number | string) {
        if (event === null || event === undefined) {
            return;
        }

        if (typeof event === 'string' || typeof event === 'number') {
            setTimeout(() => {
                event !== '' && !this.selectedValue.gemeindeBaseInfo.nameDe ? this.resetValue(event) : this.setAndKeepId(event);

                this.bfsNrAutosuggest.inputElement.nativeElement.value = event;
                this.setSelectedItemToForm();
            });

            this.bfsNrInputReadOnlyValue = event.toString();
        } else if ((event as GemeindeDTO).gemeindeId) {
            this.setSelectedItem(event as GemeindeDTO);
            this.bfsNrInputReadOnlyValue = (event as GemeindeDTO).bfsNummer;
        } else if (event instanceof Event) {
            const bfsNummer = (event.target as HTMLInputElement).value;
            const name: string = this.dbTranslateService.translate(this.selectedValue.gemeindeBaseInfo, 'name');
            const result: INameItem = {
                gemeindeBaseInfo: this.updateGemeindeBaseInfoName(name),
                kanton: '',
                ortschaftsbezeichnung: '',
                plz: -1
            };

            result.gemeindeBaseInfo.bfsNummer = Number(bfsNummer);

            this.selectedValue = result;
        }

        this.setSelectedItemToForm();
        this.onInputBfsNr.emit(event);
    }

    keyupBfsNr(event: KeyboardEvent) {
        this.resetValue((event.target as HTMLInputElement).value);

        this.onKeyupBfsNr.emit(event);
    }

    blurBfsNr(event: FocusEvent) {
        this.onBlurBfsNr.emit(event);
    }

    selectName(event: INameItem) {
        this.selectedValue = event;
        this.parentForm.controls[this.bfsNrControlName].setValue(this.inputBfsNrFormatter(event));
        this.bfsNrAutosuggest.inputElement.nativeElement.value = this.inputBfsNrFormatter(event);
        this.bfsNrInputReadOnlyValue = this.inputBfsNrFormatter(event).toString();
        this.nameInputReadOnlyValue = this.inputNameFormatter(event).toString();

        this.setSelectedItemToForm();
        this.onSelectName.emit(event);
    }

    changeName(event: Event) {
        this.onChangeName.emit(event);
    }

    inputName(event: Event | INameItem | string | GemeindeDTO) {
        if (event === null || event === undefined) {
            return;
        }

        if (typeof event === 'string' || typeof event === 'number') {
            setTimeout(() => {
                event === '' || !this.selectedValue.gemeindeBaseInfo.nameDe ? this.resetValue(null, event.toString()) : this.setAndKeepId(null, event.toString());

                this.nameAutosuggest.inputElement.nativeElement.value = event;
                this.setSelectedItemToForm();
            });

            this.nameInputReadOnlyValue = event.toString();
        } else if ((event as GemeindeDTO).gemeindeId) {
            this.setSelectedItem(event as GemeindeDTO);
            this.nameInputReadOnlyValue = this.dbTranslateService.translate(this.selectedValue.gemeindeBaseInfo, 'name');
        } else if (event instanceof Event) {
            const name = (event.target as HTMLInputElement).value;
            const result: INameItem = {
                gemeindeBaseInfo: this.updateGemeindeBaseInfoName(name),
                kanton: '',
                ortschaftsbezeichnung: '',
                plz: -1
            };

            result.gemeindeBaseInfo.bfsNummer = this.selectedValue.gemeindeBaseInfo.bfsNummer;

            this.selectedValue = result;
        }

        this.setSelectedItemToForm();
        this.onInputName.emit(event);
    }

    updateGemeindeBaseInfoName(name: string) {
        const names = {
            nameDe: name,
            nameFr: name,
            nameIt: name
        };

        return Object.assign(JSON.parse(JSON.stringify(defaultGemeindeBaseInfo)), names);
    }

    keyupName(event: KeyboardEvent) {
        this.onKeyupName.emit(event);
    }

    blurName(event: FocusEvent) {
        this.onBlurName.emit(event);
    }

    private setSelectedItem(item: GemeindeDTO) {
        this.selectedValue.gemeindeBaseInfo = item;
    }

    private setSelectedItemToForm() {
        const gemeinde: GemeindeDTO = this.selectedValue.gemeindeBaseInfo;
        this.parentForm.controls[this.bfsNrControlName]['autosuggestObject'] = gemeinde;
        this.parentForm.controls[this.nameControlName]['autosuggestObject'] = gemeinde;
    }

    private resetValue(bfsNr: string | number = null, name: string = null) {
        const bfsNrValue: string | number = bfsNr === null ? this.selectedValue.gemeindeBaseInfo.bfsNummer : bfsNr;
        const nameValue: string = name === null ? this.dbTranslateService.translate(this.selectedValue.gemeindeBaseInfo, 'name') : name;

        this.selectedValue.kanton = '';
        this.selectedValue.plz = -1;
        this.selectedValue.ortschaftsbezeichnung = nameValue;
        this.selectedValue.gemeindeBaseInfo = this.updateGemeindeBaseInfoName(nameValue);
        this.selectedValue.gemeindeBaseInfo.bfsNummer = Number(bfsNrValue);
    }

    private setAndKeepId(bfsNr: string | number = null, name: string = null) {
        if (bfsNr !== null) {
            this.selectedValue.gemeindeBaseInfo.bfsNummer = bfsNr as any;
        }

        if (name !== null) {
            this.selectedValue.gemeindeBaseInfo.nameDe = name as any;
            this.selectedValue.gemeindeBaseInfo.nameFr = name as any;
            this.selectedValue.gemeindeBaseInfo.nameIt = name as any;
        }
    }
}
