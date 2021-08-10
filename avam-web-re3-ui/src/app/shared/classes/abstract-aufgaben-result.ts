import { Unsubscribable } from 'oblique-reactive';
import { ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GekoAufgabenService } from '@shared/services/geko-aufgaben.service';
import { GeKoAufgabeDTO } from '@dtos/geKoAufgabeDTO';
import { ToolboxService } from '@app/shared';
import { filter, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum, ToolboxConfiguration } from '@shared/services/toolbox.service';
import { AufgabenTableComponent, AufgabeTableRow } from '@shared/components/aufgaben-table/aufgaben-table.component';
import { FacadeService } from '@shared/services/facade.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

export abstract class AbstractAufgabenResult extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('aufgabenTable') aufgabenTable: AufgabenTableComponent;

    resultsData: GeKoAufgabeDTO[] = [];
    toDeleteAufgabenIds: number[] = [];
    aufgabeLoeschenDisabled: boolean;
    toolboxChannel: string;
    toolboxId: string;
    searchDone = false;

    constructor(protected gekoAufgabenService: GekoAufgabenService, protected facade: FacadeService) {
        super();
        ToolboxService.CHANNEL = this.toolboxChannel;
    }

    ngOnInit(): void {
        this.subscribeToData();
    }

    ngOnDestroy(): void {
        this.facade.toolboxService.resetConfiguration();
        this.gekoAufgabenService.reset();
        super.ngOnDestroy();
    }

    onDeleteButton(): void {
        this.toDeleteAufgabenIds = [];
        this.toDeleteAufgabenIds = this.getSelectedIds();
        this.openDeletePromptModal();
    }

    delete(): void {
        this.gekoAufgabenService.clearMessages();
        const ids = this.getSelectedIds().filter(id => !this.toDeleteAufgabenIds.find(toDeleteId => toDeleteId === id));
        this.setChecksRestore(ids);
        this.gekoAufgabenService
            .delete(this.toDeleteAufgabenIds)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(result => {
                this.refreshResults();
                if (!result.warning) {
                    this.gekoAufgabenService.success(result.data);
                }
            });
    }

    refreshResults(): void {
        this.gekoAufgabenService.refreshResults();
    }

    abstract openAufgabe(row: AufgabeTableRow): void;

    configureToolbox(toolboxConfigs: ToolboxConfiguration[], stateKey: string, toolBoxData?: any): void {
        this.facade.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.gekoAufgabenService.openBig(this.modalPrint);
                this.gekoAufgabenService.storePrintState(stateKey);
            });
        this.facade.toolboxService.sendConfiguration(toolboxConfigs, this.toolboxId, toolBoxData);
    }

    onCheck(checked: boolean) {
        this.aufgabeLoeschenDisabled = !checked && this.getSelectedIds().length === 0;
    }

    onDeleteSingleRow(row: AufgabeTableRow) {
        this.toDeleteAufgabenIds = [];
        this.toDeleteAufgabenIds.push(row.aufgabeId);

        this.openDeletePromptModal();
    }

    openDeletePromptModal() {
        const modalRef: NgbModalRef = this.facade.openModalFensterService.openDeleteModal();
        modalRef.result.then(
            shouldDelete => {
                if (shouldDelete) {
                    this.delete();
                }
            },
            () => {}
        );
        modalRef.componentInstance.supressDefaultEnterAction = true;
    }

    setChecksRestore(ids: number[]) {
        this.aufgabenTable.idsToRestoreChecks = ids;
    }

    protected subscribeToData(): void {
        this.gekoAufgabenService.aufgabenSubject.pipe(takeUntil(this.unsubscribe)).subscribe((dtos: GeKoAufgabeDTO[]) => {
            this.resultsData = dtos;
            this.searchDone = true;
        });
    }

    protected getSelectedIds(): number[] {
        const ids: number[] = [];
        if (this.aufgabenTable) {
            this.aufgabenTable.selectedRows.forEach(row => {
                if (row['aufgabeId']) {
                    ids.push(row.aufgabeId);
                }
            });
        }
        return ids;
    }
}
