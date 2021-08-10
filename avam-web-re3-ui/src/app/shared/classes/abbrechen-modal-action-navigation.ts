import { StesComponentInteractionService } from '../services/stes-component-interaction.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AbbrechenModalAction } from './abbrechen-modal-action';

export class AbbrechenModalActionNavigation implements AbbrechenModalAction {
    constructor(private interactionService: StesComponentInteractionService, private activeModal: NgbActiveModal) {}

    onOk() {
        this.interactionService.navigateAwayAbbrechen.next(true);

        this.activeModal.close();
    }

    onCancel() {
        this.interactionService.navigateAwayAbbrechen.next(false);

        this.activeModal.close();
    }
}
