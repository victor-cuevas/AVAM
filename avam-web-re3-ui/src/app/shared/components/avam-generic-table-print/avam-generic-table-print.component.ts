import { Component, OnInit, Input, Optional, Output, EventEmitter, HostListener } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import PrintHelper from '@app/shared/helpers/print.helper';
import { StesModalNumber } from '@app/shared/enums/stes-modal-number.enum';

@Component({
    selector: 'avam-generic-table-print',
    templateUrl: './avam-generic-table-print.component.html',
    styleUrls: ['./avam-generic-table-print.component.scss']
})
export class AvamGenericTablePrintComponent implements OnInit {
    @Input('dataSource') dataSource: [];
    @Input('content') content: any;
    modalNumber: StesModalNumber = StesModalNumber.DRUCKEN;
    backgroundElements: any[] = [];
    currentModal: any;

    @Output() onClose: EventEmitter<any> = new EventEmitter();

    constructor(@Optional() public activePrintModal: NgbActiveModal, private readonly modalService: NgbModal) {
        Array.from(document.querySelectorAll<HTMLElement>('or-column-layout')).forEach(layout => {
            this.backgroundElements.push({ layout, initialDisplayStyle: layout.style.display });
        });
    }

    ngOnInit() {
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
        this.backgroundElements.forEach(element => (element.layout.style.display = 'none'));
    }

    showLayout(): void {
        this.backgroundElements.forEach(element => (element.layout.style.display = element.initialDisplayStyle));
    }

    close(): void {
        this.onClose.emit(true);
        this.showLayout();
        if (this.activePrintModal) {
            this.activePrintModal.close();
        } else {
            this.modalService.dismissAll();
        }
    }

    print(): void {
        PrintHelper.print();
        this.showLayout();
        this.close();
    }

    @HostListener('window:keydown', ['$event'])
    onKeydown(event): void {
        if (event.key === 'Escape' || event.key === 'Esc' || (event.keyCode && event.keyCode === 27)) {
            this.showLayout();
        }
    }
}
