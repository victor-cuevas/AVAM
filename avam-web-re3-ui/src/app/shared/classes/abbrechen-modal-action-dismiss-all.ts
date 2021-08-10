import { AbbrechenModalAction } from './abbrechen-modal-action';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';

export class AbbrechenModalActionDismissAll implements AbbrechenModalAction {
    constructor(private modalRef: NgbModalRef, private modalService: NgbModal) {}
    onOk(callbackOnOk?: () => void) {
        if (callbackOnOk) {
            callbackOnOk();
        }
        this.modalService.dismissAll();
    }

    onCancel(callbackOnClose?: () => void) {
        if (callbackOnClose) {
            callbackOnClose();
        }
        this.modalRef.dismiss();
    }
}
