import { AbbrechenModalAction } from './abbrechen-modal-action';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

export class AbbrechenModalActionCallback implements AbbrechenModalAction {
    constructor(private modalRef: NgbModalRef) {}
    onOk(callbackOnOk?: () => void) {
        if (callbackOnOk) {
            callbackOnOk();
        }
        this.modalRef.close();
    }

    onCancel(callbackOnClose?: () => void) {
        if (callbackOnClose) {
            callbackOnClose();
        }
        this.modalRef.dismiss();
    }
}
