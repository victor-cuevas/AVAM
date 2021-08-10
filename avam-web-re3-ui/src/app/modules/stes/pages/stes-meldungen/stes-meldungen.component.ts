import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ToolboxService } from '@app/shared';
import { Unsubscribable } from 'oblique-reactive';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { Subscription } from 'rxjs';
import { AvamStesInfoBarService } from '@shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { ActivatedRoute, Router } from '@angular/router';
import { GekoMeldungService } from '@modules/geko/services/geko-meldung.service';
import { StesMeldungenResultComponent } from '@stes/pages/stes-meldungen/stes-meldungen-result/stes-meldungen-result.component';
import { GeschaeftMeldungDTO } from '@shared/models/dtos-generated/geschaeftMeldungDTO';
import { takeUntil } from 'rxjs/operators';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { GekobereichCodeEnum } from '@modules/geko/utils/GekobereichCodeEnum';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-stes-meldungen',
    templateUrl: './stes-meldungen.component.html',
    styleUrls: ['./stes-meldungen.component.scss']
})
export class StesMeldungenComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('stesMeldungenResult') stesMeldungenResult: StesMeldungenResultComponent;
    geschaeftsbereichCode: typeof GekobereichCodeEnum = GekobereichCodeEnum;
    stateKey = 'meldungen-show';

    stesId: string = null;
    observerClickActionSub: Subscription;

    private meldungenToolboxId = 'meldungen';
    private readonly toolboxChannel = 'stesMeldung';
    private readonly stesMeldungResultChannel = 'stesMeldungResult';
    private counterSubscription: Subscription;
    private langChangeSubscription: Subscription;
    private reloadSubscription: Subscription;

    constructor(
        private stesInfobarService: AvamStesInfoBarService,
        private route: ActivatedRoute,
        private router: Router,
        private gekoMeldungService: GekoMeldungService,
        private facade: FacadeService
    ) {
        super();
        ToolboxService.CHANNEL = this.toolboxChannel;
    }

    ngOnInit(): void {
        this.stesInfobarService.sendDataToInfobar({ title: 'geko.subnavmenuitem.meldungen' });
        this.configureToolbox();
        this.setSubsciptions();
        this.gekoMeldungService.stesCache = this.route.snapshot.data.cache;
        if (!this.gekoMeldungService.stesCache) {
            sessionStorage.removeItem(this.stateKey);
        }
    }

    ngAfterViewInit(): void {
        this.loadData();
    }

    ngOnDestroy(): void {
        this.facade.toolboxService.sendConfiguration([]);
        if (this.observerClickActionSub) {
            this.observerClickActionSub.unsubscribe();
        }
        if (this.counterSubscription) {
            this.counterSubscription.unsubscribe();
        }
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
        if (this.reloadSubscription) {
            this.reloadSubscription.unsubscribe();
        }
        ToolboxService.GESPEICHERTEN_LISTE_URL = `/stes/details/${this.stesId}/meldungen`;
        super.ngOnDestroy();
    }

    private setSubsciptions(): void {
        this.subscribeToLangChange();
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.observerClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL, this.observerClickActionSub).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.gekoMeldungService.storePrintState(this.stateKey);
                this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.stesMeldungenResult.resultsData);
            }
        });

        this.counterSubscription = this.gekoMeldungService.subject.subscribe((tableData: GeschaeftMeldungDTO[]) => {
            this.sendDataToInfobar(tableData ? tableData.length : 0);
        });

        this.reloadSubscription = ReloadHelper.enable(this.router, this.unsubscribe, () => {
            sessionStorage.removeItem(this.stateKey);
            this.loadDataFromService();
        });
    }

    private sendDataToInfobar(tableCount: number): void {
        this.stesInfobarService.sendDataToInfobar({ title: 'geko.subnavmenuitem.meldungen', tableCount });
    }

    private configureToolbox(): void {
        this.facade.toolboxService.sendConfiguration(ToolboxConfig.getStesMeldungConfig(), this.meldungenToolboxId, ToolboxDataHelper.createForStellensuchende(this.stesId));
    }

    private loadDataFromService(): void {
        this.gekoMeldungService.callGetStesMeldungen(Number(this.stesId), this.stesMeldungResultChannel);
    }

    private subscribeToLangChange(): void {
        this.langChangeSubscription = this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.loadDataFromService();
        });
    }

    private loadData(): void {
        if (this.gekoMeldungService.stesCache) {
            this.facade.spinnerService.activate(this.stesMeldungResultChannel);
            this.gekoMeldungService.responseDTOs = this.gekoMeldungService.stesCache.list;
            this.gekoMeldungService.searchDTOParam = this.gekoMeldungService.stesCache.searchDto;
            this.gekoMeldungService.form = this.gekoMeldungService.stesCache.form;
            this.facade.spinnerService.deactivate(this.stesMeldungResultChannel);
        } else {
            this.loadDataFromService();
        }
    }
}
