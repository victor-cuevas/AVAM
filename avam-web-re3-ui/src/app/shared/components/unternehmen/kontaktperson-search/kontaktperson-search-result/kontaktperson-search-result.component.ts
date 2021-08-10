import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractKontaktpersonenResult } from '@shared/classes/abstract-kontaktpersonen-result';
import { KontaktpersonService, ToolboxService } from '@app/shared';
import { ActivatedRoute } from '@angular/router';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { filter, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { DmsService } from '@app/shared/services/dms.service';
import { FacadeService } from '@shared/services/facade.service';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';

@Component({
    selector: 'avam-kontaktperson-search-result',
    templateUrl: './kontaktperson-search-result.component.html'
})
export class KontaktpersonSearchResultComponent extends AbstractKontaktpersonenResult implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    resultsData: any;
    readonly stateKey = 'kontaktperson-search';
    searchDone = false;

    constructor(
        protected kontaktpersonService: KontaktpersonService,
        protected activatedRoute: ActivatedRoute,
        protected facadeService: FacadeService,
        protected dmsService: DmsService,
        private searchSession: SearchSessionStorageService
    ) {
        super(kontaktpersonService, activatedRoute, facadeService, dmsService);
    }

    ngOnInit() {
        super.ngOnInit();
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(
                filter(action => action.message.action === ToolboxActionEnum.PRINT),
                takeUntil(this.unsubscribe)
            )
            .subscribe(() => {
                this.kontaktpersonService.openBigModal(this.modalPrint);
            });
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getKontaktpersonenSearchConfig());
    }

    ngOnDestroy() {
        this.facadeService.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    onReset(): void {
        this.searchDone = false;
        this.resultsData = [];
        this.searchSession.restoreDefaultValues(this.stateKey);
    }
}
