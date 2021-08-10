import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Permissions } from '@shared/enums/permissions.enum';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomainEnum } from '@shared/enums/domain.enum';
import { filter, takeUntil } from 'rxjs/operators';
import { CodeDTO } from '@dtos/codeDTO';
import { DateValidator } from '@shared/validators/date-validator';
import { forkJoin } from 'rxjs';
import { KantonDTO } from '@dtos/kantonDTO';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { VoranmeldungService } from '@modules/arbeitgeber/services/voranmeldung.service';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { ErweiterteSucheComponent, ToolboxService } from '@app/shared';
import { EnhancedSearchQueryDTO } from '@dtos/enhancedSearchQueryDTO';
import { NumberValidator } from '@shared/validators/number-validator';
import { UserDto } from '@dtos/userDto';
import { VoranmeldungKaeSuchenParamDTO } from '@dtos/voranmeldungKaeSuchenParamDTO';
import { VoranmeldungKaeSuchenResponseDTO } from '@dtos/voranmeldungKaeSuchenResponseDTO';
import { ActivatedRoute, Router } from '@angular/router';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { DropdownOption } from '@shared/services/forms/form-utils.service';
import { KantonType } from '@modules/arbeitgeber/shared/services/kaeswe.service';
import { FacadeService } from '@shared/services/facade.service';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { UnternehmenGesamtbetriebCodeEnum } from '@shared/enums/domain-code/unternehmen-gesamtbetrieb-code.enum';
import { KaeSweSuchenAbstractComponent } from '@modules/arbeitgeber/shared/components/kae-swe-suchen-abstract-component';
import { AvamLabelInputComponent } from '@app/library/wrappers/form/avam-label-input/avam-label-input.component';

@Component({
    selector: 'avam-voranmeldung-suchen',
    templateUrl: './voranmeldung-suchen.component.html'
})
export class VoranmeldungSuchenComponent extends KaeSweSuchenAbstractComponent implements OnInit, AfterViewInit, OnDestroy {
    static readonly SEARCH_SPINNER_CHANNEL = 'avamVoranmeldungSearchChannel';
    static readonly STATE_KEY = 'voranmeldung-search-cache';
    readonly resultSpinnerChannel = 'avamVoranmeldungResultChannel';
    readonly tableStateKey = 'voranmeldung-search-result-cache';
    @ViewChild('erweiterteSucheComponent') erweiterteSucheComponent: ErweiterteSucheComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('entscheidNrInput') entscheidNrInput: AvamLabelInputComponent;
    permissions: typeof Permissions = Permissions;
    searchForm: FormGroup;
    statusDropdownLabels: DropdownOption[] = [];
    entscheidKaDropdownLabels: DropdownOption[] = [];
    kategorieDropdownLabels: DropdownOption[] = [];
    kantonDropdownLabels: KantonType[] = [];
    benutzerSuchenTokens: any = {};
    resultsData: VoranmeldungKaeSuchenResponseDTO[] = [];
    benutzerAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;
    searchDone = false;
    combiningFieldsDisabled = false;
    gesamtbetriebCode: CodeDTO;
    private currentUser: UserDto;
    private readonly erweiterteSucheInitialExtraCriteria = {
        searchFieldId: 'es_unternehmensname_kae',
        searchLevel1: 'es_ugdaten_kae'
    };

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        protected changeDetectorRef: ChangeDetectorRef,
        private service: VoranmeldungService,
        private sessionService: SearchSessionStorageService,
        private facadeService: FacadeService
    ) {
        super(changeDetectorRef);
        ToolboxService.CHANNEL = this.resultSpinnerChannel;
    }

    ngOnInit() {
        this.configureToolbox();
        this.currentUser = this.facadeService.authenticationService.getLoggedUser();
        this.generateForm();
        this.initDropdownLabels(() => this.afterLabelsInit());
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    ngAfterViewInit() {
        this.entscheidNrInput.coreInput.inputElement.nativeElement.focus();
    }

    ngOnDestroy() {
        this.facadeService.toolboxService.sendConfiguration([]);
        this.facadeService.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    reset() {
        this.searchForm.reset();
        this.erweiterteSucheComponent.onReset();
        this.setDefaultValues();
        this.sessionService.clearStorageByKey(VoranmeldungSuchenComponent.STATE_KEY);
        this.resultsData = [];
        this.sessionService.restoreDefaultValues(this.tableStateKey);
        this.checkDisabled(null);
        this.searchDone = false;
    }

    search() {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.storeState();
        this.searchDone = false;
        this.facadeService.spinnerService.activate(this.resultSpinnerChannel);
        this.service.search(this.mapToDTO()).subscribe(
            res => {
                this.resultsData = res.data || [];
                if (res.data) {
                    this.searchDone = true;
                }
                this.facadeService.spinnerService.deactivate(this.resultSpinnerChannel);
            },
            () => {
                this.facadeService.spinnerService.deactivate(this.resultSpinnerChannel);
                this.searchDone = true;
            }
        );
    }

    onKantonChange(event: any): void {
        this.benutzerSuchenTokens = { ...this.benutzerSuchenTokens, kantonKuerzel: event };
    }

    openVoranmeldungen(row: VoranmeldungKaeSuchenResponseDTO): void {
        this.service.redirectToVoranmeldungenFromSearch(row.unternehmenId, this.route);
    }

    updatePersonalberaterSuche(event: any): void {
        if (event) {
            this.searchForm.controls.verantwortliche.setValue(event);
        }
    }

    onInputPersonalberaterSuche(event: any): void {
        if (!event) {
            this.searchForm.controls.verantwortliche['benutzerObject'] = null;
        }
    }

    checkDisabled(event: any) {
        const entscheidNr = event && event.target ? event.target.value : event;
        this.combiningFieldsDisabled = !!entscheidNr;
    }

    onClickErweiterteSuche() {
        this.onClickErweiterteSucheBase(this.erweiterteSucheInitialExtraCriteria);
    }

    private generateForm(): void {
        this.searchForm = this.fb.group(
            {
                status: null,
                entscheidNr: [null, [NumberValidator.checkValueConsistsOnNineNumbers]],
                datumKaVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                datumKaBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                entscheidKa: null,
                datumFreigabeVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                datumFreigabeBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                kategorie: null,
                kanton: null,
                verantwortliche: null,
                sachbearbeitung: null,
                freigabe: null,
                erweiterteSuche: this.fb.array([])
            },
            {
                validators: [
                    DateValidator.rangeBetweenDates('datumKaVon', 'datumKaBis', 'val201'),
                    DateValidator.rangeBetweenDates('datumFreigabeVon', 'datumFreigabeBis', 'val201')
                ]
            }
        );
    }

    private initDropdownLabels(callback?: any): void {
        this.facadeService.spinnerService.activate(VoranmeldungSuchenComponent.SEARCH_SPINNER_CHANNEL);
        forkJoin<CodeDTO[], CodeDTO[], CodeDTO[], KantonDTO[], CodeDTO>([
            this.service.getCode(DomainEnum.KURZARBEIT_STATUS),
            this.service.getCode(DomainEnum.KURZARBEIT_ENTSCHEID),
            this.service.getCode(DomainEnum.KURZARBEIT_KATEGORIE),
            this.service.getAllKantone(),
            this.service.getCodeBy(DomainEnum.GESAMTBETRIEB, UnternehmenGesamtbetriebCodeEnum.BETRIEBSABTEILUNG_NR_DEFAULT_STRING)
        ])
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                ([status, entscheidKa, kategorie, kanton, gesamtbetriebCode]) => {
                    this.statusDropdownLabels = this.facadeService.formUtilsService.mapDropdownKurztext(status);
                    this.entscheidKaDropdownLabels = this.facadeService.formUtilsService.mapDropdownKurztext(entscheidKa);
                    this.kategorieDropdownLabels = this.facadeService.formUtilsService.mapDropdownKurztext(kategorie);
                    this.kantonDropdownLabels = kanton.map(this.service.kantonMapper);
                    this.gesamtbetriebCode = gesamtbetriebCode;
                    this.facadeService.spinnerService.deactivate(VoranmeldungSuchenComponent.SEARCH_SPINNER_CHANNEL);
                    if (callback) {
                        callback();
                    }
                },
                () => this.facadeService.spinnerService.deactivate(VoranmeldungSuchenComponent.SEARCH_SPINNER_CHANNEL)
            );
    }

    private afterLabelsInit() {
        this.initTokens();
        const state = this.sessionService.restoreStateByKey(VoranmeldungSuchenComponent.STATE_KEY);
        if (state) {
            this.restoreState(state);
        } else {
            this.setDefaultValues();
        }
    }

    private setDefaultValues() {
        if (this.currentUser) {
            this.searchForm.controls.kanton.setValue(this.currentUser.kantonKuerzel);
        }
        this.searchForm.controls.sachbearbeitung.setValue(true);
        this.searchForm.controls.freigabe.setValue(true);
        this.searchForm.controls.entscheidNr.setValue('');
    }

    private initTokens(): void {
        if (this.currentUser) {
            this.benutzerSuchenTokens = {
                myBenutzerstelleId: `${this.currentUser.benutzerstelleId}`,
                myVollzugsregionTyp: DomainEnum.STES
            };
        }
    }

    private restoreState(state): void {
        this.searchForm.patchValue(state.fields);
        if (state.fields.datumKaVon) {
            this.searchForm.controls.datumKaVon.setValue(new Date(state.fields.datumKaVon));
        }
        if (state.fields.datumKaBis) {
            this.searchForm.controls.datumKaBis.setValue(new Date(state.fields.datumKaBis));
        }
        if (state.fields.datumFreigabeVon) {
            this.searchForm.controls.datumFreigabeVon.setValue(new Date(state.fields.datumFreigabeVon));
        }
        if (state.fields.datumFreigabeBis) {
            this.searchForm.controls.datumFreigabeBis.setValue(new Date(state.fields.datumFreigabeBis));
        }
        this.service.restoreErweiterteSuche(state, this.erweiterteSucheComponent, this.afterRestore.bind(this));
    }

    private afterRestore(fromSubscribtion: boolean): void {
        if (fromSubscribtion) {
            this.changeDetectorRef.detectChanges();
        }
        this.search();
    }

    private storeState(): void {
        const storage: any = {
            status: this.searchForm.controls.status.value,
            entscheidNr: this.searchForm.controls.entscheidNr.value,
            datumKaVon: this.searchForm.controls.datumKaVon.value,
            datumKaBis: this.searchForm.controls.datumKaBis.value,
            entscheidKa: this.searchForm.controls.entscheidKa.value,
            datumFreigabeVon: this.searchForm.controls.datumFreigabeVon.value,
            datumFreigabeBis: this.searchForm.controls.datumFreigabeBis.value,
            kategorie: this.searchForm.controls.kategorie.value,
            kanton: this.searchForm.controls.kanton.value ? this.searchForm.controls.kanton.value : null,
            verantwortliche: this.searchForm.controls.verantwortliche['benutzerObject'],
            sachbearbeitung: this.searchForm.controls.sachbearbeitung.value,
            freigabe: this.searchForm.controls.freigabe.value,
            erweiterteSuche: this.service.storeErweiterteSuche(this.erweiterteSucheComponent)
        };
        if (storage.verantwortliche && storage.verantwortliche.benutzerDetailId <= 0) {
            // to prevent the given string to be appeared three times in the control after restore
            // in case if the Benutzer is not explicitly identified with an id
            storage.verantwortliche.nachname = '';
            storage.verantwortliche.vorname = '';
        }
        this.sessionService.storeFieldsByKey(VoranmeldungSuchenComponent.STATE_KEY, storage);
    }

    private mapToDTO(): VoranmeldungKaeSuchenParamDTO {
        if (this.searchForm.controls.entscheidNr.value) {
            return {
                entscheidNr: this.searchForm.controls.entscheidNr.value,
                // backend tries to read the enhancedSearchQueries values
                // so we have to provide a non-null array to prevent a runtime exception
                enhancedSearchQueries: []
            };
        }
        const ret: VoranmeldungKaeSuchenParamDTO = {
            statusId: this.searchForm.controls.status.value,
            entscheidNr: this.searchForm.controls.entscheidNr.value,
            kurzarbeitVon: this.searchForm.controls.datumKaVon.value,
            kurzarbeitBis: this.searchForm.controls.datumKaBis.value,
            entscheidDatumVon: this.searchForm.controls.datumFreigabeVon.value,
            entscheidDatumBis: this.searchForm.controls.datumFreigabeBis.value,
            entscheidId: this.searchForm.controls.entscheidKa.value,
            kategorieId: this.searchForm.controls.kategorie.value,
            kantonsKuerzel: this.searchForm.controls.kanton.value,
            sachbearbeiter: this.searchForm.controls.sachbearbeitung.value,
            unterzeichner: this.searchForm.controls.freigabe.value,
            enhancedSearchQueries: this.searchForm.controls.erweiterteSuche.value.map(
                (el): EnhancedSearchQueryDTO => {
                    return {
                        comparatorId: el.comparatorId,
                        searchFieldId: el.searchFieldId,
                        searchValue: el.searchValue ? el.searchValue : el.searchFreeText ? el.searchFreeText : el.searchLevel3
                    };
                }
            )
        };
        const benutzer = this.searchForm.controls.verantwortliche['benutzerObject'];
        return benutzer
            ? { ...ret, benutzerDetailId: benutzer.benutzerDetailId, benutzerLogin: benutzer.benutzerLogin, benutzerName: benutzer.nachname, benutzerVorname: benutzer.vorname }
            : ret;
    }

    private configureToolbox(): void {
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getVoranmeldungSuchenConfig());
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(
                filter(action => action.message.action === ToolboxActionEnum.PRINT),
                takeUntil(this.unsubscribe)
            )
            .subscribe(() => this.facadeService.openModalFensterService.openPrintModal(this.modalPrint, this.resultsData));
    }
}
