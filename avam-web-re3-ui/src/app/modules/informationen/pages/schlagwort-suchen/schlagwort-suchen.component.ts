import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToolboxService } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { ReloadHelper } from '@app/shared/helpers/reload.helper';
import { SchlagwortDTO } from '@app/shared/models/dtos-generated/schlagwortDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';
import { SchlagwortSuchenFormComponent } from '../../components/schlagwort-suchen-form/schlagwort-suchen-form.component';
import { SchlagwortSuchenTableComponent } from '../../components/schlagwort-suchen-table/schlagwort-suchen-table.component';

@Component({
    selector: 'avam-schlagwort-suchen',
    templateUrl: './schlagwort-suchen.component.html'
})
export class SchlagwortSuchenComponent extends Unsubscribable implements OnInit, OnDestroy {
    static readonly STATE_KEY = 'schlagwort-suchen-cache-state-key';
    channel = 'schlagwort-suchen-channel';

    @ViewChild('searchForm') searchForm: SchlagwortSuchenFormComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    dataSource = [];
    formData: any;
    lastSearchData: SchlagwortDTO[];

    constructor(private searchSession: SearchSessionStorageService, private facade: FacadeService, private infopanelService: AmmInfopanelService, private router: Router) {
        super();
        ToolboxService.CHANNEL = this.channel;
        SpinnerService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.configureToolbox();
        this.subscribeToToolbox();
        this.setupInfobar();
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    reset() {
        this.searchForm.reset();
        this.facade.fehlermeldungenService.closeMessage();
        this.dataSource = [];
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.searchSession.clearStorageByKey(SchlagwortSuchenComponent.STATE_KEY);
        this.searchSession.restoreDefaultValues(SchlagwortSuchenTableComponent.STATE_KEY);
    }

    search() {}

    ngOnDestroy() {
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.updateInformation({ hideInfobar: false, tableCount: null });
        super.ngOnDestroy();
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
            title: this.facade.translateService.instant('verzeichnisse.label.schlagwort.resultlist'),
            hideInfobar: true
        });
    }
}
