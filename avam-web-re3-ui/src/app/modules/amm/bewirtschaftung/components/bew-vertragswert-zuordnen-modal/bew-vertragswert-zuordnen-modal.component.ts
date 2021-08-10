import { VertragswertZuordnenTableRow } from './../bew-vertragswert-zuordnen-table/bew-vertragswert-zuordnen-table.component';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { FacadeService } from '@app/shared/services/facade.service';
import { SpinnerService } from 'oblique-reactive';
import { Subscription } from 'rxjs';
import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import { VertragswertMDTO } from '@app/shared/models/dtos-generated/vertragswertMDTO';
import { formatNumber } from '@angular/common';
import { LocaleEnum } from '@app/shared/enums/locale.enum';

@Component({
    selector: 'avam-bew-vertragswert-zuordnen-modal',
    templateUrl: './bew-vertragswert-zuordnen-modal.component.html'
})
export class BewVertragswertZuordnenModalComponent implements OnInit, OnDestroy {
    static readonly CHANNEL_STATE_KEY = 'bew-vertragswert-zuordnen';

    public get CHANNEL_STATE_KEY() {
        return BewVertragswertZuordnenModalComponent.CHANNEL_STATE_KEY;
    }

    @Input() kursId: number;
    @Output() vertragswertZuordnenEmitter: EventEmitter<number> = new EventEmitter();

    alertChannel = AlertChannelEnum;
    previousChannel: string;
    toolboxSub: Subscription;
    toolboxConfiguration = [new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false), new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];

    formNumber = AmmFormNumberEnum.AMM_BEW_VERTRAGSWERT_ZUORDNEN;

    dataSource = [];

    constructor(private facade: FacadeService, private vertraegeRestService: VertraegeRestService) {
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

    close() {
        this.facade.openModalFensterService.dismissAll();
    }

    vertragswertUebernehmen(vertragswertRow: VertragswertZuordnenTableRow) {
        this.vertragswertZuordnenEmitter.emit(vertragswertRow.vertragswertId);

        this.close();
    }

    private getData() {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);

        this.vertraegeRestService.getVertragswerteForZuordnen(this.kursId).subscribe(
            response => {
                if (response.data) {
                    this.dataSource = response.data.map(el => this.createRow(el));
                }

                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            },
            () => this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY)
        );
    }

    private subscribeToToolbox() {
        this.toolboxSub = this.facade.toolboxService.observeClickAction(this.CHANNEL_STATE_KEY).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
        });
    }

    private createRow(vertragswert: VertragswertMDTO): VertragswertZuordnenTableRow {
        return {
            vertragswertId: vertragswert.vertragswertId,
            vertragswertNr: vertragswert.vertragswertNr || '',
            profilNr: vertragswert.profilNr || '',
            gueltigVon: vertragswert.gueltigVon,
            gueltigBis: vertragswert.gueltigBis,
            preismodell: this.facade.dbTranslateService.translate(vertragswert.preismodell, 'kurzText') || '',
            gueltig: vertragswert.gueltigB ? 'common.label.ja' : 'common.label.nein',
            chf: formatNumber(-Math.round(-vertragswert.wertTripelObject.chfBetrag), LocaleEnum.SWITZERLAND),
            tnTage: vertragswert.wertTripelObject.teilnehmerTage || '',
            tn: vertragswert.wertTripelObject.teilnehmer || ''
        };
    }
}
