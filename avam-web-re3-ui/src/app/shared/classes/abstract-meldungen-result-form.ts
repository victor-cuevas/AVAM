import { NotificationService, Unsubscribable } from 'oblique-reactive';
import { Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { GekoMeldungService } from '@modules/geko/services/geko-meldung.service';
import { GekoMeldungRestService } from '@core/http/geko-meldung-rest.service';
import { GeschaeftMeldungDTO } from '@dtos/geschaeftMeldungDTO';
import { Observable, Subscription } from 'rxjs';
import { MeldungenTableComponent } from '@shared/components/meldungen-table/meldungen-table.component';
import { GenericConfirmComponent } from '@app/shared';
import { GekobereichCodeEnum } from '@modules/geko/utils/GekobereichCodeEnum';

type MarkFunction = (ids: number[]) => Observable<any>;

export interface GeschaeftMeldungRow extends GeschaeftMeldungDTO {
    checked?: boolean;
    allowOpen?: boolean;
    displayName?: string;
}

export abstract class AbstractMeldungenResultForm extends Unsubscribable implements OnInit, OnDestroy {
    static readonly MODAL_PRINT_OPTIONS: NgbModalOptions = { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' };
    @ViewChild('meldungenTable') meldungenTable: MeldungenTableComponent;
    @Input() geschaeftsbereichCode: GekobereichCodeEnum;
    resultsData: GeschaeftMeldungDTO[] = [];
    footerDisabled = true;
    private gekoMeldungServiceSub: Subscription;

    private rowToDelete: GeschaeftMeldungRow = null;

    constructor(
        protected modalService: NgbModal,
        protected gekoMeldungService: GekoMeldungService,
        protected gekoMeldungRestService: GekoMeldungRestService,
        protected readonly notificationService: NotificationService
    ) {
        super();
    }

    ngOnInit() {
        this.subscribeToData();
    }

    ngOnDestroy(): void {
        if (this.gekoMeldungServiceSub) {
            this.gekoMeldungServiceSub.unsubscribe();
        }
        this.gekoMeldungService.resetSearchParams();
        super.ngOnDestroy();
    }

    subscribeToData() {
        this.gekoMeldungServiceSub =
            this.gekoMeldungServiceSub ||
            this.gekoMeldungService.subject.subscribe((dtos: GeschaeftMeldungDTO[]) => {
                this.resultsData = dtos ? dtos : [];
                this.loadTableData();
            });
    }

    setChecksRestore(ids: number[]) {
        this.meldungenTable.idsToRestoreChecks = ids;
    }

    openModal(content) {
        this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
    }

    delete() {
        this.rowToDelete = null;
        this.openDeleteConfirmDialog();
    }

    private openDeleteConfirmDialog() {
        const modalRef: NgbModalRef = this.modalService.open(GenericConfirmComponent, { backdrop: 'static' });
        modalRef.result.then(
            shouldDelete => {
                if (shouldDelete) {
                    this.markDelete();
                }
            },
            () => {}
        );
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
        modalRef.componentInstance.supressDefaultEnterAction = true;
    }

    markDelete() {
        if (this.rowToDelete) {
            this.setChecksRestore(this.getSelectedIds().filter(i => i !== this.rowToDelete.meldungId));
            this.callMarkFunction(this.gekoMeldungRestService.markMeldungenDeleted.bind(this.gekoMeldungRestService), [this.rowToDelete.meldungId], true);
        } else {
            this.setChecksRestore(null);
            this.callMarkFunction(this.gekoMeldungRestService.markMeldungenDeleted.bind(this.gekoMeldungRestService), this.getSelectedIds(), true);
        }
    }

    markNotRead() {
        this.setChecksRestore(null);
        this.callMarkFunction(this.gekoMeldungRestService.markMeldungenNotRead.bind(this.gekoMeldungRestService), this.getSelectedIds());
    }

    markRead() {
        this.setChecksRestore(null);
        this.callMarkFunction(this.gekoMeldungRestService.markMeldungenRead.bind(this.gekoMeldungRestService), this.getSelectedIds());
    }

    callMarkFunction(restCall: MarkFunction, selectedIds: number[], showOKMsg = false, refresh = true) {
        this.gekoMeldungService.clearMessages();
        if (selectedIds.length > 0) {
            restCall(selectedIds).subscribe(result => {
                if (refresh) {
                    this.gekoMeldungService.refreshSearchResults();
                }
                if (showOKMsg && !result.warning) {
                    this.notificationService.success(result.data);
                }
            });
        }
    }

    onDeleteSingleRow(row: GeschaeftMeldungRow) {
        this.rowToDelete = row;
        this.openDeleteConfirmDialog();
    }

    openCallback(row: GeschaeftMeldungRow): void {
        const callback = row.callback;
        if (this.gekoMeldungService.callbackHelper.isCallable(callback)) {
            const navigationPath = this.gekoMeldungService.createNavigationPath(callback, this.geschaeftsbereichCode);
            if (navigationPath) {
                // BSP6 - mark the row as read on open
                this.callMarkFunction(this.gekoMeldungRestService.markMeldungenRead.bind(this.gekoMeldungRestService), [row.meldungId], false, false);
                row.gelesen = true;
                this.gekoMeldungService.navigate(navigationPath);
            }
        }
    }

    onCheck(checked: boolean) {
        this.footerDisabled = !checked;
    }

    abstract isNameIncluded(): boolean;

    abstract loadTableData();

    protected getName(meldung: GeschaeftMeldungDTO) {
        return this.gekoMeldungService.getName(meldung);
    }

    protected getZustandig(meldung: GeschaeftMeldungDTO): string {
        return this.gekoMeldungService.getZustandig(meldung);
    }

    private getSelectedIds(): number[] {
        const ids: number[] = [];
        this.meldungenTable.selectedRows.forEach(row => {
            if (row['meldungId']) {
                ids.push(row.meldungId);
            }
        });
        return ids;
    }
}
