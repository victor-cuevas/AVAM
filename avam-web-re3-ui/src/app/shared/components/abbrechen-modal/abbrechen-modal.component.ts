import { Component } from '@angular/core';
import { AbbrechenModalAction } from '@app/shared/classes/abbrechen-modal-action';
import { AbbrechenText, AbbrechenModalTexte } from '@app/shared/classes/abbrechen-modal-texts';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
    selector: 'app-abbrechen-modal',
    templateUrl: './abbrechen-modal.component.html',
    styleUrls: ['./abbrechen-modal.component.scss']
})
export class AbbrechenModalComponent {
    public text: AbbrechenModalText = AbbrechenModalTexte.getText(AbbrechenText.Default);
    private action: AbbrechenModalAction;

    constructor(private activeModal: NgbActiveModal) {}

    setModalText(modalText: AbbrechenModalText) {
        if (modalText) {
            this.text = modalText;
        }
    }

    setModalAction(action: AbbrechenModalAction) {
        if (action) {
            this.action = action;
        }
    }

    onOk() {
        this.action.onOk();
    }

    onCancel() {
        this.action.onCancel();
    }
}

export interface AbbrechenModalText {
    modalHeader;
    bodyHeader;
    bodyMessage;
    cancelButtonText;
    okButtonText;
}
