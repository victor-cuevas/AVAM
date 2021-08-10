import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { OsteDataRestService } from '@app/core/http/oste-data-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { GenericConfirmComponent, RoboHelpService, FormUtilsService } from '@app/shared';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { ErweiterteSucheComponent } from '@app/shared/components/erweiterte-suche/erweiterte-suche.component';
import { ZuweisungWizardService } from '@app/shared/components/new/avam-wizard/zuweisung-wizard.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { StesArbeitsvermittlungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { MeldepflichtEnum } from '@app/shared/enums/table-icon-enums';

import { OsteSearchParamsDTO } from '@app/shared/models/dtos-generated/osteSearchParamsDTO';
import { OsteSearchResultDTO } from '@app/shared/models/dtos-generated/osteSearchResultDTO';
import { StesHeaderDTO } from '@app/shared/models/dtos-generated/stesHeaderDTO';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { CodeDTO } from '@dtos/codeDTO';
import { EnhancedSearchQueryDTO } from '@dtos/enhancedSearchQueryDTO';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { SpinnerService } from 'oblique-reactive';
import { forkJoin, Subscription } from 'rxjs';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { first } from 'rxjs/operators';
import { AvamBerufAutosuggestComponent } from '@app/library/wrappers/form/autosuggests/avam-beruf-autosuggest/avam-beruf-autosuggest.component';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-oste-suchen',
    templateUrl: './oste-suchen.component.html',
    styleUrls: ['./oste-suchen.component.scss'],
    providers: [ObliqueHelperService]
})
export class OsteSuchenComponent implements OnInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('erweiterteSucheComponent') erweiterteSucheComponent: ErweiterteSucheComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('berufAutosuggest') berufAutosuggest: AvamBerufAutosuggestComponent;

    dataSource;
    meldepflichtEnum = MeldepflichtEnum;

    stellenangebotForm: FormGroup;

    stellenangebotData = [];
    erfahrungOptionsLabels = [];
    qualifikationOptionsLabels = [];
    ausbildungsniveauOptionsLabels = [];
    zustaendigkeitsBereichOptionsLabels = [];

    stellenangebotChannel = 'stellenangebot-suchen';

    stesId;
    stesHeader: StesHeaderDTO;
    dataSubscription: Subscription;
    langChangeSubscription: Subscription;
    observeClickActionSub: Subscription;

    ostesuchenToolboxId = 'stellenangebot-suchen';

    permissions: typeof Permissions = Permissions;

    stellenverantwortungSuchenTokens: {} = {};
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;
    currentUser;
    benutzerSuchenTokens: any = {};

    constructor(
        private formBuilder: FormBuilder,
        private modalService: NgbModal,
        private obliqueHelper: ObliqueHelperService,
        private stesDataService: StesDataRestService,
        private osteDataService: OsteDataRestService,
        private spinnerService: SpinnerService,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private fehlermeldungenService: FehlermeldungenService,
        private router: Router,
        private zuweisungWizard: ZuweisungWizardService,
        private toolboxService: ToolboxService,
        private roboHelpService: RoboHelpService,
        private stesInfobarService: AvamStesInfoBarService,
        private searchSession: SearchSessionStorageService,
        private changeDetectorRef: ChangeDetectorRef,
        private facade: FacadeService
    ) {
        SpinnerService.CHANNEL = this.stellenangebotChannel;
        ToolboxService.CHANNEL = this.ostesuchenToolboxId;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.checkNavigationState();
        this.initForm();
        this.setStesId();
        this.loadData();
        this.subscribeToLangChange();
        this.zuweisungWizard.selectCurrentStep(0);
        this.zuweisungWizard.setStesId(this.stesId);
    }

    setStesId() {
        this.route.parent.params.subscribe(data => (this.stesId = data['stesId']));
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.ostesuchenToolboxId);
    }

    subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
            if (action.message.action === ToolboxActionEnum.HELP) {
                this.roboHelpService.help(StesFormNumberEnum.VERMITTLUNG_ERFASSEN);
            }
        });
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    checkNavigationState() {
        const state = window.history.state;

        if (state && state.clearSearchState) {
            this.searchSession.clearStorageByKey(this.stellenangebotChannel);
        }
    }

    itemSelected(osteId) {
        this.zuweisungWizard.setOsteId(osteId);
        this.zuweisungWizard.navigateToStes(2);
    }

    getStellenangebote() {
        if (this.stellenangebotForm.valid) {
            this.fehlermeldungenService.closeMessage();

            this.spinnerService.activate(this.stellenangebotChannel);
            this.osteDataService.getStellenangebote(this.mapToDTO(), this.translate.currentLang).subscribe(
                stellenangebote => {
                    if (stellenangebote.data) {
                        this.dataSource = [...stellenangebote.data]
                            .map((element: OsteSearchResultDTO) => this.createStellenangebotRow(element))
                            .sort((v1, v2) => (v1.stellenbezeichnung < v2.stellenbezeichnung ? 1 : v1.stellenbezeichnung > v2.stellenbezeichnung ? -1 : 0));
                        this.stesInfobarService.sendDataToInfobar({ title: 'arbeitgeber.label.stellenangeboteSuchen', tableCount: this.dataSource.length });
                    }

                    this.spinnerService.deactivate(this.stellenangebotChannel);
                    OrColumnLayoutUtils.scrollTop();
                },
                () => {
                    this.spinnerService.deactivate(this.stellenangebotChannel);
                    OrColumnLayoutUtils.scrollTop();
                }
            );
        }
    }

    search() {
        this.getStellenangebote();
        this.storeState();
    }

    cancel() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.router.navigate([`stes/details/${this.stesId}/${StesArbeitsvermittlungPaths.ARBEITSVERMITTLUNGEN_ANZEIGEN}`]);
            }
        });
        modalRef.componentInstance.titleLabel = 'common.button.vermittlungAbbrechen';
        modalRef.componentInstance.promptLabel = 'common.message.vermittlungAbbrechen';
        modalRef.componentInstance.primaryButton = 'common.button.jaAbbrechen';
        modalRef.componentInstance.secondaryButton = 'i18n.common.no';
    }

    subscribeToLangChange(): void {
        this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
            this.getStellenangebote();
        });
    }

    mapToDTO(): OsteSearchParamsDTO {
        return {
            beruf: this.stellenangebotForm.controls.beruf['berufAutosuggestObject'],
            verwandteBerufe: this.stellenangebotForm.controls.aehnlicheBerufe.value,
            qualifikationId: this.stellenangebotForm.controls.qualifikation.value,
            erfahrungId: this.stellenangebotForm.controls.erfahrung.value,
            ausbildungsniveauId: this.stellenangebotForm.controls.ausbildung.value,
            zustaendigkeitsBereichId: this.stellenangebotForm.controls.stellenangebote.value,
            arbeitsRegion: this.stellenangebotForm.controls.arbeitsRegion['arbeitsorteAutosuggestObject'],
            unternehmenId: this.stellenangebotForm.controls.arbeitgeber['unternehmenAutosuggestObject'].unternehmenId
                ? this.stellenangebotForm.controls.arbeitgeber['unternehmenAutosuggestObject'].unternehmenId
                : -1,
            unternehmenText: this.stellenangebotForm.controls.arbeitgeber['unternehmenAutosuggestObject'].name1
                ? this.stellenangebotForm.controls.arbeitgeber['unternehmenAutosuggestObject'].name1
                : null,
            stellenNrAvam: this.stellenangebotForm.controls.stellenNr.value,
            benutzer: this.stellenangebotForm.controls.stellenverantwortung.value ? this.stellenangebotForm.controls.stellenverantwortung['benutzerObject'] : null,
            enhancedSearchQueries: this.stellenangebotForm.controls.erweiterteSuche.value.map(
                (el): EnhancedSearchQueryDTO => {
                    return {
                        comparatorId: el.comparatorId,
                        searchFieldId: el.searchFieldId,
                        searchValue: el.searchValue ? el.searchValue : el.searchFreeText ? el.searchFreeText : el.searchLevel3
                    };
                }
            ),
            stellenbeschreibung: this.stellenangebotForm.controls.stellenbeschreibung.value
        };
    }

    storeState() {
        const storage: any = {
            erweiterteSuche: this.storeErweiterteSuche(this.erweiterteSucheComponent),
            beruf: this.stellenangebotForm.controls.beruf['berufAutosuggestObject'],
            berufFilter: this.berufAutosuggest.filterDropdown.nativeElement.value,
            aehnlicheBerufe: this.stellenangebotForm.controls.aehnlicheBerufe.value,
            qualifikation: this.stellenangebotForm.controls.qualifikation.value,
            erfahrung: this.stellenangebotForm.controls.erfahrung.value,
            ausbildung: this.stellenangebotForm.controls.ausbildung.value,
            stellenangebote: this.stellenangebotForm.controls.stellenangebote.value,
            arbeitsRegion: this.stellenangebotForm.controls.arbeitsRegion.value,
            stellenverantwortung: this.stellenangebotForm.controls.stellenverantwortung ? this.stellenangebotForm.controls.stellenverantwortung['benutzerObject'] : null,
            stellenbeschreibung: this.stellenangebotForm.controls.stellenbeschreibung.value,
            stellenNr: this.stellenangebotForm.controls.stellenNr.value,
            arbeitgeber: this.stellenangebotForm.controls.arbeitgeber['unternehmenAutosuggestObject']
        };

        this.searchSession.storeFieldsByKey(this.stellenangebotChannel, storage);
    }

    afterRestore(fromSubscribtion: boolean): void {
        if (fromSubscribtion) {
            this.changeDetectorRef.detectChanges();
        }
        this.getStellenangebote();
    }

    restoreState() {
        this.initTokens();
        const state = this.searchSession.restoreStateByKey(this.stellenangebotChannel);

        if (state) {
            const params = state.fields;
            const unternehmenObject =
                params['arbeitgeber'].unternehmenId > 0
                    ? {
                          unternehmenId: params['arbeitgeber'].unternehmenId,
                          name1: params['arbeitgeber'].name1 || ''
                      }
                    : params['arbeitgeber'].name1 || '';
            params['arbeitgeber'] = unternehmenObject;

            this.stellenangebotForm.reset(params);
            this.stellenangebotForm.controls.arbeitgeber['unternehmenAutosuggestObject'] = unternehmenObject;

            if (params.beruf.berufId === -1) {
                if (params.beruf.nameDe === null || params.beruf.nameDe === '') {
                    this.stellenangebotForm.controls.beruf.setValue(null);
                } else {
                    this.stellenangebotForm.controls.beruf.setValue({ nameDe: params.beruf.nameDe, berufId: -1, bezeichnungMaDe: params.beruf.bezeichnungMaDe });
                }
            }

            if (params.berufFilter) {
                this.berufAutosuggest.filterDropdown.nativeElement.value = params.berufFilter;
            }

            this.restoreErweiterteSuche(state, this.erweiterteSucheComponent, this.afterRestore.bind(this));
        }
    }

    initTokens(): void {
        if (this.currentUser) {
            this.benutzerSuchenTokens = {
                myBenutzerstelleId: `${this.currentUser.benutzerstelleId}`,
                myVollzugsregionTyp: DomainEnum.STES
            };
        }
    }

    onInputPersonalberaterSuche(event: any): void {
        if (!event) {
            this.stellenangebotForm.controls.stellenverantwortung['benutzerObject'] = null;
        }
    }

    storeErweiterteSuche(erweiterteSucheComponent: ErweiterteSucheComponent): any[] {
        const ret = [];
        if (!erweiterteSucheComponent) {
            return ret;
        }

        const esArray = erweiterteSucheComponent.getExtraCriteria() as FormGroup[];

        esArray.forEach(crit => {
            const val = {
                comparatorId: crit.controls.comparatorId.value,
                searchFieldId: crit.controls.searchFieldId.value,
                searchFreeText: crit.controls.searchFreeText.value,
                searchLevel1: crit.controls.searchLevel1.value,
                searchLevel3: crit.controls.searchLevel3.value,
                searchValue: crit.controls.searchValue.value
            };
            ret.push(val);
        });
        return ret;
    }

    restoreErweiterteSuche(state: any, erweiterteSucheComponent: ErweiterteSucheComponent, callback: (fromSubscription: boolean) => void): void {
        if (erweiterteSucheComponent && state.fields.erweiterteSuche && state.fields.erweiterteSuche.length > 0) {
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

    restoreErweiterteSucheParams(state, erweiterteSucheComponent: ErweiterteSucheComponent): void {
        for (let i = 0; i < state.fields.erweiterteSuche.length; i++) {
            erweiterteSucheComponent.onAddExtraCriteria();
            erweiterteSucheComponent.criteria.controls[i].setValue(state.fields.erweiterteSuche[i]);
        }
    }

    createStellenangebotRow(data: OsteSearchResultDTO) {
        return {
            meldepflicht: this.getMeldepflichtStatus(data),
            arbeitgeberName: `${data.ugName1 ? data.ugName1 : ''} ${data.ugName2 ? data.ugName2 : ''} ${data.ugName3 ? data.ugName3 : ''}`,
            arbeitsort: data.arbeitsOrt ? data.arbeitsOrt : data.arbeitsOrtAusland,
            beschaeftingungsgrad: this.beschaeftingungsgradToString(data),
            stellenbezeichnung: data.stellenbezeichnung[0].toUpperCase() + data.stellenbezeichnung.slice(1),
            stellenNummer: data.stellenNr ? `${this.translate.instant('arbeitgeber.label.stellennr')}: ${data.stellenNr}` : '',
            taetigkeitAnforderungen: data.taetigkeitAnforderungen,
            osteId: data.osteId
        };
    }

    getMeldepflichtStatus(data: OsteSearchResultDTO) {
        return data.meldepflicht && !!data.sperrfristDatum
            ? data.meldepflicht && this.compareSperrfristDatum(data.sperrfristDatum)
                ? this.meldepflichtEnum.UNTERLIEGT_LAUFEND
                : this.meldepflichtEnum.UNTERLIEGT_ABGELAUFEN
            : this.meldepflichtEnum.KEIN_MELDEPFLICHT;
    }

    compareSperrfristDatum(sperrfristDatum): boolean {
        const today = moment();
        const sperrfrist = moment(sperrfristDatum);
        if (sperrfrist.isSameOrAfter(today, 'day')) {
            return true;
        }
        return false;
    }

    beschaeftingungsgradToString(data: OsteSearchResultDTO) {
        return `${data.beschaeftiungsgradVon !== data.beschaeftiungsgradBis ? data.beschaeftiungsgradVon.toString() : ''} ${
            data.beschaeftiungsgradVon !== data.beschaeftiungsgradBis ? '-' : ''
        } ${data.beschaeftiungsgradBis.toString()}`;
    }

    loadData() {
        this.spinnerService.activate(this.stellenangebotChannel);
        forkJoin<CodeDTO[], CodeDTO[], CodeDTO[], CodeDTO[], StesHeaderDTO>([
            this.stesDataService.getCode(DomainEnum.QUALIFIKATION),
            this.stesDataService.getCode(DomainEnum.BERUFSERFAHRUNG),
            this.stesDataService.getActiveCodeByDomain(DomainEnum.AUSBILDUNGSNIVEAU),
            this.stesDataService.getCode(DomainEnum.ZUSTAENDIGKEITSREGION),
            this.stesDataService.getStesHeader(this.stesId, this.translate.currentLang)
        ]).subscribe(
            ([qualifikation, erfahrung, ausbildungsniveau, zustaendigkeitsBereich, stesHeader]) => {
                if (qualifikation) {
                    this.qualifikationOptionsLabels = this.facade.formUtilsService.mapDropdownKurztext(qualifikation);
                }
                if (erfahrung) {
                    this.erfahrungOptionsLabels = this.facade.formUtilsService.mapDropdownKurztext(erfahrung);
                }
                if (ausbildungsniveau) {
                    this.ausbildungsniveauOptionsLabels = this.facade.formUtilsService.mapDropdownKurztext(ausbildungsniveau);
                }
                if (zustaendigkeitsBereich) {
                    this.zustaendigkeitsBereichOptionsLabels = this.facade.formUtilsService.mapDropdownKurztext(zustaendigkeitsBereich);
                }
                if (stesHeader) {
                    this.stesHeader = stesHeader;
                    this.stesInfobarService.sendDataToInfobar({ title: 'arbeitgeber.label.stellenangeboteSuchen' });
                    this.observeClickActionSub = this.subscribeToToolbox();
                    this.configureToolbox();
                }

                this.restoreState();

                this.spinnerService.deactivate(this.stellenangebotChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.stellenangebotChannel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    reset() {
        this.stellenangebotForm.reset();
        this.erweiterteSucheComponent.onReset();
    }

    initForm() {
        this.stellenangebotForm = this.formBuilder.group({
            beruf: null,
            aehnlicheBerufe: false,
            qualifikation: null,
            erfahrung: null,
            ausbildung: null,
            stellenbeschreibung: null,
            arbeitsRegion: null,
            stellenangebote: null,
            stellenverantwortung: null,
            stellenNr: ['', NumberValidator.val010],
            arbeitgeber: null,
            erweiterteSuche: this.formBuilder.array([])
        });
    }

    ngOnDestroy() {
        this.toolboxService.sendConfiguration([]);
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
        this.fehlermeldungenService.closeMessage();
    }
}
