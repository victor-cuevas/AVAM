import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { CodeDTO } from '@dtos/codeDTO';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { Unsubscribable } from 'oblique-reactive';
import { forkJoin } from 'rxjs';
import { DomainEnum } from '@shared/enums/domain.enum';
import { finalize, first, takeUntil } from 'rxjs/operators';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { ErweiterteSucheComponent, FormUtilsService, ToolboxService } from '@app/shared';
import { MeldepflichtEnum } from '@shared/enums/table-icon-enums';
import { OsteSearchResultDTO } from '@dtos/osteSearchResultDTO';
import { BaseResponseWrapperListOsteSearchResultDTOWarningMessages } from '@dtos/baseResponseWrapperListOsteSearchResultDTOWarningMessages';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { OsteSearchParamsDTO } from '@dtos/osteSearchParamsDTO';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EnhancedSearchQueryDTO } from '@dtos/enhancedSearchQueryDTO';
import { NumberValidator } from '@shared/validators/number-validator';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { FacadeService } from '@shared/services/facade.service';
import { ReloadHelper } from '@shared/helpers/reload.helper';

@Component({
    selector: 'avam-oste-vermittlung-suchen',
    templateUrl: './oste-vermittlung-suchen.component.html',
    styleUrls: ['./oste-vermittlung-suchen.component.scss']
})
export class OsteVermittlungSuchenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    static STATE_KEY = 'oste-vermittlung-suchen-state-key';
    readonly stateKey = 'oste-vermittlung-suchen-state-key';
    readonly cacheKey = 'oste-vermittlung-suchen-cache-state-key';
    @ViewChild('erweiterteSucheComponent') erweiterteSucheComponent: ErweiterteSucheComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    searchForm: FormGroup;
    qualifikationDropdownLabels: CodeDTO[] = [];
    erfahrungDropdownLabels: CodeDTO[] = [];
    ausbildungniveauDropdownLabels: CodeDTO[] = [];
    stesImZustaendigkeitsbereichLabels: CodeDTO[] = [];
    benutzerSuchenTokens: any = {};
    benutzerAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;
    channel = 'oste-vermittlung-channel';
    permissions: typeof Permissions = Permissions;
    responseData: OsteSearchResultDTO[];
    tableConfig;
    personalberaterEvent: any;
    searchDone = false;
    private baseTableConfig = {
        columns: [
            {
                columnDef: 'flag',
                header: '',
                fixWidth: true,
                cell: (element: any) => element.flag
            },
            {
                columnDef: 'namearbeitgeber',
                header: 'arbeitgeber.label.namearbeitgeber',
                cell: (element: any) => `${element.namearbeitgeber}`
            },
            {
                columnDef: 'ort',
                header: 'common.label.ort',
                cell: (element: any) => `${element.ort}`
            },
            {
                columnDef: 'stellenbezeichnung',
                header: 'arbeitgeber.oste.label.stellenbezeichnung',
                cell: (element: any) => `${element.stellenbezeichnung}`
            },
            {
                columnDef: 'stellenbeschreibung',
                header: 'arbeitgeber.oste.label.stellenbeschreibung',
                cell: (element: any) => `${element.stellenbeschreibung}`
            },
            {
                columnDef: 'arbeitsort',
                header: 'arbeitgeber.oste.label.arbeitsort',
                cell: (element: any) => `${element.arbeitsort}`
            },
            {
                columnDef: 'beschaeftigungsgrad',
                header: 'arbeitgeber.oste.label.beschaeftigungsgrade',
                cell: (element: any) => `${element.beschaeftigungsgrad}`
            },
            {
                columnDef: 'idealAlter',
                header: 'arbeitgeber.label.alter',
                cell: (element: any) => `${element.idealAlter}`
            },
            {
                columnDef: 'geschlecht',
                header: 'arbeitgeber.oste.label.geschlecht',
                cell: (element: any) => `${element.geschlecht}`
            },
            { columnDef: 'actions', header: 'common.button.oeffnen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'arbeitsort',
            sortOrder: 1,
            displayedColumns: []
        }
    };
    private printConfig: any;
    constructor(
        private osteDataRestService: OsteDataRestService,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private stesDataRestService: StesDataRestService,
        private modalService: NgbModal,
        private router: Router,
        private searchSession: SearchSessionStorageService,
        private facadeService: FacadeService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    public ngOnInit(): void {
        this.generateForm();
        this.generateTable();
        this.subscribeToLangChange();
        this.subscribeToolbox();
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    public ngAfterViewInit(): void {
        this.getInitialData();
    }

    public ngOnDestroy(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.facadeService.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    public search() {
        this.facadeService.fehlermeldungenService.closeMessage();
        if (this.searchForm.valid) {
            this.searchDone = false;
            this.storeState();
            this.facadeService.fehlermeldungenService.closeMessage();
            this.facadeService.spinnerService.activate(this.channel);
            this.osteDataRestService
                .getStellenangebote(this.mapToDto(), this.facadeService.translateService.currentLang)
                .pipe(
                    takeUntil(this.unsubscribe),
                    finalize(() => {
                        this.searchDone = true;
                        this.facadeService.spinnerService.deactivate(this.channel);
                    })
                )
                .subscribe((response: BaseResponseWrapperListOsteSearchResultDTOWarningMessages) => {
                    this.responseData = response.data;
                    this.setTableData();
                });
        } else {
            this.ngForm.onSubmit(undefined);
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    public reset() {
        this.searchForm.reset();
        this.erweiterteSucheComponent.onReset();
        this.searchSession.clearStorageByKey(this.cacheKey);
        this.searchDone = false;
        this.tableConfig.data = [];
        this.searchSession.restoreDefaultValues(this.stateKey);
    }

    public selectItem(event: any) {
        this.facadeService.spinnerService.activate(this.channel);
        this.osteDataRestService
            .searchByOste(event.osteId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                response => {
                    const unternehmenId = response.unternehmenId;
                    this.router.navigate([`arbeitgeber/details/${unternehmenId}/stellenangebote/stellenangebot/vermittlungen`], { queryParams: { osteId: event.osteId } });
                    this.facadeService.spinnerService.deactivate(this.channel);
                },
                () => this.facadeService.spinnerService.deactivate(this.channel)
            );
    }

    public updatePersonalberaterSuche(personalberaterState: any): void {
        if (personalberaterState) {
            this.personalberaterEvent = personalberaterState;
            this.searchForm.controls.stellenverantwortung.setValue(personalberaterState);
        }
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

    private generateForm(): void {
        this.searchForm = this.fb.group({
            berufeTaetigkeit: null,
            umAehnlicheBerufeErgaenzen: null,
            qualifikation: null,
            erfahrung: null,
            ausbildungniveau: null,
            stellenbeschreibung: null,
            arbeitsRegion: null,
            stesImZustaendigkeitsbereich: null,
            stellenverantwortung: null,
            arbeitgeber: null,
            stellenNr: ['', NumberValidator.val010],
            extraCriteria: this.fb.array([])
        });
    }

    private subscribeToolbox() {
        const printColumns = this.tableConfig.columns.filter(item => item.columnDef !== 'actions');
        this.printConfig = { ...this.tableConfig.config, displayedColumns: printColumns.map(c => c.columnDef) };
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    this.modalService.open(this.modalPrint, {
                        ariaLabelledBy: 'zahlstelle-basic-title',
                        windowClass: 'avam-modal-xl',
                        centered: true,
                        backdrop: 'static'
                    });
                }
            });
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getOsteVermittlungSuchenConfig());
    }

    private getInitialData(): void {
        this.facadeService.spinnerService.activate(this.channel);
        forkJoin<CodeDTO[], CodeDTO[], CodeDTO[], CodeDTO[]>([
            this.stesDataRestService.getCode(DomainEnum.QUALIFIKATION),
            this.stesDataRestService.getCode(DomainEnum.BERUFSERFAHRUNG),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.AUSBILDUNGSNIVEAU),
            this.stesDataRestService.getCode(DomainEnum.ZUSTAENDIGKEITSREGION)
        ])
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.facadeService.spinnerService.deactivate(this.channel))
            )
            .subscribe(([qualifikation, erfahrung, ausbildungsniveau, zustaendigkeitsbereich]) => {
                this.qualifikationDropdownLabels = this.facadeService.formUtilsService.mapDropdownKurztext(qualifikation);
                this.erfahrungDropdownLabels = this.facadeService.formUtilsService.mapDropdownKurztext(erfahrung);
                this.ausbildungniveauDropdownLabels = this.facadeService.formUtilsService.mapDropdownKurztext(ausbildungsniveau);
                this.stesImZustaendigkeitsbereichLabels = this.facadeService.formUtilsService.mapDropdownKurztext(zustaendigkeitsbereich);
                const state = this.searchSession.restoreStateByKey(this.cacheKey);
                if (state) {
                    this.restoreStateAndSearch(state);
                } else {
                    this.facadeService.spinnerService.deactivate(this.channel);
                }
            });
        this.benutzerSuchenTokens = this.getBenutzerSuchenTokens();
    }

    private subscribeToLangChange(): void {
        this.facadeService.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.search();
        });
    }

    private generateTable() {
        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
    }

    private setTableData() {
        this.tableConfig.data = this.responseData && this.responseData.length ? this.responseData.map(row => this.createRow(row)) : [];
    }

    private createRow(data: OsteSearchResultDTO) {
        return {
            osteId: data.osteId,
            flag: this.getFlagTypeBSP6AndBSP7(data),
            namearbeitgeber: `${data.ugName1 || ''} ${data.ugName2 || ''} ${data.ugName3 || ''}`,
            ort: data.unternehmenOrt ? data.unternehmenOrt : '',
            stellenbezeichnung: data.stellenbezeichnung ? data.stellenbezeichnung[0].toUpperCase() + data.stellenbezeichnung.slice(1) : '',
            arbeitsort: data.arbeitsOrt ? data.arbeitsOrt : data.arbeitsOrtAusland,
            stellenbeschreibung: data.taetigkeitAnforderungen ? data.taetigkeitAnforderungen : '',
            beschaeftigungsgrad: this.beschaeftingungsgradToString(data),
            idealAlter: this.idealAlterToString(data),
            geschlecht: data.geschlecht
        };
    }

    private beschaeftingungsgradToString(data: OsteSearchResultDTO): string {
        return `${data.beschaeftiungsgradVon !== data.beschaeftiungsgradBis ? data.beschaeftiungsgradVon.toString() : ''} ${
            data.beschaeftiungsgradVon !== data.beschaeftiungsgradBis ? '-' : ''
        } ${data.beschaeftiungsgradBis.toString()}`;
    }

    private getFlagTypeBSP6AndBSP7(data: OsteSearchResultDTO) {
        if (data.meldepflicht && !!data.sperrfristDatum) {
            const today = moment();
            const sperrfrist = moment(data.sperrfristDatum);
            if (sperrfrist.isSameOrAfter(today, 'day')) {
                return {
                    flagType: MeldepflichtEnum.UNTERLIEGT_LAUFEND,
                    tooltip: this.facadeService.translateService.instant('stes.tooltip.vermittlung.meldepflichtLaufend')
                };
            } else if (today.isSameOrAfter(sperrfrist, 'day')) {
                return {
                    flagType: MeldepflichtEnum.UNTERLIEGT_ABGELAUFEN,
                    tooltip: this.facadeService.translateService.instant('stes.tooltip.vermittlung.meldepflichtAbgelaufen')
                };
            }
        }
        return null;
    }

    private idealAlterToString(data: OsteSearchResultDTO) {
        let idealAlter = '';
        if (data.alterVon && data.alterVon > 0) {
            idealAlter = data.alterVon.toString();
            if (data.alterBis && data.alterBis > 0 && data.alterBis > data.alterVon) {
                idealAlter = `${data.alterVon - data.alterBis}`;
            }
        } else if (data.alterBis && data.alterBis > 0) {
            idealAlter = data.alterBis.toString();
        }
        return idealAlter;
    }

    private getBenutzerSuchenTokens() {
        const currentUser = this.facadeService.authenticationService.getLoggedUser();

        if (currentUser) {
            return {
                berechtigung: Permissions.STES_VM_ZUWEISUNG_BEARBEITEN,
                myBenutzerstelleId: currentUser.benutzerstelleId,
                stati: DomainEnum.BENUTZER_STATUS_AKTIV
            };
        }
        return null;
    }

    private mapToDto(): OsteSearchParamsDTO {
        const formControls: any = this.searchForm.controls;
        return {
            beruf: formControls.berufeTaetigkeit.berufAutosuggestObject,
            verwandteBerufe: formControls.umAehnlicheBerufeErgaenzen.value ? true : null,
            qualifikationId: formControls.qualifikation.value,
            erfahrungId: formControls.erfahrung.value,
            ausbildungsniveauId: formControls.ausbildungniveau.value,
            zustaendigkeitsBereichId: formControls.stesImZustaendigkeitsbereich.value,
            arbeitsRegion: formControls.arbeitsRegion.arbeitsorteAutosuggestObject,
            unternehmenId: formControls.arbeitgeber.unternehmenAutosuggestObject.unternehmenId === -1 ? null : formControls.arbeitgeber.unternehmenAutosuggestObject.unternehmenId,
            unternehmenText: formControls.arbeitgeber.unternehmenAutosuggestObject
                ? formControls.arbeitgeber['unternehmenAutosuggestObject'].name1
                : { name1: formControls.arbeitgeber['unternehmenAutosuggestObject'].name1 },
            stellenNrAvam: formControls.stellenNr.value === '' ? null : formControls.stellenNr.value,
            stellenbeschreibung: formControls.stellenbeschreibung.value === '' ? null : formControls.stellenbeschreibung.value,
            benutzer: formControls.stellenverantwortung.value ? formControls.stellenverantwortung.benutzerObject : null,
            burNr: null,
            enhancedSearchQueries: formControls.extraCriteria.value.map(
                (el): EnhancedSearchQueryDTO => {
                    return {
                        comparatorId: el.comparatorId,
                        searchFieldId: el.searchFieldId,
                        searchValue: el.searchValue ? el.searchValue : el.searchFreeText ? el.searchFreeText : el.searchLevel3
                    };
                }
            )
        };
    }

    private storeState() {
        const searchFormControls = this.searchForm.controls;
        const storage: any = {
            berufeTaetigkeit: searchFormControls.berufeTaetigkeit['berufAutosuggestObject'],
            umAehnlicheBerufeErgaenzen: searchFormControls.umAehnlicheBerufeErgaenzen.value,
            qualifikation: searchFormControls.qualifikation.value,
            erfahrung: searchFormControls.erfahrung.value,
            ausbildungniveau: searchFormControls.ausbildungniveau.value,
            stellenbeschreibung: searchFormControls.stellenbeschreibung.value,
            arbeitsRegion: searchFormControls.arbeitsRegion['arbeitsorteAutosuggestObject'],
            stesImZustaendigkeitsbereich: searchFormControls.stesImZustaendigkeitsbereich.value,
            stellenverantwortung: searchFormControls.stellenverantwortung['benutzerObject']
                ? searchFormControls.stellenverantwortung['benutzerObject'].benutzerId === -1
                    ? {
                          benuStelleCode: '',
                          benutzerDetailId: -1,
                          benutzerId: -1,
                          benutzerLogin: '',
                          benutzerstelleId: -1,
                          nachname: searchFormControls.stellenverantwortung.value,
                          vorname: ''
                      }
                    : searchFormControls.stellenverantwortung['benutzerObject']
                : null,
            arbeitgeber: searchFormControls.arbeitgeber.value,
            stellenNr: searchFormControls.stellenNr.value,
            extraCriteria: this.erweiterteSucheComponent ? this.storeErweiterteSuche() : []
        };
        this.searchSession.storeFieldsByKey(this.cacheKey, storage);
    }

    private restoreStateAndSearch(state) {
        this.searchForm.patchValue({
            berufeTaetigkeit: state.fields.berufeTaetigkeit,
            umAehnlicheBerufeErgaenzen: state.fields.umAehnlicheBerufeErgaenzen,
            qualifikation: state.fields.qualifikation,
            erfahrung: state.fields.erfahrung,
            ausbildungniveau: state.fields.ausbildungniveau,
            stellenbeschreibung: state.fields.stellenbeschreibung,
            stesImZustaendigkeitsbereich: state.fields.stesImZustaendigkeitsbereich,
            stellenverantwortung: state.fields.stellenverantwortung,
            arbeitgeber: state.fields.arbeitgeber,
            stellenNr: state.fields.stellenNr
        });

        this.updateBerufSuche(state.fields.berufeTaetigkeit);
        this.updateArbeitsregion(state.fields.arbeitsRegion);
        this.updatePersonalberaterSuche(state.fields.stellenverantwortung);
        this.restoreErweiterteSuche(state);
        setTimeout(() => this.search(), 1000);
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
            this.searchForm.controls.arbeitsRegion.setValue(null);
        } else if (region.code === -1 && region.regionDe) {
            this.searchForm.controls.arbeitsRegion.patchValue({
                code: `${region.code}`,
                regionDe: region.regionDe
            });
        } else {
            this.searchForm.controls.arbeitsRegion.patchValue(region);
        }
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
            (erweiterteSucheComponent.criteria.controls[index] as FormGroup).get('searchLevel1').setValue(el.searchLevel1);
            (erweiterteSucheComponent.criteria.controls[index] as FormGroup).get('searchFieldId').setValue(el.searchFieldId);
            (erweiterteSucheComponent.criteria.controls[index] as FormGroup).get('comparatorId').setValue(el.comparatorId);
            (erweiterteSucheComponent.criteria.controls[index] as FormGroup).get('searchLevel3').setValue(el.searchValue);
            (erweiterteSucheComponent.criteria.controls[index] as FormGroup).get('searchFreeText').setValue(el.searchValue);
        });
    }

    private storeErweiterteSuche(): any[] {
        const returnErweiterteSucheArray = [];
        const extraCriteras = this.erweiterteSucheComponent.getExtraCriteria() as FormGroup[];

        extraCriteras.forEach(value => {
            const extraCriteria = {
                searchLevel1: value.controls.searchLevel1.value,
                comparatorId: value.controls.comparatorId.value,
                searchFieldId: value.controls.searchFieldId.value,
                searchValue: value.controls.searchFreeText.value ? value.controls.searchFreeText.value : value.controls.searchLevel3.value
            };
            returnErweiterteSucheArray.push(extraCriteria);
        });
        return returnErweiterteSucheArray;
    }
}
