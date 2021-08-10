import { SweMeldungSuchenComponent } from '@modules/arbeitgeber/schlechtwetter/pages/swe-meldung-suchen/swe-meldung-suchen.component';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Permissions } from '@shared/enums/permissions.enum';
import { MeldungSweDTO } from '@dtos/meldungSweDTO';
import { filter, takeUntil } from 'rxjs/operators';
import { SweMeldungService } from '@modules/arbeitgeber/services/swe-meldung.service';
import { BaseResponseWrapperListMeldungSweDTOWarningMessages } from '@dtos/baseResponseWrapperListMeldungSweDTOWarningMessages';
import { Unsubscribable } from 'oblique-reactive';
import { ActivatedRoute } from '@angular/router';
import { CodeDTO } from '@dtos/codeDTO';
import { forkJoin } from 'rxjs';
import { DomainEnum } from '@shared/enums/domain.enum';
import { UnternehmenStatusCodeEnum } from '@shared/enums/domain-code/unternehmen-status-code.enum';
import { UnternehmenGesamtbetriebCodeEnum } from '@shared/enums/domain-code/unternehmen-gesamtbetrieb-code.enum';
import { UnternehmenDetailsDTO } from '@dtos/unternehmenDetailsDTO';
import { ToolboxService } from '@app/shared';
import { FacadeService } from '@shared/services/facade.service';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';

@Component({
    selector: 'avam-swe-meldungen',
    templateUrl: './swe-meldungen.component.html'
})
export class SweMeldungenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    readonly channel = 'swe-meldungen.channel';
    readonly stateKey = 'swe-meldungen.table';
    permissions: typeof Permissions = Permissions;
    dataSource: MeldungSweDTO[] = [];
    unternehmenId: number;
    gesamtbetriebCode: CodeDTO;
    isMeldungErfassenEnabled = false;
    private static readonly UNTERNEHMEN_ID = 'unternehmenId';
    private static readonly TITLE = 'unternehmen.subnavmenuitem.schlechtwettermeldungenliste';
    private aktivStatusCodeId: any;
    private schweizId: any;
    private unternehmenDetailsDTO: UnternehmenDetailsDTO;

    constructor(
        private sweMeldungService: SweMeldungService,
        private facadeService: FacadeService,
        private route: ActivatedRoute,
        private sessionService: SearchSessionStorageService,
        private infopanelService: AmmInfopanelService
    ) {
        super();
    }

    ngOnInit(): void {
        this.initCodes();
        this.initHeader();
        this.observeUnternehmenId();
        this.observePrintAction();
    }

    ngOnDestroy(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.resetHeader();
        super.ngOnDestroy();
    }

    createMeldung(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.sweMeldungService.create(this.unternehmenDetailsDTO, this.aktivStatusCodeId, this.route);
    }

    newSearch(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.sessionService.clearStorageByKey(SweMeldungSuchenComponent.STATE_KEY);
        this.sweMeldungService.redirectToSuchen();
    }

    edit(dto: MeldungSweDTO): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.sweMeldungService.redirectToBearbeiten(this.route, this.unternehmenId, dto.meldungSweId);
    }

    private initHeader(): void {
        this.infopanelService.updateInformation({ subtitle: SweMeldungenComponent.TITLE });
    }

    private resetHeader(): void {
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.facadeService.toolboxService.resetConfiguration();
    }

    private initCodes(): void {
        forkJoin([
            this.sweMeldungService.getCodeBy(DomainEnum.UNTERNEHMEN_STATUS, UnternehmenStatusCodeEnum.STATUS_AKTIV),
            this.sweMeldungService.getCodeBy(DomainEnum.GESAMTBETRIEB, UnternehmenGesamtbetriebCodeEnum.BETRIEBSABTEILUNG_NR_DEFAULT_STRING),
            this.sweMeldungService.getStaatSwiss()
        ])
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(([aktivCode, gesamtbetriebCode, schweizDTO]) => {
                this.aktivStatusCodeId = aktivCode.codeId;
                this.gesamtbetriebCode = gesamtbetriebCode;
                this.schweizId = schweizDTO.staatId;
            });
    }

    private loadData(): void {
        this.facadeService.spinnerService.activate(this.channel);
        this.sweMeldungService
            .searchByUnternehmen(this.unternehmenId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (res: BaseResponseWrapperListMeldungSweDTOWarningMessages) => {
                    if (res.data) {
                        this.dataSource = res.data;
                        this.sweMeldungService.updateTitle({ tableCount: this.dataSource.length });
                    }
                    this.facadeService.spinnerService.deactivate(this.channel);
                },
                () => {
                    this.sweMeldungService.updateTitle({ tableCount: 0 });
                    this.facadeService.spinnerService.deactivate(this.channel);
                }
            );
        this.sweMeldungService.getUnternehmen(this.unternehmenId).subscribe((unternehmenDetailsDTO: UnternehmenDetailsDTO) => {
            this.unternehmenDetailsDTO = unternehmenDetailsDTO;
            this.isMeldungErfassenEnabled = this.sweMeldungService.checkBsp1(this.unternehmenDetailsDTO, this.aktivStatusCodeId);
        });
    }

    private observeUnternehmenId(): void {
        this.route.parent.params.subscribe(params => {
            this.unternehmenId = params[SweMeldungenComponent.UNTERNEHMEN_ID];
            this.loadData();
            this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getSweMeldungenConfig(), this.channel, ToolboxDataHelper.createByUnternehmenId(this.unternehmenId));
        });
    }

    private observePrintAction(): void {
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(
                filter(action => action.message.action === ToolboxActionEnum.PRINT),
                takeUntil(this.unsubscribe)
            )
            .subscribe(() => this.facadeService.openModalFensterService.openPrintModal(this.modalPrint, this.dataSource));
    }
}
