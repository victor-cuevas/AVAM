import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { TeilzahlungDTO } from '@app/shared/models/dtos-generated/teilzahlungDTO';
import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { Subscription } from 'rxjs';
import { SpinnerService } from 'oblique-reactive';
import { FacadeService } from '@app/shared/services/facade.service';
import { TeilzahlungenTableType } from '../teilzahlungen-uebersicht-table/teilzahlungen-uebersicht-table.component';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';

@Component({
    selector: 'avam-teilzahlung-zuordnen-modal',
    templateUrl: './teilzahlung-zuordnen-modal.component.html'
})
export class TeilzahlungZuordnenModalComponent implements OnInit, OnDestroy {
    @Input() anbieterId: number;
    @Output() onTeilzahlungZuordnen: EventEmitter<TeilzahlungDTO> = new EventEmitter();

    formNumber = AmmFormNumberEnum.AMM_TEILZAHLUNG_ZUORDNEN;
    channel = 'teilzahlung-zuordnen';
    alertChannel = AlertChannelEnum;
    toolboxConfiguration = [new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false), new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];
    tableType = TeilzahlungenTableType;

    previousChannel: string;
    toolboxSub: Subscription;
    data: TeilzahlungDTO[] = [];
    tableDataSource = [];

    constructor(private facade: FacadeService, private anbieterService: AnbieterRestService) {
        this.previousChannel = ToolboxService.CHANNEL;
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.subscribeToToolbox();
        this.getData();
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

    getData() {
        this.facade.spinnerService.activate(this.channel);
        this.anbieterService.getTeilzahlungenByAnbieterId(this.anbieterId, AlertChannelEnum.MODAL).subscribe(
            response => {
                this.data = response.data ? response.data : [];
                this.tableDataSource = this.data.map((row, index) => this.createTableRow(row, index));
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    teilzahlungZuordnen(row) {
        this.onTeilzahlungZuordnen.emit(this.data[row.index]);

        this.close();
    }

    ngOnDestroy() {
        ToolboxService.CHANNEL = this.previousChannel;
        SpinnerService.CHANNEL = this.previousChannel;

        if (this.toolboxSub) {
            this.toolboxSub.unsubscribe();
        }
    }

    private createTableRow(teilzahlung: TeilzahlungDTO, index: number) {
        return {
            index,
            teilzahlungId: teilzahlung.teilzahlungId,
            teilzahlungNr: teilzahlung.teilzahlungNr,
            titel: teilzahlung.titel,
            ausfuehrungsdatum: teilzahlung.ausfuehrungsdatum,
            status: this.facade.dbTranslateService.translateWithOrder(teilzahlung.statusObject, 'kurzText')
        };
    }
}
