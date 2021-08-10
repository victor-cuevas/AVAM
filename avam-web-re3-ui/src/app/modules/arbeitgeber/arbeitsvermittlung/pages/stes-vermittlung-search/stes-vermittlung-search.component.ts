import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { Unsubscribable } from 'oblique-reactive';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { StesVMDTO } from '@dtos/stesVMDTO';
import * as moment from 'moment';
import { StesFuerZuweisungSuchenParamDTO } from '@dtos/stesFuerZuweisungSuchenParamDTO';
import { filter, takeUntil } from 'rxjs/operators';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToolboxService } from '@app/shared';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesArbeitsvermittlungPaths } from '@shared/enums/stes-navigation-paths.enum';
import { BaseResponseWrapperListStesVMDTOWarningMessages } from '@dtos/baseResponseWrapperListStesVMDTOWarningMessages';
import { Router } from '@angular/router';
import { VermittlungSearchFormComponent } from '@shared/components/vermittlung-search-form/vermittlung-search-form.component';
import { FacadeService } from '@shared/services/facade.service';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';

@Component({
    selector: 'avam-stes-vermittlung-search',
    templateUrl: './stes-vermittlung-search.component.html',
    styleUrls: ['./stes-vermittlung-search.component.scss']
})
export class StesVermittlungSearchComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('searchForm') searchFormComponent: VermittlungSearchFormComponent;

    readonly channel = 'stesVermittlungSpinner';
    readonly STATE_KEY = 'stes-vermitttlung-key';
    readonly TABLE_STATE_KEY = 'stes-vermittlung-table-state-key';
    searchDone = false;
    benutzerSuchenTokens: any = {};
    benutzerAutosuggestType = BenutzerAutosuggestType.BENUTZER;
    tableConfig;
    responseData: StesVMDTO[];
    private baseTableConfig = {
        columns: [
            {
                columnDef: 'beruf',
                header: 'stes.label.vermittlung.berufTaetigkeit',
                cell: (element: any) => `${element.beruf}`,
                tooltip: (elemnt: any) => `${elemnt.berufTooltip}`
            },
            {
                columnDef: 'qualifikation',
                header: 'stes.label.vermittlung.qualifikation',
                cell: (element: any) => `${element.qualifikation}`
            },
            {
                columnDef: 'erfahrung',
                header: 'stes.label.vermittlung.erfahrungJahre',
                cell: (element: any) => `${element.erfahrung}`
            },
            {
                columnDef: 'gesucht',
                header: 'erweitertesuche.label.gesucht',
                cell: (element: any) => `${element.gesucht}`
            },
            {
                columnDef: 'erwerbssituation',
                header: 'stes.label.erwerbssituationBerechnet',
                cell: (element: any) => `${element.erwerbssituation}`
            },
            {
                columnDef: 'beschaeftingungsgrad',
                header: 'arbeitgeber.label.beschaeftingungsgrad',
                cell: (element: any) => `${element.beschaeftingungsgrad}`
            },
            {
                columnDef: 'alter',
                header: 'stes.label.vermittlung.alter',
                cell: (element: any) => `${element.alter ? moment().diff(element.alter, 'years') : ''}`
            },
            {
                columnDef: 'geschlecht',
                header: 'common.label.geschlecht',
                cell: (element: any) => `${element.geschlecht}`
            },
            {
                columnDef: 'name',
                header: 'common.label.name',
                cell: (element: any) => `${element.name}`
            },
            {
                columnDef: 'vorname',
                header: 'common.label.vorname',
                cell: (element: any) => `${element.vorname}`
            },
            {
                columnDef: 'plz',
                header: 'stes.label.plz',
                cell: (element: any) => `${element.plz}`
            },
            {
                columnDef: 'ort',
                header: 'common.label.ort',
                cell: (element: any) => `${element.ort}`
            },
            { columnDef: 'actions', header: 'common.button.oeffnen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'ort',
            sortOrder: 1,
            displayedColumns: []
        }
    };
    private printColumns: any;
    private printConfig: any;

    constructor(
        private facadeService: FacadeService,
        private router: Router,
        private stesDataRestService: StesDataRestService,
        private restService: UnternehmenRestService,
        private toolboxService: ToolboxService,
        private modalService: NgbModal,
        private searchSession: SearchSessionStorageService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.generateTable();
        this.subscribeToLangChange();
        this.subscribeToolbox();
    }

    public ngOnDestroy(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    selectItem(event: StesVMDTO) {
        this.router.navigate([`stes/details/${event.stesId}/${StesArbeitsvermittlungPaths.ARBEITSVERMITTLUNGEN_ANZEIGEN}`]);
    }

    onSearchEvent(dto: StesFuerZuweisungSuchenParamDTO) {
        if (!!dto) {
            this.facadeService.fehlermeldungenService.closeMessage();
            this.facadeService.spinnerService.activate(this.channel);
            this.searchDone = false;
            this.stesDataRestService
                .searchArbeitgeberStellenvermitllung(dto)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    (response: BaseResponseWrapperListStesVMDTOWarningMessages) => {
                        this.responseData = [];
                        if (response && response.data) {
                            this.responseData = response.data;
                            this.sortNames({ response, order: this.tableConfig.config.sortOrder });
                        }
                        this.setTableData();
                        this.searchDone = true;
                        this.facadeService.spinnerService.deactivate(this.channel);
                    },
                    () => {
                        this.facadeService.spinnerService.deactivate(this.channel);
                        this.searchDone = true;
                    }
                );
        } else {
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    onResetEvent() {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.tableConfig.data = [];
        this.searchDone = false;
        this.searchSession.restoreDefaultValues(this.TABLE_STATE_KEY);
    }

    onSpinnerEvent(isActive: boolean) {
        isActive ? this.facadeService.spinnerService.activate(this.channel) : this.facadeService.spinnerService.deactivate(this.channel);
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
        this.toolboxService.sendConfiguration(ToolboxConfig.getStesVermittlungSearchConfig());
    }

    private subscribeToLangChange(): void {
        this.facadeService.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.setTableData();
        });
    }

    private setTableData() {
        this.tableConfig.data = this.responseData ? this.responseData.map(row => this.createRow(row)) : [];
    }

    private sortNames(event) {
        event.response.data.sort((value1, value2) => {
            return value1.stesName.localeCompare(value2.stesName) * event.order;
        });
    }

    private generateTable() {
        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
    }

    private createRow(data: StesVMDTO) {
        const { qualifikation, erfahrung, erwerbssituation, geschlecht, berufetaetigkeit, gesucht } = this.setDataToTranslate(data);
        return {
            stesId: data.stesId,
            qualifikation,
            erfahrung,
            gesucht,
            erwerbssituation,
            beschaeftingungsgrad: data.vermittlungsgrad,
            alter: data.geburtsdatum,
            geschlecht,
            beruf: berufetaetigkeit,
            berufTooltip: data.skills || '',
            name: data.stesName ? data.stesName : '',
            vorname: data.stesVorname ? data.stesVorname : '',
            plz: data.stesPlz ? data.stesPlz : '',
            ort: data.stesWohnort ? data.stesWohnort : ''
        };
    }

    private setDataToTranslate(data: StesVMDTO) {
        return {
            qualifikation: data.qualifikation ? this.facadeService.dbTranslateService.translate(data.qualifikation, 'text') : '',
            erfahrung: data.erfahrung ? this.facadeService.dbTranslateService.translate(data.erfahrung, 'text') : '',
            erwerbssituation: data.erwerbssituation ? this.facadeService.dbTranslateService.translate(data.erwerbssituation, 'text') : '',
            geschlecht: data.geschlecht ? this.facadeService.dbTranslateService.translate(data.geschlecht, 'text') : '',
            berufetaetigkeit: data.beruf ? this.facadeService.dbTranslateService.translate(data.beruf, 'bezeichnungMa') : '',
            gesucht: data.gesucht ? this.facadeService.translateService.instant('common.label.ja') : this.facadeService.translateService.instant('common.label.nein')
        };
    }
}
