import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from 'src/app/shared/services/toolbox.service';
import { Unsubscribable } from 'oblique-reactive';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { StesRahmenfristDTO } from 'src/app/shared/models/dtos-generated/stesRahmenfristDTO';
import { BaseResponseWrapperStesRahmenfristDTOWarningMessages } from 'src/app/shared/models/dtos-generated/baseResponseWrapperStesRahmenfristDTOWarningMessages';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { StesRahmenfristenPaths } from '@shared/enums/stes-navigation-paths.enum';
import { FormUtilsService } from '@app/shared';
import PrintHelper from '@shared/helpers/print.helper';

import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'app-stes-rahmenfristen-details',
    templateUrl: './stes-rahmenfristen-details.component.html',
    styleUrls: ['./stes-rahmenfristen-details.component.scss']
})
export class StesRahmenfristenDetailsComponent extends Unsubscribable implements OnInit, OnDestroy {
    rahmenfristenDetailsChannel = 'rahmenfristenDetails';
    rahmenfristId: string;
    stesId: string;
    rahmenfristData: any;
    observeClickActionSub: Subscription;
    rahmenfristenDetailsToolboxId = 'rahmenfristenDetails';

    private zahlungsstoppGrund: any;
    private ivCode: any;
    private verlaengerungsgrund: any;
    private anspruch: any;

    constructor(
        private stesDataRestService: StesDataRestService,
        private route: ActivatedRoute,
        private router: Router,
        private facade: FacadeService,
        private stesInfobarService: AvamStesInfoBarService
    ) {
        super();
        ToolboxService.CHANNEL = 'rahmenfristenDetails';
    }

    ngOnInit() {
        this.facade.dbTranslateService
            .getEventEmitter()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(event => {
                this.rahmenfristData.zahlungsstoppGrund = this.getTranslatedText(this.zahlungsstoppGrund);
                this.rahmenfristData.ivCode = this.getTranslatedText(this.ivCode);
                this.rahmenfristData.verlaengerungsgrund = this.getTranslatedText(this.verlaengerungsgrund);
                this.rahmenfristData.anspruchText = this.getTranslatedText(this.anspruch);
                const titleInfoBar = `${this.facade.dbTranslateService.instant('stes.subnavmenuitem.stesRahmenFristDetails')} ${this.rahmenfristData.dauerVon} - ${
                    this.rahmenfristData.dauerBis
                }`;
                this.facade.messageBus.buildAndSend('stes-details-content-ueberschrift', { ueberschrift: titleInfoBar });
                this.stesInfobarService.sendDataToInfobar({ title: titleInfoBar });
            });

        this.route.queryParamMap.subscribe(params => {
            this.rahmenfristId = params.get('rahmenfristId');
            this.facade.navigationService.showNavigationTreeRoute(StesRahmenfristenPaths.RAHMENFRIST, { rahmenfristId: this.rahmenfristId });
            this.facade.navigationService.showNavigationTreeRoute(StesRahmenfristenPaths.RAHMENFRISTZAELERSTAND, { rahmenfristId: this.rahmenfristId });
        });

        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.getData();

        this.configureToolbox();

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });
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
        if (message.data.label === this.facade.dbTranslateService.instant('common.label.rahmenfrist')) {
            this.cancel();
        }
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.observeClickActionSub.unsubscribe();
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.rahmenfristenDetailsToolboxId);
    }

    getData() {
        this.facade.spinnerService.activate(this.rahmenfristenDetailsChannel);
        this.stesDataRestService
            .getRahmenfristById(this.rahmenfristId, this.stesId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperStesRahmenfristDTOWarningMessages) => {
                    this.setData(
                        response.data,
                        this.getTranslatedText(response.data.raRfVerlaengerung),
                        this.getTranslatedText(response.data.asfSperrgrund),
                        this.getTranslatedText(response.data.raIv)
                    );

                    const titleInfoBar = `${this.facade.dbTranslateService.instant('stes.subnavmenuitem.stesRahmenFristDetails')} ${this.formatDate(
                        response.data.raDatumRahmenfristVon
                    )} - ${this.formatDate(response.data.raDatumRahmenfristBis)}`;
                    this.facade.messageBus.buildAndSend('stes-details-content-ueberschrift', { ueberschrift: titleInfoBar });
                    this.stesInfobarService.sendDataToInfobar({ title: titleInfoBar });

                    this.zahlungsstoppGrund = response.data.asfSperrgrund;
                    this.ivCode = response.data.raIv;
                    this.verlaengerungsgrund = response.data.raRfVerlaengerung;
                    this.anspruch = response.data.raAnspruch;

                    this.facade.spinnerService.deactivate(this.rahmenfristenDetailsChannel);
                },
                () => {
                    this.facade.spinnerService.deactivate(this.rahmenfristenDetailsChannel);
                }
            );
    }

    setData(dto: StesRahmenfristDTO, verlaengerungsgrundText: string, zahlungsstoppGrundText: string, ivCodeText: string) {
        this.rahmenfristData = {
            raAusloeserNameVorname: `${dto.raAusloeserName} ${dto.raAusloeserVorname}`,
            raAusloeserTel: `${dto.raAusloeserTelVorwahl} ${dto.raAusloeserTelefon}`,
            raAusloeserEmail: dto.raAusloeserEmail,
            alkZahlstelleNr: `${dto.asfAlkNr} / ${dto.asfZahlstelleNr} ${this.facade.dbTranslateService.translate(dto.zahlstelle, 'kurzname')}`,
            anspruchText: `${this.facade.dbTranslateService.translate(dto.anspruch, 'text')} ${this.getAnspruchVorschussLE(dto)}`,
            anspruchVorschussLE: this.getAnspruchVorschussLE(dto),
            dauerVon: this.formatDate(dto.raDatumRahmenfristVon),
            dauerBis: this.formatDate(dto.raDatumRahmenfristBis),
            rahmenfristNr: this.getFormatedRFNr(dto.raRahmenfristNr),
            verlaengerungsgrund: verlaengerungsgrundText,
            dauerStellensuche: dto.dauerStellensuche,
            restTaggelderBisAussteuerung: this.getTaggelderBisAussteuerung(dto),
            langzeitarbeitslosSeit: this.getLangzeitarbeitslosSeit(dto),
            zahlungsstoppBis: this.formatDate(dto.asfGesperrtBis),
            zahlungsstoppGrund: zahlungsstoppGrundText,
            versicherterVerdienstCHF: dto.raVersichertenVerdienst,
            hoechstgrenze: dto.raHoechstanspruch,
            taggeldsatz: dto.raTggProzentsatz,
            versicherterVerdienstProzent: dto.raBeschaeftigungsgradProzent,
            vermittlung: dto.raVermittlungsgradProzent,
            pauschalCode: `${this.facade.dbTranslateService.translate(dto.pauschal, 'kurzText')}`,
            ivCode: ivCodeText,
            beitragsdauerBeitragsRF: dto.raBeitragszeitBRF,
            beitragsdauerAusland: dto.raBeitragsdauerAusland
        };
    }

    cancel() {
        if (this.router.url.includes(StesRahmenfristenPaths.RAHMENFRIST) || this.router.url.includes(StesRahmenfristenPaths.RAHMENFRISTZAELERSTAND)) {
            this.router.navigate([`./${StesRahmenfristenPaths.RAHMENFRISTEN}`], { relativeTo: this.route.parent });
            this.facade.navigationService.hideNavigationTreeRoute(StesRahmenfristenPaths.RAHMENFRIST);
        }
    }

    formatDate(date) {
        return this.facade.formUtilsService.formatDateNgx(date, FormUtilsService.GUI_DATE_FORMAT);
    }

    // BSP 6
    getTaggelderBisAussteuerung(dto: StesRahmenfristDTO) {
        const hoechstanspruch = dto.raHoechstanspruch;
        const abgerechneteTaggelderTotal = dto.raAbgerechneteTGGTotal;
        let restTaggelder = hoechstanspruch - abgerechneteTaggelderTotal;

        // Anzahl Tage bis Ablauf der Rahmenfrist berechnen
        let restTageBisEndeRF = 0;
        if (dto.raDatumRahmenfristBis != null) {
            restTageBisEndeRF = Math.round(this.getDayDifferenceLastDayIncluded(dto.raDatumRahmenfristBis) * (5 / 7));
        } else {
            restTageBisEndeRF = hoechstanspruch;
        }

        // Wenn Rahmenfrist ablaeuft, bevor die restlichen Taggelder aufgebraucht sind,
        // deurfen nur die restlichen Tage bis zum Ablauf der RF angezeigt werden.
        if (restTageBisEndeRF < restTaggelder) {
            // Falls restTageBisEndeRF negativ ist, setzen wir den Wert auf 0
            if (restTageBisEndeRF < 0) {
                restTaggelder = 0;
            } else {
                restTaggelder = restTageBisEndeRF;
            }
        }

        return restTaggelder;
    }

    getDayDifferenceLastDayIncluded(endDate: Date) {
        const currDate = moment(new Date());
        const end = moment(endDate);
        let dayDiff = end.diff(currDate, 'days');

        if (dayDiff >= 0) {
            dayDiff += 1;
        } else {
            dayDiff -= 1;
        }

        return dayDiff;
    }

    // BSP 2
    getAnspruchVorschussLE(dto: StesRahmenfristDTO) {
        if (dto.raVorschussLeistungExport === 'V') {
            return this.facade.translateService.instant('stes.asal.label.vorschussLeistungsexport');
        } else {
            return '';
        }
    }
    // BSP 5
    getLangzeitarbeitslosSeit(dto: StesRahmenfristDTO) {
        return dto.dauerStellensuche <= 365 ? 0 : dto.dauerStellensuche - 365;
    }

    getTranslatedText(value): string {
        return `${this.facade.dbTranslateService.translate(value, 'kurzText')}`;
    }

    getFormatedRFNr(rfNr) {
        let rahmenfristNr = rfNr ? rfNr.toString() : '00';

        if (rahmenfristNr.length === 1) {
            rahmenfristNr = '0' + rahmenfristNr;
        }
        return rahmenfristNr;
    }
}
