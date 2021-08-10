import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import { AmmAdministrationRestService } from '@app/modules/amm/administration/services/amm-administration-rest.service';
import { ToolboxService } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { ReloadHelper } from '@app/shared/helpers/reload.helper';
import { RahmenvertragDTO } from '@app/shared/models/dtos-generated/rahmenvertragDTO';
import { RahmenvertragSuchenParamDTO } from '@app/shared/models/dtos-generated/rahmenvertragSuchenParamDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { Unsubscribable } from 'oblique-reactive';
import { forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RahmenvertragSuchenFormComponent, RahmenvertragSuchenTableComponent } from '../../components';

@Component({
    selector: 'avam-rahmenvertrag-suchen',
    templateUrl: './rahmenvertrag-suchen.component.html',
    styleUrls: ['./rahmenvertrag-suchen.component.scss']
})
export class RahmenvertragSuchenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    static readonly CHANNEL_STATE_KEY = 'rahmenvertrag-search-channel';
    @ViewChild('suchenFormComponent') suchenFormComponent: RahmenvertragSuchenFormComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    rahmenvertragData: any;
    dataSource = [];
    permissions: typeof Permissions = Permissions;
    lastUpdate: RahmenvertragDTO[];

    constructor(
        private facade: FacadeService,
        private stesDataRestService: StesDataRestService,
        private vertraegeService: VertraegeRestService,
        private ammHelper: AmmHelper,
        private searchSession: SearchSessionStorageService,
        private infopanelService: AmmInfopanelService,
        private administrationRestService: AmmAdministrationRestService,
        private router: Router
    ) {
        super();
    }

    ngOnInit() {
        this.setupInfobar();
        this.configureToolbox();
        this.subscribeToToolbox();
        this.subscribeToLangChange();
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    ngAfterViewInit(): void {
        this.getData();
    }

    subscribeToLangChange() {
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.facade.fehlermeldungenService.closeMessage();
            this.dataSource = [...this.lastUpdate]
                .sort((v1, v2) => (v1.rahmenvertragNr > v2.rahmenvertragNr ? 1 : v1.rahmenvertragNr < v2.rahmenvertragNr ? -1 : 0))
                .map(el => this.createRow(el));
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);
        const gueltigVon = this.suchenFormComponent.handler.mapToDTO().gueltigVon || new Date();

        forkJoin([
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.VIERAUGENSTATUS),
            this.stesDataRestService.getFixedCode(DomainEnum.YES_NO_OPTIONS),
            this.administrationRestService.getGesetzlicheMassnahmentypListeOhneSpez(gueltigVon)
        ]).subscribe(
            ([statusOptionsResponse, gueltigOptionsResponse, massnahmeOptionsResponse]) => {
                const state = this.searchSession.restoreStateByKey(this.CHANNEL_STATE_KEY);

                this.rahmenvertragData = { statusOptions: statusOptionsResponse, gueltigOptions: gueltigOptionsResponse, massnahmeOptions: massnahmeOptionsResponse.data };

                if (state) {
                    this.rahmenvertragData.state = state.fields;
                    this.searchRestCall(state.fields);
                }

                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            },
            () => {
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            }
        );
    }

    reset() {
        this.suchenFormComponent.reset();
        this.facade.fehlermeldungenService.closeMessage();
        this.dataSource = [];
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.searchSession.clearStorageByKey(this.CHANNEL_STATE_KEY);
        this.searchSession.restoreDefaultValues(RahmenvertragSuchenTableComponent.STATE_KEY);
    }

    onItemSelected(event) {
        this.router.navigate([`/amm/anbieter/${event.unternehmenId}/rahmenvertraege/bearbeiten`], {
            queryParams: { rahmenvertragId: event.rahmenvertragId }
        });
    }

    search() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.suchenFormComponent.formGroup.valid) {
            const suchenParam = this.suchenFormComponent.mapToDTO();
            this.searchSession.storeFieldsByKey(this.CHANNEL_STATE_KEY, suchenParam);
            this.searchRestCall(suchenParam);
            this.searchSession.resetSelectedTableRow(RahmenvertragSuchenTableComponent.STATE_KEY);
        } else {
            this.suchenFormComponent.ngForm.onSubmit(undefined);
            this.facade.openModalFensterService.openInfoModal('stes.error.bearbeiten.pflichtfelder');
        }
    }

    searchRestCall(rahmenvertragSuchenParam: RahmenvertragSuchenParamDTO) {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);
        this.vertraegeService.searchRahmenvertraege(rahmenvertragSuchenParam).subscribe(
            response => {
                this.lastUpdate = response.data;
                this.dataSource = [...response.data]
                    .sort((v1, v2) => (v1.rahmenvertragNr > v2.rahmenvertragNr ? 1 : v1.rahmenvertragNr < v2.rahmenvertragNr ? -1 : 0))
                    .map(el => this.createRow(el));

                this.infopanelService.updateInformation({ tableCount: this.dataSource ? this.dataSource.length : 0 });

                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            },
            () => {
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            }
        );
    }

    createRow(rahmenvertrag: RahmenvertragDTO) {
        const anbieter = rahmenvertrag.anbieterObject;

        return {
            rahmenvertragNr: rahmenvertrag.rahmenvertragNr,
            unternehmenId: rahmenvertrag.anbieterObject.unternehmenId,
            rahmenvertragId: rahmenvertrag.rahmenvertragId,
            titel: rahmenvertrag.titel,
            gueltigVon: rahmenvertrag.gueltigVon,
            gueltigBis: rahmenvertrag.gueltigBis,
            gueltig: rahmenvertrag.gueltigB ? this.facade.translateService.instant('common.label.ja') : this.facade.translateService.instant('common.label.nein'),
            status: rahmenvertrag.statusObject ? this.facade.dbTranslateService.translateWithOrder(rahmenvertrag.statusObject, 'text') : '',
            anbieterName:
                anbieter && anbieter.unternehmen && anbieter.unternehmen.unternehmenId !== -1
                    ? this.ammHelper.concatenateUnternehmensnamen(anbieter.unternehmen.name1, anbieter.unternehmen.name2, anbieter.unternehmen.name3)
                    : ''
        };
    }

    setupInfobar() {
        this.infopanelService.dispatchInformation({
            title: 'amm.akquisition.subnavmenuitem.rahmenvertraege',
            tableCount: undefined,
            hideInfobar: true
        });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, RahmenvertragSuchenComponent.CHANNEL_STATE_KEY);
    }

    subscribeToToolbox() {
        this.facade.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.dataSource);
                }
            });
    }

    public get CHANNEL_STATE_KEY() {
        return RahmenvertragSuchenComponent.CHANNEL_STATE_KEY;
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.updateInformation({ hideInfobar: false, tableCount: undefined });
    }
}
