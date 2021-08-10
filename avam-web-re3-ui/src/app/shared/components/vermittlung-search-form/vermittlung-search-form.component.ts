import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { AvamBerufAutosuggestComponent } from '@app/library/wrappers/form/autosuggests/avam-beruf-autosuggest/avam-beruf-autosuggest.component';
import { ErweiterteSucheIdLabelDTO } from '@shared/models/dtos/erweiterte-suche-id-label-dto.interface';
import { DateValidator } from '@shared/validators/date-validator';
import { NumberValidator } from '@shared/validators/number-validator';
import { ErweiterteSucheDTO } from '@shared/models/dtos/erweiterte-suche-dto.interface';
import { CodeDTO } from '@dtos/codeDTO';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { forkJoin } from 'rxjs';
import { DomainEnum } from '@shared/enums/domain.enum';
import { first, finalize, takeUntil } from 'rxjs/operators';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { AuthenticationService } from '@core/services/authentication.service';
import { Unsubscribable } from 'oblique-reactive';
import { StesFuerZuweisungSuchenParamDTO } from '@dtos/stesFuerZuweisungSuchenParamDTO';
import { EnhancedSearchQueryDTO } from '@dtos/enhancedSearchQueryDTO';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { StatusEnum } from '@shared/classes/fixed-codes';
import { ErweiterteSucheComponent } from '@app/shared';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { Router } from '@angular/router';
import { FormUtilsService } from '@app/shared';
import { FacadeService } from '@shared/services/facade.service';

interface EnhancedSearchLabelInfo {
    sucheObject: any[];
    sucheKriterium: EnhancedSearchLabelChildrenInfo[];
    operatorId: EnhancedSearchLabelChildrenInfo[];
    dropdownOption: EnhancedSearchLabelChildrenInfo[];
}

interface EnhancedSearchLabelChildrenInfo {
    labels: any[];
}

@Component({
    selector: 'avam-vermittlung-search-form',
    templateUrl: './vermittlung-search-form.component.html',
    styleUrls: ['./vermittlung-search-form.component.scss']
})
export class VermittlungSearchFormComponent extends Unsubscribable implements OnInit, AfterViewInit {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('berufAutosuggest') berufAutosuggest: AvamBerufAutosuggestComponent;
    @ViewChild('erweiterteSucheComponent') erweiterteSucheComponent: ErweiterteSucheComponent;

    @Input() stateKey: string;
    @Output() searchEmitter = new EventEmitter<StesFuerZuweisungSuchenParamDTO>();
    @Output() resetEmitter = new EventEmitter<void>();
    @Output() spinnerEmitter = new EventEmitter<boolean>();

    permissions: typeof Permissions = Permissions;
    qualifikationDropdownLabels: CodeDTO[] = [];
    erfahrungDropdownLabels: CodeDTO[] = [];
    ausbildungniveauDropdownLabels: CodeDTO[] = [];
    stesImZustaendigkeitsbereichLabels: CodeDTO[] = [];
    benutzerSuchenTokens: any = {};
    benutzerAutosuggestType = BenutzerAutosuggestType.BENUTZER;
    rawEnhancedSearchInfo: ErweiterteSucheDTO;
    personalberaterEvent: any;
    searchForm: FormGroup;

    private berufsFunktionCodes: CodeDTO[] = [];
    private berufAbschlussCodes: CodeDTO[] = [];
    private readonly SEARCH_FIELD_NO_FREE_TEXT = [
        'es_leistungsbezug_stes_vm',
        'es_erwerbssituation_stes_vm',
        'es_aufenthaltsstatus_stes_vm',
        'es_geschlecht_stes_vm',
        'es_fuehrerausweis_kategorie_stes_vm',
        'es_fahrzeug_stes_vm',
        'es_arbeitszeit_stes_vm',
        'es_arbeitsform_stes_vm',
        'es_mobilitaet_stes_vm',
        'es_wohnortwechsel_stes_vm',
        'es_sprache_stes_vm',
        'es_muttersprache_stes_vm',
        'es_funktion_stes_vm',
        'es_berufsabschluss_stes_vm',
        'es_ausgeuebt_stes_vm',
        'es_gesucht_stes_vm',
        'es_status_zv_stes_vm'
    ];

    get extraCriteria(): FormArray {
        return this.searchForm.controls['extraCriteria'] as FormArray;
    }

    isDropdown = [];
    STELLENATRITT_AB = 'es_stellenantritt_ab_stes_vm';
    VERMITTLUNGSGRAD = 'es_vermittlungsgrad_stes_vm';
    enhancedSearchInfo: EnhancedSearchLabelInfo = {
        sucheObject: [],
        sucheKriterium: [],
        operatorId: [],
        dropdownOption: []
    };

    constructor(
        private fb: FormBuilder,
        private fehlermeldungService: FehlermeldungenService,
        private stesDataRestService: StesDataRestService,
        private restService: UnternehmenRestService,
        private authenticationService: AuthenticationService,
        private searchSession: SearchSessionStorageService,
        private changeDetectorRef: ChangeDetectorRef,
        private router: Router,
        private facade: FacadeService
    ) {
        super();
    }

    ngOnInit() {
        this.generateForm();
        this.checkNavigationState();
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    public ngAfterViewInit(): void {
        this.getInitialData();
        this.berufAutosuggest.inputElement.inputElement.nativeElement.focus();
    }

    updatePersonalberaterSuche(personalberaterState: any): void {
        if (personalberaterState) {
            this.personalberaterEvent = personalberaterState;
            this.searchForm.controls.personalberater.setValue(personalberaterState);
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

    search() {
        this.fehlermeldungService.closeMessage();
        if (this.searchForm.valid) {
            this.searchEmitter.emit(this.mapToDto(this.searchForm));
            this.storeState();
        } else {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    reset() {
        this.searchForm.reset();
        this.searchForm['plzWohnAdresseObject'] = null;
        for (const field in this.searchForm.controls) {
            this.searchForm.get(field).enable();
        }
        this.searchForm.controls['extraCriteria'] = this.fb.array([]);
        this.enhancedSearchInfo = { sucheObject: [], sucheKriterium: [], operatorId: [], dropdownOption: [] };
        this.filterExtraCriteriaFields(this.rawEnhancedSearchInfo);
        this.berufAutosuggest.filterDropdown.nativeElement.value = StatusEnum.AKTIV;
        this.searchForm.updateValueAndValidity();
        this.searchSession.clearStorageByKey(this.stateKey);
        this.resetEmitter.emit();
    }

    getExtraCriteria(i: number): FormGroup {
        return this.extraCriteria.at(i) as FormGroup;
    }

    onClickErweiterteSuche() {
        if (this.erweiterteSucheComponent && this.erweiterteSucheComponent.criteria.controls.length > 0) {
            let updated = false;
            const extraCriteras = this.erweiterteSucheComponent.getExtraCriteria() as FormGroup[];
            extraCriteras.forEach((extraCriteria: FormGroup, index) => {
                extraCriteria.controls.searchFieldId.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(searchFieldId => {
                    if (searchFieldId === this.STELLENATRITT_AB) {
                        this.getExtraCriteria(index).controls['searchFreeText'].setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
                    } else if (searchFieldId === this.VERMITTLUNGSGRAD) {
                        this.getExtraCriteria(index).controls['searchFreeText'].setValidators([Validators.required, NumberValidator.isValidPercentage]);
                    } else if (this.SEARCH_FIELD_NO_FREE_TEXT.includes(searchFieldId)) {
                        this.getExtraCriteria(index).controls['searchFreeText'].setValidators(null);
                    } else {
                        this.getExtraCriteria(index).controls['searchFreeText'].setValidators(Validators.required);
                    }
                    this.getExtraCriteria(index).controls['searchFreeText'].setValue(null);
                    setTimeout(() => this.getExtraCriteria(index).controls['searchFreeText'].updateValueAndValidity(), 0);
                });
                updated = true;
            });
            if (updated) {
                this.changeDetectorRef.detectChanges();
            }
        }
    }

    private getSearchTuples(extraCriteria: FormArray): EnhancedSearchQueryDTO[] {
        return extraCriteria.value.map(
            (el): EnhancedSearchQueryDTO => {
                // This logic is done only in this component to match the RE2 Action logic.
                const codeId = el.searchFreeText ? el.searchFreeText : el.searchLevel3;
                const funktionCode = this.berufsFunktionCodes.find(codeDTO => codeDTO.codeId === +codeId);
                const abschlussCode = this.berufAbschlussCodes.find(codeDTO => codeDTO.codeId === +codeId);

                const value = funktionCode ? funktionCode.code : abschlussCode ? abschlussCode.code : codeId;
                return {
                    comparatorId: el.comparatorId,
                    searchFieldId: el.searchFieldId,
                    searchValue: value
                };
            }
        );
    }

    private getInitialData(): void {
        this.spinnerEmitter.emit(true);
        forkJoin<CodeDTO[], CodeDTO[], CodeDTO[], CodeDTO[], ErweiterteSucheDTO>([
            this.stesDataRestService.getCode(DomainEnum.QUALIFIKATION),
            this.stesDataRestService.getCode(DomainEnum.BERUFSERFAHRUNG),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.AUSBILDUNGSNIVEAU),
            this.stesDataRestService.getCode(DomainEnum.ZUSTAENDIGKEITSREGION),
            this.restService.getExtraCriteriaInfo('stes_fuer_zuweisung')
        ])
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.spinnerEmitter.emit(false))
            )
            .subscribe(([qualifikation, erfahrung, ausbildungsniveau, zustaendigkeitsbereich, extraCriteriaInfo]) => {
                this.qualifikationDropdownLabels = qualifikation.map(this.customPropertyMapper);
                this.erfahrungDropdownLabels = erfahrung.map(this.customPropertyMapper);
                this.ausbildungniveauDropdownLabels = ausbildungsniveau.map(this.customPropertyMapper);
                this.stesImZustaendigkeitsbereichLabels = this.facade.formUtilsService.mapDropdownKurztext(zustaendigkeitsbereich);
                this.filterExtraCriteriaFields(extraCriteriaInfo);
                const state = this.searchSession.restoreStateByKey(this.stateKey);
                if (state) {
                    this.restoreStateAndSearch(state);
                }
            });

        forkJoin<CodeDTO[], CodeDTO[]>([this.stesDataRestService.getCode(DomainEnum.BERUFSFUNKTION), this.stesDataRestService.getCode(DomainEnum.BERUFSABSCHLUSS)])
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.spinnerEmitter.emit(false))
            )
            .subscribe(([berufsFunktionCodes, berufAbschlussCodes]) => {
                this.berufsFunktionCodes = berufsFunktionCodes.map(this.customPropertyMapper);
                this.berufAbschlussCodes = berufAbschlussCodes.map(this.customPropertyMapper);
            });
        this.benutzerSuchenTokens = this.getBenutzerSuchenTokens();
    }

    private customPropertyMapper(element: CodeDTO) {
        return {
            code: element.code,
            codeId: element.codeId,
            value: element.code,
            labelFr: element.kurzTextFr,
            labelIt: element.kurzTextIt,
            labelDe: element.kurzTextDe
        };
    }

    private mapToDto(searchForm): StesFuerZuweisungSuchenParamDTO {
        const formControls: any = searchForm.controls;
        return {
            beruf: formControls.berufeTaetigkeit.berufAutosuggestObject,
            berufGueltigkeit: this.berufAutosuggest.filterDropdown.nativeElement.value,
            verwandteBerufe: formControls.umAehnlicheBerufeErgaenzen.value ? true : null,
            qualifikationCode: formControls.qualifikation.value,
            erfahrungCode: formControls.erfahrung.value,
            ausbildungsniveauCode: formControls.ausbildungniveau.value,
            zustaendigkeitsBereichId: formControls.stesImZustaendigkeitsbereich.value,
            skills: formControls.faehigketienSkills.value ? formControls.faehigketienSkills.value : null,
            stesName: formControls.name.value ? formControls.name.value : '',
            stesVorname: formControls.vorname.value ? formControls.vorname.value : '',
            plz: searchForm['plzWohnAdresseObject'],
            personalberater: formControls.personalberater.value ? formControls.personalberater.benutzerObject : null,
            arbeitsregionObject: formControls.gewuenscheArbeitsRegion.arbeitsorteAutosuggestObject,
            enhancedSearchQueries: this.getSearchTuples(formControls.extraCriteria)
        };
    }

    private getBenutzerSuchenTokens() {
        const currentUser = this.authenticationService.getLoggedUser();

        return !currentUser
            ? null
            : {
                myBenutzerstelleId: currentUser.benutzerstelleId,
                myVollzugsregionTyp: DomainEnum.STES,
                stati: DomainEnum.BENUTZER_STATUS_AKTIV
            };
    }

    private filterExtraCriteriaFields(enhancedSearchDTO: ErweiterteSucheDTO) {
        this.rawEnhancedSearchInfo = enhancedSearchDTO;
        this.enhancedSearchInfo.sucheObject = enhancedSearchDTO.fieldGroupIdLabelBeans ? enhancedSearchDTO.fieldGroupIdLabelBeans.map(this.enhancedSearchPropertyMapper) : [];
    }

    private enhancedSearchPropertyMapper = (element: ErweiterteSucheIdLabelDTO) => {
        return {
            value: element.id,
            code: element.id,
            codeId: element.id,
            labelKey: element.label
        };
    };

    private checkNavigationState() {
        const state = window.history.state;

        if (state && state.clearSearchState) {
            this.searchSession.clearStorageByKey(this.stateKey);
        }
    }

    private generateForm(): void {
        this.searchForm = this.fb.group({
            berufeTaetigkeit: null,
            umAehnlicheBerufeErgaenzen: false,
            qualifikation: null,
            erfahrung: null,
            ausbildungniveau: null,
            faehigketienSkills: null,
            gewuenscheArbeitsRegion: null,
            stesImZustaendigkeitsbereich: null,
            personalberater: null,
            name: null,
            vorname: null,
            postleitzahl: null,
            ort: null,
            extraCriteria: this.fb.array([])
        });
    }

    private storeState() {
        const searchForm = this.searchForm.controls;
        const storage: any = {
            berufeTaetigkeit: searchForm.berufeTaetigkeit['berufAutosuggestObject'],
            berufStatus: this.berufAutosuggest.filterDropdown.nativeElement.value,
            umAehnlicheBerufeErgaenzen: searchForm.umAehnlicheBerufeErgaenzen.value,
            qualifikation: searchForm.qualifikation.value,
            erfahrung: searchForm.erfahrung.value,
            ausbildungniveau: searchForm.ausbildungniveau.value,
            faehigketienSkills: searchForm.faehigketienSkills.value,
            gewuenscheArbeitsRegion: searchForm.gewuenscheArbeitsRegion['arbeitsorteAutosuggestObject'],
            stesImZustaendigkeitsbereich: searchForm.stesImZustaendigkeitsbereich.value,
            personalberater: searchForm.personalberater['benutzerObject']
                ? searchForm.personalberater['benutzerObject'].benutzerId === -1
                    ? {
                          benuStelleCode: '',
                          benutzerId: -1,
                          benutzerLogin: '',
                          nachname: searchForm.personalberater.value,
                          vorname: '',
                          value: searchForm.personalberater.value
                      }
                    : searchForm.personalberater['benutzerObject']
                : '',
            name: searchForm.name.value,
            vorname: searchForm.vorname.value,
            postleitzahl: searchForm.postleitzahl.value,
            ort: searchForm.ort.value,
            extraCriteria: this.searchForm.controls.extraCriteria.value
        };

        this.searchSession.storeFieldsByKey(this.stateKey, storage);
    }

    private restoreStateAndSearch(state) {
        this.searchForm.patchValue({
            berufeTaetigkeit: state.fields.berufeTaetigkeit,
            umAehnlicheBerufeErgaenzen: state.fields.umAehnlicheBerufeErgaenzen,
            qualifikation: state.fields.qualifikation,
            erfahrung: state.fields.erfahrung,
            ausbildungniveau: state.fields.ausbildungniveau,
            faehigketienSkills: state.fields.faehigketienSkills,
            stesImZustaendigkeitsbereich: state.fields.stesImZustaendigkeitsbereich,
            personalberater: state.fields.personalberater,
            name: state.fields.name,
            vorname: state.fields.vorname,
            postleitzahl: state.fields.postleitzahl,
            ort: state.fields.ort
        });
        this.restoreErweiterteSuche(state.fields.extraCriteria, this.erweiterteSucheComponent, this.afterRestore.bind(this));
        this.berufAutosuggest.filterDropdown.nativeElement.value = state.fields.berufStatus;
        this.updatePersonalberaterSuche(state.fields.personalberater);
        this.updateArbeitsregion(state.fields.gewuenscheArbeitsRegion);
        this.updateBerufSuche(state.fields.berufeTaetigkeit);
    }

    private afterRestore(fromSubscribtion: boolean): void {
        if (fromSubscribtion) {
            this.changeDetectorRef.detectChanges();
        }
        this.search();
    }

    private updateBerufSuche(berufe) {
        if (berufe && berufe.berufId === -1 && !berufe.nameDe) {
            this.searchForm.controls.berufeTaetigkeit.setValue(null);
        }
    }

    private updateArbeitsregion(region) {
        if (!region) {
            return;
        }
        if (region.code === -1 && !region.regionDe) {
            this.searchForm.controls.gewuenscheArbeitsRegion.setValue(null);
        } else if (region.code === -1 && region.regionDe) {
            this.searchForm.controls.gewuenscheArbeitsRegion.patchValue({
                code: `${region.code}`,
                regionDe: region.regionDe
            });
        } else {
            this.searchForm.controls.gewuenscheArbeitsRegion.patchValue(region);
        }
    }

    private restoreErweiterteSuche(state: any, erweiterteSucheComponent: ErweiterteSucheComponent, callback: (fromSubscription: boolean) => void): void {
        if (erweiterteSucheComponent && state && state.length > 0) {
            if (erweiterteSucheComponent.staticChildrenOptions.length > 0) {
                this.restoreErweiterteSucheParams(state, erweiterteSucheComponent);
                if (callback) {
                    callback(false);
                }
            } else {
                erweiterteSucheComponent.extraCriteriaLoaded.pipe(first()).subscribe(() => {
                    this.restoreErweiterteSucheParams(state, erweiterteSucheComponent);
                    if (callback) {
                        callback(true);
                    }
                });
            }
        } else {
            if (callback) {
                callback(false);
            }
        }
    }

    private restoreErweiterteSucheParams(state, erweiterteSucheComponent: ErweiterteSucheComponent): void {
        for (let i = 0; i < state.length; i++) {
            erweiterteSucheComponent.onAddExtraCriteria();
            erweiterteSucheComponent.criteria.controls[i].setValue(state[i]);
        }
    }
}
