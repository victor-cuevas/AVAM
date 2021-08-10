import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { AvamGenericTablePrintComponent } from '@shared/components/avam-generic-table-print/avam-generic-table-print.component';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { HistorisierungComponent } from '@shared/components/historisierung/historisierung.component';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { GenericConfirmComponent } from '../components/generic-confirm/generic-confirm.component';

@Injectable({
    providedIn: 'root'
})
export class OpenModalFensterService {
    public subjectOpen = new Subject<any>();
    public subjectClose = new Subject<any>();
    private readonly deleteModalOptions: NgbModalOptions = { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' };
    private readonly modalOptions: NgbModalOptions = { windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' };
    private readonly basicModalOptions: NgbModalOptions = { ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' };

    constructor(private readonly modalService: NgbModal) {}

    openModalFenster(): void {
        this.subjectOpen.next();
    }

    getModalFensterToOpen(): Observable<any> {
        return this.subjectOpen.asObservable();
    }

    closeModalFenster(): void {
        this.subjectClose.next();
    }

    getModalFensterClosed(): Observable<any> {
        return this.subjectClose.asObservable();
    }

    openXLModal(modalPrint): NgbModalRef {
        return this.modalService.open(modalPrint, this.modalOptions);
    }

    openModal(modalPrint): NgbModalRef {
        return this.modalService.open(modalPrint, this.basicModalOptions);
    }

    openDeleteModal(): NgbModalRef {
        const modalRef = this.modalService.open(GenericConfirmComponent, this.deleteModalOptions);
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
        return modalRef;
    }

    deleteModal(deleteCallback: any): void {
        const modalRef = this.openDeleteModal();
        modalRef.result.then(result => {
            if (result) {
                deleteCallback();
            }
        });
        if (modalRef.componentInstance) {
            modalRef.componentInstance.titleLabel = 'i18n.common.delete';
            modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
            modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
            modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
        }
    }

    openPrintModal(modalPrint, dataSource): void {
        const modalRef = this.modalService.open(AvamGenericTablePrintComponent, this.modalOptions);
        modalRef.componentInstance.dataSource = dataSource;
        modalRef.componentInstance.content = modalPrint;
    }

    openHistoryModal(id: string, type: string, ref?: string): void {
        const modalRef = this.modalService.open(HistorisierungComponent, this.modalOptions);
        modalRef.componentInstance.id = id;
        modalRef.componentInstance.type = type;
        if (ref) {
            modalRef.componentInstance.ref = ref;
        }
    }

    openDmsCopyModalPlanung(context: DmsMetadatenContext, organisationsKuerzel: string, planungsJahr: number): void {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { backdrop: 'static' });
        modalRef.componentInstance.context = context;
        modalRef.componentInstance.organisationsKuerzel = organisationsKuerzel;
        modalRef.componentInstance.planungsJahr = planungsJahr;
    }

    openDmsCopyModal(context: DmsMetadatenContext, id: string, nr = ''): void {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { backdrop: 'static' });
        modalRef.componentInstance.context = context;
        modalRef.componentInstance.id = id;
        modalRef.componentInstance.nr = nr;
    }

    openInfoModal(message: string) {
        const modalRef = this.openModal(GenericConfirmComponent);
        modalRef.componentInstance.titleLabel = '';
        modalRef.componentInstance.promptLabel = message;
        modalRef.componentInstance.primaryButton = 'common.button.ok';
        modalRef.componentInstance.singleButtonCenter = true;
    }

    dismissAll(reason?: any): void {
        this.modalService.dismissAll(reason);
    }
}
