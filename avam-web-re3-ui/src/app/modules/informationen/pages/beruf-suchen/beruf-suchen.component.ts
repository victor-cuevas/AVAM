import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ToolboxService } from '@app/shared';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { FacadeService } from '@shared/services/facade.service';
import { Unsubscribable } from 'oblique-reactive';
import { Permissions } from '@shared/enums/permissions.enum';
import { BerufSuchenFormComponent } from '@modules/informationen/pages/beruf-suchen/beruf-suchen-form/beruf-suchen-form.component';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { Router } from '@angular/router';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { BaseResponseWrapperListBerufMeldepflichtViewDTOWarningMessages } from '@dtos/baseResponseWrapperListBerufMeldepflichtViewDTOWarningMessages';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BerufSuchenTableComponent } from '@modules/informationen/components/beruf-suchen-table/beruf-suchen-table.component';
import { AehnlicheBerufeSuchenModalComponent } from '@modules/informationen/components/aehnliche-berufe-suchen-modal/aehnliche-berufe-suchen-modal.component';
import { BaseResponseWrapperOsteBerufAnforderungenInfoDTOWarningMessages } from '@dtos/baseResponseWrapperOsteBerufAnforderungenInfoDTOWarningMessages';
import { FormArray } from '@angular/forms';

@Component({
    selector: 'avam-beruf-suchen',
    templateUrl: './beruf-suchen.component.html',
    styleUrls: ['./beruf-suchen.component.scss']
})
export class BerufSuchenComponent extends Unsubscribable implements OnInit, OnDestroy {
    static readonly STATE_KEY = 'beruf-search';
    static readonly TABLE_STATE_KEY = 'berufe-table-search';
    @ViewChild('berufSuchenFormComponent') berufSuchenFormComponent: BerufSuchenFormComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('berufSuchenTableComponent') berufSuchenTableComponent: BerufSuchenTableComponent;
    @ViewChild('aehnlicheBerufeSuchenModalComponent') aehnlicheBerufeSuchenModalComponent: AehnlicheBerufeSuchenModalComponent;
    public channel = 'beruf-suchen-table';
    searchDone: boolean;
    responseData: any[] = [];
    responseDataAehlichBeruf: any[] = [];
    permissions: typeof Permissions = Permissions;

    constructor(
        private osteRestService: OsteDataRestService,
        private router: Router,
        private facadeService: FacadeService,
        private searchSession: SearchSessionStorageService,
        private modalService: NgbModal
    ) {
        super();
    }

    public ngOnInit() {
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
        this.configureToolbox();
        this.setSubscription();
    }

    public ngOnDestroy() {
        this.facadeService.toolboxService.sendConfiguration([]);
        this.facadeService.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    reset() {
        this.searchDone = false;
        this.berufSuchenTableComponent.setTableData([]);
        this.searchSession.clearStorageByKey(BerufSuchenComponent.STATE_KEY);
        this.berufSuchenFormComponent.searchForm.reset();
        this.berufSuchenFormComponent.getInitialData();
    }

    search() {
        this.facadeService.fehlermeldungenService.closeMessage();
        if (this.berufSuchenFormComponent.searchForm.valid) {
            this.berufSuchenFormComponent.storeState();
            this.facadeService.spinnerService.activate(this.channel);
            const searchParams = this.berufSuchenFormComponent.mapToDTO();
            this.osteRestService
                .getBeruf(searchParams)
                .pipe(
                    takeUntil(this.unsubscribe),
                    finalize(() => this.facadeService.spinnerService.deactivate(this.channel))
                )
                .subscribe((response: BaseResponseWrapperListBerufMeldepflichtViewDTOWarningMessages) => {
                    if (response.data) {
                        this.searchDone = true;
                        this.responseData = response.data;
                        this.berufSuchenTableComponent.setTableData(this.responseData);
                        this.berufSuchenTableComponent.selectedRows = [];
                    } else {
                        this.responseData.length = 0;
                        this.berufSuchenTableComponent.setTableData([]);
                    }
                });
        }
    }

    restoreChache() {
        this.search();
    }

    public aehlichenBerufSuchen() {
        this.facadeService.fehlermeldungenService.closeMessage();
        const selectedItems = this.berufSuchenTableComponent.selectedRows.length;
        if (selectedItems === 0) {
            this.facadeService.fehlermeldungenService.showMessage('verzeichnisse.message.berufauswaehlen', 'danger');
        } else {
            const selectedChiscoBerufId = this.berufSuchenTableComponent.selectedRows.map(chIscoId => chIscoId.chIscoBerufId);
            this.osteRestService
                .getAehnlichBerufe('checkList', selectedChiscoBerufId.toString())
                .pipe(
                    takeUntil(this.unsubscribe),
                    finalize(() => {
                        this.facadeService.spinnerService.deactivate(this.channel);
                        this.facadeService.fehlermeldungenService.closeMessage();
                    })
                )
                .subscribe((response: BaseResponseWrapperOsteBerufAnforderungenInfoDTOWarningMessages) => {
                    this.responseDataAehlichBeruf = response.data.berufMeldepflichtViewDTOList;
                    this.modalService.open(this.aehnlicheBerufeSuchenModalComponent, {
                        ariaLabelledBy: 'modal-basic-title',
                        windowClass: 'avam-modal-xl',
                        backdrop: 'static',
                        centered: true
                    });
                });
        }
    }

    private configureToolbox() {
        ToolboxService.CHANNEL = this.channel;
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getBerufSuchenConfig(), this.channel);
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

    private setSubscription() {
        this.facadeService.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.berufSuchenTableComponent.setTableData(this.responseData);
        });
    }
}
