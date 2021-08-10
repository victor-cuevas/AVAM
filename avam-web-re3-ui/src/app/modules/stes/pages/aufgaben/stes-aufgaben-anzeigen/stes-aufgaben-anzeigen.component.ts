import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { buildStesPath } from '@shared/services/build-route-path.function';
import { StesAufgabenPaths } from '@shared/enums/stes-navigation-paths.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractAufgabenResult } from '@shared/classes/abstract-aufgaben-result';
import { ToolboxService } from '@app/shared';
import { GekoAufgabenService } from '@shared/services/geko-aufgaben.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { AvamStesInfoBarService } from '@shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { takeUntil } from 'rxjs/operators';
import { GeKoAufgabeDTO } from '@dtos/geKoAufgabeDTO';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { Permissions } from '@shared/enums/permissions.enum';
import { AufgabeTableRow } from '@shared/components/aufgaben-table/aufgaben-table.component';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-stes-aufgaben-anzeigen',
    templateUrl: './stes-aufgaben-anzeigen.component.html',
    providers: [SearchSessionStorageService]
})
export class StesAufgabenAnzeigenComponent extends AbstractAufgabenResult implements OnInit, AfterViewInit, OnDestroy {
    resultSpinnerChannel = 'aufgabenResults';
    stesId: string = null;
    public permissions: typeof Permissions = Permissions;
    readonly toolboxChannel = 'stesAufgabenAnzeigen';
    readonly toolboxId = 'stesAufgaben';
    stateKey = 'aufgaben-anzeigen';

    constructor(
        protected router: Router,
        protected route: ActivatedRoute,
        protected gekoAufgabenService: GekoAufgabenService,
        protected stesInfobarService: AvamStesInfoBarService,
        protected stateService: SearchSessionStorageService,
        protected facade: FacadeService
    ) {
        super(gekoAufgabenService, facade);
    }

    ngOnInit(): void {
        this.setSubscriptions();
        this.configureToolbox(ToolboxConfig.getStesAufgabenAnzeigenConfig(), this.stateKey, ToolboxDataHelper.createForStellensuchende(this.stesId));
        this.stesInfobarService.sendDataToInfobar({ title: 'geko.pfad.aufgaben.uebersicht' });
    }

    ngAfterViewInit(): void {
        this.subscribeToData();
        this.loadDataFromService();
    }

    ngOnDestroy(): void {
        if (this.gekoAufgabenService.stesCache) {
            this.gekoAufgabenService.stesCache.list = this.aufgabenTable.tableData;
        }
        super.ngOnDestroy();
    }

    aufgabeErfassen(): void {
        this.router.navigate([buildStesPath(this.stesId, StesAufgabenPaths.AUFGABEN_ERFASSEN)]);
    }

    openAufgabe(row: AufgabeTableRow): void {
        ToolboxService.GESPEICHERTEN_LISTE_URL = this.router.url;
        this.gekoAufgabenService.navigateToStesAufgabenBearbeiten(String(row.stesId), row.aufgabeId);
    }

    setSubscriptions(): void {
        this.route.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.gekoAufgabenService.aufgabenSubject.pipe(takeUntil(this.unsubscribe)).subscribe((dtos: GeKoAufgabeDTO[]) => {
            this.stesInfobarService.sendDataToInfobar({ title: 'geko.pfad.aufgaben.uebersicht', tableCount: dtos.length });
        });

        this.gekoAufgabenService.stesCache = this.stateService.restoreStateByKey(this.stateKey);
    }

    loadDataFromService(): void {
        this.gekoAufgabenService.searchBy(this.stesId, this.resultSpinnerChannel);
    }
}
