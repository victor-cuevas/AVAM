import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AvamStesInfoBarService } from '@shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { ToolboxService } from '@app/shared';
import { Unsubscribable } from 'oblique-reactive';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { GekoStesService } from '@shared/services/geko-stes.service';
import { takeUntil } from 'rxjs/operators';
import { VerlaufGeKoAnbieterDTO } from '@dtos/verlaufGeKoAnbieterDTO';
import { BaseResponseWrapperListVerlaufGeKoAnbieterDTOWarningMessages } from '@dtos/baseResponseWrapperListVerlaufGeKoAnbieterDTOWarningMessages';
import { CallbackDTO } from '@dtos/callbackDTO';
import { GeschaefteTableRow } from '@shared/components/geschaefte-table/geschaefte-table.component';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-stes-geschaefte',
    templateUrl: './stes-geschaefte.component.html',
    providers: [SearchSessionStorageService]
})
export class StesGeschaefteComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    geschaefte: VerlaufGeKoAnbieterDTO[] = [];
    rows: GeschaefteTableRow[];
    readonly spinnerChannel = 'geschaefteSpinner';
    readonly stateKey = 'avam-stes-geschaefte-table';
    readonly stateKeyPrint = 'avam-stes-geschaefte-table.print';
    private stesId: string = null;
    private observeClickActionSub: Subscription;
    private termineToolboxId = 'geschaefte';

    constructor(
        private stesInfobarService: AvamStesInfoBarService,
        private route: ActivatedRoute,
        private gekoStesService: GekoStesService,
        private storageService: SearchSessionStorageService,
        private facade: FacadeService,
        private router: Router
    ) {
        super();
        ToolboxService.CHANNEL = 'stesGeschaefteResult';
    }

    ngOnInit(): void {
        this.configureToolbox();
        this.setSubscriptions();
        this.facade.spinnerService.activate(this.spinnerChannel);
        this.stesInfobarService.sendDataToInfobar({ title: 'geko.subnavmenuitem.geschaefte' });
        this.loadDataFromService();
    }

    ngOnDestroy(): void {
        this.facade.toolboxService.sendConfiguration([]);
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
        super.ngOnDestroy();
    }

    loadDataFromService(): void {
        this.gekoStesService
            .searchGeschaeftStesByStesId(this.stesId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (geschaefte: BaseResponseWrapperListVerlaufGeKoAnbieterDTOWarningMessages) => {
                    this.geschaefte = geschaefte.data;
                    this.loadTableData(geschaefte.data);
                    this.stesInfobarService.sendDataToInfobar({ title: 'geko.subnavmenuitem.geschaefte', tableCount: this.geschaefte.length });
                    this.storageService.storeFieldsByKey(this.stateKey, {
                        tableData: geschaefte.data,
                        stesId: this.stesId,
                        currentLang: this.facade.dbTranslateService.getCurrentLang(),
                        page: 'stes-geschaefte'
                    });
                    this.facade.spinnerService.deactivate(this.spinnerChannel);
                },
                () => {
                    this.facade.spinnerService.deactivate(this.spinnerChannel);
                }
            );
    }

    openCallback(callback: CallbackDTO): void {
        ToolboxService.GESPEICHERTEN_LISTE_URL = this.router.url;
        if (this.gekoStesService.callbackHelper.isCallable(callback)) {
            const navigationPath = this.gekoStesService.createNavigationPath(callback);
            this.gekoStesService.navigate(navigationPath);
        }
    }

    protected loadTableData(data: Array<VerlaufGeKoAnbieterDTO>): void {
        this.rows = data.map((dto: VerlaufGeKoAnbieterDTO) => {
            return {
                id: String(dto.verlaufId),
                exclamationMark: dto.abgelaufen,
                erfasstAm: dto.erfasstAm,
                geschaeftsart: this.facade.dbTranslateService.translate(dto, 'geschaeftsartText'),
                sachstand: this.facade.dbTranslateService.translate(dto, 'sachstandText'),
                termin: dto.geschaeftstermin,
                callback: dto.callback
            } as GeschaefteTableRow;
        });
    }

    private setSubscriptions(): void {
        this.subscribeToLangChange();
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });
        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL, this.observeClickActionSub).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.gekoStesService.openPrintModal(this.modalPrint, this.stateKey, this.stateKeyPrint, this.rows);
            }
        });
    }

    private configureToolbox(): void {
        this.facade.toolboxService.sendConfiguration(ToolboxConfig.getStesGeschaefteConfig(), this.termineToolboxId, ToolboxDataHelper.createForStellensuchende(this.stesId));
    }

    private subscribeToLangChange(): void {
        this.facade.dbTranslateService
            .getEventEmitter()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.facade.spinnerService.activate(this.spinnerChannel);
                this.loadTableData(this.geschaefte);
                this.facade.spinnerService.deactivate(this.spinnerChannel);
            });
    }
}
