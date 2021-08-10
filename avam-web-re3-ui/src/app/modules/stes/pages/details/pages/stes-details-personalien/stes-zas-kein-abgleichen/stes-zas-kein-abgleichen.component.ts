import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';

@Component({
    selector: 'app-stes-zas-kein-abgleichen',
    templateUrl: './stes-zas-kein-abgleichen.component.html'
})
export class StesZasKeinAbgleichenComponent implements OnInit {
    constructor(private readonly modalService: NgbModal) {}

    ngOnInit(): void {
        /**/
    }

    getFormNr(): string {
        return StesFormNumberEnum.ZAS_ABGLEICH;
    }

    close(): void {
        this.modalService.dismissAll();
    }
}
