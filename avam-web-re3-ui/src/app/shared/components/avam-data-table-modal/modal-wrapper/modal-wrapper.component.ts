import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-modal-wrapper',
    templateUrl: './modal-wrapper.component.html'
})
export class ModalWrapperComponent implements AfterViewInit, OnDestroy {
    @Input() public tableConfig: any;
    @Input() public modalHeader: string;
    @Input() public modalToolboxConfiguration: ToolboxConfiguration[];
    @Input() public modalToolboxId: string;
    @Input() public formNr: string;
    @Output() public modalClose: EventEmitter<boolean> = new EventEmitter();
    @ViewChild('modalPrint') public modalPrint: ElementRef;

    private observeClickActionSub: Subscription;
    private modalColumns: any;
    private modalConfig: any;

    constructor(private modalService: NgbModal, private toolboxService: ToolboxService) {}

    ngAfterViewInit(): void {
        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.modalService.dismissAll();
                this.openPrintModal();
            }
        });
        this.modalColumns = this.tableConfig.columns.filter(item => item.columnDef !== 'actions');
        this.modalConfig = {
            ...this.tableConfig.config,
            displayedColumns: this.modalColumns.map(c => c.columnDef)
        };
    }

    ngOnDestroy() {
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
    }

    selectItem(row) {
        this.modalClose.emit(row);
        this.close();
    }

    close() {
        this.modalService.dismissAll();
    }

    private openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }
}
