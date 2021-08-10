import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AbbrechenModalComponent } from '../components/abbrechen-modal/abbrechen-modal.component';
import { AbbrechenModalActionCallback } from '../classes/abbrechen-modal-action-dismiss-only-current';
import { AbbrechenModalTexte, AbbrechenText } from '../classes/abbrechen-modal-texts';
import { FormGroup } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class ResetDialogService {
    constructor(private modalService: NgbModal) {}

    /**
     * checks provided form an resets if dirty
     *
     * @param myForm the form to check
     * @param callback the callback to be executed
     */
    resetIfDirty(myForm: FormGroup, callback: () => void) {
        if (!myForm.dirty) {
            return;
        }
        this.reset(callback);
    }

    reset(callback) {
        const modalRefAbbrechen = this.modalService.open(AbbrechenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRefAbbrechen.componentInstance.setModalAction(new AbbrechenModalActionCallback(modalRefAbbrechen));
        modalRefAbbrechen.componentInstance.setModalText(AbbrechenModalTexte.getText(AbbrechenText.Zuruecksetzen));
        modalRefAbbrechen.result.then(
            result => {
                callback();
            },
            error => {}
        );
    }
}
