import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import { MessageBus } from '@shared/services/message-bus';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { UnternehmenTypes } from '@shared/enums/unternehmen.enum';
import { finalize, takeUntil } from 'rxjs/operators';

import { Permissions } from '@shared/enums/permissions.enum';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { TranslateService } from '@ngx-translate/core';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { UnternehmenSuchenDTO } from '@dtos/unternehmenSuchenDTO';
import { EnhancedSearchQueryDTO } from '@dtos/enhancedSearchQueryDTO';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BaseResponseWrapperListUnternehmenResponseSuchenDTOWarningMessages } from '@dtos/baseResponseWrapperListUnternehmenResponseSuchenDTOWarningMessages';
import { UnternehmenResponseSuchenDTO } from '@dtos/unternehmenResponseSuchenDTO';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { UnternehmenSearchFormComponent } from '@shared/components/unternehmen/search/unternehmen-search-form/unternehmen-search-form.component';
import { ReloadHelper } from '@shared/helpers/reload.helper';

@Component({
    selector: 'avam-unternehmen-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    providers: [SearchSessionStorageService]
})
export class UnternehmenSearchComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    static TOOLBOX_CHANNEL = 'searchForm';
    static TABLE_SPINNER_CHANNEL = 'tableSpinner';

    @Input() stateKey: string;
    @Input() cacheKey: string;

    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('emailConfirm') emailConfirm: ElementRef;
    @ViewChild('trefferAusBURAnzeigen') trefferAusBURAnzeigen: ElementRef;
    @ViewChild('unternehmenSearchForm') unternehmenSearchForm: UnternehmenSearchFormComponent;

    @Input() hideAdvancedSearch: boolean;

    type: string;
    infoleisteTranslationKey: string;
    permissions: typeof Permissions = Permissions;

    tableForm: FormGroup;

    checkedRows = 0;
    selectedBurData;
    rawTableData: UnternehmenResponseSuchenDTO[];
    tableConfig;

    searchDone = false;
    private isSearchedAVAM = false;
    private baseTableConfig;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private restService: UnternehmenRestService,
        private translateService: TranslateService,
        private dbTranslateService: DbTranslateService,
        private fehlermeldungenService: FehlermeldungenService,
        private activatedRoute: ActivatedRoute,
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private messageBus: MessageBus,
        private modalService: NgbModal,
        private stesDataRestService: StesDataRestService,
        private searchSession: SearchSessionStorageService
    ) {
        super();
        ToolboxService.CHANNEL = UnternehmenSearchComponent.TOOLBOX_CHANNEL;
    }

    public ngOnInit(): void {
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.onReset());
        this.setInitialData();
        this.generateTable();
        this.configureToolbox();
        this.configureInfoleiste();
        this.setSubscriptions();
    }

    public ngAfterViewInit() {}

    public ngOnDestroy(): void {
        this.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    onReset(): void {
        this.fehlermeldungenService.closeMessage();
        this.tableForm.controls.headerControl.setValue(false);
        this.tableForm.controls.tableRows = this.fb.array([]);
        this.unternehmenSearchForm.searchForm.reset({
            statusId: this.unternehmenSearchForm.defaultStatusId,
            selector: { label: 'unternehmen.label.sucheavam', value: 'AVAM' }
        });
        this.unternehmenSearchForm.searchForm.controls['statusId'].enable();
        this.unternehmenSearchForm.searchForm.controls['personalberater'].enable();
        this.unternehmenSearchForm.searchForm.controls['extraCriteria'] = this.fb.array([]);
        this.unternehmenSearchForm.enhancedSearchInfo = { sucheObject: [], sucheKriterium: [], operatorId: [] };
        this.unternehmenSearchForm.filterExtraCriteriaFields(this.unternehmenSearchForm.rawEnhancedSearchInfo);
        this.tableForm.updateValueAndValidity();
        this.unternehmenSearchForm.searchForm.updateValueAndValidity();
        this.tableConfig.data = [];
        this.rawTableData = [];
        this.searchSession.restoreDefaultValues(this.stateKey);
        this.searchDone = false;
        this.isSearchedAVAM = this.unternehmenSearchForm.isAVAMSelected();
        this.unternehmenSearchForm.personalberaterEvent = null;
        this.searchSession.clearStorageByKey(this.cacheKey);
    }

    public search(): void {
        if (this.unternehmenSearchForm.searchForm.valid) {
            this.unternehmenSearchForm.storeState();
            this.fehlermeldungenService.closeMessage();
            this.searchDone = false;
            this.spinnerService.activate(UnternehmenSearchComponent.TABLE_SPINNER_CHANNEL);
            this.isSearchedAVAM = this.unternehmenSearchForm.isAVAMSelected();
            this.restService
                .searchUnternehmen(this.mapToDTO(this.unternehmenSearchForm.searchForm.controls))
                .pipe(
                    takeUntil(this.unsubscribe),
                    finalize(() => {
                        this.searchDone = true;
                        this.spinnerService.deactivate(UnternehmenSearchComponent.TABLE_SPINNER_CHANNEL);
                    })
                )
                .subscribe((response: BaseResponseWrapperListUnternehmenResponseSuchenDTOWarningMessages) => {
                    if (response.data && response.data.length) {
                        // AvamGenericTableComponent can only sort columns by 1 field. Other columns are sorted here
                        this.rawTableData = this.sortByPlzOrt(response.data);
                        this.fillTableWithResults(this.rawTableData);
                    } else {
                        this.tableForm.controls.headerControl.setValue(false);
                        this.tableForm.controls.tableRows = this.fb.array([]);
                        this.tableForm.updateValueAndValidity();
                        this.tableConfig.data = [];
                        this.rawTableData = [];
                    }
                });
        } else {
            this.unternehmenSearchForm.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    public invalidMailCount() {
        return this.checkedRows === 0 || this.checkedRows >= 50;
    }

    public sendEmails() {
        if (!this.invalidMailCount()) {
            const selectedRowsIndexes = this.tableForm.value.tableRows.map((checked, index) => (checked ? index : null)).filter(value => value !== null);
            const selectedRows = this.tableConfig.data.filter(tableData => selectedRowsIndexes.includes(tableData.i) && tableData.object.ugInAvam && !!tableData.email);
            window.location.href = `mailto:${selectedRows.map(rowData => rowData.email).join(';')}`;
        }
    }

    public selectItem(tableRowInfo: any): void {
        if (tableRowInfo.object.ugInAvam) {
            if (this.isSearchedAVAM) {
                this.router.navigate([`${this.router.url.split('/', 3).join('/')}/${tableRowInfo.object.unternehmenId}`]);
            } else {
                this.restService
                    .getUnternehmenIdByBurOrEnheitNummer(tableRowInfo.object.burOrtEinheitId)
                    .pipe(takeUntil(this.unsubscribe))
                    .subscribe((response: BaseResponseWrapperLongWarningMessages) => {
                        this.router.navigate([`${this.router.url.split('/', 3).join('/')}/${response.data}`]);
                    });
            }
        } else {
            this.spinnerService.activate(UnternehmenSearchComponent.TABLE_SPINNER_CHANNEL);
            this.restService
                .getBurUnternehmenErfassenDTOByBurOrEnheitId(tableRowInfo.object.burOrtEinheitId)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    response => {
                        this.spinnerService.deactivate(UnternehmenSearchComponent.TABLE_SPINNER_CHANNEL);
                        if (!!response && !!response.data) {
                            const selectedItem = tableRowInfo.object as UnternehmenResponseSuchenDTO;
                            this.selectedBurData = response.data;
                            this.selectedBurData.uidOrganisationIdCategorie = selectedItem.uidOrganisationIdCategorie;
                            this.selectedBurData.uidOrganisationId = selectedItem.uidOrganisationId;
                            this.selectedBurData.burNr = selectedItem.burNr;
                            this.modalService.open(this.trefferAusBURAnzeigen, {
                                windowClass: 'modal-md',
                                ariaLabelledBy: 'modal-basic-title',
                                centered: true,
                                backdrop: 'static'
                            });
                        }
                    },
                    () => this.spinnerService.deactivate(UnternehmenSearchComponent.TABLE_SPINNER_CHANNEL)
                );
        }
    }

    onEmail(event: any) {
        window.location.href = `mailto:${event}`;
    }

    private static getSearchTuples(extraCriteria: FormArray): EnhancedSearchQueryDTO[] {
        const response: EnhancedSearchQueryDTO[] = [];
        extraCriteria.controls
            .filter((formGroup: FormGroup) => formGroup.valid)
            .forEach((formGroup: FormGroup) => {
                response.push({
                    searchFieldId: formGroup.controls.sucheKriterium.value,
                    comparatorId: formGroup.controls.operatorId.value,
                    searchValue: formGroup.controls.freeInput.value
                });
            });
        return response;
    }

    private setInitialData(): void {
        this.type = this.activatedRoute.snapshot.data['type'];
        this.baseTableConfig = {
            columns: [
                { columnDef: 'checkbox', header: '', cell: (e: any) => `${e.checkbox}`, fixWidth: true },
                { columnDef: 'exclamation', header: this.getExclamationHeader(), cell: (e: any) => `${e.exclamation}`, fixWidth: true },
                { columnDef: 'name', header: 'stes.label.name', cell: (e: any) => `${e.name}`, initWidth: '22%' },
                { columnDef: 'strasse', header: 'common.label.strassenr', cell: (e: any) => `${e.strasse}` },
                { columnDef: 'plzOrt', header: 'stes.label.plzort', cell: (e: any) => `${e.plzOrt}` },
                { columnDef: 'land', header: 'common.label.land', cell: (e: any) => `${e.land}` },
                { columnDef: 'uidOrganisationFull', header: 'unternehmen.label.uidnummer', cell: (e: any) => `${e.uidOrganisationFull}` },
                { columnDef: 'unternehmenStatus', header: 'unternehmen.label.burstatus', cell: (e: any) => `${e.unternehmenStatus}` },
                { columnDef: 'avamSuche', header: 'unternehmen.label.sucheavam', cell: (e: any) => `${e.avamSuche}`, initWidth: '7%' },
                { columnDef: 'actions', header: 'common.button.oeffnen', cell: () => '', initWidth: '6%' }
            ],
            data: [],
            config: {
                sortField: 'name',
                sortOrder: 1,
                displayedColumns: []
            }
        };
    }

    private generateTable(): void {
        this.tableForm = this.fb.group({
            headerControl: false,
            tableRows: this.fb.array([])
        });

        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
    }

    private configureToolbox(): void {
        this.toolboxService.sendConfiguration(
            [new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true), new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)],
            UnternehmenSearchComponent.TOOLBOX_CHANNEL
        );

        this.messageBus.buildAndSend('toolbox.help.formNumber', this.activatedRoute.snapshot.data.formNumber);
    }

    private configureInfoleiste(): void {
        switch (this.type) {
            case UnternehmenTypes.ARBEITGEBER:
                this.infoleisteTranslationKey = 'unternehmen.label.suchen.arbeitgeber';
                break;
            case UnternehmenTypes.FACHBERATUNG:
                this.infoleisteTranslationKey = 'unternehmen.label.suchen.fachberatung';
                break;
            default:
                this.infoleisteTranslationKey = 'unternehmen.label.suchen.anbieter';
                break;
        }
    }

    private setSubscriptions(): void {
        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    this.openPrintModal();
                }
            });

        this.dbTranslateService
            .getEventEmitter()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                if (!!this.rawTableData) {
                    this.updateTableColumns();
                }
            });

        this.tableForm.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe((formValue: any) => {
            this.checkedRows = formValue.tableRows.filter(checkboxValue => checkboxValue).length;
        });
    }

    private openPrintModal(): void {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    private updateTableColumns() {
        this.tableConfig.data = this.tableConfig.data.map(rowData => {
            const plz = !!rowData.object.plzObject ? rowData.object.plzObject.postleitzahl : '';
            const ort = !!rowData.object.plzObject ? this.dbTranslateService.translate(rowData.object.plzObject, 'ort') : '';
            return {
                ...rowData,
                plzOrt: plz ? `${plz} ${ort}` : ort,
                land: this.dbTranslateService.translate(rowData.object.land, 'name') || '',
                unternehmenStatus:
                    this.dbTranslateService.translate(rowData.object.status, 'text') || this.translateService.instant('erweitertesuche.label.burstatus.nichtverfuegbar'),
                avamSuche: this.translateService.instant(rowData.dataFromTUnternehmen ? 'common.label.ja' : 'common.label.nein') || ''
            };
        });
    }

    private mapToDTO(formControls: any): UnternehmenSuchenDTO {
        const uidValue = !!formControls.uidnummer.value
            ? formControls.uidnummer.value
                  .split('')
                  .filter(char => !isNaN(char))
                  .join('')
            : null;

        return {
            name: formControls.name.value,
            strasse: formControls.strasse.value,
            strassenNr: formControls.strassenr.value,
            plzDTO: formControls.plz['plzWohnAdresseObject'],
            land: formControls.land.landAutosuggestObject,
            uid: uidValue,
            burNr: formControls.burnummer.value,
            kundenberater: formControls.selector.value.value === 'AVAM' ? formControls.personalberater.benutzerObject : null,
            unternehmenStatusId: formControls.selector.value.value === 'AVAM' ? formControls.statusId.value : null,
            avamSuche: formControls.selector.value.value === 'AVAM',
            sucheWortBeliebig: formControls.mitirgendeinemwort.value,
            sucheUmliegend: formControls.umliegendeorte.value,
            language: this.translateService.currentLang,
            searchTuples: UnternehmenSearchComponent.getSearchTuples(formControls.extraCriteria)
        };
    }

    private sortByPlzOrt(response: UnternehmenResponseSuchenDTO[]): UnternehmenResponseSuchenDTO[] {
        return response.sort((row1, row2) => {
            let returnValue = 0;
            if (!!row1.plzObject && !!row2.plzObject) {
                const plzOrt1 = `${row1.plzObject.postleitzahl} ${this.dbTranslateService.translate(row1.plzObject, 'ort')}`;
                const plzOrt2 = `${row2.plzObject.postleitzahl} ${this.dbTranslateService.translate(row2.plzObject, 'ort')}`;
                returnValue = plzOrt1 < plzOrt2 ? -1 : 1;
            }
            return returnValue;
        });
    }

    private fillTableWithResults(data: UnternehmenResponseSuchenDTO[]): void {
        this.tableConfig.data = data ? data.map(row => this.generateRow(row)) : [];
    }

    private generateRow(responseDTO: UnternehmenResponseSuchenDTO): any {
        const formArray = this.validateAvamAndEmail(responseDTO);

        const plz = !!responseDTO.plzObject ? responseDTO.plzObject.postleitzahl : '';
        const ort = !!responseDTO.plzObject && !!responseDTO.plzObject.ortDe ? this.dbTranslateService.translate(responseDTO.plzObject, 'ort') : '';
        return {
            i: formArray.length - 1,
            object: responseDTO,
            email: responseDTO.email,
            allowMailTo: true,
            dataFromTUnternehmen: responseDTO.ugInAvam,
            exclamation: responseDTO.fiktiv ? this.getExclamationHeader() : '',
            name: responseDTO.name,
            strasse: responseDTO.strasse,
            plzOrt: plz ? `${plz} ${ort}` : ort,
            land: this.dbTranslateService.translate(responseDTO.land, 'name') || '',
            uidOrganisationFull: responseDTO.uidOrganisationFull,
            unternehmenStatus: this.dbTranslateService.translate(responseDTO.status, 'text') || this.translateService.instant('erweitertesuche.label.burstatus.nichtverfuegbar'),
            avamSuche: this.translateService.instant(responseDTO.ugInAvam ? 'common.label.ja' : 'common.label.nein')
        };
    }

    private validateAvamAndEmail(responseDTO: UnternehmenResponseSuchenDTO) {
        const formArray = this.tableForm.controls['tableRows'] as FormArray;
        if (responseDTO.ugInAvam && !!responseDTO.email) {
            formArray.push(this.fb.control(false));
        }
        return formArray;
    }

    private getExclamationHeader(): string {
        let tooltipTranslationKey;
        switch (this.type) {
            case UnternehmenTypes.ANBIETER:
                tooltipTranslationKey = 'unternehmen.exclamationtooltip.unternehmenfiktivanbieter';
                break;
            case UnternehmenTypes.ARBEITGEBER:
                tooltipTranslationKey = 'unternehmen.exclamationtooltip.unternehmenfiktivarbeitgeber';
                break;
            case UnternehmenTypes.FACHBERATUNG:
                tooltipTranslationKey = 'unternehmen.exclamationtooltip.unternehmenfiktivfachberatungsstelle';
                break;
            default:
                tooltipTranslationKey = 'unternehmen.exclamationtooltip.unternehmenfiktivanbieter';
                break;
        }
        return tooltipTranslationKey;
    }

    restoreCache() {
        this.search();
    }
}
