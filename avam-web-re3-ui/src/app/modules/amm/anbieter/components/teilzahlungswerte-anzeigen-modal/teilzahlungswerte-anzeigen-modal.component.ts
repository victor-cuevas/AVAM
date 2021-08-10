import { DatePipe, formatNumber } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { FormatSwissFrancPipe, ToolboxService } from '@app/shared';
import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';
import { LocaleEnum } from '@app/shared/enums/locale.enum';
import { TeilzahlungswertListeViewDTO } from '@app/shared/models/dtos-generated/teilzahlungswertListeViewDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { SpinnerService } from 'oblique-reactive';
import { Subscription } from 'rxjs';

@Component({
    selector: 'avam-teilzahlungswerte-anzeigen-modal',
    templateUrl: './teilzahlungswerte-anzeigen-modal.component.html',
    providers: [FormatSwissFrancPipe]
})
export class TeilzahlungswerteAnzeigenModalComponent implements OnInit, OnDestroy {
    @Input() profilNr: number;

    formNumber = AmmFormNumberEnum.AMM_TEILZAHLUNGSWERTE_ANZEIGEN;
    channel = 'teilzahlungswerte-anzeigen';
    alertChannel = AlertChannelEnum;
    toolboxConfiguration = [new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false), new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];

    previousChannel: string;
    toolboxSub: Subscription;
    dataSource = [];
    summeTotal: string;

    constructor(private facade: FacadeService, private anbieterRestService: AnbieterRestService, private datePipe: DatePipe, private formatSwissFrancPipe: FormatSwissFrancPipe) {
        this.previousChannel = ToolboxService.CHANNEL;
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.subscribeToToolbox();
        this.getData();
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);
        this.anbieterRestService.getTeilzahlungswerteByProfilNr(this.profilNr, AlertChannelEnum.MODAL).subscribe(
            response => {
                const teilzahlungswerte = [...response.data];
                this.dataSource = response.data.map(row => this.createTableRow(row));
                this.summeTotal = formatNumber(teilzahlungswerte.reduce((acc, obj) => acc + obj.teilzahlungswertBetrag, 0), LocaleEnum.SWITZERLAND, '.2-2');

                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    subscribeToToolbox() {
        this.toolboxSub = this.facade.toolboxService.observeClickAction(this.channel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
        });
    }

    close() {
        this.facade.openModalFensterService.dismissAll();
    }

    ngOnDestroy() {
        ToolboxService.CHANNEL = this.previousChannel;
        SpinnerService.CHANNEL = this.previousChannel;

        if (this.toolboxSub) {
            this.toolboxSub.unsubscribe();
        }
    }

    private createTableRow(data: TeilzahlungswertListeViewDTO) {
        return {
            teilzahlungswertNr: data.teilzahlungswertNr,
            chf: this.formatSwissFrancPipe.transform(data.teilzahlungswertBetrag),
            transferAnAlk: this.getTransferAlk(data.transferAlkAm),
            teilzahlungsNr: data.teilzahlungNr,
            titel: data.durchfuehrungsTitelDe ? this.facade.dbTranslateService.translate(data, 'durchfuehrungsTitel') : '',
            status: data.teilzahlungStatusKurztextDe ? this.facade.dbTranslateService.translate(data, 'teilzahlungStatusKurztext') : '',
            vertragswertNr: data.vertragswertNummer
        };
    }

    private getTransferAlk(transferAlkAm: Date) {
        return transferAlkAm
            ? `${this.facade.translateService.instant('amm.zahlungen.message.datenuebermittelt')} ${this.datePipe.transform(transferAlkAm, 'dd.MM.yyyy')}`
            : this.facade.translateService.instant('amm.zahlungen.message.keinedatenuebermittelt');
    }
}
