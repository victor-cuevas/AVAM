import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormGroupDirective, ValidatorFn, Validators } from '@angular/forms';
import { NumberValidator } from '@shared/validators/number-validator';
import { DomainEnum } from '@shared/enums/domain.enum';
import { forkJoin } from 'rxjs';
import { ErweiterteSucheDTO } from '@shared/models/dtos/erweiterte-suche-dto.interface';
import { CodeDTO } from '@dtos/codeDTO';
import { takeUntil } from 'rxjs/operators';
import { UnternehmenStatusCodeEnum } from '@shared/enums/domain-code/unternehmen-status-code.enum';
import { UnternehmenTypes } from '@shared/enums/unternehmen.enum';
import { ErweiterteSucheIdLabelDTO } from '@shared/models/dtos/erweiterte-suche-id-label-dto.interface';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { CoreButtonGroupInterface } from '@app/library/core/core-button-group/core-button-group.interface';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { FormUtilsService } from '@app/shared';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { TwoFieldsAutosuggestValidator } from '@shared/validators/two-fields-autosuggest-validator';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-unternehmen-search-form',
    templateUrl: './unternehmen-search-form.component.html',
    styleUrls: ['./unternehmen-search-form.component.scss']
})
export class UnternehmenSearchFormComponent extends Unsubscribable implements OnInit, AfterViewInit {
    static FORM_SPINNER_CHANNEL = 'formSpinner';
    static STATUS_BFS = '6';
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @Input() stateKey;
    @Input() type: string;
    @Input() showAdvancedSearch = false;
    @Output() restoreCache: EventEmitter<any> = new EventEmitter();

    get extraCriteria(): FormArray {
        return this.searchForm.controls['extraCriteria'] as FormArray;
    }

    searchForm: FormGroup;
    statusDropdownLabels: any[] = [];
    benutzerAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;
    selectorGroup: CoreButtonGroupInterface[];
    enhancedSearchInfo: EnhancedSearchLabelInfo = { sucheObject: [], sucheKriterium: [], operatorId: [] };

    rawEnhancedSearchInfo: ErweiterteSucheDTO;
    defaultStatusId: string;
    personalberaterEvent: any;
    private isAvam = true;
    private isSearchedAVAM = false;

    constructor(
        private facade: FacadeService,
        private fb: FormBuilder,
        private spinnerService: SpinnerService,
        private restService: UnternehmenRestService,
        private stesDataRestService: StesDataRestService,
        private searchSession: SearchSessionStorageService
    ) {
        super();
    }

    static getCommonCondition(searchForm: FormGroup): boolean {
        const name = searchForm.get('name').value;
        const strasse = searchForm.get('strasse').value;
        const plz = searchForm.controls.plz.get('postleitzahl').value;
        const ort = searchForm.controls.plz.get('ort').value;
        const uidnummer = searchForm.get('uidnummer').value;
        const burnummer = searchForm.get('burnummer').value;
        let formArrayGroupFilled: boolean;
        for (const formArrayKey of searchForm.get('extraCriteria').value) {
            if (!!formArrayKey.sucheObject && !!formArrayKey.freeInput) {
                formArrayGroupFilled = true;
                break;
            }
        }

        return name || strasse || plz || ort || uidnummer || burnummer || formArrayGroupFilled;
    }

    ngOnInit() {
        this.generateForm();
        this.initButtons();
        this.isSearchedAVAM = this.isAVAMSelected();
    }

    public ngAfterViewInit() {
        this.getInitialData();
    }

    public checkBur(value: any): void {
        const selected = value.target.value;
        const formControl = this.searchForm.controls;
        if (selected === 'BUR') {
            formControl.statusId.reset();
            formControl.statusId.disable();
            formControl.personalberater.reset();
            formControl.personalberater.disable();
        } else if (selected === 'AVAM') {
            this.searchForm.patchValue({
                statusId: this.defaultStatusId
            });
            formControl.statusId.enable();
            formControl.personalberater.enable();
        }
    }

    public getExtraCriteria(i: number): FormGroup {
        return this.extraCriteria.at(i) as FormGroup;
    }

    public onRemoveExtraCriteria(index: number): void {
        this.enhancedSearchInfo.sucheKriterium.splice(index, 1);
        this.enhancedSearchInfo.operatorId.splice(index, 1);
        this.extraCriteria.removeAt(index);
    }

    public onAddExtraCriteria(): void {
        this.enhancedSearchInfo.sucheKriterium.push({ labels: [] });
        this.enhancedSearchInfo.operatorId.push({ labels: [] });
        const newFormGroup = this.fb.group({
            sucheObject: [null, Validators.required],
            sucheKriterium: null,
            operatorId: null,
            freeInput: [null, Validators.required]
        });
        this.extraCriteria.push(newFormGroup);
        this.searchForm.setControl('extraCriteria', this.extraCriteria);
        setTimeout(() => {
            newFormGroup.controls.sucheObject.updateValueAndValidity();
            newFormGroup.controls.freeInput.updateValueAndValidity();
        });
    }

    public reloadKriteriumOptions(sucheObjectId: string, i: number): void {
        if (sucheObjectId !== null) {
            if (!!sucheObjectId) {
                const selectedRawSucheObject = this.rawEnhancedSearchInfo.fieldGroupIdLabelBeans.find((labelGroup: ErweiterteSucheIdLabelDTO) => labelGroup.id === sucheObjectId);
                this.enhancedSearchInfo.sucheKriterium[i].labels = selectedRawSucheObject.children.map(this.enhancedSearchPropertyMapper);
                this.getExtraCriteria(i).controls['sucheKriterium'].setValue(selectedRawSucheObject.children[0].id);
                this.enhancedSearchInfo.operatorId[i].labels = this.rawEnhancedSearchInfo.stringComparatorIdLabelBeans.map(this.enhancedSearchPropertyMapper);
                this.getExtraCriteria(i).controls['operatorId'].setValue(this.rawEnhancedSearchInfo.stringComparatorIdLabelBeans[0].id);
            } else {
                this.enhancedSearchInfo.sucheKriterium[i].labels = [];
                this.getExtraCriteria(i).controls['sucheKriterium'].setValue(null);
                this.getExtraCriteria(i).controls['operatorId'].setValue(null);
            }
        }
    }

    clearEmptyPersonalberaterSuche(event: any): void {
        const isNullObject = typeof event === 'object' && event === null;
        const isEmptyString = typeof event === 'string' && event === '';
        if (isNullObject || isEmptyString) {
            this.personalberaterEvent = null;
            this.searchForm.controls.personalberater['benutzerObject'] = null;
        } else {
            this.personalberaterEvent = event;
        }
    }

    updatePersonalberaterSuche(personalberaterState: any): void {
        if (personalberaterState) {
            this.personalberaterEvent = personalberaterState;
            this.searchForm.controls.personalberater.setValue(personalberaterState);
        }
    }

    updateLandSuche(landState) {
        if (landState) {
            if (landState.staatId === -1 && !landState.nameDe) {
                this.searchForm.controls.land.setValue(null);
            } else {
                this.searchForm.controls.land.setValue(landState);
            }
        }
    }

    filterExtraCriteriaFields(enhancedSearchDTO: ErweiterteSucheDTO) {
        this.rawEnhancedSearchInfo = enhancedSearchDTO;
        this.enhancedSearchInfo.sucheObject = enhancedSearchDTO.fieldGroupIdLabelBeans
            ? enhancedSearchDTO.fieldGroupIdLabelBeans
                  .filter((dto: ErweiterteSucheIdLabelDTO) => {
                      return dto.id !== 'es_anbieterdaten'; // Erweiterte suche präzisierung
                  })
                  .map(this.enhancedSearchPropertyMapper)
            : [];
    }

    public isAVAMSelected(): boolean {
        return !!this.searchForm.controls.selector.value ? this.searchForm.controls.selector.value.value === 'AVAM' : false;
    }

    public storeState(): void {
        const plzControl: any = this.searchForm.controls.plz;
        const storage: any = {
            statusId: this.searchForm.controls.statusId.value,
            name: this.searchForm.controls.name.value,
            mitirgendeinemwort: this.searchForm.controls.mitirgendeinemwort.value,
            strasse: this.searchForm.controls.strasse.value,
            strassenr: this.searchForm.controls.strassenr.value,
            postleitzahl: plzControl.controls.postleitzahl.value,
            ort: plzControl.controls.ort.value,
            umliegendeorte: this.searchForm.controls.umliegendeorte.value,
            land: this.searchForm.controls.land['landAutosuggestObject'],
            uidnummer: this.searchForm.controls.uidnummer.value,
            burnummer: this.searchForm.controls.burnummer.value,
            personalberater: this.searchForm.controls.personalberater['benutzerObject']
                ? this.searchForm.controls.personalberater['benutzerObject'].benutzerId === -1
                    ? {
                          benuStelleCode: '',
                          benutzerId: -1,
                          benutzerLogin: '',
                          nachname: this.searchForm.controls.personalberater.value,
                          vorname: '',
                          value: this.searchForm.controls.personalberater.value
                      }
                    : this.searchForm.controls.personalberater['benutzerObject']
                : '',
            selector: this.searchForm.controls.selector.value,
            extraCriteria: this.searchForm.controls.extraCriteria.value
        };
        this.searchSession.storeFieldsByKey(this.stateKey, storage);
    }

    private getInitialData(): void {
        this.spinnerService.activate(UnternehmenSearchFormComponent.FORM_SPINNER_CHANNEL);
        const getExtraCriteriaInfo = this.restService.getExtraCriteriaInfo(this.getDomainForEnhancedSearch());
        const getDropdownStatusLabels = this.stesDataRestService.getCode(DomainEnum.UNTERNEHMEN_STATUS);

        forkJoin<ErweiterteSucheDTO, CodeDTO[]>(getExtraCriteriaInfo, getDropdownStatusLabels)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                ([extraCriteriaInfo, status]) => {
                    this.filterExtraCriteriaFields(extraCriteriaInfo);
                    this.statusDropdownLabels = this.facade.formUtilsService.mapDropdownKurztext(status).filter(obj => obj.code !== UnternehmenSearchFormComponent.STATUS_BFS);
                    this.defaultStatusId = this.facade.formUtilsService.getCodeIdByCode(this.statusDropdownLabels, UnternehmenStatusCodeEnum.STATUS_AKTIV);
                    this.searchForm.controls.statusId.setValue(this.defaultStatusId);
                    const state = this.searchSession.restoreStateByKey(this.stateKey);
                    if (state) {
                        this.restoreStateAndSearch(state);
                    } else {
                        this.spinnerService.deactivate(UnternehmenSearchFormComponent.FORM_SPINNER_CHANNEL);
                    }
                },
                () => this.spinnerService.deactivate(UnternehmenSearchFormComponent.FORM_SPINNER_CHANNEL)
            );
    }

    private generateForm(): void {
        this.searchForm = this.fb.group(
            {
                statusId: null,
                name: [null, TwoFieldsAutosuggestValidator.inputMinLength(2)],
                mitirgendeinemwort: null,
                strasse: [null, TwoFieldsAutosuggestValidator.inputMinLength(2)],
                strassenr: null,
                plz: this.fb.group({
                    postleitzahl: [null, TwoFieldsAutosuggestValidator.inputMinLength(2, 'postleitzahl')],
                    ort: [null, TwoFieldsAutosuggestValidator.inputMinLength(2, 'ort')]
                }),
                umliegendeorte: null,
                land: [null, TwoFieldsAutosuggestValidator.inputMinLength(2, 'nameDe')],
                uidnummer: [null, NumberValidator.containsNineDigits],
                burnummer: [null, NumberValidator.containsEightDigits],
                personalberater: null,
                selector: null,
                extraCriteria: this.fb.array([])
            },
            {
                validators: [this.validateSearch]
            }
        );
    }

    private validateSearch: ValidatorFn = (formGroup: FormGroup): { [key: string]: any } => {
        const selector = formGroup.get('selector').value;
        const commonCondition = UnternehmenSearchFormComponent.getCommonCondition(formGroup);
        return selector != null && ((!commonCondition && selector.value === 'BUR') || (!commonCondition && selector.value === 'AVAM' && !formGroup.get('personalberater').value))
            ? { ...formGroup.errors, valid: false }
            : null;
    };

    private getDomainForEnhancedSearch(): string {
        switch (this.type) {
            case UnternehmenTypes.ARBEITGEBER:
                return 'unternehmen_arbeitgeber';
            case UnternehmenTypes.FACHBERATUNG:
                return 'unternehmen_fachberatungsstelle';
            default:
                return 'unternehmen_anbieter';
        }
    }

    private restoreStateAndSearch(state) {
        this.searchForm.patchValue({
            statusId: state.fields.statusId,
            name: state.fields.name,
            mitirgendeinemwort: state.fields.mitirgendeinemwort,
            strasse: state.fields.strasse,
            strassenr: state.fields.strassenr,
            umliegendeorte: state.fields.umliegendeorte,
            uidnummer: state.fields.uidnummer,
            burnummer: state.fields.burnummer,
            selector: state.fields.selector
        });
        this.updatePlzSuchen(state.fields.ort, state.fields.postleitzahl);
        this.updatePersonalberaterSuche(state.fields.personalberater);
        this.updateLandSuche(state.fields.land);
        this.updateExtraCriteria(state.fields.extraCriteria);
        this.restoreCache.emit();
    }

    private updateExtraCriteria(enhancedSearchState) {
        if (enhancedSearchState) {
            enhancedSearchState.forEach((extraCrit, index) => {
                this.onAddExtraCriteria();
                const selectedRawSucheObject = this.rawEnhancedSearchInfo.fieldGroupIdLabelBeans.find(
                    (labelGroup: ErweiterteSucheIdLabelDTO) => labelGroup.id === extraCrit.sucheObject
                );
                this.enhancedSearchInfo.sucheKriterium[index].labels = selectedRawSucheObject.children.map(this.enhancedSearchPropertyMapper);
                this.enhancedSearchInfo.operatorId[index].labels = this.rawEnhancedSearchInfo.stringComparatorIdLabelBeans.map(this.enhancedSearchPropertyMapper);
                this.getExtraCriteria(index).patchValue(extraCrit);
            });
        }
    }

    private enhancedSearchPropertyMapper = (element: ErweiterteSucheIdLabelDTO) => {
        return {
            value: element.id,
            code: element.id,
            codeId: element.id,
            labelKey: element.label === 'erweitertesuche.label.unternehmensdaten' ? `erweitertesuche.label.unternehmensdaten.${this.type}` : element.label
        };
    };

    private initButtons(): void {
        this.selectorGroup = [
            {
                label: 'unternehmen.label.sucheavam',
                value: 'AVAM',
                selected: this.isAvam
            },
            {
                label: 'unternehmen.label.suchebure',
                value: 'BUR',
                selected: !this.isAvam
            }
        ];
    }

    private updatePlzSuchen(ort: any, postleitzahl: any) {
        this.searchForm.controls.plz.setValue({
            postleitzahl,
            ort
        });
    }
}

interface EnhancedSearchLabelInfo {
    sucheObject: any[];
    sucheKriterium: EnhancedSearchLabelChildrenInfo[];
    operatorId: EnhancedSearchLabelChildrenInfo[];
}

interface EnhancedSearchLabelChildrenInfo {
    labels: any[];
}
