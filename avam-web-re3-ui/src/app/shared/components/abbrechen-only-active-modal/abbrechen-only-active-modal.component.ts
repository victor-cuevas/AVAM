import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-abbrechen-only-active-modal',
    templateUrl: './abbrechen-only-active-modal.component.html',
    styleUrls: ['./abbrechen-only-active-modal.component.scss']
})
export class AbbrechenOnlyActiveModalComponent {
    constructor(public activeModal: NgbActiveModal) {}
}
