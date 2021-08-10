import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CodeDataRestService } from '@app/core/http/code-data-rest.service';
import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { InformationenFormNumberEnum } from '@app/shared/enums/informationen-form-number.enum';
import { DomainDTO } from '@app/shared/models/dtos-generated/domainDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { SpinnerService } from 'oblique-reactive';
import { Subscription } from 'rxjs';

@Component({
    selector: 'avam-code-domaene-auswaehlen',
    templateUrl: './code-domaene-auswaehlen.component.html'
})
export class CodeDomaeneAuswaehlenComponent implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @Input('codeDomain') codeDomain: any;
    @Output() onDomainWaehlen: EventEmitter<DomainDTO> = new EventEmitter();

    formNumber = InformationenFormNumberEnum.CODE_DOMAENE_AUSWAHLEN;
    channel = 'code-domaene-auswaehlen';
    alertChannel = AlertChannelEnum;
    toolboxConfiguration = [
        new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false),
        new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false),
        new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)
    ];
    previousChannel: string;
    tableDataSource = [];
    toolboxSub: Subscription;
    data: DomainDTO[];

    constructor(private facade: FacadeService, private codeDataRest: CodeDataRestService) {
        this.previousChannel = ToolboxService.CHANNEL;
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.subscribeToolbox();
        this.getData();
    }

    close() {
        this.facade.openModalFensterService.dismissAll();
    }

    domainWaehlen(row: any) {
        this.onDomainWaehlen.emit(this.data[row.index]);
        this.close();
    }

    ngOnDestroy() {
        if (this.toolboxSub) {
            this.toolboxSub.unsubscribe();
        }

        ToolboxService.CHANNEL = this.previousChannel;
        SpinnerService.CHANNEL = this.previousChannel;
    }

    private getData() {
        const domain = this.codeDomain && this.codeDomain.domain ? this.codeDomain.domain : this.codeDomain;

        this.codeDataRest.codeDomainSearch({ domain }).subscribe(
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

    private createTableRow(domainDTO: DomainDTO, index: number) {
        return {
            index,
            domain: domainDTO.domain
        };
    }

    private subscribeToolbox() {
        this.toolboxSub = this.facade.toolboxService.observeClickAction(this.channel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            } else if (action.message.action === ToolboxActionEnum.PRINT) {
                this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.tableDataSource);
            }
        });
    }
}
