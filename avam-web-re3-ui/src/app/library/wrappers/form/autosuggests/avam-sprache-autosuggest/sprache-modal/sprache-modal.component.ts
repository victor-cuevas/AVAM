import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { Component, OnInit, Input, ElementRef, ViewChild, OnDestroy, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { OpenModalFensterService } from '@shared/services/open-modal-fenster.service';

@Component({
    selector: 'avam-sprache-modal',
    templateUrl: './sprache-modal.component.html',
    styleUrls: ['./sprache-modal.component.scss']
})
export class SpracheModalComponent implements OnInit, OnDestroy {
    @Input() dataSource;
    @Input() modalToolboxId: string;
    @Input() selectedItem;

    @Output() onCloseSpracheModal: EventEmitter<any> = new EventEmitter();
    @Output() onSelectRow: EventEmitter<any> = new EventEmitter();

    modalToolboxConfiguration: ToolboxConfiguration[];
    observeClickActionSub: Subscription;

    formNr = StesFormNumberEnum.SPRACHE_AUSWAEHLEN_MODAL;

    alertChannel = AlertChannelEnum;

    @ViewChild('spracheModalPrint') spracheModalPrint: ElementRef;

    constructor(private toolboxService: ToolboxService, private readonly modalService: NgbModal, private openModalFensterService: OpenModalFensterService) {}

    ngOnInit() {
        this.modalToolboxConfiguration = [
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)
        ];

        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.closeSpracheModal();
            }
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openModalFensterService.openPrintModal(this.spracheModalPrint, this.dataSource);
            }
        });
    }

    ngOnDestroy() {
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
    }

    closeSpracheModal() {
        this.onCloseSpracheModal.emit(true);
        this.modalService.dismissAll();
    }

    selectRow(row) {
        this.onSelectRow.emit(row);
        this.closeSpracheModal();
    }
}
