import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { StesInfotagModalComponent, StesInfotagDetailsModalComponent } from '../components';

@Injectable()
export class StesInfotagBuchenService {
    private static readonly MODAL_OPTIONS: NgbModalOptions = {
        ariaLabelledBy: 'modal-basic-title',
        windowClass: 'avam-modal-xl',
        backdrop: 'static',
        centered: true
    } as NgbModalOptions;

    constructor(private modalService: NgbModal) {}

    public infotagBuchen(stesId: string): void {
        const instance: StesInfotagModalComponent = this.openModal<StesInfotagModalComponent>(StesInfotagModalComponent);
        instance.stesId = stesId;
    }

    public infotagZeigen(stesId: string, dfeId: string, title: string): void {
        const instance: StesInfotagDetailsModalComponent = this.openModal<StesInfotagDetailsModalComponent>(StesInfotagDetailsModalComponent);
        instance.stesId = stesId;
        instance.dfeId = dfeId;
        instance.ueberschrift = title;
    }

    private openModal<T>(content: any): T {
        return this.modalService.open(content, StesInfotagBuchenService.MODAL_OPTIONS).componentInstance as T;
    }
}
