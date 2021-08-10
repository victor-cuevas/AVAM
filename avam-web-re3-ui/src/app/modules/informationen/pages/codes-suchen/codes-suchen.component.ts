import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CodeDataRestService } from '@app/core/http/code-data-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { ToolboxService } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { ReloadHelper } from '@app/shared/helpers/reload.helper';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import * as moment from 'moment';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';
import { CodesSuchenFormComponent } from '../../components/code-domaene/codes-suchen-form/codes-suchen-form.component';
import { CodesSuchenTableComponent } from '../../components/code-domaene/codes-suchen-table/codes-suchen-table.component';

@Component({
    selector: 'avam-codes-suchen',
    templateUrl: './codes-suchen.component.html'
})
export class CodesSuchenComponent extends Unsubscribable implements OnInit, OnDestroy {
    static readonly STATE_KEY = 'code-suchen-cache-state-key';
    channel = 'code-suchen-channel';

    @ViewChild('searchForm') searchForm: CodesSuchenFormComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    dataSource = [];
    formData: any;
    lastSearchData: CodeDTO[];

    constructor(
        private searchSession: SearchSessionStorageService,
        private facade: FacadeService,
        private infopanelService: AmmInfopanelService,
        private router: Router,
        private codeDataRest: CodeDataRestService,
        private stesDataRestService: StesDataRestService
    ) {
        super();
        ToolboxService.CHANNEL = this.channel;
        SpinnerService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.getData();
        this.configureToolbox();
        this.subscribeToToolbox();
        this.setupInfobar();
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.dataSource = this.lastSearchData.map(el => this.createTeilzahlungswertRow(el));
        });
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    reset() {
        this.searchForm.reset();
        this.facade.fehlermeldungenService.closeMessage();
        this.dataSource = [];
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.searchSession.clearStorageByKey(CodesSuchenComponent.STATE_KEY);
        this.searchSession.restoreDefaultValues(CodesSuchenTableComponent.STATE_KEY);
    }

    search() {
        this.facade.fehlermeldungenService.closeMessage();

        if (!this.searchForm.formGroup.valid) {
            this.searchForm.ngForm.onSubmit(undefined);
            return;
        }
        this.searchSession.storeFieldsByKey(CodesSuchenComponent.STATE_KEY, this.searchForm.mapStateData());
        this.searchSession.resetSelectedTableRow(CodesSuchenTableComponent.STATE_KEY);
        this.searchRestCall();
    }

    searchRestCall() {
        this.facade.spinnerService.activate(this.channel);

        this.codeDataRest.searchCode(this.searchForm.mapToDTO()).subscribe(
            response => {
                if (response.data) {
                    this.lastSearchData = response.data;
                    this.dataSource = this.lastSearchData.map(el => this.createTeilzahlungswertRow(el));
                    this.searchForm.formGroup.markAsDirty();
                }

                this.infopanelService.updateInformation({ tableCount: this.dataSource ? this.dataSource.length : 0 });

                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    onItemSelected(item) {
        this.router.navigate([`informationen/verzeichnisse/code/${item.codeId}/bearbeiten`]);
    }

    ngOnDestroy() {
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.updateInformation({ hideInfobar: false, tableCount: null });
        super.ngOnDestroy();
    }

    private createTeilzahlungswertRow(data: CodeDTO) {
        return {
            codeId: data.codeId,
            codeDomaene: data.domain,
            bezeichnung: this.facade.dbTranslateService.translate(data, 'kurzText'),
            code: data.code,
            order: data.order,
            status: this.setStatus(data)
        };
    }

    private setStatus(data: CodeDTO): string {
        let status = this.facade.translateService.instant('common.label.inaktiv');
        const today = moment();
        const gueltigBis = moment(data.gueltigBis);
        const gueltigAb = moment(data.gueltigAb);

        if ((!data.gueltigBis || gueltigBis.isSameOrAfter(today)) && (!data.gueltigAb || gueltigAb.isSameOrBefore(today))) {
            status = this.facade.translateService.instant('common.label.aktiv');
        }

        return status;
    }

    private getData() {
        this.facade.spinnerService.activate(this.channel);

        this.stesDataRestService.getFixedCode(DomainEnum.STATUS_OPTIONS).subscribe(
            statusOptions => {
                const state = this.searchSession.restoreStateByKey(CodesSuchenComponent.STATE_KEY);
                if (state) {
                    this.formData = { statusOptions, state: state.fields };
                } else {
                    this.formData = { statusOptions };
                }

                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel);
    }

    private subscribeToToolbox() {
        this.facade.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.dataSource);
                }
            });
    }

    private setupInfobar() {
        this.infopanelService.dispatchInformation({
            title: this.facade.translateService.instant('common.label.codes'),
            hideInfobar: true
        });
    }
}
