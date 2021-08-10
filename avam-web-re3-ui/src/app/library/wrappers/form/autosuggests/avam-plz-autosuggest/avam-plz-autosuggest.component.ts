import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { StaatDTO } from '@app/shared/models/dtos-generated/staatDTO';
import { of, Subscription, Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { StesDataRestService } from '../../../../../core/http/stes-data-rest.service';
import { FormGroup, AbstractControl, FormGroupDirective } from '@angular/forms';
import { Component, Input, Output, OnInit, AfterViewInit, ViewChild, EventEmitter, OnDestroy } from '@angular/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';

@Component({
    selector: 'avam-plz-autosuggest',
    templateUrl: './avam-plz-autosuggest.component.html',
    styleUrls: ['./avam-plz-autosuggest.component.scss']
})
export class AvamPlzAutosuggestComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() parentForm: FormGroup;
    @Input() label: string;
    @Input() placeholderPlz: string;
    @Input() placeholderOrt: string;
    @Input() inputClassPlz: string;
    @Input() inputClassOrt: string;
    @Input() disabled: boolean;
    @Input() set readOnly(isReadOnly: boolean) {
        this._readOnly = isReadOnly;

        if (isReadOnly && this.parentForm) {
            const plzValue: any = (this.parentForm.controls[this.plzControl] && this.parentForm.controls[this.plzControl].value) || {};
            const ortValue: any = (this.parentForm.controls[this.ortControl] && this.parentForm.controls[this.ortControl].value) || {};

            this.setReadonlyValues(plzValue, this.plzControl);
            this.setReadonlyValues(ortValue, this.ortControl);
        }
    }
    @Input() supportsSimpleInput: boolean;
    @Input() plzControl: string;
    @Input() ortControl: string;
    @Input() landControl: AbstractControl;
    @Input() container = '';
    @Input() scrollIntoView = true;

    @Output() onPlzKeyup: EventEmitter<any> = new EventEmitter();
    @Output() onPlzInput: EventEmitter<any> = new EventEmitter();
    @Output() onPlzChange: EventEmitter<any> = new EventEmitter();
    @Output() onPlzBlur: EventEmitter<any> = new EventEmitter();
    @Output() onPlzSelect: EventEmitter<any> = new EventEmitter();
    @Output() onPlzClear: EventEmitter<any> = new EventEmitter();

    @Output() onOrtKeyup: EventEmitter<any> = new EventEmitter();
    @Output() onOrtInput: EventEmitter<any> = new EventEmitter();
    @Output() onOrtChange: EventEmitter<any> = new EventEmitter();
    @Output() onOrtBlur: EventEmitter<any> = new EventEmitter();
    @Output() onOrtSelect: EventEmitter<any> = new EventEmitter();
    @Output() onOrtClear: EventEmitter<any> = new EventEmitter();

    @ViewChild('ngForm') formInstance: FormGroupDirective;

    selectedOrtOption: any;

    selectedLandOption: StaatDTO;
    landInputText: string;

    simpleInput = false;

    translateSubscription: Subscription;
    parentFormValueChange: Subscription;
    staatSwissSubscription: Subscription;
    landControlSubscription: Subscription;

    plzValue: any;
    ortValue: any;

    plzId: number = null;

    _readOnly = false;

    emptyFormValue: any = { ort: '', postleitzahl: '', ortDe: '', ortFr: '', ortIt: '', plzId: '-1' };

    constructor(public dbTranslateService: DbTranslateService, public dataService: StesDataRestService, public obliqueHelper: ObliqueHelperService) {}

    /**
     * generate oblique state on component init
     */
    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);
    }

    /**
     * on ngAfterViewInit subscribe for translation and changes.
     */
    ngAfterViewInit() {
        if (this.landControl) {
            this.useLandInputField();
        } else {
            const ortControlSubscription: Subscription = this.parentForm.controls[this.ortControl].valueChanges.subscribe(value => {
                if (value) {
                    ortControlSubscription.unsubscribe();
                    this.useAutosuggest();
                }
            });
        }
    }

    /**
     * on ngOnDestroy unsubscribe all subscriptions.
     */
    ngOnDestroy() {
        this.unsubscribeIfExists(this.staatSwissSubscription);
        this.unsubscribeIfExists(this.landControlSubscription);
        this.unsubscribeIfExists(this.parentFormValueChange);
        this.unsubscribeIfExists(this.translateSubscription);
    }

    /**
     * If we are on simple input mode and the user has changed plz or ort we are making the plzId -1
     * Because that's not an autosuggest object already
     */
    changeInput() {
        this.plzId = -1;
    }

    clearPlz(event: any) {
        this.onPlzClear.emit(event);
    }

    clearOrt(event: any) {
        this.onOrtClear.emit(event);
    }

    /**
     * Use the landControl to control plz/ort fields.
     * In case of "Schweiz" the two fields are awlays autosuggests
     * If supportsSimpleInput param is true and landControl value is not "Schweiz" then plz/ort are simple input fields
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private useLandInputField() {
        this.staatSwissSubscription = this.dataService.getStaatSwiss().subscribe((swiss: StaatDTO) => {
            const ortControl: AbstractControl = this.parentForm.controls[this.ortControl];

            if (this.landControl && this.landControl.value) {
                this.setupControls(swiss, this.landControl.value);
                const formValue: any = ortControl.value
                    ? { ...ortControl.value, ort: ortControl.value.ortDe, postleitzahl: ortControl.value.postleitzahl }
                    : Object.assign(this.emptyFormValue);
                this.setFormValue(formValue);
            } else {
                this.switchInputComponentInCaseOfLand(null, null);
            }

            const landObservable: Observable<any> = this.supportsSimpleInput ? this.landControl.valueChanges : this.landControl.valueChanges.pipe(first());

            this.landControlSubscription = landObservable.subscribe((event: any) => {
                const landObj: any = this.getLandValue(event);

                if (this.neitherStringOrANumber(landObj)) {
                    this.selectedLandOption = landObj;
                }

                if (this.isStringOrANumber(landObj)) {
                    this.landInputText = landObj;
                }

                if (
                    this.isStringOrANumber(landObj) &&
                    this.selectedLandOption &&
                    !this.isValueExistsInArray(landObj, [this.selectedLandOption.nameDe, this.selectedLandOption.nameFr, this.selectedLandOption.nameIt])
                ) {
                    this.selectedLandOption = null;
                }

                const landInput: string | StaatDTO = this.selectedLandOption || this.landInputText;
                this.setupControls(swiss, landInput);

                if (this.simpleInput !== this.checkIsMatchSchweiz(swiss, landInput) && this.supportsSimpleInput) {
                    this.switchInputComponentInCaseOfLand(swiss, landInput);
                }
            });
        });
    }

    /**
     * On type inside the land control there is a standard DOM event.
     * On select item there is a land value.
     * Consider what kind of data we have and return it.
     *
     * @param event
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private getLandValue(event: any) {
        if (!event) {
            return null;
        }

        return event.target ? event.target.value : event;
    }

    /**
     * Setting up needed controls.
     * If we have supportsSimpleInput switch bethwen input and autosuggest.
     * If we haven't supportsSimpleInput then use autosuggest for all the cases.
     *
     * @param staatSwiss
     * @param landControlValue
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private setupControls(staatSwiss: StaatDTO, landControlValue: string | StaatDTO) {
        this.supportsSimpleInput ? this.switchInputComponentInCaseOfLand(staatSwiss, landControlValue) : this.useAutosuggest();
    }

    /**
     * Switch to according input component (input or autosuggest) in case of the land input
     *
     * @param swiss
     * @param landObj
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private switchInputComponentInCaseOfLand(staatSwiss: StaatDTO, landControlValue: string | StaatDTO) {
        this.simpleInput = this.supportsSimpleInput && !this.checkIsMatchSchweiz(staatSwiss, landControlValue);
        this.simpleInput ? this.useSimpleInput() : this.useAutosuggest();
    }

    /**
     * When land equals to Schweiz use that functionality
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private useAutosuggest() {
        this.unsubscribeIfExists(this.parentFormValueChange);

        const ortControl: AbstractControl = this.parentForm.controls[this.ortControl];
        const plzControl: AbstractControl = this.parentForm.controls[this.plzControl];

        const controlValue: any =
            ortControl.value && ortControl.value.plzId ? this.formatControlObject(ortControl.value) : this.formatControlValue(plzControl.value, ortControl.value, this.plzId);

        this.selectFormValues(controlValue);

        if (this.isSubscriptionClosedOrUndefined(this.translateSubscription)) {
            this.translateSubscription = this.dbTranslateService.getEventEmitter().subscribe(() => {
                ortControl.setValue({
                    ...this.selectedOrtOption,
                    [this.ortControl]: this.dbTranslateService.translate(this.selectedOrtOption, 'ort')
                });
            });
        }
    }

    /**
     * When land differs from Schweiz use that functionality
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private useSimpleInput() {
        this.unsubscribeIfExists(this.translateSubscription);

        this.simpleInputValueFormatter(this.parentForm.value);

        if (this.isSubscriptionClosedOrUndefined(this.parentFormValueChange)) {
            this.parentFormValueChange = this.parentForm.valueChanges.subscribe((value: any) => {
                this.simpleInputValueFormatter(value);
            });
        }
    }

    private simpleInputValueFormatter(value: any) {
        if (!value) {
            this.setFormValue(Object.assign(this.emptyFormValue));
            return;
        }

        const isPlzObject: boolean = value[this.plzControl] ? this.neitherStringOrANumber(value[this.plzControl]) : false;
        const isOrtObject: boolean = value[this.ortControl] ? this.neitherStringOrANumber(value[this.ortControl]) : false;
        const postleitzahl: any = isPlzObject ? value[this.plzControl].postleitzahl : value[this.plzControl];
        const ort: string = isOrtObject ? this.dbTranslateService.translate(value[this.ortControl], 'ort') : value[this.ortControl];

        this.getPlzId(isPlzObject, value[this.plzControl], isOrtObject, value[this.ortControl]);

        if (isPlzObject || isOrtObject) {
            this.parentForm.patchValue({ [this.plzControl]: postleitzahl, [this.ortControl]: ort });
        }

        const formControlValue: any = this.formatControlValue(postleitzahl, ort);
        this.setFormValue(formControlValue);
    }

    /**
     * Get the plzId and save it. If we change bethwen input and autosuggest we could have the plzId.
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private getPlzId(isPlzObject: boolean, plzControl: any, isOrtObject: boolean, ortControl: any) {
        if (this.plzId !== null && this.plzId !== -1) {
            return;
        }

        if (isPlzObject && (this.plzId === null || this.plzId === -1)) {
            this.plzId = plzControl.plzId;
            return;
        }

        if (isOrtObject && (this.plzId === null || this.plzId === -1)) {
            this.plzId = ortControl.plzId;
            return;
        }

        this.plzId = -1;
    }

    /**
     * Use the API returned object and the current user input to determine is land match Schweiz
     *
     * @param swissObj
     * @param landObj
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private checkIsMatchSchweiz(swissObj: StaatDTO, landObj: string | StaatDTO): boolean {
        if (!swissObj || !landObj) {
            return false;
        }

        const isLandString: boolean = this.isStringOrANumber(landObj);
        const landStaat: StaatDTO = landObj as StaatDTO;
        const landName: string = isLandString ? (landObj as string) : landStaat.nameDe;

        const possibleSwissNames: string[] = [swissObj.nameDe, swissObj.nameIt, swissObj.nameFr];

        const isNameMatch: boolean = this.isValueExistsInArray(landName, possibleSwissNames);
        const isIsoCodeMatch: boolean = isLandString ? false : landStaat.iso2Code && swissObj.iso2Code && landStaat.iso2Code === swissObj.iso2Code;

        return isIsoCodeMatch || isNameMatch;
    }

    /**
     * Unsubscribe from provided subscription object if it exists
     *
     * @param subscription
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private unsubscribeIfExists(subscription: Subscription) {
        if (subscription) {
            subscription.unsubscribe();
        }
    }

    /**
     * Check subscription parameter is it closed or undefined
     *
     * @param subscription
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private isSubscriptionClosedOrUndefined(subscription: Subscription): boolean {
        return !subscription || (subscription && subscription.closed);
    }

    /**
     * Check for string param is exists in array of strings
     *
     * @param value
     * @param arr
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private isValueExistsInArray(value: string, arr: string[]): boolean {
        if (!value || !arr || !arr.length) {
            return false;
        }

        return arr.map((item: string) => (item || '').trim().toLowerCase()).indexOf(value.trim().toLowerCase()) >= 0;
    }

    /**
     * Check is parameter is type string or a number
     *
     * @param value
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private isStringOrANumber(value: any): boolean {
        return typeof value === 'string' || typeof value === 'number';
    }

    /**
     * Check is parameter neigher string or a number
     *
     * @param value
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private neitherStringOrANumber(value: any): boolean {
        return typeof value !== 'string' && typeof value !== 'number';
    }

    /**
     * Emit according event value if plz field being keyuped
     *
     * @param event
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private plzKeyup(event: any) {
        this.onPlzKeyup.emit(event);
    }

    /**
     * Emit according event value if plz field being blured
     *
     * @param event
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private plzBlur(event: any) {
        this.onPlzBlur.emit(event);
    }

    /**
     * Emit according event value if ort field being keyuped
     *
     * @param event
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private ortKeyup(event: any) {
        this.onOrtKeyup.emit(event);
    }

    /**
     * Emit according event value if ort field being blured
     *
     * @param event
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private ortBlur(event: any) {
        this.onOrtBlur.emit(event);
    }

    /**
     * Search and result all matching ort fields
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private searchFunctionAutosuggestOrt = (ortText: string) => this.dataService.getPlzByOrt(this.dbTranslateService.getCurrentLang(), ortText).pipe(map(this.toAutosuggestValue));

    /**
     * Search and result all matching postleitzahl fields
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private searchFunctionAutosuggestPlz = (plzCode: number) =>
        !isNaN(plzCode) ? this.dataService.getPlzByNumber(this.dbTranslateService.getCurrentLang(), plzCode).pipe(map(this.toAutosuggestValue)) : of('');

    /**
     * Map the value returned from service as autosuggest dropdown
     *
     * @param AvamNavTreeItemModel
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private toAutosuggestValue = arrayOptions => arrayOptions.map(objOption => this.formatControlObject(objOption));

    /**
     * result formatter for postleitzahl field
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private resultFormatterAutosuggest = (result: any) => `${result.postleitzahl} ${this.dbTranslateService.translate(result, 'ort')}`;

    /**
     * input formatter for postleitzahl field
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private inputFormatterAutosuggestPlz = (result: any) => result.postleitzahl;

    /**
     * input formatter for ort field
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private inputFormatterAutosuggestOrt = (result: any) => this.dbTranslateService.translate(result, 'ort');

    /**
     * changing postleitzahl value.
     *
     * @param value
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private changePlz(event: any) {
        this.changeControl(event.target.value, this.ortControl);
        this.onPlzChange.emit(event);
    }

    /**
     * changing ort value.
     *
     * @param value
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private changeOrt(event: any) {
        this.changeControl(event.target.value, this.plzControl);
        this.onOrtChange.emit(event);
    }

    /**
     * Setting the initial value of the plz field on input event from core-autosuggest
     *
     * @param event
     */
    private inputPlz(event: any) {
        this.inputValue(event, this.plzControl);
        this.onPlzInput.emit(event);
    }

    /**
     * Setting the initial value of the ort field on input event from core-autosuggest
     *
     * @param event
     */
    private inputOrt(event: any) {
        this.inputValue(event, this.ortControl);
        this.onOrtInput.emit(event);
    }

    /**
     * Setting the initial value of the according field passed as controlName parameter
     *
     * @param event
     * @param controlName
     */
    private inputValue(event: any, controlName: string) {
        if (event === null || event === undefined) {
            this.setFormValue(this.emptyFormValue);
            return;
        }

        this.setReadonlyValues(event, controlName);

        if (this.isInputSame(event, controlName) && !this.simpleInput && this.isStringOrANumber(event)) {
            this.formatAndUpdate(event, controlName);
        }

        if (!this.isInputSame(event, controlName)) {
            event.plzId ? this.selectFormValues(this.formatControlObject(event)) : this.formatAndUpdate(event, controlName);
        }

        this.setFormValue(this.parentForm.controls[controlName].value);
    }

    /**
     * Checking if we are supposed to add the same value and the according value parameter is NOT DOM event
     *
     * @param value
     * @param controlName
     */
    private isInputSame(value: any, controlName: string) {
        return JSON.stringify(value) === JSON.stringify(this.parentForm.controls[controlName].value) && Boolean(this.isStringOrANumber(value) || value.plzId) && value !== '';
    }

    /**
     * format the incomeing value if it is a dto and set it inside the form controls
     *
     * @param value
     */
    private formatControlObject(value: any) {
        return this.formatControlValue(value.postleitzahl, this.dbTranslateService.translate(value, 'ort'), value.plzId, value);
    }

    /**
     * format the incomeing value if it is a DOM event and set it inside the form controls
     *
     * @param value
     */
    private formatAndUpdate(event: any, controlName: string) {
        const value: any = this.isStringOrANumber(event) ? event : event.target && this.plzOrOrtValue(event.target.value, controlName);
        const otherControlName: string = controlName === this.plzControl ? this.ortControl : this.plzControl;
        const otherControlValue: any = this.parentForm.controls[otherControlName].value;
        const otherValue: any = this.plzOrOrtValue(otherControlValue, otherControlName);
        const formattedValue: any = this.formatInCaseOfControl(controlName, value, otherValue);
        this.selectFormValues(formattedValue);
    }

    /**
     * Set the ccording values to the readonly variables in case are we have an dto comeing or a DOM event
     *
     * @param value
     * @param controlName
     */
    private setReadonlyValues(value: any, controlName: string) {
        this.isStringOrANumber(value) || value.target
            ? controlName === this.plzControl
                ? (this.plzValue = value)
                : (this.ortValue = value)
            : controlName === this.plzControl
            ? (this.plzValue = value.postleitzahl)
            : (this.ortValue = this.dbTranslateService.translate(value, 'ort'));
    }

    /**
     * Format and change the control values when user changes some fields values (select new value from the autosuggest dropdown or type new value and blur).
     * We have a "value" parameter which is the current changed control "value" and we have the "otherControlName" for the other one control.
     * For example fi our "value" is comeing from plz field. The "otherControlName" will be the ort name.
     * Then both of them are producing the finel "outputFormValue" which are going to be set to bothe of the fields plz and ort.
     *
     * @param value
     * @param otherControlName
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private changeControl(value: any, otherControlName: string) {
        const otherFormControl: AbstractControl = this.parentForm.controls[otherControlName];

        if (otherFormControl && otherFormControl.value) {
            const plzFormValue: any = this.formatControlValue(otherFormControl.value.postleitzahl, value);
            const ortFormValue: any = this.isStringOrANumber(otherFormControl.value) ? this.formatControlValue(value, otherFormControl.value) : otherFormControl.value;
            const otherFormValue: any = otherFormControl.value.plzId === -1 && otherControlName === this.plzControl ? plzFormValue : ortFormValue;
            const plzOrOrtValue: any = this.isStringOrANumber(otherFormValue) ? otherFormValue : this.plzOrOrtValue(otherFormValue, otherControlName);
            this.plzId = otherFormValue.plzId || -1;
            const outputFormValue: any = this.formatInCaseOfControl(otherControlName, plzOrOrtValue, value, this.plzId, otherFormValue);
            this.selectFormValues(outputFormValue);
        }
    }

    /**
     * In case of "value" and the "controlname" parameters extract the current field value.
     * For example if we have a:
     * - PlzDTO for "value" which equals: { ort: "Bern", postleitzahl: 3000, ... }
     * - And plz for "controlName"
     * Then the return value is going to be 3000
     *
     * @param value
     * @param controlName
     */
    private plzOrOrtValue(value: any, controlName: string) {
        if (!value) {
            return '';
        }

        const plzValue: any = this.isStringOrANumber(value) ? value : value.postleitzahl;
        const ortValue: any = this.isStringOrANumber(value)
            ? this.dbTranslateService.translate(this.translatedObject(value), 'ort')
            : this.dbTranslateService.translate(value, 'ort');

        return controlName === this.plzControl ? plzValue : ortValue;
    }

    /**
     * format the input value in case of the parameters provided
     *
     * @param controlName
     * @param value
     * @param otherValue
     * @param id
     * @param translate
     */
    private formatInCaseOfControl(controlName: string, value: any, otherValue: any, id = -1, translate?: any) {
        return controlName === this.plzControl ? this.formatControlValue(value, otherValue, id, translate) : this.formatControlValue(otherValue, value, id, translate);
    }

    /**
     * Select the current plz value from the autosuggest
     *
     * @param value
     */
    private selectPlz(value: any) {
        this.selectFormValues(value);
        this.onPlzSelect.emit(value);
    }

    /**
     * Select the current ort value from the autosuggest
     *
     * @param value
     */
    private selectOrt(value: any) {
        this.selectFormValues(value);
        this.onOrtSelect.emit(value);
    }

    /**
     * Change the current autosuggest value and apply it to the form
     *
     * @param value
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private selectFormValues(value: any) {
        if (value.plzId) {
            this.plzId = value.plzId;
        }

        this.updateFormControls(value);
        this.setFormValue(value);
    }

    /**
     * Update fom controls with provided parameter
     *
     * @param value
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private updateFormControls(inputValue: any) {
        const value: any = !inputValue || (inputValue && !inputValue.ort && !inputValue.postleitzahl && (!inputValue.plzId || inputValue.plzId === -1)) ? null : inputValue;

        this.parentForm.controls[this.plzControl].setValue(value);
        this.parentForm.controls[this.ortControl].setValue(value);

        this.parentForm.controls[this.plzControl].updateValueAndValidity();
        this.parentForm.controls[this.ortControl].updateValueAndValidity();
    }

    /**
     * Format value of a control in dependance of provided parameters
     *
     * @param plz
     * @param ort
     * @param id
     * @param ortTranslate
     *
     * @memberof AvamPlzAutosuggestComponent
     */
    private formatControlValue(postleitzahl: any, ort: any, plzId: any = -1, ortTranslate?: any) {
        const translate: any = ortTranslate ? this.translatedObject(ortTranslate.ortDe, ortTranslate.ortFr, ortTranslate.ortIt) : this.translatedObject(ort);
        return { ...translate, ort, postleitzahl, plzId };
    }

    /**
     * Get the translated object in case of the parameters provided
     *
     * @param ortDe
     * @param ortIt
     * @param ortFr
     */
    private translatedObject(ortDe, ortFr?, ortIt?) {
        return { ortDe, ortIt: ortIt || ortDe, ortFr: ortFr || ortDe };
    }

    /**
     * set plzWohnAdresseObject for the provided form
     *
     * @memberof AvamPlzAutosuggestComponent
     *
     * @param postleitzahl
     * @param ort
     * @param id
     */
    private setFormValue(value: any) {
        this.selectedOrtOption = Object.assign(value);
        if (value.plzId === null) {
            value.plzId = -1;
        }

        this.parentForm['plzWohnAdresseObject'] = {
            ...this.formatControlObject(value),
            plzWohnadresseAusland: value.postleitzahl,
            ortWohnadresseAusland: value.ort
        };
    }
}
