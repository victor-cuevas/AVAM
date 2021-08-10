import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CodeDTO } from '@dtos/codeDTO';
import { Unsubscribable } from 'oblique-reactive';
import { FacadeService } from '@shared/services/facade.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { filter, finalize, first, takeUntil } from 'rxjs/operators';
import { OsteStatusCode } from '@shared/enums/domain-code/oste-status-code.enum';
import { NumberValidator } from '@shared/validators/number-validator';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { geschaeftsartEnum, SchlagworteAutosuggestInputComponent } from '@shared/components/schlagworte-autosuggest/schlagworte-autosuggest.component';
import { ErweiterteSucheComponent, ToolboxService } from '@app/shared';
import { DateValidator } from '@shared/validators/date-validator';
import { StellenSuchenTableComponent } from '@modules/arbeitgeber/stellenangebot/pages/stellen-suchen/stellen-suchen-table/stellen-suchen-table.component';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { UnternehmenSideNavLabels } from '@shared/enums/stes-routing-labels.enum';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { Permissions } from '@shared/enums/permissions.enum';
import { StatusEnum } from '@shared/classes/fixed-codes';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { OsteSuchenParamDTO } from '@dtos/osteSuchenParamDTO';
import { BaseResponseWrapperListOsteSuchresultatParamDTOWarningMessages } from '@dtos/baseResponseWrapperListOsteSuchresultatParamDTOWarningMessages';
import { EnhancedSearchQueryDTO } from '@dtos/enhancedSearchQueryDTO';
import { GemeindeDTO } from '@dtos/gemeindeDTO';
import { SchlagwortDTO } from '@dtos/schlagwortDTO';
import { TwoFieldsAutosuggestValidator } from '@shared/validators/two-fields-autosuggest-validator';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { Router } from '@angular/router';

@Component({
    selector: 'avam-stellen-suchen',
    templateUrl: './stellen-suchen.component.html',
    styleUrls: ['./stellen-suchen.component.scss']
})
export class StellenSuchenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    static STATE_KEY = 'stellen-suchen-state-key';
    @ViewChild('schlagworteAutosuggest') schlagworteAutosuggest: SchlagworteAutosuggestInputComponent;
    @ViewChild('stellenSuchenTable') stellenSuchenTable: StellenSuchenTableComponent;
    @ViewChild('stellenSuchenTableModal') stellenSuchenTableModal: StellenSuchenTableComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('erweiterteSucheComponent') erweiterteSucheComponent: ErweiterteSucheComponent;

    public channel = 'channel';
    public searchForm: FormGroup;
    public defaultStatus: string;
    public currentArbeitgeber: any;
    public personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;
    public statusOptions: CodeDTO[] = [];
    public personalberaterEvent: any;
    public gemeindeEvent: any;
    public selectedSchlagwort: SchlagwortDTO;
    public geschaeftsartEnum: typeof geschaeftsartEnum = geschaeftsartEnum;
    public ERWEITERTERSUCHEN_ES_OSTE = 'es_oste';
    public ERWEITERTERSUCHEN_ERFASSUNGSDATUM = 'es_erfasstAm_oste';
    public ERWEITERTERSUCHEN_BESCHAEFTIGUGSGRAD = 'es_beschaeftigungsgrad_oste_suchen';
    public ERWEITERTERSUCHEN_GULTIKEIT = 'es_gueltigkeit_oste';
    public ERWEITERTERSUCHEN_JOBROOM = 'es_jobroomnr_oste';
    public ERWEITERTERSUCHEN_LIKE = 'es_like';
    public isSearchButtonEnabled = false;
    public dataSource = [];
    permissions: typeof Permissions = Permissions;
    private readonly DROPDOWNS = ['es_behinderung_oste', 'es_zuweisungstop_oste'];

    constructor(
        private infopanelService: AmmInfopanelService,
        private facadeService: FacadeService,
        private stesDataRestService: StesDataRestService,
        private fb: FormBuilder,
        private searchSession: SearchSessionStorageService,
        private osteDataRestService: OsteDataRestService,
        private changeDetectorRef: ChangeDetectorRef,
        private router: Router
    ) {
        super();
    }

    public ngOnInit() {
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
        this.generateForm();
        this.createSubscriptions();
        this.initToolBox();
        this.infopanelService.dispatchInformation({
            subtitle: UnternehmenSideNavLabels.STELLENANGEBOTE,
            hideInfobar: true
        });
    }

    public ngAfterViewInit(): void {
        this.getInitialData();
    }

    public ngOnDestroy(): void {
        this.infopanelService.updateInformation({ hideInfobar: false, tableCount: undefined });
        this.facadeService.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    public selectedUnternehmen(unternehmen: any) {
        this.currentArbeitgeber = unternehmen;
    }

    public clearUnternehmen() {
        this.currentArbeitgeber = null;
    }

    public updatePersonalberaterSuche(personalberaterState: any): void {
        if (personalberaterState) {
            this.personalberaterEvent = personalberaterState;
            this.searchForm.controls.stellenverantwortung.setValue(personalberaterState);
        }
    }

    public updateGemeindeSuche(gemeindeState: any): void {
        if (gemeindeState && gemeindeState.value) {
            this.gemeindeEvent = gemeindeState;
            this.searchForm.controls.gemeinde.setValue(gemeindeState);
        }
    }

    public selectSchlagwort(event: SchlagwortDTO) {
        this.selectedSchlagwort = event;
    }

    public removeSelectValue() {
        this.selectedSchlagwort = null;
    }

    public clearEmptyPersonalberaterSuche(event: any): void {
        const isNullObject = typeof event === 'object' && event === null;
        const isEmptyString = typeof event === 'string' && event === '';
        if (isNullObject || isEmptyString) {
            this.personalberaterEvent = null;
            this.searchForm.controls.stellenverantwortung['benutzerObject'] = null;
        } else {
            this.personalberaterEvent = event;
        }
    }

    public onClickErweiterteSuche() {
        this.setCustomOptionComparator();
        if (this.erweiterteSucheComponent && this.erweiterteSucheComponent.criteria.controls.length > 0) {
            let updated = false;
            const extraCriteras = this.erweiterteSucheComponent.getExtraCriteria() as FormGroup[];
            extraCriteras.forEach((extraCriteria: FormGroup) => {
                if (extraCriteria.controls.comparatorId.value === '') {
                    extraCriteria.controls.searchLevel1.setValue(this.ERWEITERTERSUCHEN_ES_OSTE);
                }
                extraCriteria.controls.searchFieldId.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
                    if (
                        extraCriteria.controls.searchFieldId.value === this.ERWEITERTERSUCHEN_ERFASSUNGSDATUM ||
                        extraCriteria.controls.searchFieldId.value === this.ERWEITERTERSUCHEN_GULTIKEIT
                    ) {
                        extraCriteria.controls.searchFreeText.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
                    } else if (extraCriteria.controls.searchFieldId.value === this.ERWEITERTERSUCHEN_BESCHAEFTIGUGSGRAD) {
                        extraCriteria.controls.searchFreeText.setValidators([Validators.required, NumberValidator.isValidPercentage]);
                    } else if (this.DROPDOWNS.includes(value)) {
                        extraCriteria.controls.searchFreeText.setValidators(null);
                    } else {
                        extraCriteria.controls.searchFreeText.setValidators([Validators.required]);
                    }
                    extraCriteria.controls.searchFreeText.setValue(null);
                    extraCriteria.controls.searchFreeText.updateValueAndValidity();
                });
                updated = true;
            });
            if (updated) {
                this.changeDetectorRef.detectChanges();
            }
        }
    }

    public search(): void {
        if (this.searchForm.valid) {
            this.storeState();
            this.facadeService.fehlermeldungenService.closeMessage();
            this.facadeService.spinnerService.activate(this.channel);
            this.osteDataRestService
                .searchOste(this.mapToDTO())
                .pipe(
                    takeUntil(this.unsubscribe),
                    finalize(() => {
                        this.facadeService.spinnerService.deactivate(this.channel);
                        OrColumnLayoutUtils.scrollTop();
                    })
                )
                .subscribe((response: BaseResponseWrapperListOsteSuchresultatParamDTOWarningMessages) => {
                    if (response) {
                        this.dataSource = response.data;
                        this.stellenSuchenTable.setData(this.dataSource, this.statusOptions);
                        this.infopanelService.updateInformation({ tableCount: this.dataSource.length });
                    }
                });
        }
    }

    public reset() {
        this.searchForm.reset({
            status: this.defaultStatus
        });
        this.dataSource = [];
        this.stellenSuchenTable.setData(this.dataSource, this.statusOptions);
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.schlagworteAutosuggest.filterDropdown.nativeElement.value = StatusEnum.AKTIV;
        this.erweiterteSucheComponent.onReset();
        this.searchSession.clearStorageByKey(StellenSuchenComponent.STATE_KEY);
        this.searchSession.restoreDefaultValues('stellen-suchen-table');
    }

    private generateForm() {
        this.searchForm = this.fb.group({
            status: null,
            stellenbezeichnung: [null, TwoFieldsAutosuggestValidator.inputMinLength(2)],
            stellenNummer: [null, NumberValidator.val010],
            arbeitgeber: [null, TwoFieldsAutosuggestValidator.inputMinLength(2)],
            gemeinde: null,
            stellenverantwortung: null,
            schlagwort: null,
            extraCriteria: this.fb.array([])
        });
    }

    private getInitialData() {
        this.facadeService.spinnerService.activate(this.channel);
        this.stesDataRestService
            .getCode(DomainEnum.STATUS_OSTE)
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.facadeService.spinnerService.deactivate(this.channel))
            )
            .subscribe(statusId => {
                this.statusOptions = this.facadeService.formUtilsService.mapDropdownKurztext(statusId);
                this.defaultStatus = this.facadeService.formUtilsService.getCodeIdByCode(this.statusOptions, OsteStatusCode.ACTIVE);
                this.searchForm.controls.status.setValue(this.defaultStatus);
                const state = this.searchSession.restoreStateByKey(StellenSuchenComponent.STATE_KEY);
                if (state) {
                    this.restoreStateAndSearch(state);
                } else {
                    this.facadeService.spinnerService.deactivate(this.channel);
                }
            });
    }

    private initToolBox() {
        ToolboxService.CHANNEL = this.channel;
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getStellenangebotSuchenConfig(), this.channel, null);

        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.facadeService.openModalFensterService.openPrintModal(this.modalPrint, this.stellenSuchenTable.dataSource));
    }

    private createSubscriptions() {
        this.facadeService.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.stellenSuchenTable.setData(this.dataSource, this.statusOptions);
        });
        this.searchForm.valueChanges.subscribe(value => {
            this.isSearchButtonEnabled = Object.keys(value)
                .filter(k => k !== 'status')
                .map(k => value[k])
                .some(v => (Array.isArray(v) ? v.length > 0 : !!v));
        });
    }

    private restoreStateAndSearch(state) {
        this.erweiterteSucheComponent.extraCriteriaLoaded.pipe(first()).subscribe(() => {
            this.setCustomOptionComparator();
        });
        this.searchForm.patchValue({
            status: state.fields.status,
            stellenbezeichnung: state.fields.stellenbezeichnung,
            stellenNummer: state.fields.stellenNummer,
            arbeitgeber: state.fields.arbeitgeber,
            schlagwort: state.fields.schlagwort
        });
        this.schlagworteAutosuggest.filterDropdown.nativeElement.value = state.fields.schlagowrtStatus;
        this.updatePersonalberaterSuche(state.fields.stellenverantwortung);
        this.updateGemeindeSuche(state.fields.gemeinde);
        this.restoreErweiterteSuche(state);
        setTimeout(() => this.search(), 1000);
    }

    private storeState(): void {
        const formSearchControls = this.searchForm.controls;
        const storage: any = {
            status: formSearchControls.status.value,
            stellenbezeichnung: formSearchControls.stellenbezeichnung.value,
            stellenNummer: formSearchControls.stellenNummer.value,
            arbeitgeber: formSearchControls.arbeitgeber.value,
            gemeinde: formSearchControls.gemeinde['gemeindeObj']
                ? formSearchControls.gemeinde['gemeindeObj']
                : {
                      gemeindeBaseInfo: {
                          bfsNummer: '',
                          gemeindeId: -1,
                          nameDe: formSearchControls.gemeinde.value,
                          nameFr: formSearchControls.gemeinde.value,
                          nameIt: formSearchControls.gemeinde.value
                      },
                      kanton: '',
                      plz: '',
                      ortschaftsbezeichnung: '',
                      value: formSearchControls.gemeinde.value
                  },
            stellenverantwortung: formSearchControls.stellenverantwortung['benutzerObject']
                ? formSearchControls.stellenverantwortung['benutzerObject'].benutzerId === -1
                    ? {
                          benuStelleCode: '',
                          benutzerDetailId: -1,
                          benutzerId: -1,
                          benutzerLogin: '',
                          benutzerstelleId: -1,
                          nachname: formSearchControls.stellenverantwortung.value,
                          vorname: ''
                      }
                    : formSearchControls.stellenverantwortung['benutzerObject']
                : null,
            schlagwort: this.getSchlagwortFromAutosuggest(formSearchControls.schlagwort),
            schlagowrtStatus: this.schlagworteAutosuggest.filterDropdown.nativeElement.value,
            extraCriteria: this.erweiterteSucheComponent ? this.storeErweiterteSuche() : []
        };
        this.searchSession.storeFieldsByKey(StellenSuchenComponent.STATE_KEY, storage);
    }

    private getSchlagwortFromAutosuggest(schlagwortAutosuggest) {
        let output;
        if (typeof schlagwortAutosuggest.value === 'string') {
            output = schlagwortAutosuggest.value;
        } else if (schlagwortAutosuggest.value) {
            output = schlagwortAutosuggest.value.value;
        } else {
            output = null;
        }
        return output;
    }

    private mapToDTO(): OsteSuchenParamDTO {
        const searchFormControl = this.searchForm.controls;
        const unternehmenObjControl = searchFormControl.arbeitgeber['unternehmenAutosuggestObject'];
        return {
            osteStatusId: searchFormControl.status.value,
            bezeichnung: searchFormControl.stellenbezeichnung.value,
            stellenNr: searchFormControl.stellenNummer.value,
            unternehmenName: searchFormControl.arbeitgeber['unternehmenAutosuggestObject'].name1
                ? searchFormControl.arbeitgeber['unternehmenAutosuggestObject'].name1
                : searchFormControl.arbeitgeber.value,
            plzId: unternehmenObjControl.plzId ? unternehmenObjControl.plzId : null,
            plz: unternehmenObjControl.plz ? unternehmenObjControl.plz : null,
            ort: unternehmenObjControl.ort ? unternehmenObjControl.ort : null,
            gemeindeDTO: this.mapGemeindeDTO(searchFormControl),
            stellenverantwortlicher: searchFormControl.stellenverantwortung['benutzerObject'] ? searchFormControl.stellenverantwortung['benutzerObject'] : null,
            burNummer: unternehmenObjControl.burNr ? unternehmenObjControl.burNr : null,
            schlagwortDTO: this.mapSchlagwortDTO(searchFormControl),
            searchTuples: searchFormControl.extraCriteria.value.map(
                (el): EnhancedSearchQueryDTO => {
                    return {
                        comparatorId: el.comparatorId,
                        searchFieldId: el.searchFieldId,
                        searchValue: el.searchFreeText ? el.searchFreeText : el.searchLevel3
                    };
                }
            )
        };
    }

    private mapGemeindeDTO(searchFormControl): GemeindeDTO {
        if (searchFormControl.gemeinde['gemeindeObj']) {
            return searchFormControl.gemeinde['gemeindeObj'].gemeindeBaseInfo;
        } else if (!searchFormControl.gemeinde.value) {
            return null;
        } else {
            return {
                gemeindeId: searchFormControl.gemeinde['customGemeindeObj'].gemeindeBaseInfo.gemeindeId,
                bfsNummer: null,
                nameDe: searchFormControl.gemeinde['customGemeindeObj'].gemeindeBaseInfo.nameDe
            };
        }
    }

    private mapSchlagwortDTO(searchFormControl): SchlagwortDTO {
        if (this.selectedSchlagwort) {
            return {
                ...this.selectedSchlagwort,
                schlagwort: this.selectedSchlagwort[
                    `schlagwort${this.facadeService.translateService.currentLang[0].toUpperCase()}${this.facadeService.translateService.currentLang[1]}`
                ]
            };
        } else if (searchFormControl.schlagwort.value) {
            return { schlagwortId: -1, schlagwort: searchFormControl.schlagwort.value };
        } else {
            return null;
        }
    }

    private storeErweiterteSuche(): any[] {
        const returnErweiterteSucheArray = [];
        const extraCriteras = this.erweiterteSucheComponent.getExtraCriteria() as FormGroup[];

        extraCriteras.forEach(value => {
            const extraCriteria = {
                comparatorId: value.controls.comparatorId.value,
                searchFieldId: value.controls.searchFieldId.value,
                searchValue: value.controls.searchFreeText.value ? value.controls.searchFreeText.value : value.controls.searchLevel3.value
            };
            returnErweiterteSucheArray.push(extraCriteria);
        });
        return returnErweiterteSucheArray;
    }

    private restoreErweiterteSuche(state: any): void {
        let update = false;
        const erweiterteSucheComponent = this.erweiterteSucheComponent;
        if (erweiterteSucheComponent && state.fields.extraCriteria && state.fields.extraCriteria.length > 0) {
            if (erweiterteSucheComponent.staticChildrenOptions.length > 0) {
                this.restoreErweiterteSucheParams(state);
            } else {
                erweiterteSucheComponent.extraCriteriaLoaded.pipe(first()).subscribe(() => {
                    this.restoreErweiterteSucheParams(state);
                });
            }
            update = true;
        }
        if (update) {
            this.changeDetectorRef.detectChanges();
        }
    }

    private restoreErweiterteSucheParams(state): void {
        const erweiterteSucheComponent = this.erweiterteSucheComponent;
        state.fields.extraCriteria.forEach((el, index) => {
            erweiterteSucheComponent.onAddExtraCriteria();
            (erweiterteSucheComponent.criteria.controls[index] as FormGroup).get('searchFieldId').setValue(el.searchFieldId);
            (erweiterteSucheComponent.criteria.controls[index] as FormGroup).get('comparatorId').setValue(el.comparatorId);
            (erweiterteSucheComponent.criteria.controls[index] as FormGroup).get('searchLevel3').setValue(el.searchValue);
            (erweiterteSucheComponent.criteria.controls[index] as FormGroup).get('searchFreeText').setValue(el.searchValue);
        });
    }

    private setCustomOptionComparator() {
        const oste = this.erweiterteSucheComponent.staticParentOptions.findIndex(item => item.code === this.ERWEITERTERSUCHEN_ES_OSTE);
        const jobroom = this.erweiterteSucheComponent.staticChildrenOptions[oste].findIndex(item => item.code === this.ERWEITERTERSUCHEN_JOBROOM);
        const comparatorList = this.erweiterteSucheComponent.staticComparatorOptions[jobroom];
        const finalComparatorList = comparatorList.filter(item => item.code !== this.ERWEITERTERSUCHEN_LIKE);
        this.erweiterteSucheComponent.staticComparatorOptions[jobroom] = finalComparatorList;
    }
}
