import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DateValidator } from '@shared/validators/date-validator';
import { Permissions } from '@shared/enums/permissions.enum';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { FacadeService } from '@shared/services/facade.service';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { InfoMessageSuchenParamDTO } from '@dtos/infoMessageSuchenParamDTO';
import { BaseResponseWrapperListInfoMessageDTOWarningMessages } from '@dtos/baseResponseWrapperListInfoMessageDTOWarningMessages';
import { InfoMessageRestService } from '@core/http/info-message-rest.service';
import { InfoMessageDTO } from '@dtos/infoMessageDTO';
import { FormUtilsService, ToolboxService } from '@app/shared';
import { ActivatedRoute, Router } from '@angular/router';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReloadHelper } from '@shared/helpers/reload.helper';

@Component({
    selector: 'avam-informationsmeldungen-suchen',
    templateUrl: './informationsmeldungen-suchen.component.html',
    styleUrls: ['./informationsmeldungen-suchen.component.scss']
})
export class InformationsmeldungenSuchenComponent extends Unsubscribable implements OnInit, OnDestroy {
    static readonly stateKey = 'informationsmeldungen-search';
    @ViewChild('modalPrint') modalPrint: ElementRef;

    public permissions: typeof Permissions = Permissions;
    public searchForm: FormGroup;
    public channel = 'informationsmeldung-channel';
    public responseData: InfoMessageDTO[];
    public tableConfig;
    public printConfig;
    public searchDone = false;
    private baseTableConfig = {
        columns: [
            {
                columnDef: 'gueltigAb',
                header: 'common.label.gueltig_von',
                cell: (element: any) => `${this.facadeService.formUtilsService.formatDateNgx(element.gueltigAb, FormUtilsService.GUI_DATE_FORMAT) || ''}`,
                initWidth: '150px'
            },
            {
                columnDef: 'gueltigBis',
                header: 'common.label.gueltig_bis',
                cell: (element: any) => `${this.facadeService.formUtilsService.formatDateNgx(element.gueltigBis, FormUtilsService.GUI_DATE_FORMAT) || ''}`,
                initWidth: '150px'
            },
            {
                columnDef: 'meldungstext',
                header: 'geko.label.meldungstext',
                cell: (element: any) => `${element.meldungstext || ''} `
            },
            { columnDef: 'actions', header: 'common.button.oeffnen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'gueltigAb',
            sortOrder: -1,
            displayedColumns: []
        }
    };

    constructor(
        private fb: FormBuilder,
        private searchSession: SearchSessionStorageService,
        private facadeService: FacadeService,
        private infoMessageRestService: InfoMessageRestService,
        private router: Router,
        private route: ActivatedRoute,
        private modalService: NgbModal
    ) {
        super();
    }

    public ngOnInit() {
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
        this.generateForm();
        this.generateTable();
        this.configureToolbox();
        this.subscribeToLangChange();
        this.restoreState();
    }

    public ngOnDestroy() {
        this.facadeService.toolboxService.sendConfiguration([]);
        this.facadeService.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    public search() {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.facadeService.spinnerService.activate(this.channel);
        this.storeState();
        this.infoMessageRestService
            .searchInformationsmeldungenaByParams(this.mapToDTO())
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.facadeService.spinnerService.deactivate(this.channel))
            )
            .subscribe((response: BaseResponseWrapperListInfoMessageDTOWarningMessages) => {
                if (response) {
                    this.searchDone = true;
                    this.responseData = response.data;
                    this.setTableData();
                }
            });
    }

    public reset() {
        this.searchDone = false;
        this.searchSession.clearStorageByKey(InformationsmeldungenSuchenComponent.stateKey);
        this.searchSession.restoreDefaultValues('informationsmeldungen-suchen');
        this.tableConfig.data = [];
        this.searchForm.reset();
    }

    public selectItem(event: any) {
        this.router.navigate([`../bearbeiten`], { queryParams: { meldungId: event.infomessageId }, relativeTo: this.route, state: { navigateToSearch: true } });
    }

    private generateForm() {
        this.searchForm = this.fb.group(
            {
                meldungstext: null,
                gueltigVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gueltigBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]]
            },
            {
                validators: [DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201')]
            }
        );
    }

    private storeState() {
        const formSearchControls = this.searchForm.controls;
        const storage: any = {
            meldungstext: formSearchControls.meldungstext.value,
            gueltigVon: formSearchControls.gueltigVon.value,
            gueltigBis: formSearchControls.gueltigBis.value
        };
        this.searchSession.storeFieldsByKey(InformationsmeldungenSuchenComponent.stateKey, storage);
    }

    private restoreState() {
        const state = this.searchSession.restoreStateByKey(InformationsmeldungenSuchenComponent.stateKey);
        if (state) {
            this.restoreStateAndSearch(state);
        }
    }

    private restoreStateAndSearch(state) {
        this.searchForm.patchValue({
            meldungstext: state.fields.meldungstext,
            gueltigVon: state.fields.gueltigVon ? new Date(state.fields.gueltigVon) : '',
            gueltigBis: state.fields.gueltigBis ? new Date(state.fields.gueltigBis) : ''
        });
        this.search();
    }

    private setTableData() {
        this.tableConfig.data = this.responseData && this.responseData.length ? this.responseData.map(row => this.createRow(row)) : [];
    }

    private mapToDTO(): InfoMessageSuchenParamDTO {
        return {
            meldungText: this.searchForm.controls.meldungstext.value,
            gultigVon: this.searchForm.controls.gueltigVon.value,
            gultigBis: this.searchForm.controls.gueltigBis.value
        };
    }

    private generateTable() {
        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
    }

    private createRow(data: InfoMessageDTO) {
        return {
            gueltigAb: data.gueltigAb,
            gueltigBis: data.gueltigBis,
            meldungstext: this.facadeService.dbTranslateService.translate(data, 'message'),
            infomessageId: data.infomessageId
        };
    }

    private configureToolbox() {
        ToolboxService.CHANNEL = this.channel;
        const printColumns = this.tableConfig.columns.filter(item => item.columnDef !== 'actions');
        this.printConfig = { ...this.tableConfig.config, displayedColumns: printColumns.map(c => c.columnDef) };
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getInformationsmeldungenSuchenConfig(), this.channel);
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(
                takeUntil(this.unsubscribe),
                filter(action => action.message.action === ToolboxActionEnum.PRINT)
            )
            .subscribe(() => {
                this.modalService.open(this.modalPrint, {
                    ariaLabelledBy: 'zahlstelle-basic-title',
                    windowClass: 'avam-modal-xl',
                    centered: true,
                    backdrop: 'static'
                });
            });
    }

    private subscribeToLangChange() {
        this.facadeService.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.search();
        });
    }
}
