import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ToolboxService } from '@app/shared';
import { Router } from '@angular/router';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { filter, takeUntil } from 'rxjs/operators';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { VerlaufGeKoStesDTO } from '@dtos/verlaufGeKoStesDTO';
import { GekoStesService } from '@shared/services/geko-stes.service';
import { GeschaefteTableRow } from '@shared/components/geschaefte-table/geschaefte-table.component';
import { CallbackDTO } from '@dtos/callbackDTO';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';

@Component({
    selector: 'avam-geko-stes-search-result',
    templateUrl: './stes-search-result.component.html'
})
export class StesSearchResultComponent extends Unsubscribable implements OnInit, OnDestroy {
    static readonly STATE_KEY = 'avam-geko-stes-table';
    @ViewChild('modalPrint') modalPrint: ElementRef;
    results: VerlaufGeKoStesDTO[] = [];
    rows: GeschaefteTableRow[] = [];
    readonly stateKey = StesSearchResultComponent.STATE_KEY;
    readonly stateKeyPrint = 'avam-geko-stes-table.print';
    private readonly toolboxId = 'verlauefe';
    private readonly toolboxChannel = 'gekoStesSearchResult';
    private readonly gekoStesResultsChannel = 'gekoStesResults';
    searchDone = false;

    constructor(
        private router: Router,
        private toolboxService: ToolboxService,
        private dbTranslateService: DbTranslateService,
        private gekoStesService: GekoStesService,
        private spinnerService: SpinnerService,
        private searchSession: SearchSessionStorageService
    ) {
        super();
        ToolboxService.CHANNEL = this.toolboxChannel;
    }

    ngOnInit(): void {
        this.subscribeToLangChange();
        this.configureToolbox();
        this.subscribeToData();
    }

    ngOnDestroy(): void {
        this.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    onLangChange(): void {
        this.update(this.results);
    }

    onOpen(callback: CallbackDTO): void {
        ToolboxService.GESPEICHERTEN_LISTE_URL = this.router.url;
        if (this.gekoStesService.callbackHelper.isCallable(callback)) {
            const navigationPath = this.gekoStesService.createNavigationPath(callback);
            this.gekoStesService.navigate(navigationPath);
        }
    }

    removeFromStorage(): void {
        this.gekoStesService.removeFromStorage(this.stateKey, this.stateKeyPrint);
    }

    reset(): void {
        this.searchDone = false;
        this.searchSession.restoreDefaultValues(this.stateKey);
    }

    private configureToolbox(): void {
        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.gekoStesService.openPrintModal(this.modalPrint, this.stateKey, this.stateKeyPrint, this.rows);
            });
        this.toolboxService.sendConfiguration(ToolboxConfig.getGekoStesSearchConfig(), this.toolboxId);
    }

    private update(results: VerlaufGeKoStesDTO[]): void {
        this.rows = results
            ? results.map((dto: VerlaufGeKoStesDTO) => {
                  return {
                      id: String(dto.verlaufId),
                      exclamationMark: dto.abgelaufen,
                      erfasstAm: dto.erfasstAm,
                      nameVornameOrt: this.dbTranslateService.translate(dto, 'stesInfo'),
                      geschaeftsart: this.dbTranslateService.translate(dto, 'geschaeftsartText'),
                      sachstand: this.dbTranslateService.translate(dto, 'sachstandText'),
                      termin: dto.geschaeftstermin,
                      callback: dto.callback
                  } as GeschaefteTableRow;
              })
            : [];
    }

    private subscribeToLangChange(): void {
        this.dbTranslateService
            .getEventEmitter()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.spinnerService.activate(this.gekoStesResultsChannel);
                this.onLangChange();
                this.spinnerService.deactivate(this.gekoStesResultsChannel);
            });
    }

    private subscribeToData(): void {
        this.gekoStesService.searchGeschaeftStesSubject.pipe(takeUntil(this.unsubscribe)).subscribe((response: VerlaufGeKoStesDTO[]) => {
            this.results = response;
            this.update(response);
            this.searchDone = true;
        });
    }
}
