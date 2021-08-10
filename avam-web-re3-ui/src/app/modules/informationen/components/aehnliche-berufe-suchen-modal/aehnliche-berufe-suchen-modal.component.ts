import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import { AlertChannelEnum } from '@shared/components/alert/alert-channel.enum';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { takeUntil } from 'rxjs/operators';
import { FacadeService } from '@shared/services/facade.service';
import { Unsubscribable } from 'oblique-reactive';
import { BerufSuchenTableComponent } from '@modules/informationen/components/beruf-suchen-table/beruf-suchen-table.component';

@Component({
    selector: 'avam-aehnliche-berufe-suchen-modal',
    templateUrl: './aehnliche-berufe-suchen-modal.component.html',
    styleUrls: ['./aehnliche-berufe-suchen-modal.component.scss']
})
export class AehnlicheBerufeSuchenModalComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    @Input() dataSource = [];
    @Input() showEyeAction;
    @ViewChild('berufSuchenTableComponent') berufSuchenTableComponent: BerufSuchenTableComponent;
    @ViewChild('modalPrintModal') modalPrintModal: ElementRef;
    public formNr = StesFormNumberEnum.AENLICHE_BERUFE_SUCHEN_MODAL;
    public modalToolboxConfiguration: ToolboxConfiguration[];
    public alertChannel = AlertChannelEnum;
    public channel = 'AehnlicheBerufeSuchenModalComponent';
    public originalChannel: string;
    constructor(readonly modalService: NgbModal, private facadeService: FacadeService) {
        super();
        this.originalChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = this.channel;
    }

    public ngOnInit() {
        this.subscribeToToolbox();
    }

    public ngAfterViewInit() {
        this.berufSuchenTableComponent.setTableData(this.dataSource);
    }

    public ngOnDestroy() {
        this.facadeService.fehlermeldungenService.closeMessage();
        ToolboxService.CHANNEL = this.originalChannel;
        super.ngOnDestroy();
    }

    private subscribeToToolbox() {
        this.modalToolboxConfiguration = ToolboxConfig.getAenlichBerufeSuchenModalConfig();
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    this.modalService.open(this.modalPrintModal, {
                        ariaLabelledBy: 'zahlstelle-basic-title',
                        windowClass: 'avam-modal-xl',
                        centered: true,
                        backdrop: 'static'
                    });
                }
                if (action.message.action === ToolboxActionEnum.EXIT) {
                    this.close();
                }
            });
    }

    private close(): void {
        this.modalService.dismissAll();
    }
}
