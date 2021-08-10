import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { FacadeService } from '@app/shared/services/facade.service';
import { SpinnerService } from 'oblique-reactive';
import { Subscription, forkJoin } from 'rxjs';
import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { FormatSwissFrancPipe } from '@app/shared';
import { AuszahlungZurLeistungsvereinbarungXDTO } from '@app/shared/models/dtos-generated/auszahlungZurLeistungsvereinbarungXDTO';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { UnternehmenRestService } from '@app/core/http/unternehmen-rest.service';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { PlzDTO } from '@app/shared/models/dtos-generated/plzDTO';
import { UnternehmenErfassenPageComponent } from '@app/modules/stes/pages/unternehmen/unternehmen-erfassen-page/unternehmen-erfassen-page.component';

@Component({
    selector: 'avam-auszahlungen-zur-leistungsvereinbarung-modal',
    templateUrl: './auszahlungen-zur-leistungsvereinbarung-modal.component.html'
})
export class AuszahlungenZurLeistungsvereinbarungModalComponent implements OnInit, OnDestroy {
    static readonly CHANNEL_STATE_KEY = 'auszahlungen-zur-leistungsvereinbarung';

    public get CHANNEL_STATE_KEY() {
        return AuszahlungenZurLeistungsvereinbarungModalComponent.CHANNEL_STATE_KEY;
    }

    @Input() leistungsvereinbarungId: number;
    @Input() anbieterId: number;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    alertChannel = AlertChannelEnum;
    previousChannel: string;
    toolboxSub: Subscription;

    toolboxConfiguration = [
        new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false),
        new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false),
        new ToolboxConfiguration(ToolboxActionEnum.ZURUECK, true, false)
    ];

    formNumber = AmmFormNumberEnum.AMM_ANBIETER_AUSZAHLUNGEN_ZUR_LEISTUNGSVEREINBARUNG;

    auszahlungen: AuszahlungZurLeistungsvereinbarungXDTO[] = [];
    dataSource = [];
    summeTotal: string | number;

    unternehmen: UnternehmenDTO;
    unternehmenName = '';
    unternehmenStatus = '';
    strasseInfo = '';
    postfachInfo = '';

    constructor(
        private facade: FacadeService,
        private anbieterRestService: AnbieterRestService,
        private unternehmenRestService: UnternehmenRestService,
        private formatSwissFrancPipe: FormatSwissFrancPipe
    ) {
        this.previousChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = this.CHANNEL_STATE_KEY;
        SpinnerService.CHANNEL = this.CHANNEL_STATE_KEY;
    }

    ngOnInit() {
        this.subscribeToToolbox();
        this.getData();
    }

    ngOnDestroy() {
        this.toolboxSub.unsubscribe();
        SpinnerService.CHANNEL = this.previousChannel;
        ToolboxService.CHANNEL = this.previousChannel;
    }

    getData() {
        this.getAuszahlungen();
        this.getUnternehmenInfo();
    }

    createRow(auszahlung: AuszahlungZurLeistungsvereinbarungXDTO) {
        const periode = this.facade.formUtilsService.parseDate(auszahlung.abrechnungsperiode);

        return {
            vertragswertNr: auszahlung.vertragswertNr || '',
            gueltigVon: this.facade.formUtilsService.parseDate(auszahlung.vwGueltigAb),
            gueltigBis: this.facade.formUtilsService.parseDate(auszahlung.vwGueltigBis),
            profilNr: auszahlung.profilNr || '',
            titel: auszahlung.titel || '',
            teilzahlungswertAbrechnungswertNr: auszahlung.aamNummer || '',
            auszahlungsNr: auszahlung.auszahlungsNr || '',
            zahlungscode: auszahlung.zahlungsCode || '',
            entschaedigungsart: auszahlung.entschaedigungskategorie || '',
            betrag: this.formatSwissFrancPipe.transform(auszahlung.betrag),
            auszahlungsperiode: this.facade.formUtilsService.dateToMonthYearString(periode),
            valuta: this.facade.formUtilsService.parseDate(auszahlung.valutadatum)
        };
    }

    subscribeToToolbox() {
        this.toolboxSub = this.facade.toolboxService.observeClickAction(this.CHANNEL_STATE_KEY).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            } else if (action.message.action === ToolboxActionEnum.PRINT) {
                this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.dataSource);
            }
        });
    }

    close() {
        this.facade.openModalFensterService.dismissAll();
    }

    showTooltip(element: HTMLElement, tooltip: NgbTooltip) {
        if (element.clientWidth !== element.scrollWidth) {
            tooltip.open();
        }
    }

    private getAuszahlungen() {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);

        this.anbieterRestService.getAuszahlungenZurLeistungsvereinbarung(this.leistungsvereinbarungId, AlertChannelEnum.MODAL).subscribe(
            response => {
                if (response.data) {
                    this.auszahlungen = response.data;
                    this.dataSource = response.data.map(el => this.createRow(el));

                    this.unternehmenName = this.getName(this.auszahlungen[0]);
                    this.strasseInfo = this.getStrasseInfo(this.auszahlungen[0]);

                    this.summeTotal = this.formatSwissFrancPipe.transform(this.auszahlungen.reduce((acc, obj) => acc + obj.betrag, 0));
                }

                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            },
            () => {
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
                this.summeTotal = this.formatSwissFrancPipe.transform(0);
            }
        );
    }

    private getUnternehmenInfo() {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);
        this.unternehmenRestService.getUnternehmenById(this.anbieterId.toString(), AlertChannelEnum.MODAL).subscribe(
            response => {
                if (response) {
                    this.unternehmen = response;
                    this.unternehmenStatus = this.facade.dbTranslateService.translate(response.statusObject, 'text');
                    this.postfachInfo = this.getPostfachInfo(response);
                }

                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            },
            () => {
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            }
        );
    }

    private getName(auszahlungZurLv: AuszahlungZurLeistungsvereinbarungXDTO): string {
        if (!auszahlungZurLv) {
            return '';
        }

        return [auszahlungZurLv.name1, auszahlungZurLv.name2, auszahlungZurLv.name3].filter((n: string) => n !== null && n !== undefined && n.length > 0).join(' ');
    }

    private getStrasseInfo(auszahlungZurLv: AuszahlungZurLeistungsvereinbarungXDTO): string {
        let strasseInfo = '';
        if (auszahlungZurLv.strasseNr) {
            strasseInfo = `${auszahlungZurLv.strasseNr}`;
        }

        if (auszahlungZurLv.plzOrt) {
            strasseInfo = strasseInfo ? `${strasseInfo}, ${auszahlungZurLv.plzOrt}` : `${auszahlungZurLv.plzOrt}`;
        }

        return strasseInfo;
    }

    private getPostfachInfo(unternehmen: UnternehmenDTO): string {
        let postfachInfo = '';

        if (unternehmen.postfach) {
            postfachInfo = String(unternehmen.postfach);
        }

        return this.addPlzInfo(unternehmen.postfachPlzObject, postfachInfo);
    }

    private addPlzInfo(plzDTO: PlzDTO, info: string): string {
        const plzOrt = this.getPlzUndOrt(plzDTO);

        if (plzOrt) {
            info = info ? `${info}, ${plzOrt}` : plzOrt;
        }

        return info;
    }

    private getPlzUndOrt(plzDTO: PlzDTO): string | undefined {
        return plzDTO ? `${plzDTO.postleitzahl} ${this.facade.dbTranslateService.translate(plzDTO, 'ort')}` : undefined;
    }
}
