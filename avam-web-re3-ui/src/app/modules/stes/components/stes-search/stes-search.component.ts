import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { StesSearchRestService } from '@core/http/stes-search-rest.service';
import { GenericConfirmComponent, SchlagworteAutosuggestInputComponent } from '@app/shared';
import { ErweiterteSucheDTO } from '@shared/models/dtos/erweiterte-suche-dto.interface';
import { StesSucheQueryDTO } from '@dtos/stesSucheQueryDTO';
import { StesSucheFormbuilder } from '@shared/formbuilders/stes-suche.formbuilder';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { StesDataService } from '@stes/services/stes-data.service';
import { ErweiterteSucheIdLabelDTO } from '@shared/models/dtos/erweiterte-suche-id-label-dto.interface';
import { EnhancedSearchQueryDTO } from '@dtos/enhancedSearchQueryDTO';
import { CodeDTO } from '@shared/models/dtos-generated/codeDTO';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { StesStatusCode } from '@app/shared/enums/domain-code/stes-status-code.enum';
import { DateValidator } from '@app/shared/validators/date-validator';
import { UserDto } from '@dtos/userDto';
import { FacadeService } from '@shared/services/facade.service';
import { StesSearchConstants } from '@stes/components/stes-search/stes-search.constants';

@Component({
    selector: 'app-stes-search',
    templateUrl: './stes-search.component.html',
    styleUrls: ['./stes-search.component.scss'],
    providers: [SearchSessionStorageService]
})
export class StesSearchComponent implements OnInit, OnDestroy, AfterViewInit {
    searchFormBuilder: StesSucheFormbuilder;
    searchDTO: StesSucheQueryDTO;
    searchFormData: FormGroup;
    extraCriteria: EnhancedSearchQueryDTO[] = [];
    statusOptionsLabels: any[];
    dataServiceSub: Subscription;
    restrictedQuery: boolean;
    staticParentOptions: any[] = [];

    /** Pushing or removing elements should always happen for both arrays at the same time! */
    staticChildrenParents: string[] = [];
    staticChildrenOptions: any[][] = [];

    /** Pushing or removing elements should always happen for both arrays at the same time! */
    staticComparatorParents: string[] = [];
    staticComparatorOptions: any[][] = [];

    /** Pushing or removing elements should always happen for both arrays at the same time! */
    staticGrandChildParents: string[] = [];
    staticGrandChildOptions: any[][] = [];

    selectedChildrenOptions = [];
    selectedComparatorOptions = [];
    selectedGrandChildOptions = [];
    isEWSDropdown = [];
    modalErrorMsg = '';
    benutzerAutosuggestType = BenutzerAutosuggestType.BENUTZER;
    benutzerSuchenTokens: {} = {};
    combiningFieldsDisabled = false;
    svNrDisabled = false;
    personenNrDisabled = false;
    stesIdDisabled = false;

    @ViewChild('personalBeraterComponent') personalBeraterComponent: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('schlagwortComponent') schlagwortComponent: SchlagworteAutosuggestInputComponent;

    @Input() cache: any;

    private selectedGemeinde: any;
    private readonly parameterKeys = [
        StesSearchConstants.STES_LABEL_PERSONENNR,
        StesSearchConstants.STES_LABEL_STESID,
        StesSearchConstants.STES_LABEL_SVNR,
        StesSearchConstants.STES_LABEL_GEBURTSDATUM
    ];
    private invalidErrorMsg = [];
    private readonly dateFields = [StesSearchConstants.ES_ANMELDEDATUM_GEMEINDE_STES, StesSearchConstants.ES_ANMELDEDATUM_RAV_STES, StesSearchConstants.ES_STELLENANTRITT_AB_STES];
    private erweiterteSucheDataLoaded: Subject<any> = new Subject();

    constructor(
        private formBuilder: FormBuilder,
        private dataService: StesSearchRestService,
        private stesDataRestService: StesDataRestService,
        private stesDataService: StesDataService,
        private searchSession: SearchSessionStorageService,
        private changeDetectorRef: ChangeDetectorRef,
        private facadeService: FacadeService
    ) {}

    ngOnInit(): void {
        this.facadeService.spinnerService.activate(StesSearchConstants.STES_SEARCH_CHANNEL);
        this.searchFormBuilder = new StesSucheFormbuilder(this.formBuilder, this.stesDataRestService);
        this.searchFormData = this.searchFormBuilder.initForm();
        this.selectedGemeinde = this.searchFormData.controls.gemeinde[StesSearchConstants.GEMEINDE_OBJ];
        this.benutzerSuchenTokens = this.getBenutzerSuchenTokens();

        const state = this.searchSession.restoreStateByKey(StesSearchConstants.STES_SEARCH_CACHE);

        if (state) {
            this.restoreState(state);
            this.initStatusOptionLabels(() => {
                this.calcQueryRestricted();
            });
        } else {
            this.initStatusOptionLabels(() => {
                this.setDefaultValues();
            });
        }
        this.initData();
    }

    ngOnDestroy(): void {
        if (this.dataServiceSub) {
            this.dataServiceSub.unsubscribe();
        }
    }

    ngAfterViewInit(): void {
        this.changeDetectorRef.detectChanges();
    }

    initData(dto?: any): void {
        this.searchDTO = dto ? dto.request : ({} as StesSucheQueryDTO);
        this.extraCriteria = [];

        this.restrictedQuery = false;
        this.parameterKeys.forEach(parameter => {
            this.setErrorMessage(this.facadeService.translateService.instant(parameter));
        });
    }

    setDefaultValues() {
        this.searchFormData.controls.statusId.setValue(this.facadeService.formUtilsService.getCodeIdByCode(this.statusOptionsLabels, StesStatusCode.ACTIVE));
    }

    setErrorMessage(keyStr: string): void {
        const msg = this.facadeService.translateService.get(StesSearchConstants.INVALID_FORMAT_LABEL, { '0': keyStr }) as any;
        if (msg) {
            this.invalidErrorMsg.push({ key: keyStr, value: msg.value });
        }
    }

    onSubmit(): void {
        this.updateStorage();

        if (!this.modalErrorMsg) {
            this.validateExtraCriteria();
            if (this.searchFormData.invalid) {
                this.showErrorMsg();
            } else if ((this.searchFormData.valid && !this.modalErrorMsg) || this.searchFormData.invalid) {
                this.restrictedQuery ? this.search(this.setRestrictedForm(), []) : this.search(this.searchFormData, this.extraCriteria);
            }
        } else {
            this.modalErrorMsg = '';
        }
    }

    validateExtraCriteria(): void {
        this.prepareEnhancedCriteriaForm();
        if (this.getExtraCriteria().length > 0 && !this.restrictedQuery) {
            this.extraCriteria.forEach(element => {
                if (!element.searchFieldId) {
                    this.modalErrorMsg = this.facadeService.translateService.instant(StesSearchConstants.EMPTY_ENHANCEDSEARCH) + '\n';
                }
                if (!element.comparatorId) {
                    this.modalErrorMsg += this.facadeService.translateService.instant(StesSearchConstants.EMPTY_COMPERATOR_ENHANCEDSEARCH) + '\n';
                }
                if (!element.searchValue) {
                    this.modalErrorMsg += this.facadeService.translateService.instant(StesSearchConstants.EMPTY_VALUE_ENHANCEDSEARCH);
                }
                if (this.modalErrorMsg !== '') {
                    this.openConfirmModal();
                }
            });
        }
    }

    setRestrictedForm(): FormGroup {
        const restrictedSearchForm = this.searchFormData;
        restrictedSearchForm.patchValue({
            nachname: '',
            vorname: '',
            geburtsdatum: '',
            gemeinde: '',
            personalBerater: '',
            schlagwort: ''
        });
        return restrictedSearchForm;
    }

    showErrorMsg(): void {
        if (this.searchFormData.controls.personenNr.errors) {
            this.setModalErrorMsg(this.facadeService.translateService.instant(StesSearchConstants.STES_LABEL_PERSONENNR));
        } else if (this.searchFormData.controls.stesId.errors) {
            this.setModalErrorMsg(this.facadeService.translateService.instant(StesSearchConstants.STES_LABEL_STESID));
        } else if (this.searchFormData.controls.svNr.errors) {
            this.setModalErrorMsg(this.facadeService.translateService.instant(StesSearchConstants.STES_LABEL_SVNR));
        } else if (this.searchFormData.controls.geburtsdatum.invalid) {
            this.setModalErrorMsg(this.facadeService.translateService.instant(StesSearchConstants.STES_LABEL_GEBURTSDATUM));
        } else if (this.searchFormData.controls.personalBerater.invalid) {
            this.modalErrorMsg = StesSearchConstants.BENUTZER_UNGUELTIG_ERROR_MSG;
        } else if (this.getExtraCriteria().length === 0) {
            this.modalErrorMsg = StesSearchConstants.EMPTY_FORM_ERROR_MSG;
        }
        this.openConfirmModal();
    }

    setModalErrorMsg(keyStr: string): void {
        this.modalErrorMsg = this.invalidErrorMsg.filter(param => param.key === keyStr).shift().value;
    }

    search(data: FormGroup, extracriteria: EnhancedSearchQueryDTO[]): void {
        this.facadeService.spinnerService.activate(StesSearchConstants.STES_SEARCH_RESULT_CHANNEL);
        this.searchDTO = this.searchFormBuilder.buildQueryDTO(data, this.searchDTO, extracriteria);
        this.facadeService.fehlermeldungenService.closeMessage();
        this.stesDataService.callRestService(this.searchDTO, data, this.selectedGemeinde, this.statusOptionsLabels);
    }

    loadExtraCriteria(): void {
        this.dataServiceSub =
            this.dataServiceSub ||
            this.dataService.getExtraCriteriaOptions().subscribe((data: ErweiterteSucheDTO) => {
                this.staticParentOptions = data.fieldGroupIdLabelBeans ? data.fieldGroupIdLabelBeans.map(this.customPropertyMapperTranslationKey) : [];
                for (const parentField of data.fieldGroupIdLabelBeans) {
                    this.staticChildrenOptions.push(parentField.children ? parentField.children.map(this.customPropertyMapperTranslationKey) : []);
                    this.staticChildrenParents.push(parentField.id);
                    for (const childField of parentField.children) {
                        const comparatorData: ErweiterteSucheIdLabelDTO[] = this.getEWSQualifier(
                            data,
                            childField.dataTypeDate,
                            childField.dataTypeDecimal,
                            childField.dataTypeText
                        );
                        this.staticComparatorOptions.push(comparatorData ? comparatorData.map(this.customPropertyMapperTranslationKey) : []);
                        this.staticComparatorParents.push(childField.id);

                        this.staticGrandChildOptions.push(childField.children ? childField.children.map(this.customPropertyMapper) : []);
                        this.staticGrandChildParents.push(childField.id);
                    }
                }
                this.erweiterteSucheDataLoaded.next();
                this.facadeService.spinnerService.deactivate(StesSearchConstants.STES_SEARCH_CHANNEL);
            });
    }

    onAddExtraCriteria(): void {
        this.loadExtraCriteria();
        (this.searchFormData.get(StesSearchConstants.EXTRA_CRITERIA) as FormArray).push(this.searchFormBuilder.buildExtraCriteriaInput());
    }

    getExtraCriteria() {
        return (this.searchFormData.get(StesSearchConstants.EXTRA_CRITERIA) as FormArray).controls;
    }

    onRemoveExtraCriteria(index: number): void {
        (this.searchFormData.get(StesSearchConstants.EXTRA_CRITERIA) as FormArray).removeAt(index);
        this.extraCriteria.splice(index, 1);
        this.selectedChildrenOptions.splice(index, 1);
        this.selectedComparatorOptions.splice(index, 1);
        this.selectedGrandChildOptions.splice(index, 1);
        this.isEWSDropdown.splice(index, 1);

        this.updateStorage();
    }

    prepareEnhancedCriteriaForm(): void {
        this.getExtraCriteria().forEach((extraComponent, idx) => {
            if (extraComponent.get(StesSearchConstants.SEARCH_LEVEL_3).value) {
                this.extraCriteria[idx] = {
                    searchFieldId: extraComponent.get(StesSearchConstants.SEARCH_FIELD_ID).value,
                    comparatorId: extraComponent.get(StesSearchConstants.COMPARATOR_ID).value,
                    searchValue: extraComponent.get(StesSearchConstants.SEARCH_LEVEL_3).value
                };
            } else if (extraComponent.get(StesSearchConstants.SEARCH_FREE_TEXT).value) {
                this.extraCriteria[idx] = {
                    searchFieldId: extraComponent.get(StesSearchConstants.SEARCH_FIELD_ID).value,
                    comparatorId: extraComponent.get(StesSearchConstants.COMPARATOR_ID).value,
                    searchValue: extraComponent.get(StesSearchConstants.SEARCH_FREE_TEXT).value
                };
            } else {
                this.extraCriteria[idx] = {
                    searchFieldId: extraComponent.get(StesSearchConstants.SEARCH_FIELD_ID).value,
                    comparatorId: extraComponent.get(StesSearchConstants.COMPARATOR_ID).value,
                    searchValue: null
                };
            }
        });
    }

    getEWSQualifier(data: ErweiterteSucheDTO, typeDate: boolean, typeDecimal: boolean, typeText: boolean): ErweiterteSucheIdLabelDTO[] {
        if (typeDate || typeDecimal) {
            return data.numberComparatorIdLabelBeans;
        } else if (typeText) {
            return data.stringComparatorIdLabelBeans;
        } else {
            return data.idComparatorIdLabelBeans;
        }
    }

    onReset(): void {
        this.enableInputs();
        let i = (this.searchFormData.get(StesSearchConstants.EXTRA_CRITERIA) as FormArray).length;
        while (i > 0) {
            this.onRemoveExtraCriteria(--i);
        }
        this.searchFormData.reset();
        this.initData();
        this.setDefaultValues();
        this.searchFormData.controls.personalBerater.reset();
    }

    onDrop(name: string, event: any) {
        const data = event.dataTransfer;
        const text = data.getData(StesSearchConstants.TEXT);
        this.setRestrictedControls(text, name);
    }

    onPaste(name: string, event: any) {
        // IE fires another kind of an event on paste
        const data = event.clipboardData || event.view.clipboardData;
        const text = data.getData(StesSearchConstants.TEXT);
        this.setRestrictedControls(text, name);
    }

    setRestrictedControls(text, name: string) {
        if (text && text !== '') {
            this.disableRestrictedInputs(name);
        } else {
            this.enableInputs();
        }
    }

    calcQueryRestricted() {
        if (this.searchFormData.get(StesSearchConstants.SV_NR).value) {
            this.disableRestrictedInputs(StesSearchConstants.SV_NR);
        } else if (this.searchFormData.get(StesSearchConstants.PERSONEN_NR).value) {
            this.disableRestrictedInputs(StesSearchConstants.PERSONEN_NR);
        } else if (this.searchFormData.get(StesSearchConstants.STES_ID).value) {
            this.disableRestrictedInputs(StesSearchConstants.STES_ID);
        } else {
            this.enableInputs();
        }
    }

    enableInputs(value?, ids?: string[]) {
        if (!value) {
            this.resetRestricted(ids ? ids : [StesSearchConstants.SV_NR, StesSearchConstants.PERSONEN_NR, StesSearchConstants.STES_ID]);
            this.combiningFieldsDisabled = false;
            this.svNrDisabled = false;
            this.personenNrDisabled = false;
            this.stesIdDisabled = false;
            this.searchFormData.controls.schlagwort.enable();
            this.restrictedQuery = false;
        }
    }

    resetRestricted(ids: string[]) {
        ids.forEach(id => this.searchFormData.get(id).reset());
    }

    disableRestrictedInputs(idEnabled: string) {
        this.combiningFieldsDisabled = true;
        this.searchFormData.controls.schlagwort.disable();

        if (idEnabled !== StesSearchConstants.SV_NR) {
            this.svNrDisabled = true;
        }

        if (idEnabled !== StesSearchConstants.PERSONEN_NR) {
            this.personenNrDisabled = true;
        }

        if (idEnabled !== StesSearchConstants.STES_ID) {
            this.stesIdDisabled = true;
        }

        this.restrictedQuery = true;
    }

    reloadChildrenOptions(parentId: string, index: number) {
        this.selectedChildrenOptions[index] = [];
        this.selectedComparatorOptions[index] = [];
        this.selectedGrandChildOptions[index] = [];
        for (let childIndex = 0; childIndex < this.staticChildrenOptions.length; childIndex++) {
            const child = this.staticChildrenOptions[childIndex];
            const childsParentId = this.staticChildrenParents[childIndex];

            if (childsParentId === parentId) {
                this.selectedChildrenOptions[index] = child;
                (this.getExtraCriteria()[index] as FormGroup).controls.searchFieldId.setValue(this.selectedChildrenOptions[index][0].codeId);
                this.reloadComparatorsAndGrandChildOptions(child[0].codeId, index);
            }
        }
        this.setChildrenFromState(index);
    }

    reloadComparatorsAndGrandChildOptions(childId: string, index: number) {
        this.selectedComparatorOptions[index] = [];
        this.selectedGrandChildOptions[index] = [];
        for (let comparatorIndex = 0; comparatorIndex < this.staticComparatorOptions.length; comparatorIndex++) {
            const comparator = this.staticComparatorOptions[comparatorIndex];
            const comparatorParentId = this.staticComparatorParents[comparatorIndex];
            if (comparatorParentId === childId) {
                this.selectedComparatorOptions[index] = comparator;
                (this.getExtraCriteria()[index] as FormGroup).controls.comparatorId.setValue(this.selectedComparatorOptions[index][0].codeId);
            }
        }
        if (this.isFieldDate(childId)) {
            (this.getExtraCriteria()[index] as FormGroup).get(StesSearchConstants.SEARCH_FREE_TEXT).setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        } else {
            (this.getExtraCriteria()[index] as FormGroup).get(StesSearchConstants.SEARCH_FREE_TEXT).clearValidators();
            (this.getExtraCriteria()[index] as FormGroup).get(StesSearchConstants.SEARCH_FREE_TEXT).updateValueAndValidity();
        }

        for (let grandChildIndex = 0; grandChildIndex < this.staticGrandChildOptions.length; grandChildIndex++) {
            const grandChild = this.staticGrandChildOptions[grandChildIndex];
            const grandChildsParentId = this.staticGrandChildParents[grandChildIndex];
            if (grandChildsParentId === childId) {
                this.selectedGrandChildOptions[index] = grandChild;
                if (grandChild.length > 0) {
                    (this.getExtraCriteria()[index] as FormGroup).controls.searchLevel3.setValue(this.selectedGrandChildOptions[index][0].codeId);
                }
                this.isEWSDropdown[index] = grandChild.length > 0;
            }
        }

        this.setComparatorsAndGrandChildFromState(index);
    }

    formatWithDots() {
        this.facadeService.formUtilsService.formatDateWithDots(this.searchFormData.controls.geburtsdatum);
    }

    formatSearchFreeText(index: number) {
        const control = (this.getExtraCriteria()[index] as FormGroup).controls.searchFreeText;
        this.facadeService.formUtilsService.formatDateWithDots(control);
    }

    openConfirmModal() {
        const modalRef = this.facadeService.openModalFensterService.openModal(GenericConfirmComponent);
        modalRef.componentInstance.titleLabel = '';
        modalRef.componentInstance.promptLabel = this.modalErrorMsg;
        modalRef.componentInstance.primaryButton = StesSearchConstants.COMMON_BUTTON_OK;
        modalRef.componentInstance.singleButtonCenter = true;
    }

    private customPropertyMapperTranslationKey = (element: ErweiterteSucheIdLabelDTO) => {
        return {
            value: element.id,
            code: element.id,
            codeId: element.id,
            labelKey: element.label
        };
    };

    private customPropertyMapper = (element: ErweiterteSucheIdLabelDTO) => {
        return {
            value: element.id,
            code: element.id,
            codeId: element.id,
            labelFr: element.labelFr,
            labelIt: element.labelIt,
            labelDe: element.labelDe
        };
    };

    private initStatusOptionLabels(callback?): void {
        forkJoin([this.stesDataRestService.getCode(DomainEnum.STES_STATUS), this.stesDataRestService.getFixedCode(DomainEnum.COMMON_STATUS_ALL_OPTION)]).subscribe(
            ([status, statusAll]) => {
                const statusOptions = this.searchFormBuilder.buildStatusOptionLabels(status[0], status[1], statusAll[0]);
                this.statusOptionsLabels = this.facadeService.formUtilsService.mapDropdownKurztext(statusOptions);
                this.facadeService.spinnerService.deactivate(StesSearchConstants.STES_SEARCH_CHANNEL);
                if (callback) {
                    callback();
                }
            }
        );
    }

    private isFieldDate(fieldCode: string): boolean {
        return this.dateFields.includes(fieldCode);
    }

    private getBenutzerSuchenTokens(): any {
        const loggedUser: UserDto = this.facadeService.authenticationService.getLoggedUser();
        return !loggedUser
            ? null
            : {
                  myBenutzerstelleId: loggedUser.benutzerstelleId,
                  myVollzugsregionTyp: DomainEnum.STES,
                  stati: DomainEnum.BENUTZER_STATUS_AKTIV
              };
    }

    private restoreState(state): void {
        this.restoreStandardSearchForm(state);
        if (state.fields.extraCriteria) {
            this.restoreExtraCriteria(state.fields.extraCriteria);
        }
    }

    private restoreExtraCriteria(extraCriterias: any[]): void {
        this.erweiterteSucheDataLoaded.asObservable().subscribe(() => {
            this.extraCriteria = [];
            extraCriterias.forEach((extraCrit, i) => {
                (this.searchFormData.get(StesSearchConstants.EXTRA_CRITERIA) as FormArray).push(this.searchFormBuilder.buildExtraCriteriaInput());

                const extraCriteria = {
                    searchFieldId: extraCrit.searchFieldId,
                    comparatorId: extraCrit.comparatorId,
                    searchValue: extraCrit.searchLevel3 ? extraCrit.searchLevel3 : extraCrit.searchFreeText
                };
                this.extraCriteria.push(extraCriteria);
                (this.getExtraCriteria()[i] as FormGroup).controls.searchLevel1.setValue(extraCrit.searchLevel1);
            });
            this.search(this.searchFormData, this.extraCriteria);
        });
        this.loadExtraCriteria();
    }

    private setChildrenFromState(index: number): void {
        const state = this.searchSession.restoreStateByKey(StesSearchConstants.STES_SEARCH_CACHE);
        if (state && state.fields.extraCriteria && state.fields.extraCriteria.length > index) {
            (this.getExtraCriteria()[index] as FormGroup).controls.searchFieldId.setValue(state.fields.extraCriteria[index].searchFieldId);
        }
    }

    private setComparatorsAndGrandChildFromState(index: number): void {
        const state = this.searchSession.restoreStateByKey(StesSearchConstants.STES_SEARCH_CACHE);
        if (state && state.fields.extraCriteria && state.fields.extraCriteria.length > index) {
            (this.getExtraCriteria()[index] as FormGroup).controls.comparatorId.setValue(state.fields.extraCriteria[index].comparatorId);
            if (state.fields.extraCriteria[index].searchLevel3) {
                (this.getExtraCriteria()[index] as FormGroup).controls.searchLevel3.setValue(state.fields.extraCriteria[index].searchLevel3);
            } else if (state.fields.extraCriteria[index].searchFreeText) {
                (this.getExtraCriteria()[index] as FormGroup).controls.searchFreeText.setValue(state.fields.extraCriteria[index].searchFreeText);
            }
        }
    }

    private updateStorage(): void {
        const storage = {
            nachname: this.searchFormData.controls.nachname.value,
            vorname: this.searchFormData.controls.vorname.value,
            svNr: this.searchFormData.controls.svNr.value,
            personalBerater: this.getPersonalBeraterFullValue(),
            gemeinde: this.searchFormData.controls.gemeinde[StesSearchConstants.GEMEINDE_OBJ],
            schlagwort: this.getSchlagwortFullValue(),
            geburtsdatum: this.searchFormData.controls.geburtsdatum.value,
            personenNr: this.searchFormData.controls.personenNr.value,
            stesId: this.searchFormData.controls.stesId.value,
            statusId: this.searchFormData.controls.statusId.value,
            extraCriteria: this.searchFormData.controls.extraCriteria.value
        };
        this.searchSession.storeFieldsByKey(StesSearchConstants.STES_SEARCH_CACHE, storage);
    }

    private restoreStandardSearchForm(state: any): void {
        this.searchFormData.patchValue(state.fields);
        if (state.fields.schlagwort) {
            this.searchFormData.controls.schlagwort.setValue(state.fields.schlagwort.value);
        }
    }

    private getPersonalBeraterFullValue(): any {
        if (this.searchFormData.controls.personalBerater.value && this.searchFormData.controls.personalBerater.value.hasOwnProperty('benutzerDetailId')) {
            return this.searchFormData.controls.personalBerater.value;
        }
        if (this.searchFormData.controls.personalBerater['benutzerObject'] && this.searchFormData.controls.personalBerater['benutzerObject'].benutzerDetailId > 0) {
            return this.searchFormData.controls.personalBerater['benutzerObject'];
        }
        return '';
    }

    private getSchlagwortFullValue(): any {
        if (this.searchFormData.controls.schlagwort.value && this.searchFormData.controls.schlagwort.value.hasOwnProperty('value')) {
            return this.searchFormData.controls.schlagwort.value;
        }
        if (this.searchFormData.controls.schlagwort.value) {
            return {
                value: this.searchFormData.controls.schlagwort.value
            };
        }
        return '';
    }
}
