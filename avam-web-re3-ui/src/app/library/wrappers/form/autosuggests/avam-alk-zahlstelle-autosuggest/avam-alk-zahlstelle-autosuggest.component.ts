import { DEFAULT_SELECTED_ALK_ZAHLSTELLE_VALUE } from './alk-zahlstelle-constants';
import { ZahlstelleDTO } from '@dtos/zahlstelleDTO';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormGroupDirective, AbstractControl } from '@angular/forms';
import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnDestroy, ElementRef } from '@angular/core';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { map } from 'rxjs/operators';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { IAlkResult } from './alk-result.interface';
import { Subscription } from 'rxjs';
import { CoreAutosuggestComponent } from '@app/library/core/core-autosuggest/core-autosuggest.component';
import { FacadeService } from '@app/shared/services/facade.service';

@Component({
    selector: 'avam-alk-zahlstelle-autosuggest',
    templateUrl: './avam-alk-zahlstelle-autosuggest.component.html',
    styleUrls: ['./avam-alk-zahlstelle-autosuggest.component.scss']
})
export class AvamAlkZahlstelleAutosuggestComponent implements OnInit, OnDestroy {
    @Input() parentForm: FormGroup;
    @Input() alkControl: string;
    @Input() zahlstelleControl: string;
    @Input() alkPlaceholder: string;
    @Input() zahlstellePlaceholder: string;
    @Input() label: string;
    @Input() disabled: boolean;
    @Input() container = '';
    @Input() scrollIntoView = true;
    @Input() coreReadOnly: boolean;
    @Input() coreReadOnlyClearButton: boolean;
    @Input() set readOnly(isReadOnly: boolean) {
        this._readOnly = isReadOnly;

        if (isReadOnly) {
            this.alkValue = this.getAlkReadonlyValue(this.parentForm.controls[this.alkControl].value);
            this.zahlstelleValue = this.getZahlstelleReadonlyValue(this.parentForm.controls[this.zahlstelleControl].value);
        }
    }

    @Input() wrapperInputClass: string;
    @Input() labelWrapperInputClass: string;
    @Input() labelInputClass: string;
    @Input() inputWrapperClass: string;
    @Input() inputAlkClass: string;
    @Input() inputZahlstelleClass: string;
    @Input() inputReadonlyWrapperClass: string;
    @Input() inputReadonlyValueClass: string;

    @Output() onAlkKeyup: EventEmitter<any> = new EventEmitter();
    @Output() onAlkInput: EventEmitter<any> = new EventEmitter();
    @Output() onAlkChange: EventEmitter<any> = new EventEmitter();
    @Output() onAlkBlur: EventEmitter<any> = new EventEmitter();
    @Output() onAlkClear: EventEmitter<any> = new EventEmitter();
    @Output() onAlkSelect: EventEmitter<any> = new EventEmitter();

    @Output() onZahlstelleKeyup: EventEmitter<any> = new EventEmitter();
    @Output() onZahlstelleInput: EventEmitter<any> = new EventEmitter();
    @Output() onZahlstelleChange: EventEmitter<any> = new EventEmitter();
    @Output() onZahlstelleBlur: EventEmitter<any> = new EventEmitter();
    @Output() onZahlstelleClear: EventEmitter<any> = new EventEmitter();
    @Output() onZahlstelleSelect: EventEmitter<any> = new EventEmitter();

    @ViewChild('ngForm') formInstance: FormGroupDirective;
    @ViewChild('alkAutosuggest') alkAutosuggest: CoreAutosuggestComponent;
    @ViewChild('zahlstelleAutosuggest') zahlstelleAutosuggest: CoreAutosuggestComponent;
    @ViewChild('modalZahlstelleSuchen') modalZahlstelleSuchen: ElementRef;

    alkValue: string;
    zahlstelleValue: string;

    _readOnly: boolean;

    transtaleSubscription: Subscription;
    modalFensterSubscription: Subscription;

    selectedValue: ZahlstelleDTO = JSON.parse(JSON.stringify(DEFAULT_SELECTED_ALK_ZAHLSTELLE_VALUE));

    constructor(
        public obliqueHelper: ObliqueHelperService,
        private stesDataRestService: StesDataRestService,
        private translateService: TranslateService,
        private dbTranslateService: DbTranslateService,
        private facadeService: FacadeService
    ) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);

        this.transtaleSubscription = this.dbTranslateService.getEventEmitter().subscribe(() => {
            if (!this.parentForm || !this.parentForm.controls[this.zahlstelleControl]) {
                return;
            }

            this.zahlstelleAutosuggest.inputElement.nativeElement.value = this.dbTranslateService.translate(this.selectedValue, 'kurzname');
        });

        this.modalFensterSubscription = this.facadeService.openModalFensterService.getModalFensterClosed().subscribe(() => {
            this.disabled = false;
        });
    }

    ngOnDestroy() {
        this.transtaleSubscription.unsubscribe();
        this.modalFensterSubscription.unsubscribe();
    }

    searchAlk = (alkCode: string) =>
        this.stesDataRestService.getZahlstelleByNummer(this.translateService.currentLang, alkCode).pipe(map((b: ZahlstelleDTO[]) => b.map((i: ZahlstelleDTO) => i)));

    searchZahlstelle = (zahlstelleText: string) =>
        this.stesDataRestService.getZahlstelleByKurzname(this.translateService.currentLang, zahlstelleText).pipe(map((a: ZahlstelleDTO[]) => a.map((item: ZahlstelleDTO) => item)));

    resultAlk = (result: IAlkResult) => {
        return `${result.alkZahlstellenNr} ${this.dbTranslateService.translate(result, 'kurzname')}`;
    };

    resultZahlstelle = (result: IAlkResult) => `${result.alkZahlstellenNr} ${this.dbTranslateService.translate(result, 'kurzname')}`;

    inputAlk = (result: IAlkResult) => result.alkZahlstellenNr;

    inputZahlstelle = (result: IAlkResult) => this.dbTranslateService.translate(result, 'kurzname');

    alkKeyup(event: ZahlstelleDTO | string) {
        this.onAlkKeyup.emit(event);

        this.resetKurzname();
        this.setSelectedValueToForm(DEFAULT_SELECTED_ALK_ZAHLSTELLE_VALUE);
    }

    alkInput(event: ZahlstelleDTO | string) {
        this.alkValue = this.getAlkReadonlyValue(this.parentForm.controls[this.alkControl].value);

        let zahlstelleObject: ZahlstelleDTO;

        if (typeof event === 'string' || typeof event === 'number') {
            this.resetKurzname();
            zahlstelleObject = JSON.parse(JSON.stringify(DEFAULT_SELECTED_ALK_ZAHLSTELLE_VALUE));
        }

        if (event && (event as ZahlstelleDTO).alkZahlstellenNr) {
            this.selectedValue = event as ZahlstelleDTO;
        }

        this.setSelectedValueToForm(zahlstelleObject);
        this.onAlkInput.emit(event);
    }

    alkChange(event: ZahlstelleDTO | string) {
        this.onAlkChange.emit(event);
    }

    alkBlur(event: ZahlstelleDTO | string) {
        this.onAlkBlur.emit(event);
    }

    alkSelect(event: ZahlstelleDTO) {
        this.selectedValue = event;
        this.parentForm.controls[this.zahlstelleControl].setValue(event);
        this.setSelectedValueToForm();
        this.onAlkSelect.emit(event);
    }

    alkClear(event: any) {
        this.onAlkClear.emit(event);
    }

    zahlstelleKeyup(event: ZahlstelleDTO | string) {
        this.resetKurzname();
        this.setSelectedValueToForm(DEFAULT_SELECTED_ALK_ZAHLSTELLE_VALUE);
        this.onZahlstelleKeyup.emit(event);
    }

    zahlstelleInput(event: ZahlstelleDTO | string) {
        this.zahlstelleValue = this.getZahlstelleReadonlyValue(this.parentForm.controls[this.zahlstelleControl].value);

        let zahlstelleObject: ZahlstelleDTO;

        if (typeof event === 'string' || typeof event === 'number') {
            this.resetKurzname();
            zahlstelleObject = JSON.parse(JSON.stringify(DEFAULT_SELECTED_ALK_ZAHLSTELLE_VALUE));
        }

        if (event && (event as ZahlstelleDTO).alkZahlstellenNr) {
            this.selectedValue = event as ZahlstelleDTO;
        }

        this.setSelectedValueToForm(zahlstelleObject);
        this.onZahlstelleInput.emit(event);
    }

    zahlstelleChange(event: ZahlstelleDTO | string) {
        this.onZahlstelleChange.emit(event);
    }

    zahlstelleBlur(event: ZahlstelleDTO | string) {
        this.onZahlstelleBlur.emit(event);
    }

    zahlstelleSelect(event: ZahlstelleDTO) {
        this.selectedValue = event;
        this.parentForm.controls[this.alkControl].setValue(event);
        this.setSelectedValueToForm();
        this.onZahlstelleSelect.emit(event);
    }

    zahlstelleClear(event: any) {
        this.onZahlstelleClear.emit(event);
    }

    resetKurzname() {
        this.selectedValue.kurznameDe = this.zahlstelleAutosuggest.inputElement.nativeElement.value;
        this.selectedValue.kurznameFr = this.zahlstelleAutosuggest.inputElement.nativeElement.value;
        this.selectedValue.kurznameIt = this.zahlstelleAutosuggest.inputElement.nativeElement.value;
    }

    getAlkReadonlyValue(value: ZahlstelleDTO | string | number) {
        if (!value) {
            return null;
        }

        if (typeof value === 'string' || typeof value === 'number') {
            return value.toString();
        }

        return this.inputAlk(value);
    }

    getZahlstelleReadonlyValue(value: ZahlstelleDTO | string | number) {
        if (!value) {
            return null;
        }

        if (typeof value === 'string' || typeof value === 'number') {
            return value.toString();
        }

        return this.inputZahlstelle(value);
    }

    setSelectedValueToForm(initialObject?: ZahlstelleDTO) {
        if (!this.parentForm || !this.parentForm.controls[this.alkControl] || !this.parentForm.controls[this.zahlstelleControl]) {
            return;
        }

        let alkZahlstelleObject: ZahlstelleDTO = null;

        if (initialObject) {
            const alkValue: string = this.alkAutosuggest.inputElement.nativeElement.value;
            const zahlstelleValue: string = this.zahlstelleAutosuggest.inputElement.nativeElement.value;

            alkZahlstelleObject = JSON.parse(JSON.stringify(initialObject));
            alkZahlstelleObject.alkZahlstellenNr = alkValue;
            alkZahlstelleObject.kurznameDe = zahlstelleValue;
            alkZahlstelleObject.kurznameIt = zahlstelleValue;
            alkZahlstelleObject.kurznameFr = zahlstelleValue;

            this.selectedValue = JSON.parse(JSON.stringify(alkZahlstelleObject));
        } else {
            alkZahlstelleObject = JSON.parse(JSON.stringify(this.selectedValue));
        }

        this.parentForm.controls[this.alkControl]['alkZahlstelleObject'] = alkZahlstelleObject;
        this.parentForm.controls[this.zahlstelleControl]['alkZahlstelleObject'] = alkZahlstelleObject;
    }

    buttonClick() {
        this.facadeService.openModalFensterService.openXLModal(this.modalZahlstelleSuchen);
        this.disabled = true;
    }

    fillDataZahlstelle(data: any) {
        this.parentForm.controls[this.alkControl].setValue(data.rawObject);
        this.parentForm.controls[this.zahlstelleControl].setValue(data.rawObject);
    }
}
