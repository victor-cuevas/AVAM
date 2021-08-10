import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { MessageBus } from '@app/shared/services/message-bus';
import { NavigationService } from '@app/shared/services/navigation-service';
import { ActivatedRoute, Router } from '@angular/router';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { Subscription, forkJoin } from 'rxjs';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { AMMLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { ToolboxService } from '@app/shared';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { SpinnerService } from 'oblique-reactive';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import * as moment from 'moment';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { AmmDmsTypeEnum } from '@app/shared/enums/amm-dms-type.enum';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';
import { FacadeService } from '@shared/services/facade.service';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';

@Component({
    selector: 'avam-teilnehmerplaetze',
    templateUrl: './teilnehmerplaetze.component.html'
})
export class TeilnehmerplaetzeComponent extends AmmCloseableAbstract implements OnInit, OnDestroy {
    @ViewChild('infobartemp') infobartemp: TemplateRef<any>;

    ammMassnahmenType: string;
    geschaeftsfallId: number;
    entscheidId: number;
    basisNr: number;

    allowedTypes: string[] = [AmmMassnahmenCode.AP, AmmMassnahmenCode.BP, AmmMassnahmenCode.UEF, AmmMassnahmenCode.PVB, AmmMassnahmenCode.SEMO];
    channel = 'teilnehmerplaetze-channel';

    observeClickActionSub: Subscription;
    langChangeSubscription: Subscription;
    buchungData: AmmBuchungParamDTO;
    dataSource: any;
    beginData: any;

    shouldShowNextButton: boolean;
    shouldShowPreviousButton: boolean;
    beginDateKurs: any;
    endDateKurs: any;

    constructor(
        private route: ActivatedRoute,
        private navigationService: NavigationService,
        private messageBus: MessageBus,
        protected router: Router,
        private dbTranslateService: DbTranslateService,
        private toolboxService: ToolboxService,
        private stesInfobarService: AvamStesInfoBarService,
        private translateService: TranslateService,
        private spinnerService: SpinnerService,
        private ammDataService: AmmRestService,
        protected facade: FacadeService,
        protected interactionService: StesComponentInteractionService,
        private ammHelper: AmmHelper
    ) {
        super(facade, router, interactionService);
        ToolboxService.CHANNEL = this.channel;
        SpinnerService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];

            this.route.queryParamMap.subscribe(param => {
                this.geschaeftsfallId = +param.get('gfId');
                this.entscheidId = param.get('entscheidId') ? +param.get('entscheidId') : null;
            });

            this.route.paramMap.subscribe(param => {
                this.ammMassnahmenType = param.get('type');
                this.ammEntscheidTypeCode = AmmMassnahmenCode[Object.keys(AmmMassnahmenCode).find(key => AmmMassnahmenCode[key] === this.ammMassnahmenType)];

                if (!this.allowedTypes.includes(this.ammMassnahmenType)) {
                    this.router.navigate(['/not-found']);
                }
            });
        });

        this.setSideNavigation();

        this.getData();

        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
            if (this.buchungData) {
                this.stesInfobarService.sendDataToInfobar({ title: this.configureInfobarTitle(this.dbTranslateService.translate(this.buchungData.titel, 'name')) });
                this.getData();
            } else {
                this.stesInfobarService.sendDataToInfobar({ title: this.configureInfobarTitle() });
            }
        });

        super.ngOnInit();
    }

    canDeactivate() {
        return false;
    }

    isOurLabel(message): boolean {
        return (
            message.data.label === this.dbTranslateService.instant(AMMLabels.KOLLEKTIV_AP) ||
            message.data.label === this.dbTranslateService.instant(AMMLabels.KOLLEKTIV_BP) ||
            message.data.label === this.dbTranslateService.instant(AMMLabels.UEF) ||
            message.data.label === this.dbTranslateService.instant(AMMLabels.PVB) ||
            message.data.label === this.dbTranslateService.instant(AMMLabels.SEMO)
        );
    }

    isOurUrl(): boolean {
        return this.router.url.includes(AMMPaths.TEILNEHMERPLAETZE.replace(':type', this.ammMassnahmenType));
    }

    getNextMonth() {
        this.spinnerService.activate(this.channel);
        let year = moment(this.beginData).year();

        if (Number(moment(this.beginData).month()) === 11) {
            year = moment(this.beginData)
                .add(1, 'year')
                .year();
        }

        this.ammDataService
            .getAmmTeilnehmerplaetzeNextMonth(
                this.geschaeftsfallId,
                this.ammMassnahmenType,
                moment(this.beginData)
                    .add(1, 'months')
                    .month(),
                year,
                this.stesId
            )
            .subscribe(
                teilnehmerplaetze => {
                    if (teilnehmerplaetze.data) {
                        const data = this.mapTeilnehmerPlaetzeData(teilnehmerplaetze);
                        this.beginData = data.data.zeitraumBeginn;
                        this.dataSource = data;
                        this.shouldShowButtons();
                    }

                    this.spinnerService.deactivate(this.channel);
                },
                () => {
                    this.spinnerService.deactivate(this.channel);
                }
            );
    }

    getPreviousMonth() {
        this.spinnerService.activate(this.channel);
        let year = moment(this.beginData).year();

        if (Number(moment(this.beginData).month()) === 0) {
            year = moment(this.beginData)
                .subtract(1, 'year')
                .year();
        }

        this.ammDataService
            .getAmmTeilnehmerplaetzePreviousMonth(
                this.geschaeftsfallId,
                this.ammMassnahmenType,
                moment(this.beginData)
                    .subtract(1, 'months')
                    .month(),
                year,
                this.stesId
            )
            .subscribe(
                teilnehmerPlaetze => {
                    if (teilnehmerPlaetze.data) {
                        const data = this.mapTeilnehmerPlaetzeData(teilnehmerPlaetze);
                        this.dataSource = data;
                        this.beginData = data.data.zeitraumBeginn;
                        this.shouldShowButtons();
                    }

                    this.spinnerService.deactivate(this.channel);
                },
                () => {
                    this.spinnerService.deactivate(this.channel);
                }
            );
    }

    getData() {
        this.spinnerService.activate(this.channel);

        forkJoin(
            this.ammDataService.getAmmBuchungParam(this.geschaeftsfallId, this.ammMassnahmenType, this.stesId),
            this.ammDataService.getAmmTeilnehmerplaetze(this.geschaeftsfallId, this.ammMassnahmenType, this.stesId)
        ).subscribe(
            ([buchungResponse, teilnehmerPlaetze]) => {
                if (teilnehmerPlaetze.data) {
                    const data = this.mapTeilnehmerPlaetzeData(teilnehmerPlaetze);
                    this.dataSource = data;
                    this.beginData = data.data.zeitraumBeginn;
                }

                if (buchungResponse.data) {
                    this.buchungData = buchungResponse.data;
                    this.beginDateKurs = moment(this.buchungData.durchfuehrungVon);
                    this.endDateKurs = moment(this.buchungData.durchfuehrungBis);
                    this.shouldShowButtons();

                    this.basisNr = this.ammHelper.getAmmBuchung(this.buchungData).ammGeschaeftsfallObject.basisNr;

                    this.stesInfobarService.sendDataToInfobar({ title: this.configureInfobarTitle(this.dbTranslateService.translate(this.buchungData.titel, 'name')) });
                    this.stesInfobarService.addItemToInfoPanel(this.infobartemp);
                }

                this.configureToolbox();
                this.spinnerService.deactivate(this.channel);
            },
            () => {
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData());

        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });
    }

    getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { STES_ID: +this.stesId, GF_ID: +this.geschaeftsfallId },
            uiSuffix: AmmDmsTypeEnum.DMS_TYP_AMM
        };
    }

    mapTeilnehmerPlaetzeData(teilnehmerplaetze) {
        this.placeCurrentStesFirst(teilnehmerplaetze);

        const daysOfMonth = teilnehmerplaetze.data.zeitraumInTagen;
        const buchungen = teilnehmerplaetze.data.plaetze[0].buchungen;
        const bookingCapacity = teilnehmerplaetze.data.plaetze[0].buchungsKapazitaet;
        const overbookingMax = teilnehmerplaetze.data.plaetze[0].ueberbuchungMax;

        const bookingsAM = Array(daysOfMonth).fill(0);
        const bookingsPM = Array(daysOfMonth).fill(0);

        buchungen.forEach(buchung => {
            const platzbelegung = buchung.platzbelegung;
            const bookingAM = Array(daysOfMonth).fill(0);
            const bookingPM = Array(daysOfMonth).fill(0);

            for (let index = 0; index < platzbelegung.length; index++) {
                const dayOfMonth = Math.floor(index / 2);
                if (platzbelegung[index] && platzbelegung[index].status === 3) {
                    if (index % 2 === 0) {
                        bookingsAM[dayOfMonth]++;
                        bookingAM[dayOfMonth]++;
                    } else {
                        bookingsPM[dayOfMonth]++;
                        bookingPM[dayOfMonth]++;
                    }
                }
            }

            buchung['status'] = { bookingAM, bookingPM };
        });

        const statusOfBookingsAM = this.mapParentStatus(bookingsAM, bookingCapacity, overbookingMax);
        const statusOfBookingsPM = this.mapParentStatus(bookingsPM, bookingCapacity, overbookingMax);

        teilnehmerplaetze.data.plaetze[0]['parentStatus'] = { statusOfBookingsAM, statusOfBookingsPM };

        return teilnehmerplaetze;
    }

    ngOnDestroy(): void {
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }

        this.toolboxService.sendConfiguration([]);
        this.stesInfobarService.removeItemFromInfoPanel(this.infobartemp);
        super.ngOnDestroy();
    }

    private placeCurrentStesFirst(teilnehmerplaetze) {
        const currentStesPersonenNr = teilnehmerplaetze.data.tlnPersonenNrAktuell;
        const buchungen = teilnehmerplaetze.data.plaetze[0].buchungen;

        if (currentStesPersonenNr && buchungen.length > 0 && currentStesPersonenNr !== buchungen[0].tlnPersonenNr) {
            buchungen.sort((a, b) => (a.tlnPersonenNr === currentStesPersonenNr ? -1 : b.tlnPersonenNr === currentStesPersonenNr ? 1 : 0));
        }
    }

    private mapParentStatus(bookings, bookingCapacity, overbookingMax) {
        return bookings.map(bookingCnt => {
            let status;
            if (bookingCnt === 0) {
                status = 0;
            } else if (bookingCnt < bookingCapacity) {
                status = 1;
            } else if (bookingCnt < bookingCapacity + overbookingMax) {
                status = 2;
            } else {
                status = 3;
            }

            return status;
        });
    }

    private shouldShowButtons() {
        const currDate = moment(this.beginData);

        if (currDate.isBefore(this.endDateKurs, 'month')) {
            this.shouldShowNextButton = true;
        } else {
            this.shouldShowNextButton = false;
        }

        if (currDate.isAfter(this.beginDateKurs, 'month')) {
            this.shouldShowPreviousButton = true;
        } else {
            this.shouldShowPreviousButton = false;
        }
    }

    private setSideNavigation() {
        this.navigationService.showNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });

        if (
            this.ammMassnahmenType === AmmMassnahmenCode.PVB ||
            this.ammMassnahmenType === AmmMassnahmenCode.SEMO ||
            this.ammMassnahmenType === AmmMassnahmenCode.BP ||
            this.ammMassnahmenType === AmmMassnahmenCode.AP ||
            this.ammMassnahmenType === AmmMassnahmenCode.UEF
        ) {
            this.navigationService.showNavigationTreeRoute(AMMPaths.PSAK_BUCHUNG.replace(':type', this.ammMassnahmenType), {
                gfId: this.geschaeftsfallId,
                entscheidId: this.entscheidId
            });
        } else {
            this.navigationService.showNavigationTreeRoute(AMMPaths.KOLLEKTIV_BUCHUNG.replace(':type', this.ammMassnahmenType), {
                gfId: this.geschaeftsfallId,
                entscheidId: this.entscheidId
            });
        }

        this.navigationService.showNavigationTreeRoute(AMMPaths.BESCHREIBUNG.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.KOLLEKTIV_DURCHFUHRUNG.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.TEILNEHMERPLAETZE.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });

        if (this.ammMassnahmenType === AmmMassnahmenCode.BP || this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_BP) {
            this.navigationService.showNavigationTreeRoute(AMMPaths.BP_KOSTEN.replace(':type', this.ammMassnahmenType), {
                gfId: this.geschaeftsfallId,
                entscheidId: this.entscheidId
            });
        }

        this.navigationService.showNavigationTreeRoute(AMMPaths.SPESEN.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.BIM_BEM_ENTSCHEID.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
    }

    private configureInfobarTitle(title?) {
        const massnahmenLabel = this.translateService.instant(AmmHelper.ammMassnahmenToLabel.find(e => e.code === this.ammMassnahmenType).label);
        const teilnehmerplaetzeTranslatedLabel = this.translateService.instant('amm.massnahmen.subnavmenuitem.teilnehmerplaetze');

        return `${massnahmenLabel} ${title} - ${teilnehmerplaetzeTranslatedLabel}`;
    }
}
