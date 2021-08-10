import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { ToolboxService } from '@app/shared';
import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';
import { AbrechnungDTO } from '@app/shared/models/dtos-generated/abrechnungDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { SpinnerService } from 'oblique-reactive';
import { Subscription } from 'rxjs';

@Component({
    selector: 'avam-abrechnung-zuordnen-modal',
    templateUrl: './abrechnung-zuordnen-modal.component.html'
})
export class AbrechnungZuordnenModalComponent implements OnInit, OnDestroy {
    @Input() vertragswertId: number;
    @Output() onAbrechnungZuordnen: EventEmitter<AbrechnungDTO> = new EventEmitter();

    formNumber = AmmFormNumberEnum.ABRECHNUNG_ZUORDNEN;
    channel = 'abrechnung-zuordnen';
    alertChannel = AlertChannelEnum;
    toolboxConfiguration = [new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false), new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];

    previousChannel: string;
    toolboxSub: Subscription;
    tableDataSource = [];
    data: AbrechnungDTO[];

    constructor(private facade: FacadeService, private anbieterRestService: AnbieterRestService) {
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
        this.anbieterRestService.getAbrechnungenByVertragswertId(this.vertragswertId, AlertChannelEnum.MODAL).subscribe(
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

    abrechnungZuordnen(row) {
        this.onAbrechnungZuordnen.emit(this.data[row.index]);

        this.close();
    }

    ngOnDestroy() {
        ToolboxService.CHANNEL = this.previousChannel;
        SpinnerService.CHANNEL = this.previousChannel;

        if (this.toolboxSub) {
            this.toolboxSub.unsubscribe();
        }
    }

    private createTableRow(data: AbrechnungDTO, index: number) {
        return {
            index,
            abrechnungNr: data.abrechnungNr,
            titel: data.titel,
            ausfuehrungsdatum: this.facade.formUtilsService.parseDate(data.ausfuehrungsdatum),
            statusObject: data.statusObject,
            status: data.statusObject ? this.facade.dbTranslateService.translate(data.statusObject, 'kurzText') : ''
        };
    }
}
