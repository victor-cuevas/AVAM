import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxService } from '@app/shared';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ActivatedRoute } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { VoranmeldungService } from '@modules/arbeitgeber/services/voranmeldung.service';
import { Unsubscribable } from 'oblique-reactive';
import { Permissions } from '@shared/enums/permissions.enum';
import { VoranmeldungKaeDTO } from '@dtos/voranmeldungKaeDTO';
import { CodeDTO } from '@dtos/codeDTO';
import { UnternehmenDetailsDTO } from '@dtos/unternehmenDetailsDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { UnternehmenStatusCodeEnum } from '@shared/enums/domain-code/unternehmen-status-code.enum';
import { forkJoin } from 'rxjs';
import { UnternehmenGesamtbetriebCodeEnum } from '@shared/enums/domain-code/unternehmen-gesamtbetrieb-code.enum';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { BaseResponseWrapperListVoranmeldungKaeDTOWarningMessages } from '@dtos/baseResponseWrapperListVoranmeldungKaeDTOWarningMessages';
import { FacadeService } from '@shared/services/facade.service';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { VoranmeldungSuchenComponent } from '@app/modules/arbeitgeber/kurzarbeit/pages/voranmeldung-suchen/voranmeldung-suchen.component';

@Component({
    selector: 'avam-voranmeldungen',
    templateUrl: './voranmeldungen.component.html'
})
export class VoranmeldungenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    dataSource: VoranmeldungKaeDTO[] = [];
    gesamtbetriebCode: CodeDTO;
    permissions: typeof Permissions = Permissions;
    readonly channel = 'voranmeldungen-channel';
    readonly stateKey = 'voranmeldungen-table';
    private static readonly TITLE = 'unternehmen.subnavmenuitem.kurzarbeitvoranmeldungliste';
    private static readonly UNTERNEHMEN_ID = 'unternehmenId';
    private unternehmenId: number;
    private unternehmenDetailsDTO: UnternehmenDetailsDTO;
    private aktivStatusCodeId: number;

    constructor(
        private route: ActivatedRoute,
        private infopanelService: AmmInfopanelService,
        private voranmeldungService: VoranmeldungService,
        private sessionService: SearchSessionStorageService,
        private facadeService: FacadeService
    ) {
        super();
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit(): void {
        this.initCodes();
        this.initHeader();
        this.observePrintAction();
    }

    ngAfterViewInit(): void {
        this.observeUnternehmenId();
    }

    ngOnDestroy(): void {
        this.resetHeader();
        super.ngOnDestroy();
    }

    searchAgain(): void {
        this.sessionService.clearStorageByKey(VoranmeldungSuchenComponent.STATE_KEY);
        this.voranmeldungService.redirectToSuchen();
    }

    /**
     * Bedingte Systemverhalten und Plausibilitaeten: BSP2
     */
    create(): void {
        this.voranmeldungService.create(this.unternehmenDetailsDTO, this.aktivStatusCodeId, this.route);
    }

    edit(dto: VoranmeldungKaeDTO): void {
        this.voranmeldungService.redirectToBearbeiten(this.route, this.unternehmenId, dto.voranmeldungKaeId);
    }

    /**
     * Bedingte Systemverhalten und Plausibilitaeten: BSP1
     */
    isCreatePossible(): boolean {
        return this.voranmeldungService.checkBsp1(this.unternehmenDetailsDTO, this.aktivStatusCodeId);
    }

    private initCodes(): void {
        forkJoin([
            this.voranmeldungService.getCodeBy(DomainEnum.UNTERNEHMEN_STATUS, UnternehmenStatusCodeEnum.STATUS_AKTIV),
            this.voranmeldungService.getCodeBy(DomainEnum.GESAMTBETRIEB, UnternehmenGesamtbetriebCodeEnum.BETRIEBSABTEILUNG_NR_DEFAULT_STRING)
        ])
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(([aktivCode, gesamtbetriebCode]) => {
                this.aktivStatusCodeId = aktivCode.codeId;
                this.gesamtbetriebCode = gesamtbetriebCode;
            });
    }

    private observeUnternehmenId(): void {
        this.route.parent.params.subscribe(params => {
            this.unternehmenId = params[VoranmeldungenComponent.UNTERNEHMEN_ID];
            this.loadData();
            this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getVoranmeldungenConfig(), this.channel, ToolboxDataHelper.createByUnternehmenId(this.unternehmenId));
            this.voranmeldungService
                .getUnternehmen(this.unternehmenId)
                .subscribe((unternehmenDetailsDTO: UnternehmenDetailsDTO) => (this.unternehmenDetailsDTO = unternehmenDetailsDTO));
        });
    }

    private initHeader(): void {
        this.infopanelService.updateInformation({ subtitle: VoranmeldungenComponent.TITLE });
    }

    private resetHeader(): void {
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.facadeService.toolboxService.resetConfiguration();
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

    private loadData(): void {
        this.facadeService.spinnerService.activate(this.channel);
        this.voranmeldungService
            .searchByUnternehmenId(this.unternehmenId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (res: BaseResponseWrapperListVoranmeldungKaeDTOWarningMessages) => {
                    if (res.data) {
                        this.dataSource = res.data;
                        this.infopanelService.updateInformation({ tableCount: this.dataSource.length });
                    }
                    this.facadeService.spinnerService.deactivate(this.channel);
                },
                () => {
                    this.infopanelService.updateInformation({ tableCount: 0 });
                    this.facadeService.spinnerService.deactivate(this.channel);
                }
            );
    }
}
