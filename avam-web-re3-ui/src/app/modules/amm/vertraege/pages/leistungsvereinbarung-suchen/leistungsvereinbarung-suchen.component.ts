import { Subscription } from 'rxjs';
import { CodeDTO } from '@dtos/codeDTO';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { LeistungsvereinbarungSuchenFormComponent, LeistungsvereinbarungSuchenTableComponent } from '../../components';
import { FacadeService } from '@app/shared/services/facade.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { LvFiltersData } from '../../components/leistungsvereinbarung-suchen-form/leistungsvereinbarung-suchen-form.component';
import { LeistungsvereinbarungSuchenParamDTO } from '@app/shared/models/dtos-generated/leistungsvereinbarungSuchenParamDTO';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import { LeistungsvereinbarungDTO } from '@app/shared/models/dtos-generated/leistungsvereinbarungDTO';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { Router } from '@angular/router';
import { ReloadHelper } from '@app/shared/helpers/reload.helper';
import { Unsubscribable } from 'oblique-reactive';

@Component({
    selector: 'avam-leistungsvereinbarung-suchen',
    templateUrl: './leistungsvereinbarung-suchen.component.html'
})
export class LeistungsvereinbarungSuchenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    static readonly CHANNEL_STATE_KEY = 'leistungsvereinbarung-search';

    public get CHANNEL_STATE_KEY() {
        return LeistungsvereinbarungSuchenComponent.CHANNEL_STATE_KEY;
    }

    @ViewChild('suchenFormComponent') suchenFormComponent: LeistungsvereinbarungSuchenFormComponent;
    @ViewChild('tableComponent') tableComponent: LeistungsvereinbarungSuchenTableComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    langSubscription: Subscription;
    toolboxSubscription: Subscription;

    data: LvFiltersData;
    lastUpdate: LeistungsvereinbarungDTO[];
    dataSource: any[] = [];

    permissions: typeof Permissions = Permissions;

    constructor(
        private ammHelper: AmmHelper,
        private router: Router,
        private facade: FacadeService,
        private stesDataRestService: StesDataRestService,
        private vertraegeService: VertraegeRestService,
        private infopanelService: AmmInfopanelService,
        private searchSession: SearchSessionStorageService
    ) {
        super();
    }

    ngOnInit() {
        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.dataSource = this.lastUpdate ? this.lastUpdate.map((row, index) => this.createRow(row, index)) : [];
        });

        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    ngAfterViewInit() {
        this.setupInfobar();
        this.configureToolbox();
        this.toolboxSubscription = this.subscribeToToolbox();
        this.getData();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.facade.fehlermeldungenService.closeMessage();
        this.langSubscription.unsubscribe();
        this.infopanelService.resetTemplateInInfobar();
        this.infopanelService.updateInformation({ hideInfobar: false, tableCount: undefined });
        this.toolboxSubscription.unsubscribe();
    }

    getData() {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);

        this.stesDataRestService.getActiveCodeByDomain(DomainEnum.VIERAUGENSTATUS).subscribe(
            (statusOptionsResponse: CodeDTO[]) => {
                const state = this.searchSession.restoreStateByKey(this.CHANNEL_STATE_KEY);
                this.data = { statusOptions: statusOptionsResponse, state: null };

                if (state) {
                    this.data.state = state.fields;

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
        this.dataSource = [];
        this.lastUpdate = undefined;
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.searchSession.clearStorageByKey(this.CHANNEL_STATE_KEY);
        this.searchSession.restoreDefaultValues(LeistungsvereinbarungSuchenTableComponent.STATE_KEY);
    }

    search() {
        this.facade.fehlermeldungenService.closeMessage();
        if (this.suchenFormComponent.formGroup.valid) {
            const storageParam = this.suchenFormComponent.mapToDTO(true);
            this.fillStorage(storageParam);

            const suchenParam = this.suchenFormComponent.mapToDTO();
            this.searchRestCall(suchenParam);
            this.searchSession.resetSelectedTableRow(LeistungsvereinbarungSuchenTableComponent.STATE_KEY);
        } else {
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    onItemSelected(event) {
        this.router.navigate([`/amm/anbieter/${event.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung`], {
            queryParams: { lvId: event.leistungsvereinbarungId }
        });
    }

    private searchRestCall(lvSuchenParam: LeistungsvereinbarungSuchenParamDTO) {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);
        this.vertraegeService.searchLeistungsvereinbarungen(lvSuchenParam).subscribe(
            response => {
                this.lastUpdate = response.data;
                this.dataSource = response.data.map((row: LeistungsvereinbarungDTO, index) => this.createRow(row, index));

                this.infopanelService.updateInformation({ tableCount: this.dataSource ? this.dataSource.length : 0 });

                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            },
            () => {
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            }
        );
    }

    private createRow(leistungsvereinbarung: LeistungsvereinbarungDTO, index: number) {
        const anbieter = leistungsvereinbarung.anbieterObject;

        return {
            index,
            leistungsvereinbarungId: leistungsvereinbarung.leistungsvereinbarungId,
            leistungsvereinbarungNr: leistungsvereinbarung.leistungsvereinbarungNr || '',
            titel: leistungsvereinbarung.titel || '',
            gueltigVon: this.facade.formUtilsService.parseDate(leistungsvereinbarung.gueltigVon),
            gueltigBis: this.facade.formUtilsService.parseDate(leistungsvereinbarung.gueltigBis),
            status: leistungsvereinbarung.statusObject ? this.facade.dbTranslateService.translateWithOrder(leistungsvereinbarung.statusObject, 'text') : '',
            rahmenvertragNr: leistungsvereinbarung.rahmenvertragObject ? leistungsvereinbarung.rahmenvertragObject.rahmenvertragNr : '',
            anbieterName:
                anbieter && anbieter.unternehmen && anbieter.unternehmen.unternehmenId !== -1
                    ? this.ammHelper.concatenateUnternehmensnamen(anbieter.unternehmen.name1, anbieter.unternehmen.name2, anbieter.unternehmen.name3)
                    : '',
            anbieterId: anbieter ? anbieter.unternehmenId : ''
        };
    }

    private setupInfobar() {
        this.infopanelService.dispatchInformation({
            title: 'amm.akquisition.label.leistungsvereinbarungen',
            tableCount: undefined,
            hideInfobar: true
        });
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, LeistungsvereinbarungSuchenComponent.CHANNEL_STATE_KEY, null, true);
    }

    private subscribeToToolbox(): Subscription {
        return this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.dataSource);
            }
        });
    }

    private fillStorage(dataToStore: LeistungsvereinbarungSuchenParamDTO): void {
        const controls = this.suchenFormComponent.formGroup.controls;
        const anbieterParam = controls.anbieterParam.value ? controls.anbieterParam['unternehmenAutosuggestObject'] : null;

        if (anbieterParam) {
            dataToStore.anbieterId = anbieterParam.unternehmenId;
            dataToStore.anbieterName = anbieterParam.name1;
        }

        this.searchSession.storeFieldsByKey(this.CHANNEL_STATE_KEY, dataToStore);
    }
}
