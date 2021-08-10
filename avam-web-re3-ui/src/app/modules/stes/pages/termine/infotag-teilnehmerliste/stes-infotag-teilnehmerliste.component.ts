import { Component, Input, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavigationService } from '@shared/services/navigation-service';
import { ActivatedRoute, Router } from '@angular/router';
import { StesTerminePaths } from '@shared/enums/stes-navigation-paths.enum';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum, ToolboxService } from '@shared/services/toolbox.service';
import { MessageBus } from '@shared/services/message-bus';
import { forkJoin, Subscription } from 'rxjs';
import { InfotagService } from '@shared/services/infotag.service';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { DbTranslateService } from '@shared/services/db-translate.service';
// prettier-ignore
import {BaseResponseWrapperTeilnehmerBuchungSessionWithTitelDTOWarningMessages} from
        '@shared/models/dtos-generated/baseResponseWrapperTeilnehmerBuchungSessionWithTitelDTOWarningMessages';
import { TeilnehmerBuchungSessionWithTitelDTO } from '@shared/models/dtos-generated/teilnehmerBuchungSessionWithTitelDTO';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { StesTermineLabels } from '@shared/enums/stes-routing-labels.enum';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { TeilnehmerBuchungSessionDTO } from '@app/shared/models/dtos-generated/teilnehmerBuchungSessionDTO';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'app-stes-infotag-teilnehmerliste',
    templateUrl: './stes-infotag-teilnehmerliste.component.html'
})
export class StesInfotagTeilnehmerlisteComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    praesenzStatusOptions: any = [];
    buchungStatusOptions: any = [];

    @Input() stesId: string;
    @Input() dfeId: string;
    @Input() geschaeftsfallID: number;
    @Input() isBuchung = true;
    @Input() updateInfobar = true;

    tableData = [];
    resultData: TeilnehmerBuchungSessionWithTitelDTO;
    channel = 'stesInfotagTeilnehmerliste';

    alertList: {
        isShown: boolean;
        messageText: string;
        messageType: string;
    }[] = [];

    private BUCHUNGSTATUS_GEBUCHT = 1;

    private langChangeSubscription: Subscription;
    private observeClickActionSub: Subscription;
    private toolBoxId = 'infotag-teilnehmerliste';

    constructor(
        private route: ActivatedRoute,
        private infotagService: InfotagService,
        private facade: FacadeService,
        private stesDataRestService: StesDataRestService,
        private router: Router,
        private stesInfobarService: AvamStesInfoBarService,
        private modalService: NgbModal
    ) {
        super();
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit(): void {
        if (this.route.parent) {
            this.subscribeParams();
            this.configureToolbox();
            this.subscribeToLangChange();
            this.facade.navigationService.showNavigationTreeRoute(StesTerminePaths.INFOTAG, {
                dfeId: this.dfeId,
                gfId: this.geschaeftsfallID
            });
            this.facade.navigationService.showNavigationTreeRoute(StesTerminePaths.INFOTAGBESCHREIBUNGDURCHFUEHRUNGSORT, {
                dfeId: this.dfeId,
                gfId: this.geschaeftsfallID
            });
            this.facade.navigationService.showNavigationTreeRoute(StesTerminePaths.INFOTAGGRUNDDATENBUCHUNG, {
                dfeId: this.dfeId,
                gfId: this.geschaeftsfallID
            });
            this.facade.navigationService.showNavigationTreeRoute(StesTerminePaths.INFOTAGTEILNEHMERLISTE, {
                dfeId: this.dfeId,
                gfId: this.geschaeftsfallID
            });
        }
        this.loadCodes();
        this.facade.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(message => {
                if (message.type === 'close-nav-item' && message.data) {
                    this.closeComponent(message);
                }
            });
    }

    closeComponent(message) {
        if (
            message.data.label === this.facade.translateService.instant(StesTermineLabels.INFOTAG) ||
            message.data.label === this.facade.translateService.instant(StesTermineLabels.INFOTAGGRUNDDATENBUCHUNG) ||
            message.data.label === this.facade.translateService.instant(StesTermineLabels.INFOTAGBESCHREIBUNGDURCHFUEHRUNGSORT) ||
            message.data.label === this.facade.translateService.instant(StesTermineLabels.INFOTAGTEILNEHMERLISTE)
        ) {
            this.cancel();
            this.facade.navigationService.hideNavigationTreeRoute(StesTerminePaths.INFOTAG);
        }
    }

    cancel() {
        if (this.router.url.includes(StesTerminePaths.INFOTAG)) {
            this.navigateToTermine();
        }
    }

    ngOnDestroy(): void {
        if (this.updateInfobar) {
            this.stesInfobarService.sendLastUpdate({}, true);
        }
        if (this.route.parent) {
            this.facade.toolboxService.resetConfiguration();
        }
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
        super.ngOnDestroy();
    }

    private navigateToTermine(): void {
        this.router.navigate([`stes/details/${this.stesId}/termine`]);
    }

    private loadCodes() {
        forkJoin(
            this.stesDataRestService.getCode(DomainEnum.TLN_PRAESENZ_STATUS), //NOSONAR
            this.stesDataRestService.getCode(DomainEnum.AMM_INFOTAG_BUCHUNG_STATUS)
        )
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(([praesenzStatusList, infotagBuchungStatusList]) => {
                this.praesenzStatusOptions = praesenzStatusList;
                this.buchungStatusOptions = infotagBuchungStatusList;
                this.loadData();
            });
    }

    private subscribeParams(): void {
        this.route.parent.data.subscribe(() => {
            this.route.parent.params.subscribe(params => {
                this.stesId = params['stesId'];
            });
            this.route.queryParamMap.subscribe(params => {
                this.dfeId = params.get('dfeId');
            });
            this.route.queryParamMap.subscribe(params => {
                this.geschaeftsfallID = Number(params.get('gfId'));
            });
        });
    }

    private subscribeToLangChange(): void {
        if (this.updateInfobar) {
            this.langChangeSubscription = this.facade.translateService.onLangChange.subscribe(() => {
                this.stesInfobarService.sendDataToInfobar({
                    title: this.getTitle(this.resultData),
                    tableCount: this.tableData.length
                });
            });
        }
    }

    private loadData() {
        this.facade.spinnerService.activate(this.channel);
        this.infotagService.loadTeilnehmerListe(
            this.isBuchung,
            this.stesId,
            this.isBuchung ? this.geschaeftsfallID.toString() : this.dfeId,
            this.facade.translateService.currentLang
        );
        this.infotagService.teilnehmerliste
            .asObservable()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperTeilnehmerBuchungSessionWithTitelDTOWarningMessages) => {
                    if (response.data) {
                        this.resultData = response.data;
                        this.tableData = response.data.teilnehmerBuchungSessionDTOList.map(teilnehmer => this.createTeilnehmerRow(teilnehmer));
                        if (this.updateInfobar) {
                            this.stesInfobarService.sendDataToInfobar({
                                title: this.getTitle(this.resultData),
                                tableCount: this.tableData.length
                            });
                        }
                    }
                    this.facade.spinnerService.deactivate(this.channel);
                },
                () => {
                    this.facade.spinnerService.deactivate(this.channel);
                }
            );
    }

    private createTeilnehmerRow(teilnehmer: TeilnehmerBuchungSessionDTO) {
        const buchungStatus = this.buchungStatusOptions.filter(bs => Number(bs.code) === this.BUCHUNGSTATUS_GEBUCHT)[0];
        return {
            kanton: teilnehmer.kanton,
            teilnehmer: `${teilnehmer.stesName}, ${teilnehmer.stesVorname}`,
            personenNr: teilnehmer.stesPersonenNr,
            bearbeitung: `${teilnehmer.benutzerLogin}, ${teilnehmer.benutzerNachname}, ${teilnehmer.benutzerVorname}`,
            buchungsdatum: new Date(teilnehmer.erstellDatum),
            personalberater: `${teilnehmer.stesPbLogin}, ${teilnehmer.stesPbNachname}, ${teilnehmer.stesPbVorname}`,
            platz: teilnehmer.buchungStatusId === buchungStatus.codeId ? teilnehmer.buchungPlatz : '',
            statusCode: teilnehmer.buchungStatusId === buchungStatus.codeId && teilnehmer.praesenzStatus ? teilnehmer.praesenzStatus : null
        };
    }

    private configureToolbox(): void {
        this.facade.messageBus.buildAndSend('toolbox.id', this.toolBoxId);
        this.facade.toolboxService.sendConfiguration(
            ToolboxConfig.getInfotagTeilnehmerlisteConfig(),
            this.toolBoxId,
            ToolboxDataHelper.createForInfotag(this.dfeId, this.geschaeftsfallID)
        );
        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    private openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    private getTitle(data: TeilnehmerBuchungSessionWithTitelDTO) {
        const screenTitle = this.facade.dbTranslateService.instant('stes.subnavmenuitem.stesTermine.teilnehmerliste');
        const infoTag = this.facade.dbTranslateService.instant('amm.infotag.subnavmenuitem.infotag');
        const title = this.facade.dbTranslateService.translateWithOrder(data, 'titel');
        return `${infoTag} ${title} - ${screenTitle}`;
    }
}
