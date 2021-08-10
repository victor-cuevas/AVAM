import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import * as moment from 'moment';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { AmmTeilnehmerlisteHelperService, TeilnehmerInfobarData } from '../../services/amm-teilnehmerliste-helper.service';
import { FacadeService } from '@app/shared/services/facade.service';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { AmmDmsTypeEnum } from '@app/shared/enums/amm-dms-type.enum';

@Component({
    selector: 'avam-bew-standort-teilnehmerplaetze',
    templateUrl: './bew-standort-teilnehmerplaetze.component.html'
})
export class BewStandortTeilnehmerplaetzeComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    channel = 'massnahme-standort-teilnehmerplaetze';
    dfeId = 0;
    massnahmeId: number;
    produktId: number;
    dataSource: any;
    beginData: any;
    shouldShowNextButton: boolean;
    shouldShowPreviousButton: boolean;
    beginDateKurs: any;
    endDateKurs: any;
    infobarData: TeilnehmerInfobarData;
    langSubscription: Subscription;
    massnahmeDto: MassnahmeDTO;
    observeClickActionSub: Subscription;

    constructor(
        private route: ActivatedRoute,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private infopanelService: AmmInfopanelService,
        private facade: FacadeService,
        private teilnehmerHelperService: AmmTeilnehmerlisteHelperService,
        private toolboxService: ToolboxService
    ) {
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.getRouteParams();
    }

    ngAfterViewInit() {
        this.getData();
        this.initInfopanel();
        this.setSubscriptions();
    }

    setSubscriptions() {
        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.infopanelService.appendToInforbar(this.infobarTemplate);
            this.infobarData = this.teilnehmerHelperService.addToInforbar(this.massnahmeDto);
        });

        this.subscribeToToolbox();
    }

    ngOnDestroy() {
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.langSubscription.unsubscribe();
        this.facade.fehlermeldungenService.closeMessage();
        this.observeClickActionSub.unsubscribe();
        this.infopanelService.updateInformation({ secondTitle: '' });
    }

    getRouteParams() {
        const routeparamMap = this.route.snapshot.queryParamMap;
        this.dfeId = Number(routeparamMap.get('dfeId'));
        this.massnahmeId = Number(routeparamMap.get('massnahmeId'));
        this.produktId = Number(this.route.parent.parent.parent.snapshot.paramMap.get('produktId'));
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin([
            this.bewirtschaftungRestService.getMassnahmeTeilnehmerplaetzeByDfeId(this.dfeId),
            this.bewirtschaftungRestService.getDfeStandort(this.produktId, this.massnahmeId, this.dfeId)
        ]).subscribe(
            ([teilnehmerplaetzeResponse, standortResponse]) => {
                if (teilnehmerplaetzeResponse.data) {
                    const data = this.mapTeilnehmerPlaetzeData(teilnehmerplaetzeResponse);
                    this.beginData = data.data.zeitraumBeginn;
                    this.dataSource = data;
                }

                if (standortResponse.data) {
                    this.beginDateKurs = moment(standortResponse.data.gueltigVon);
                    this.endDateKurs = moment(standortResponse.data.gueltigBis);
                    this.shouldShowButtons();
                    this.massnahmeDto = standortResponse.data.massnahmeObject;
                    this.teilnehmerHelperService.updateSecondLabel(standortResponse.data);
                    this.infobarData = this.teilnehmerHelperService.addToInforbar(this.massnahmeDto);
                    this.infopanelService.appendToInforbar(this.infobarTemplate);
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
            .getMassnahmeTeilnehmerplaetzeNextMonthByDfeId(
                this.dfeId,
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
            .getMassnahmeTeilnehmerplaetzePreviousMonthByDfeId(
                this.dfeId,
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
            title: 'amm.massnahmen.subnavmenuitem.standort',
            subtitle: 'amm.nutzung.subnavmenuitem.teilnehmerplaetze'
        });
    }
}
