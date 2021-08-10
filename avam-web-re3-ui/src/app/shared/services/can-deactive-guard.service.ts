import { AbbrechenModalComponent } from './../components/abbrechen-modal/abbrechen-modal.component';
import { StesComponentInteractionService } from 'src/app/shared/services/stes-component-interaction.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CanDeactivate } from '@angular/router';
import { AbbrechenModalActionNavigation } from '../classes/abbrechen-modal-action-navigation';
import { JwtDTO } from '@shared/models/dtos-generated/jwtDTO';

export interface DeactivationGuarded {
    canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<DeactivationGuarded> {
    constructor(private modalService: NgbModal, private interactionService: StesComponentInteractionService) {}

    canDeactivate(component: DeactivationGuarded): any {
        const user: JwtDTO = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) {
            // NOT logged in so return true
            return true;
        }
        if (component.canDeactivate()) {
            const modalRef = this.modalService.open(AbbrechenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
            modalRef.componentInstance.setModalAction(new AbbrechenModalActionNavigation(this.interactionService, modalRef.componentInstance.activeModal));
            return this.interactionService.navigateAwayAbbrechen.asObservable();
        }
        return true;
    }
}
