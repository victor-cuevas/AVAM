import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { DomainEnum } from '@shared/enums/domain.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { CodeDTO } from '@dtos/codeDTO';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { FormUtilsService, ToolboxService } from '@app/shared';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { MatchingtreffernOsteSuchenParamDTO } from '@dtos/matchingtreffernOsteSuchenParamDTO';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { MeldepflichtEnum } from '@shared/enums/table-icon-enums';
import { Permissions } from '@shared/enums/permissions.enum';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { Router } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { ZeitraumCodeEnum } from '@shared/enums/domain-code/zeitraum-code.enum';
import { MatchingOsteOverviewDTO } from '@dtos/matchingOsteOverviewDTO';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { ReloadHelper } from '@shared/helpers/reload.helper';

@Component({
    selector: 'avam-stellen-angebote-matching-treffern',
    templateUrl: './stellen-angebote-matching-treffern.component.html',
    styleUrls: ['./stellen-angebote-matching-treffern.component.scss']
})
export class StellenAngeboteMatchingTreffernComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    static STATE_KEY = 'stellen-angebot-matching-treffern-state-key';
    readonly tableStateKey = 'stellen-angebot-matching-treffern-table-state-key';
    @ViewChild('personalberater') personalberater: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    searchForm: FormGroup;
    zeitraumOptions: CodeDTO[] = [];
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;
    permissions: typeof Permissions = Permissions;
    channel = 'stellenAngeboteMatchingTreffern-spinner';
    zeitraumSelectedValue: string;
    searchDone = false;

    public tableConfig;
    responseData: MatchingOsteOverviewDTO[];
    private baseTableConfig = {
        columns: [
            {
                columnDef: 'flag',
                header: '',
                fixWidth: true,
                cell: (element: any) => element.flag
            },
            {
                columnDef: 'arbeitgeberName',
                header: 'arbeitgeber.label.namearbeitgeber',
                cell: (element: any) => `${element.arbeitgeberName}`
            },
            {
                columnDef: 'arbeitsort',
                header: 'arbeitgeber.oste.label.arbeitsort',
                cell: (element: any) => `${element.arbeitsort}`
            },
            {
                columnDef: 'stellenbezeichnung',
                header: 'arbeitgeber.oste.label.stellenbezeichnung',
                cell: (element: any) => `${element.stellenbezeichnung}`
            },
            {
                columnDef: 'stellennr',
                header: 'arbeitgeber.oste.label.stellennr',
                cell: (element: any) => `${element.stellennr}`
            },
            { columnDef: 'actions', header: 'common.button.oeffnen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'arbeitgeberName',
            sortOrder: 1,
            displayedColumns: []
        }
    };
    private printColumns: any;
    private printConfig: any;

    constructor(
        private dataService: StesDataRestService,
        private readonly formBuilder: FormBuilder,
        private dbTranslateService: DbTranslateService,
        private formUtils: FormUtilsService,
        private spinnerService: SpinnerService,
        private changeDetector: ChangeDetectorRef,
        private osteDataService: OsteDataRestService,
        private translateService: TranslateService,
        private fehlermeldungenService: FehlermeldungenService,
        private router: Router,
        private toolboxService: ToolboxService,
        private modalService: NgbModal,
        private searchSession: SearchSessionStorageService
    ) {
        super();
    }

    ngOnInit() {
        this.searchForm = this.createFormGroup();
        this.searchForm.patchValue({ zeitraum: ZeitraumCodeEnum.LETZTE_24_STUNDEN });
        this.subscribeToLangChange();
        this.getData();
        this.subscribeToolbox();
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
        this.restoreState();
    }

    public ngOnDestroy(): void {
        this.fehlermeldungenService.closeMessage();
        this.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    ngAfterViewInit() {
        if (this.searchForm.controls.benutzer.value === null) {
            this.personalberater.appendCurrentUser();
        }
        this.changeDetector.detectChanges();
        this.search();
    }

    reset() {
        this.fehlermeldungenService.closeMessage();
        this.searchForm.patchValue({ zeitraum: ZeitraumCodeEnum.LETZTE_24_STUNDEN });
        this.personalberater.appendCurrentUser();
        this.tableConfig.data = [];
        this.searchDone = false;
        this.searchSession.restoreDefaultValues(this.tableStateKey);
        this.search();
    }

    search() {
        this.fehlermeldungenService.closeMessage();

        if (this.searchForm.valid) {
            this.storeState();
            this.spinnerService.activate(this.channel);
            this.searchDone = false;
            this.osteDataService
                .getMatchingtreffernOste(this.mapToDTO(), this.translateService.currentLang)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    response => {
                        this.zeitraumSelectedValue = this.searchForm.controls.zeitraum.value;

                        if (response && !!response.data) {
                            this.responseData = response.data;
                            this.sortStellNr();
                            this.setTableData(response.data);
                        }
                        this.searchDone = true;
                        this.spinnerService.deactivate(this.channel);
                    },
                    () => {
                        this.spinnerService.deactivate(this.channel);
                        this.searchDone = true;
                    }
                );
        } else {
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    selectItem(event: any) {
        this.router.navigate([`/arbeitgeber/details/${event.unternehmenId}/stellenangebote/stellenangebot/matchingprofil`], {
            queryParams: {
                osteId: event.osteId
            },
            state: {
                zeitraum: this.zeitraumSelectedValue
            }
        });
    }

    private createFormGroup(): FormGroup {
        return this.formBuilder.group({ benutzer: [null, Validators.required], zeitraum: null });
    }

    private getData() {
        this.spinnerService.activate(this.channel);
        this.setTableData([]);
        this.dataService
            .getCode(DomainEnum.TREFFER_SEIT)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                zeitraumOptions => {
                    if (zeitraumOptions) {
                        this.zeitraumOptions = zeitraumOptions.map(this.customPropertyMapper);
                    }
                    this.spinnerService.deactivate(this.channel);
                },
                () => this.spinnerService.deactivate(this.channel)
            );
    }

    private mapToDTO(): MatchingtreffernOsteSuchenParamDTO {
        const formControls: any = this.searchForm.controls;
        return {
            benutzerDetail: formControls.benutzer['benutzerObject'] ? formControls.benutzer['benutzerObject'] : formControls.benutzer.value,
            zeitraumValue: formControls.zeitraum.value
        };
    }

    private customPropertyMapper = (element: CodeDTO) => {
        return {
            codeId: element.codeId,
            value: element.code,
            labelFr: element.kurzTextFr,
            labelIt: element.kurzTextIt,
            labelDe: element.kurzTextDe
        };
    };

    private setTableData(data: any[]) {
        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.tableConfig.data = data && data.length ? data.map(row => this.createRow(row)) : [];
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
    }

    private createRow(data: any) {
        return {
            flag: this.getFlag(data),
            arbeitgeberName: data.unternehmen,
            arbeitsort: this.dbTranslateService.translate(data, 'arbeitsortPlz'),
            stellenbezeichnung: data.stellenBezeichnung,
            stellennr: data.stellenNr,
            unternehmenId: data.unternehmenId,
            osteId: data.osteId
        };
    }

    private subscribeToolbox() {
        this.printColumns = this.tableConfig.columns.filter(item => item.columnDef !== 'actions');
        this.printConfig = { ...this.tableConfig.config, displayedColumns: this.printColumns.map(c => c.columnDef) };
        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() =>
                this.modalService.open(this.modalPrint, { ariaLabelledBy: 'zahlstelle-basic-title', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' })
            );
        this.toolboxService.sendConfiguration(ToolboxConfig.getStellenAngeboteMatchingTreffernConfig());
    }

    private getFlag(data: any) {
        const unterliegtLaufend = { flagType: MeldepflichtEnum.UNTERLIEGT_LAUFEND, tooltip: this.translateService.instant('stes.tooltip.stellenmeldepflicht') };
        const unterliegtAbgelaufend = {
            flagType: MeldepflichtEnum.UNTERLIEGT_ABGELAUFEN,
            tooltip: this.translateService.instant('stes.tooltip.stellenmeldepflichtAbgelaufendeSperrfrist')
        };
        const hasSign = !!(data.meldepflicht && data.sperrfristDatum);
        const filled = data.meldepflicht && moment(data.sperrfristDatum).isSameOrAfter(moment.now(), 'day');
        return hasSign ? (filled ? unterliegtLaufend : unterliegtAbgelaufend) : null;
    }

    private subscribeToLangChange(): void {
        this.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.setTableData(this.responseData);
        });
    }

    private sortStellNr() {
        this.responseData.sort((value1, value2) => {
            return -1 * value1.stellenNr.localeCompare(value2.stellenNr);
        });
    }

    private storeState(): void {
        const storage: any = {
            benutzer: this.getBenutzerFromForm(),
            zeitraum: this.searchForm.controls.zeitraum.value
        };
        this.searchSession.storeFieldsByKey(StellenAngeboteMatchingTreffernComponent.STATE_KEY, storage);
    }

    private restoreState() {
        const state = this.searchSession.restoreStateByKey(StellenAngeboteMatchingTreffernComponent.STATE_KEY);
        if (state) {
            this.restoreStateAndSearch(state);
        }
    }

    private restoreStateAndSearch(state) {
        this.searchForm.patchValue({
            benutzer: state.fields.benutzer,
            zeitraum: state.fields.zeitraum
        });
    }

    private getBenutzerFromForm(): any {
        if (this.searchForm.controls.benutzer['benutzerObject'] && this.searchForm.controls.benutzer['benutzerObject'].benutzerId === -1) {
            return {
                benuStelleCode: '',
                benutzerDetailId: -1,
                benutzerId: -1,
                benutzerLogin: '',
                benutzerstelleId: -1,
                nachname: this.searchForm.controls.benutzer.value,
                vorname: ''
            };
        } else {
            return this.searchForm.controls.benutzer['benutzerObject'];
        }
    }
}
