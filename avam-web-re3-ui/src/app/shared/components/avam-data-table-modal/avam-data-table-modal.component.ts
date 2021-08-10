import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild, OnInit } from '@angular/core';
import { FormGroup, NG_VALUE_ACCESSOR, FormGroupDirective } from '@angular/forms';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '../../services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

@Component({
    selector: 'avam-data-table-modal',
    templateUrl: './avam-data-table-modal.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AvamDataTableModalComponent),
            multi: true
        }
    ]
})
export class AvamDataTableModalComponent implements OnInit {
    @Input() public parentForm: FormGroup;
    @Input() public controlName: any;
    @Input() public controlType = 'text';
    @Input() public bsConfig = { dateInputFormat: 'MMMM YYYY', minMode: 'month' };
    @Input() public inputDisabled = false;
    @Input() public isDisabled = false;
    @Input() public isReadOnly = false;
    @Input() public inputClass: string;
    @Input() public labelClass: string;
    @Input() public selectLabel: string;
    @Input() public formNr: string;
    @Input() public modalHeader: string;
    @Input() public coreReadOnly = false;
    @Input() public toolTip: string;
    @Input() public modalToolboxConfiguration: ToolboxConfiguration[] = [
        new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false),
        new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false),
        new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)
    ];
    @Input() public tableConfig: any;
    @Output() public modalClosed: EventEmitter<boolean> = new EventEmitter();
    @ViewChild('ngForm') private ngForm: FormGroupDirective;
    @ViewChild('tableModal') private tableModal: ElementRef;
    @ViewChild('commonWrapperTableComponent') private commonWrapperTableComponent: ElementRef;

    private modalToolboxId = 'table-modal';
    private originalChannel: string;

    constructor(private modalService: NgbModal, private obliqueHelper: ObliqueHelperService) {}

    public ngOnInit(): void {
        this.obliqueHelper.generateState(this.ngForm);
    }

    public openModal(event): void {
        this.originalChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = this.modalToolboxId;
        event.stopPropagation();

        this.modalService.open(this.tableModal, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-xl', backdrop: 'static' }).result.then(
            () => {
                ToolboxService.CHANNEL = this.originalChannel;
                this.modalClosed.emit(false);
            },
            () => {
                ToolboxService.CHANNEL = this.originalChannel;
                this.modalClosed.emit(false);
            }
        );
    }

    private selectItem(row): void {
        this.modalClosed.emit(row);
        this.close();
    }

    private close(): void {
        this.modalService.dismissAll();
    }
}
