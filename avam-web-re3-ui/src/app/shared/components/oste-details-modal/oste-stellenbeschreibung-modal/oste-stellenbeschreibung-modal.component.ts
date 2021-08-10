import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'avam-oste-stellenbeschreibung-modal',
    templateUrl: './oste-stellenbeschreibung-modal.component.html',
    styleUrls: ['./oste-stellenbeschreibung-modal.component.scss']
})
export class OsteStellenbeschreibungModalComponent implements OnInit {
    headerKey: string;
    text: string;

    constructor(private activeModal: NgbActiveModal) {}

    ngOnInit() {}

    close() {
        this.activeModal.close();
    }
}
