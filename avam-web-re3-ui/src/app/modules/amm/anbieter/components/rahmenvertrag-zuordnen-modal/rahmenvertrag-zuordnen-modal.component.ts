import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';
import { FacadeService } from '@app/shared/services/facade.service';
import { SpinnerService } from 'oblique-reactive';
import { RahmenvertragDTO } from '@app/shared/models/dtos-generated/rahmenvertragDTO';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import { RahmenvertragSuchenParamDTO } from '@app/shared/models/dtos-generated/rahmenvertragSuchenParamDTO';
import { LeistungsvereinbarungData } from '../leistungsvereinbarung-form/leistungsvereinbarung-form.component';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'avam-rahmenvertrag-zuordnen-modal',
    templateUrl: './rahmenvertrag-zuordnen-modal.component.html'
})
export class RahmenvertragZuordnenModalComponent implements OnInit, OnDestroy {
    static readonly CHANNEL_STATE_KEY = 'rahmenvertrag-zuordnen';

    public get CHANNEL_STATE_KEY() {
        return RahmenvertragZuordnenModalComponent.CHANNEL_STATE_KEY;
    }

    @Input() leistungsvereinbarungData: LeistungsvereinbarungData;
    @Input() leistungsvereinbarungGueltigVon: Date;
    @Input() leistungsvereinbarungGueltigBis: Date;

    @Output() rahmenvertragZuordnenEmitter: EventEmitter<RahmenvertragDTO> = new EventEmitter();

    alertChannel = AlertChannelEnum;
    previousChannel: string;
    formNumber = AmmFormNumberEnum.AMM_ANBIETER_RAHMENVERTRAG_ZUORDNEN;
    toolboxConfiguration = [new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false), new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];
    toolboxSub: Subscription;

    rahmenvertragList: RahmenvertragDTO[];
    dataSource = [];

    constructor(private facade: FacadeService, private vertraegeRestService: VertraegeRestService) {
        this.previousChannel = SpinnerService.CHANNEL;
        SpinnerService.CHANNEL = this.CHANNEL_STATE_KEY;
        ToolboxService.CHANNEL = this.CHANNEL_STATE_KEY;
    }

    ngOnInit() {
        this.getData();
        this.subscribeToToolbox();
    }

    ngOnDestroy() {
        SpinnerService.CHANNEL = this.previousChannel;
        ToolboxService.CHANNEL = this.previousChannel;

        this.toolboxSub.unsubscribe();
    }

    getData() {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);

        this.vertraegeRestService.searchRahmenvertraege(this.mapToDto()).subscribe(
            response => {
                if (response.data) {
                    this.rahmenvertragList = response.data;
                    this.dataSource = this.rahmenvertragList.map(el => this.createRow(el));
                }

                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            },
            () => this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY)
        );
    }

    rahmenvertragUebernehmen(rahmenvertrag: RahmenvertragDTO) {
        this.rahmenvertragZuordnenEmitter.emit(rahmenvertrag);
        this.close();
    }

    subscribeToToolbox() {
        this.toolboxSub = this.facade.toolboxService.observeClickAction(this.CHANNEL_STATE_KEY).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
        });
    }

    close() {
        this.facade.openModalFensterService.dismissAll();
    }

    private mapToDto(): RahmenvertragSuchenParamDTO {
        const lvDto = this.leistungsvereinbarungData ? this.leistungsvereinbarungData.lvDto : null;

        return {
            insideDate: true,
            gueltigVon: this.leistungsvereinbarungGueltigVon,
            gueltigBis: this.leistungsvereinbarungGueltigBis,
            gueltig: true,
            anbieterId: this.leistungsvereinbarungData ? this.leistungsvereinbarungData.anbieterId : 0,
            anbieterName: lvDto && lvDto.anbieterObject && lvDto.anbieterObject.unternehmen ? lvDto.anbieterObject.unternehmen.name1 : ''
        };
    }

    private createRow(rahmenvertrag: RahmenvertragDTO) {
        return {
            rahmenvertragId: rahmenvertrag.rahmenvertragId,
            rahmenvertragNr: rahmenvertrag.rahmenvertragNr || '',
            titel: rahmenvertrag.titel || '',
            gueltigVon: rahmenvertrag.gueltigVon,
            gueltigBis: rahmenvertrag.gueltigBis,
            gueltig: rahmenvertrag.gueltigB ? 'common.label.ja' : 'common.label.nein',
            status: this.facade.dbTranslateService.translate(rahmenvertrag.statusObject, 'text') || ''
        };
    }
}
