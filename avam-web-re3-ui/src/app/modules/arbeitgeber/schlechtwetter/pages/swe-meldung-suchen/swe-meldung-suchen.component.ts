import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Permissions } from '@shared/enums/permissions.enum';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { ErweiterteSucheComponent, ToolboxService } from '@app/shared';
import { ActivatedRoute, Router } from '@angular/router';
import { MeldungSweOverviewListDTO } from '@dtos/meldungSweOverviewListDTO';
import { MeldungSweSuchenParamDTO } from '@dtos/meldungSweSuchenParamDTO';
import { NumberValidator } from '@shared/validators/number-validator';
import { forkJoin } from 'rxjs';
import { CodeDTO } from '@dtos/codeDTO';
import { KantonDTO } from '@dtos/kantonDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { KantonType } from '@modules/arbeitgeber/shared/services/kaeswe.service';
import { DropdownOption } from '@shared/services/forms/form-utils.service';
import { UserDto } from '@dtos/userDto';
import { SweMeldungService } from '@modules/arbeitgeber/services/swe-meldung.service';
import { DateValidator } from '@shared/validators/date-validator';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { FacadeService } from '@shared/services/facade.service';
import { EnhancedSearchQueryDTO } from '@dtos/enhancedSearchQueryDTO';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { UnternehmenGesamtbetriebCodeEnum } from '@shared/enums/domain-code/unternehmen-gesamtbetrieb-code.enum';
import { KaeSweSuchenAbstractComponent } from '@modules/arbeitgeber/shared/components/kae-swe-suchen-abstract-component';
import { AvamLabelInputComponent } from '@app/library/wrappers/form/avam-label-input/avam-label-input.component';

@Component({
    selector: 'avam-swe-meldung-suchen',
    templateUrl: './swe-meldung-suchen.component.html',
    styles: []
})
export class SweMeldungSuchenComponent extends KaeSweSuchenAbstractComponent implements OnInit, AfterViewInit, OnDestroy {
    static readonly SEARCH_SPINNER_CHANNEL = 'avamSweMeldungSearchChannel';
    static readonly STATE_KEY = 'swemeldung-search-cache';
    readonly resultSpinnerChannel = 'avamSweMeldungResultChannel';
    readonly tableStateKey = 'swe-meldung-search-result-cache';
    @ViewChild('erweiterteSucheComponent') erweiterteSucheComponent: ErweiterteSucheComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('entscheidNrInput') entscheidNrInput: AvamLabelInputComponent;
    permissions: typeof Permissions = Permissions;
    searchForm: FormGroup;
    statusDropdownLabels: DropdownOption[] = [];
    kantonDropdownLabels: KantonType[] = [];
    resultsData: MeldungSweOverviewListDTO[] = [];
    searchDone = false;
    benutzerSuchenTokens: any = {};
    benutzerAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;
    combiningFieldsDisabled = false;
    gesamtbetriebCode: CodeDTO;
    private currentUser: UserDto;
    private readonly erweiterteSucheInitialExtraCriteria = {
        searchFieldId: 'es_unternehmensname_swe',
        searchLevel1: 'es_ugdaten_swe'
    };

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        protected changeDetectorRef: ChangeDetectorRef,
        private sessionService: SearchSessionStorageService,
        private service: SweMeldungService,
        private facadeService: FacadeService,
        private router: Router
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
        this.sessionService.clearStorageByKey(SweMeldungSuchenComponent.STATE_KEY);
        this.setDefaultValues();
        this.checkDisabled(null);
        this.resultsData = [];
        this.searchDone = false;
        this.sessionService.restoreDefaultValues(this.tableStateKey);
    }

    search() {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.storeState();
        this.searchDone = false;
        this.facadeService.spinnerService.activate(this.resultSpinnerChannel);
        this.service
            .search(this.mapToDTO())
            .pipe(finalize(() => this.facadeService.spinnerService.deactivate(this.resultSpinnerChannel)))
            .subscribe(res => {
                this.resultsData = res.data || [];
                this.searchDone = true;
            });
    }

    checkDisabled(event: any) {
        const entscheidNr = event && event.target ? event.target.value : event;
        this.combiningFieldsDisabled = !!entscheidNr;
    }

    onKantonChange(event: any): void {
        this.benutzerSuchenTokens = { ...this.benutzerSuchenTokens, kantonKuerzel: event };
    }

    openMeldungen(row: MeldungSweOverviewListDTO): void {
        this.service.redirectToSweMmeldungenFromSearch(row.unternehmenId, this.route);
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

    onClickErweiterteSuche() {
        this.onClickErweiterteSucheBase(this.erweiterteSucheInitialExtraCriteria);
    }

    private generateForm(): void {
        this.searchForm = this.fb.group(
            {
                status: null,
                entscheidNr: [null, [NumberValidator.checkValueConsistsOnNineNumbers]],
                ausfallVon: [null, [DateValidator.dateFormatMonthYearNgx, DateValidator.dateValidMonthYearNgx]],
                ausfallBis: [null, [DateValidator.dateFormatMonthYearNgx, DateValidator.dateValidMonthYearNgx]],
                freigabeVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                freigabeBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                kanton: null,
                verantwortliche: null,
                sachbearbeitung: null,
                freigabe: null,
                erweiterteSuche: this.fb.array([])
            },
            {
                validators: [DateValidator.rangeBetweenDates('ausfallVon', 'ausfallBis', 'val201'), DateValidator.rangeBetweenDates('freigabeVon', 'freigabeBis', 'val201')]
            }
        );
    }

    private initDropdownLabels(callback?: any): void {
        this.facadeService.spinnerService.activate(SweMeldungSuchenComponent.SEARCH_SPINNER_CHANNEL);
        forkJoin<CodeDTO[], KantonDTO[], CodeDTO>([
            this.service.getCode(DomainEnum.SCHLECHTWETTER_STATUS),
            this.service.getAllKantone(),
            this.service.getCodeBy(DomainEnum.GESAMTBETRIEB, UnternehmenGesamtbetriebCodeEnum.BETRIEBSABTEILUNG_NR_DEFAULT_STRING)
        ])
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                ([status, kanton, gesamtbetriebCode]) => {
                    this.statusDropdownLabels = this.facadeService.formUtilsService.mapDropdownKurztext(status);
                    this.kantonDropdownLabels = kanton.map(this.service.kantonMapper);
                    this.gesamtbetriebCode = gesamtbetriebCode;
                    this.facadeService.spinnerService.deactivate(SweMeldungSuchenComponent.SEARCH_SPINNER_CHANNEL);
                    if (callback) {
                        callback();
                    }
                },
                () => this.facadeService.spinnerService.deactivate(SweMeldungSuchenComponent.SEARCH_SPINNER_CHANNEL)
            );
    }

    private afterLabelsInit() {
        this.initTokens();
        const state = this.sessionService.restoreStateByKey(SweMeldungSuchenComponent.STATE_KEY);
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
        this.searchForm.controls.ausfallVon.setValue(new Date());
    }

    private storeState(): void {
        const storage: any = {
            status: this.searchForm.controls.status.value,
            entscheidNr: this.searchForm.controls.entscheidNr.value,
            ausfallVon: this.searchForm.controls.ausfallVon.value,
            ausfallBis: this.searchForm.controls.ausfallBis.value,
            freigabeVon: this.searchForm.controls.freigabeVon.value,
            freigabeBis: this.searchForm.controls.freigabeBis.value,
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
        this.sessionService.storeFieldsByKey(SweMeldungSuchenComponent.STATE_KEY, storage);
    }

    private restoreState(state): void {
        this.searchForm.patchValue(state.fields);
        if (state.fields.ausfallVon) {
            this.searchForm.controls.ausfallVon.setValue(new Date(state.fields.ausfallVon));
        }
        if (state.fields.ausfallBis) {
            this.searchForm.controls.ausfallBis.setValue(new Date(state.fields.ausfallBis));
        }
        if (state.fields.freigabeVon) {
            this.searchForm.controls.freigabeVon.setValue(new Date(state.fields.freigabeVon));
        }
        if (state.fields.freigabeBis) {
            this.searchForm.controls.freigabeBis.setValue(new Date(state.fields.freigabeBis));
        }
        this.service.restoreErweiterteSuche(state, this.erweiterteSucheComponent, this.afterRestore.bind(this));
    }

    private afterRestore(fromSubscribtion: boolean): void {
        if (fromSubscribtion) {
            this.changeDetectorRef.detectChanges();
        }
        this.search();
    }

    private initTokens(): void {
        if (this.currentUser) {
            this.benutzerSuchenTokens = {
                myBenutzerstelleId: `${this.currentUser.benutzerstelleId}`,
                myVollzugsregionTyp: DomainEnum.STES
            };
        }
    }

    private mapToDTO(): MeldungSweSuchenParamDTO {
        if (this.searchForm.controls.entscheidNr.value) {
            return {
                entscheidNr: this.searchForm.controls.entscheidNr.value,
                searchTuples: []
            };
        }
        let ret: MeldungSweSuchenParamDTO = {
            statusId: this.searchForm.controls.status.value,
            entscheidNr: this.searchForm.controls.entscheidNr.value,
            entscheidDatumVon: this.searchForm.controls.freigabeVon.value,
            entscheidDatumBis: this.searchForm.controls.freigabeBis.value,
            kantonsKuerzel: this.searchForm.controls.kanton.value,
            sachbearbeiter: this.searchForm.controls.sachbearbeitung.value,
            unterzeichner: this.searchForm.controls.freigabe.value,
            searchTuples: this.searchForm.controls.erweiterteSuche.value.map(
                (el): EnhancedSearchQueryDTO => {
                    return {
                        comparatorId: el.comparatorId,
                        searchFieldId: el.searchFieldId,
                        searchValue: el.searchValue ? el.searchValue : el.searchFreeText ? el.searchFreeText : el.searchLevel3
                    };
                }
            )
        };
        let date: Date = this.searchForm.controls.ausfallVon.value;
        if (date) {
            ret = { ...ret, ausfallMonatVon: date.getMonth() + 1, ausfallJahrVon: date.getFullYear() };
        }
        date = this.searchForm.controls.ausfallBis.value;
        if (date) {
            ret = { ...ret, ausfallMonatBis: date.getMonth() + 1, ausfallJahrBis: date.getFullYear() };
        }

        const benutzer = this.searchForm.controls.verantwortliche['benutzerObject'];
        return benutzer
            ? {
                  ...ret,
                  benutzerDetail: {
                      benutzerDetailId: benutzer.benutzerDetailId,
                      benutzerLogin: benutzer.benutzerLogin,
                      nachname: benutzer.nachname,
                      vorname: benutzer.vorname
                  }
              }
            : ret;
    }

    private configureToolbox() {
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getSweMeldungSuchenConfig());
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(
                filter(action => action.message.action === ToolboxActionEnum.PRINT),
                takeUntil(this.unsubscribe)
            )
            .subscribe(() => this.facadeService.openModalFensterService.openPrintModal(this.modalPrint, this.resultsData));
    }
}
