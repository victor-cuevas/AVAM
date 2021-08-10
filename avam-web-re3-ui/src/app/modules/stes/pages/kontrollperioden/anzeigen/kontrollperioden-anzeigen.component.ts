import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AvamStesInfoBarService } from '@shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { StesKontrollperioden } from '@shared/enums/stes-navigation-paths.enum';
import { Permissions } from '@shared/enums/permissions.enum';
import { KontrollperiodenAnzeigenTableComponent } from '@stes/pages/kontrollperioden/anzeigen/kontrollperioden-anzeigen-table/kontrollperioden-anzeigen-table.component';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-kontrollperioden-anzeigen',
    templateUrl: './kontrollperioden-anzeigen.component.html',
    styleUrls: ['./kontrollperioden-anzeigen.component.scss']
})
export class KontrollperiodenAnzeigenComponent implements OnInit, OnDestroy, AfterViewInit {
    static stesKontrollperiodenChannel = 'kontrollperioden';
    @ViewChild('kontrollperiodenAnzeigenTable') kontrollperiodenAnzeigenTable: KontrollperiodenAnzeigenTableComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    kontrollperioden: any;
    kontrollperiodenToolboxId: 'kontrollperioden-anzeigen';
    stesId: string;

    permissions: typeof Permissions = Permissions;

    private unsubscribe$ = new Subject();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private stesInfobarService: AvamStesInfoBarService,
        private dataRestService: StesDataRestService,
        private facade: FacadeService
    ) {
        this.unsubscribe$ = new Subject();
        ToolboxService.CHANNEL = KontrollperiodenAnzeigenComponent.stesKontrollperiodenChannel;
    }

    public ngAfterViewInit() {
        this.facade.spinnerService.activate(KontrollperiodenAnzeigenComponent.stesKontrollperiodenChannel);
    }

    public ngOnInit() {
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.kontrollperioden.anzeigen' });
        this.facade.navigationService.showNavigationTreeRoute(StesKontrollperioden.KONTROLLPERIODEN);
        this.configureToolbox();
        this.facade.fehlermeldungenService.closeMessage();
        this.createSubscriptions();
        this.getData();
    }

    public ngOnDestroy() {
        this.facade.toolboxService.sendConfiguration([]);
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public kontrollperiodeErfassen() {
        this.router.navigate([`stes/details/${this.stesId}/kontrollperioden/erfassen`]);
    }

    public onButtonClick(row) {
        this.router.navigate([`stes/details/${this.stesId}/kontrollperioden/bearbeiten`], {
            queryParams: { kontrollperiodeId: row.kontrollperiodeId }
        });
    }

    private configureToolbox(): void {
        this.facade.toolboxService.sendConfiguration(
            [
                new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)
            ],
            this.kontrollperiodenToolboxId,
            ToolboxDataHelper.createForStellensuchende(this.stesId)
        );
    }

    private createSubscriptions() {
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            if (params['stesId']) {
                this.stesId = params['stesId'];
            }
        });
        this.facade.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    this.openPrintModal();
                }
            });
        this.facade.dbTranslateService
            .getEventEmitter()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                this.kontrollperiodenAnzeigenTable.setData(this.kontrollperioden.data);
            });
    }

    private openPrintModal() {
        this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.kontrollperiodenAnzeigenTable.dataSource);
    }

    private getData() {
        this.dataRestService
            .getKontrollperioden(this.stesId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                response => {
                    this.kontrollperioden = response;
                    this.updateDataLengthHeader(response.data.length);
                    this.kontrollperiodenAnzeigenTable.setData(response.data);
                    this.facade.spinnerService.deactivate(KontrollperiodenAnzeigenComponent.stesKontrollperiodenChannel);
                },
                () => {
                    this.facade.spinnerService.deactivate(KontrollperiodenAnzeigenComponent.stesKontrollperiodenChannel);
                }
            );
    }

    private updateDataLengthHeader(numItems: number) {
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.kontrollperioden.anzeigen', tableCount: numItems });
    }
}
