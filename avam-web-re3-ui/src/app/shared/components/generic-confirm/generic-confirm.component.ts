import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-generic-confirm',
    templateUrl: './generic-confirm.component.html',
    styleUrls: ['./generic-confirm.component.scss']
})
export class GenericConfirmComponent implements OnInit {
    @Input() modalElement: any;
    @Input() titleLabel = 'common.label.bitteBestaetigenTitle';
    @Input() promptLabel: string;
    @Input() primaryButton: string;
    @Input() secondaryButton = 'common.button.neinAbbrechen';
    @Input() singleButtonCenter = false;
    @Input() supressDefaultEnterAction = false;

    @Output() emitPrimaryAction = new EventEmitter();
    @Output() emitSecondaryAction = new EventEmitter();

    constructor(readonly modalService: NgbModal, private activeModal: NgbActiveModal) {}

    ngOnInit() {}

    primaryAction() {
        this.emitPrimaryAction.emit();

        if (this.modalElement) {
            this.modalElement.close();
        }
        this.activeModal.close(true);
    }

    secondaryAction() {
        this.emitSecondaryAction.emit();

        if (this.modalElement) {
            this.modalElement.close();
        }
        this.activeModal.close();
    }

    onEnterUp(event: any, action: any) {
        if (this.supressDefaultEnterAction) {
            event.stopPropagation();
            if (action) {
                action.bind(this)();
            }
        }
    }

    onEnterDown(event: any) {
        if (this.supressDefaultEnterAction) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    dismiss() {
        this.modalService.dismissAll();
    }
}
