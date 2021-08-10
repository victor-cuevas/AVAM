import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Permissions } from '@shared/enums/permissions.enum';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { FacadeService } from '@shared/services/facade.service';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { VollzugsregionSuchenFormComponent } from '@modules/informationen/pages/vollzugsregion-suchen/vollzugsregion-suchen-form/vollzugsregion-suchen-form.component';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { BaseResponseWrapperListVollzugsregionDTOWarningMessages } from '@dtos/baseResponseWrapperListVollzugsregionDTOWarningMessages';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxService } from '@app/shared';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { VollzugsregionSuchenTableComponent } from '@modules/informationen/components/vollzugsregion-suchen-table/vollzugsregion-suchen-table.component';
import { ReloadHelper } from '@shared/helpers/reload.helper';

@Component({
    selector: 'avam-vollzugsregion-suchen',
    templateUrl: './vollzugsregion-suchen.component.html',
    styleUrls: ['./vollzugsregion-suchen.component.scss']
})
export class VollzugsregionSuchenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('vollzugsregionSuchenForm') vollzugsregionSuchenForm: VollzugsregionSuchenFormComponent;
    @ViewChild('vollzugsregionSuchenTableComponent') vollzugsregionSuchenTableComponent: VollzugsregionSuchenTableComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    static readonly stateKey = 'vollzugsregion-search';
    channel: 'VollzugsregionSuchenPage';
    responseData: any[] = [];
    permissions: typeof Permissions = Permissions;
    searchDone = false;

    constructor(
        private facadeService: FacadeService,
        private searchSession: SearchSessionStorageService,
        private router: Router,
        private route: ActivatedRoute,
        private stesDataRestService: StesDataRestService,
        private modalService: NgbModal
    ) {
        super();
    }

    ngOnInit() {
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
        this.createSubscriptions();
    }

    ngOnDestroy(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.facadeService.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    search() {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.vollzugsregionSuchenForm.storeState();
        this.facadeService.spinnerService.activate(this.channel);
        this.stesDataRestService
            .getVollzugsregion(this.vollzugsregionSuchenForm.mapToDTO())
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.facadeService.spinnerService.deactivate(this.channel))
            )
            .subscribe((response: BaseResponseWrapperListVollzugsregionDTOWarningMessages) => {
                this.searchDone = true;
                this.responseData = response.data;
                this.vollzugsregionSuchenTableComponent.setTableData(response.data);
            });
    }
    restoreCache() {
        this.search();
    }

    reset() {
        this.searchDone = false;
        this.responseData = [];
        this.vollzugsregionSuchenTableComponent.setTableData([]);
        this.searchSession.clearStorageByKey(VollzugsregionSuchenFormComponent.stateKey);
        this.vollzugsregionSuchenForm.searchForm.reset();
        this.vollzugsregionSuchenForm.getInitialData();
    }

    private createSubscriptions() {
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getVollzugsregionSuchenConfig(), this.channel);

        this.facadeService.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.search();
        });

        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.modalService.open(this.modalPrint, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' }));
    }
}
