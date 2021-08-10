import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import PrintHelper from '@app/shared/helpers/print.helper';
import { StesModalNumber } from '@app/shared/enums/stes-modal-number.enum';

enum layoutState {
    hidden = 'hidden',
    visible = 'visible'
}
@Component({
    selector: 'avam-tree-table-print-modal',
    templateUrl: './avam-tree-table-print-modal.component.html',
    styleUrls: ['./avam-tree-table-print-modal.component.scss']
})
export class AvamTreeTablePrintModalComponent implements OnInit {
    modalNumber: StesModalNumber = StesModalNumber.DRUCKEN;
    masterLayout = null;
    currentModal = null;

    constructor(private readonly modalService: NgbModal) {
        this.masterLayout = document.querySelectorAll<HTMLElement>('or-column-layout')[0];
        this.modalService.dismissAll();
    }

    ngOnInit(): void {
        this.hideLayout();
        this.currentModal = this.modalService['_modalStack']['_modalRefs'][0];
        this.currentModal.result.then(
            () => {
                this.showLayout();
            },
            () => {
                this.showLayout();
            }
        );
    }

    hideLayout(): void {
        this.masterLayout.querySelector('core-tree-table').style.display = 'none';
        this.masterLayout.style.visibility = layoutState.hidden;
    }

    showLayout(): void {
        this.masterLayout.querySelector('core-tree-table').style.display = 'block';
        this.masterLayout.style.visibility = layoutState.visible;
    }

    close(): void {
        this.modalService.dismissAll();
        this.showLayout();
    }

    print(): void {
        PrintHelper.print();
        this.showLayout();
        this.close();
    }
}
