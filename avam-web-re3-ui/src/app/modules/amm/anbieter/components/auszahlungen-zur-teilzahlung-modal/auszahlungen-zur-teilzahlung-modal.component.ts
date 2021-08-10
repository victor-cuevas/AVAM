import { Component, OnInit, OnDestroy, Input, ElementRef, ViewChild } from '@angular/core';
import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';
import { FacadeService } from '@app/shared/services/facade.service';
import { ToolboxService, ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { SpinnerService } from 'oblique-reactive';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { formatNumber } from '@angular/common';
import { LocaleEnum } from '@app/shared/enums/locale.enum';
import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { AmmAuszahlungZurTeilzahlungXDTO } from '@app/shared/models/dtos-generated/ammAuszahlungZurTeilzahlungXDTO';
import { Subscription } from 'rxjs';
import { AuszahlungenType } from '../auszahlungen-zur-abrechnung-table/auszahlungen-zur-abrechnung-table.component';

@Component({
    selector: 'avam-auszahlungen-zur-teilzahlung-modal',
    templateUrl: './auszahlungen-zur-teilzahlung-modal.component.html',
    styleUrls: ['./auszahlungen-zur-teilzahlung-modal.component.scss']
})
export class AuszahlungenZurTeilzahlungModalComponent implements OnInit, OnDestroy {
    @Input() teilzahlungId: number;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    channel = 'auszahlungen-zur-teilzahlung';
    alertChannel = AlertChannelEnum;
    previousChannel: string;
    formNumber = AmmFormNumberEnum.AMM_ANBIETER_AUSZAHLUNGEN_ZUR_TEILZAHLUNG;
    dataSource = [];
    summeTotal = '';
    auszahlungenZurTeilzahlung: AmmAuszahlungZurTeilzahlungXDTO[] = [];
    unternehmenName = '';
    strasseInfo = '';
    auszahlungenType = AuszahlungenType;

    toolboxConfiguration = [new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false), new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];
    toolboxSub: Subscription;

    constructor(private facade: FacadeService, private anbieterRestService: AnbieterRestService) {
        this.previousChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = this.channel;
        SpinnerService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.subscribeToolbox();
        this.getData();
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        this.anbieterRestService.getAuszahlungenZurTeilzahlung(this.teilzahlungId).subscribe(
            response => {
                if (response.data) {
                    this.auszahlungenZurTeilzahlung = response.data;
                    this.unternehmenName = this.getName(this.auszahlungenZurTeilzahlung[0]);
                    this.strasseInfo = this.getStrasseInfo(this.auszahlungenZurTeilzahlung[0]);

                    this.dataSource = [...response.data]
                        .sort((a, b) => (a.auszahlungsNr > b.auszahlungsNr ? -1 : b.auszahlungsNr > a.auszahlungsNr ? 1 : 0))
                        .map(el => this.createTeilzahlungRow(el));
                    this.summeTotal = formatNumber(this.auszahlungenZurTeilzahlung.reduce((acc, obj) => acc + obj.betrag, 0), LocaleEnum.SWITZERLAND, '.2-2');
                }
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    createTeilzahlungRow(auszahlungZurTeilzahlung: AmmAuszahlungZurTeilzahlungXDTO) {
        return {
            ...auszahlungZurTeilzahlung,
            gueltigVon: this.facade.formUtilsService.parseDate(auszahlungZurTeilzahlung.gueltigAb),
            gueltigBis: this.facade.formUtilsService.parseDate(auszahlungZurTeilzahlung.gueltigBis),
            abrechnungsperiode: this.facade.formUtilsService.dateToMonthYearString(auszahlungZurTeilzahlung.abrechnungsperiode),
            valutadatum: this.facade.formUtilsService.parseDate(auszahlungZurTeilzahlung.valutadatum)
        };
    }

    showTooltip(element: HTMLElement, tooltip: NgbTooltip) {
        if (element.clientWidth !== element.scrollWidth) {
            tooltip.open();
        }
    }

    subscribeToolbox() {
        this.toolboxSub = this.facade.toolboxService.observeClickAction(this.channel).subscribe((action: any) => {
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

    ngOnDestroy() {
        SpinnerService.CHANNEL = this.previousChannel;
        ToolboxService.CHANNEL = this.previousChannel;
        this.toolboxSub.unsubscribe();
    }

    private getName(auszahlungZurTeilzahlung: AmmAuszahlungZurTeilzahlungXDTO): string {
        if (!auszahlungZurTeilzahlung) {
            return '';
        }
        return [auszahlungZurTeilzahlung.name1, auszahlungZurTeilzahlung.name2, auszahlungZurTeilzahlung.name3]
            .filter((n: string) => n !== null && n !== undefined && n.length > 0)
            .join(' ');
    }

    private getStrasseInfo(auszahlungZurTeilzahlung: AmmAuszahlungZurTeilzahlungXDTO): string {
        let strasseInfo = '';
        if (auszahlungZurTeilzahlung.strasseNr) {
            strasseInfo = `${auszahlungZurTeilzahlung.strasseNr}`;
        }
        if (auszahlungZurTeilzahlung.plzOrt) {
            strasseInfo += ` ${auszahlungZurTeilzahlung.plzOrt}`;
        }
        return strasseInfo;
    }
}
