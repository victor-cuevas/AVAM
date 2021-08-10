import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ToolboxActionEnum, ToolboxService } from '@shared/services/toolbox.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { GekoMeldungService } from '@modules/geko/services/geko-meldung.service';
import { SortEvent } from '@shared/directives/table.sortable.header.directive';
import { NotificationService } from 'oblique-reactive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { filter, takeUntil } from 'rxjs/operators';
import { GekoMeldungRestService } from '@core/http/geko-meldung-rest.service';
import { AbstractMeldungenResultForm, GeschaeftMeldungRow } from '@shared/classes/abstract-meldungen-result-form';
import { Router } from '@angular/router';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';

@Component({
    selector: 'avam-geko-meldungen-search-result',
    templateUrl: './geko-meldungen-search-result.component.html'
})
export class GekoMeldungenSearchResultComponent extends AbstractMeldungenResultForm implements OnInit, OnDestroy {
    static readonly STATE_KEY = 'meldungen-search-table-state-key';
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @Input() stateKey: string;
    searchDone = false;
    private readonly toolboxChannel = 'gekoMeldungSearchResult';

    constructor(
        private router: Router,
        private toolboxService: ToolboxService,
        protected modalService: NgbModal,
        protected gekoMeldungService: GekoMeldungService,
        protected gekoMeldungRestService: GekoMeldungRestService,
        protected readonly notificationService: NotificationService,
        private searchSession: SearchSessionStorageService
    ) {
        super(modalService, gekoMeldungService, gekoMeldungRestService, notificationService);
        ToolboxService.CHANNEL = this.toolboxChannel;
    }

    ngOnInit() {
        super.ngOnInit();
        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.gekoMeldungService.storePrintState(this.stateKey);
                this.modalService.open(this.modalPrint, GekoMeldungenSearchResultComponent.MODAL_PRINT_OPTIONS);
            });
        this.toolboxService.sendConfiguration(ToolboxConfig.getGekoMeldungenSearchConfig());
    }

    ngOnDestroy(): void {
        this.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    isNameIncluded(): boolean {
        return true;
    }

    getSort(): SortEvent {
        return this.gekoMeldungService.sortEvent;
    }

    loadTableData() {
        this.searchDone = true;
    }

    openCallback(row: GeschaeftMeldungRow) {
        ToolboxService.GESPEICHERTEN_LISTE_URL = this.router.url;
        super.openCallback(row);
    }
    reset(): void {
        this.searchSession.restoreDefaultValues(this.stateKey);
        this.searchDone = false;
    }
}
