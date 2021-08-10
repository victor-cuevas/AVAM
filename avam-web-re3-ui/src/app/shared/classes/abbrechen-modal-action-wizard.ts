import { StesComponentInteractionService } from '../services/stes-component-interaction.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AbbrechenModalAction } from './abbrechen-modal-action';

export class AbbrechenModalActionWizard implements AbbrechenModalAction {
    constructor(private interactionService: StesComponentInteractionService, private modalService: NgbModal) {}

    onOk() {
        this.interactionService.navigateAwayStep.next(true);
        this.modalService.dismissAll();
    }

    onCancel() {
        this.interactionService.navigateAwayStep.next(false);
        this.modalService.dismissAll();
    }
}
