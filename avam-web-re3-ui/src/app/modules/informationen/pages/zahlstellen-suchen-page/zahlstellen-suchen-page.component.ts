import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Permissions } from '@shared/enums/permissions.enum';
import { ZahlstellenSuchenFormComponent } from '@modules/informationen/pages/zahlstellen-suchen-page/zahlstellen-suchen-form/zahlstellen-suchen-form.component';
import { ZahlstelleDTO } from '@dtos/zahlstelleDTO';
import { FacadeService } from '@shared/services/facade.service';
import { ToolboxService } from '@app/shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { Unsubscribable } from 'oblique-reactive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BaseResponseWrapperListZahlstelleDTOWarningMessages } from '@dtos/baseResponseWrapperListZahlstelleDTOWarningMessages';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { ZahlstelleRestService } from '@core/http/zahlstelle-rest.service';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';

@Component({
    selector: 'avam-zahlstellen-suchen-page',
    templateUrl: './zahlstellen-suchen-page.component.html',
    styleUrls: ['./zahlstellen-suchen-page.component.scss']
})
export class ZahlstellenSuchenPageComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('zahlstellenSearchForm') zahlstellenSearchForm: ZahlstellenSuchenFormComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    channel: 'ZahlstellenSuchenPage';
    responseData: ZahlstelleDTO[] = [];
    tableConfig;
    permissions: typeof Permissions = Permissions;
    searchDone = false;
    private baseTableConfig = {
        columns: [
            {
                columnDef: 'alkNr',
                header: 'verzeichnisse.label.zahlstelle.alkNr',
                cell: (element: any) => `${element.alkNr}`
            },
            {
                columnDef: 'zahlstelleNummer',
                header: 'verzeichnisse.label.zahlstelle.zahlstelleNummer',
                cell: (element: any) => `${element.zahlstelleNummer}`
            },

            {
                columnDef: 'kurzname',
                header: 'verzeichnisse.label.zahlstelle.kurzname',
                cell: (element: any) => `${element.kurzname}`
            },
            {
                columnDef: 'adresse',
                header: 'verzeichnisse.label.zahlstelle.adresse',
                cell: (element: any) => `${element.adresse}`
            },
            {
                columnDef: 'plz',
                header: 'verzeichnisse.label.zahlstelle.plz',
                cell: (element: any) => `${element.plz}`
            },
            {
                columnDef: 'ort',
                header: 'verzeichnisse.label.zahlstelle.ort',
                cell: (element: any) => `${element.ort}`
            },
            {
                columnDef: 'kassenstatus',
                header: 'verzeichnisse.label.zahlstelle.kassenstatus',
                cell: (element: any) => `${element.kassenstatus}`
            },
            {
                columnDef: 'status',
                header: 'common.label.status',
                cell: (element: any) => `${element.status}`
            },
            { columnDef: 'actions', header: 'common.button.oeffnen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'alkNr',
            sortOrder: 1,
            displayedColumns: []
        }
    };
    private printConfig: any;

    constructor(
        private facadeService: FacadeService,
        private modalService: NgbModal,
        private router: Router,
        private route: ActivatedRoute,
        private zahlstelleRestService: ZahlstelleRestService,
        private searchSession: SearchSessionStorageService
    ) {
        super();
    }

    ngOnInit() {
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
        this.generateTable();
        this.subscribeToolbox();
        this.subscribeToLangChange();
    }

    ngOnDestroy(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.facadeService.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    reset() {
        this.searchDone = false;
        this.tableConfig.data = [];
        this.zahlstellenSearchForm.searchForm.reset();
        this.zahlstellenSearchForm.reset();
        this.searchSession.restoreDefaultValues('zahlstellen-table-search');
    }

    selectItem(event: any) {
        this.router.navigate([`../bearbeiten`], { queryParams: { zahlstelleId: event.zahlstelleId }, relativeTo: this.route, state: { navigateToSearch: true } });
    }

    restoreCache() {
        this.search();
    }

    search() {
        this.tableConfig.data = [];
        this.responseData = [];
        this.facadeService.fehlermeldungenService.closeMessage();
        this.zahlstellenSearchForm.storeState();
        this.facadeService.spinnerService.activate(this.channel);
        this.zahlstelleRestService
            .searchZahlstelleByParams(this.zahlstellenSearchForm.mapToDTO())
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.facadeService.spinnerService.deactivate(this.channel))
            )
            .subscribe((response: BaseResponseWrapperListZahlstelleDTOWarningMessages) => {
                if (response) {
                    this.searchDone = true;
                    this.responseData = response.data;
                    this.setTableData(response.data);
                }
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

    private generateTable() {
        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
    }

    private setTableData(data) {
        this.responseData = this.sortData(data);
        this.tableConfig.data = this.responseData.map(row => this.createRow(row));
    }

    private createRow(data: ZahlstelleDTO) {
        return {
            alkNr: data.alkNr,
            zahlstelleNummer: data.alkZahlstellenNr,
            kurzname: this.facadeService.dbTranslateService.translate(data, 'kurzname'),
            adresse: data.standStrasse,
            plz: data.standPlzObject ? data.standPlzObject.postleitzahl : '',
            ort: data.standPlzObject ? this.facadeService.dbTranslateService.translate(data.standPlzObject, 'ort') : '',
            kassenstatus:
                data.kassenstatus === '1'
                    ? this.facadeService.translateService.instant('stes.label.zahlstelleOeffentlich')
                    : this.facadeService.translateService.instant('stes.label.zahlstellePrivat'),
            status: this.setStatus(data),
            zahlstelleId: data.zahlstelleId
        };
    }
    private subscribeToLangChange(): void {
        this.facadeService.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.search();
        });
    }

    private setStatus(data: ZahlstelleDTO) {
        let status = this.facadeService.translateService.instant('common.label.inaktiv');
        const today = moment();
        const gueltigBis = moment(data.gueltigBis);
        const gueltigAb = moment(data.gueltigAb);

        if ((!data.gueltigBis || gueltigBis.isSameOrAfter(today)) && (!data.gueltigAb || gueltigAb.isSameOrBefore(today))) {
            status = this.facadeService.translateService.instant('common.label.aktiv');
        }
        return status;
    }

    private sortData(responseData: ZahlstelleDTO[]) {
        return responseData.sort((v1, v2) => (v1.alkZahlstellenNr < v2.alkZahlstellenNr ? -1 : v1.alkZahlstellenNr > v2.alkZahlstellenNr ? 1 : 0));
    }
}
