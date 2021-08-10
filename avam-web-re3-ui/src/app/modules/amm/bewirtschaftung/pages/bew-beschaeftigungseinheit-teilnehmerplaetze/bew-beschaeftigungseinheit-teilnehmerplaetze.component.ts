import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import * as moment from 'moment';
import { AmmTeilnehmerlisteHelperService, TeilnehmerInfobarData } from '../../services/amm-teilnehmerliste-helper.service';
import { FacadeService } from '@app/shared/services/facade.service';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { AmmDmsTypeEnum } from '@app/shared/enums/amm-dms-type.enum';
import { BeschaeftigungseinheitDTO } from '@app/shared/models/dtos-generated/beschaeftigungseinheitDTO';
import { AmmConstants } from '@app/shared/enums/amm-constants';

@Component({
    selector: 'avam-bew-beschaeftigungseinheit-teilnehmerplaetze',
    templateUrl: './bew-beschaeftigungseinheit-teilnehmerplaetze.component.html',
    styles: []
})
export class BewBeschaeftigungseinheitTeilnehmerplaetzeComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    channel = 'massnahme-beschaeftigungseinheit-teilnehmerplaetze';
    dfeId = 0;
    beId = 0;
    massnahmeId: number;
    produktId: number;
    dataSource: any;
    beginData: any;
    shouldShowNextButton: boolean;
    shouldShowPreviousButton: boolean;
    beginDateKurs: any;
    endDateKurs: any;
    isPraktikumstelle = false;
    infobarData: TeilnehmerInfobarData;
    langSubscription: Subscription;
    massnahmeDto: MassnahmeDTO;
    observeClickActionSub: Subscription;
    beDto: BeschaeftigungseinheitDTO;

    constructor(
        private route: ActivatedRoute,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private facade: FacadeService,
        private teilnehmerHelperService: AmmTeilnehmerlisteHelperService,
        private infopanelService: AmmInfopanelService,
        private toolboxService: ToolboxService
    ) {}

    ngOnInit() {
        this.getRouteParams();
    }

    ngAfterViewInit() {
        this.getData();
        this.setSubscriptions();
    }

    ngOnDestroy() {
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.langSubscription.unsubscribe();
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.updateInformation({ secondTitle: '' });
    }

    setSubscriptions() {
        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.infopanelService.appendToInforbar(this.infobarTemplate);
            this.infobarData = this.teilnehmerHelperService.addToInforbar(this.massnahmeDto);
            this.initSecondTitle();
        });

        this.subscribeToToolbox();
    }

    getRouteParams() {
        const routeparamMap = this.route.snapshot.queryParamMap;
        this.beId = Number(routeparamMap.get('beId'));
        this.dfeId = Number(routeparamMap.get('dfeId'));
        this.massnahmeId = Number(routeparamMap.get('massnahmeId'));
        this.produktId = Number(this.route.parent.parent.parent.parent.snapshot.paramMap.get('produktId'));
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin([this.bewirtschaftungRestService.getMassnahmeTeilnehmerplaetzeByBeId(this.beId), this.bewirtschaftungRestService.getBeschaeftigungseinheit(this.beId)]).subscribe(
            ([teilnehmerplaetzeResponse, beResponse]) => {
                if (teilnehmerplaetzeResponse.data) {
                    const data = this.mapTeilnehmerPlaetzeData(teilnehmerplaetzeResponse);
                    this.beginData = data.data.zeitraumBeginn;
                    this.dataSource = data;
                }

                if (beResponse.data) {
                    this.beDto = beResponse.data.beschaeftigungseinheiten.find(v => v.beschaeftigungseinheitId === this.beId);
                    this.isPraktikumstelle = this.beDto.type === AmmConstants.PRAKTIKUMSSTELLE;
                    this.beginDateKurs = moment(beResponse.data.beschaeftigungseinheiten[0].gueltigVon);
                    this.endDateKurs = moment(beResponse.data.beschaeftigungseinheiten[0].gueltigBis);
                    this.massnahmeDto = beResponse.data.massnahmeObject;
                    this.infobarData = this.teilnehmerHelperService.addToInforbar(this.massnahmeDto);
                    this.infopanelService.appendToInforbar(this.infobarTemplate);
                    this.initInfopanel();
                    this.shouldShowButtons();
                    this.initSecondTitle();
                }

                this.configureToolbox();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    mapTeilnehmerPlaetzeData(teilnehmerplaetze) {
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

    getNextMonth() {
        this.facade.spinnerService.activate(this.channel);

        let year = moment(this.beginData).year();

        if (Number(moment(this.beginData).month()) === 11) {
            year = moment(this.beginData)
                .add(1, 'year')
                .year();
        }

        this.bewirtschaftungRestService
            .getMassnahmeTeilnehmerplaetzeNextMonthByBeId(
                this.beId,
                moment(this.beginData)
                    .add(1, 'months')
                    .month(),
                year
            )
            .subscribe(
                teilnehmerplaetzeResponse => {
                    this.handleDataForNextOrPreviousMonth(teilnehmerplaetzeResponse);
                    this.facade.spinnerService.deactivate(this.channel);
                },
                () => {
                    this.facade.spinnerService.deactivate(this.channel);
                }
            );
    }

    getPreviousMonth() {
        this.facade.spinnerService.activate(this.channel);

        let year = moment(this.beginData).year();

        if (Number(moment(this.beginData).month()) === 0) {
            year = moment(this.beginData)
                .subtract(1, 'year')
                .year();
        }

        this.bewirtschaftungRestService
            .getMassnahmeTeilnehmerplaetzePreviousMonthByBeId(
                this.beId,
                moment(this.beginData)
                    .subtract(1, 'months')
                    .month(),
                year
            )
            .subscribe(
                teilnehmerplaetzeResponse => {
                    this.handleDataForNextOrPreviousMonth(teilnehmerplaetzeResponse);
                    this.facade.spinnerService.deactivate(this.channel);
                },
                () => {
                    this.facade.spinnerService.deactivate(this.channel);
                }
            );
    }

    handleDataForNextOrPreviousMonth(teilnehmerplaetze) {
        if (teilnehmerplaetze.data) {
            const data = this.mapTeilnehmerPlaetzeData(teilnehmerplaetze);
            this.beginData = data.data.zeitraumBeginn;
            this.dataSource = data;
            this.shouldShowButtons();
        }
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.ZURUECK, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData());
    }

    private subscribeToToolbox(): Subscription {
        return (this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        }));
    }

    private getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { DFE_ID: this.dfeId },
            uiSuffix: AmmDmsTypeEnum.DMS_TYP_MASSNAHME
        };
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

    private initInfopanel() {
        this.infopanelService.dispatchInformation({
            title: this.isPraktikumstelle ? 'amm.massnahmen.subnavmenuitem.praktikumsstelle' : 'amm.massnahmen.subnavmenuitem.arbkategorie',
            subtitle: 'amm.massnahmen.subnavmenuitem.teilnehmerplaetze'
        });
    }

    private initSecondTitle() {
        this.infopanelService.updateInformation({
            secondTitle: this.facade.dbTranslateService.translateWithOrder(this.beDto, 'titel')
        });
    }
}
