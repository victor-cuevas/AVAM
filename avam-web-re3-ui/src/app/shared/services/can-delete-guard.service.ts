import { AbbrechenModalComponent } from '../components/abbrechen-modal/abbrechen-modal.component';
import { StesComponentInteractionService } from 'src/app/shared/services/stes-component-interaction.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CanDeactivate } from '@angular/router';
import { AbbrechenModalActionCallback } from '../classes/abbrechen-modal-action-dismiss-only-current';

export interface DeleteGuarded {
    shouldDelete: () => Observable<boolean> | Promise<boolean> | boolean;
    delete: () => Observable<boolean>;
}

@Injectable()
export class CanDeleteGuard implements CanDeactivate<DeleteGuarded> {
    constructor(private modalService: NgbModal, private interactionService: StesComponentInteractionService) {}

    canDeactivate(component: DeleteGuarded): any {
        if (component.shouldDelete()) {
            const modalRef = this.modalService.open(AbbrechenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
            modalRef.componentInstance.setModalAction(new AbbrechenModalActionCallback(modalRef));
            modalRef.result.then(
                () => {
                    component.delete().subscribe(() => {
                        this.interactionService.navigateAwayAbbrechen.next(true);
                    });
                },
                () => {
                    this.interactionService.navigateAwayAbbrechen.next(false);
                }
            );
            return this.interactionService.navigateAwayAbbrechen.asObservable();
        } else {
            return true;
        }
    }
}
