import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { VertragswertSuchenFormComponent } from '../../components';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { forkJoin, Subscription } from 'rxjs';
import { VwFiltersData } from '../../components/vertragswert-suchen-form/vertragswert-suchen-form.component';
import { FacadeService } from '@app/shared/services/facade.service';
import { VertragswertViewDTO } from '@app/shared/models/dtos-generated/vertragswertViewDTO';
import { VertragswertSuchenParamDTO } from '@app/shared/models/dtos-generated/vertragswertSuchenParamDTO';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { BewVertragswerteUebersichtHelperService } from '@app/modules/amm/bewirtschaftung/services/bew-vertragswerte-uebersicht-helper.service';

@Component({
    selector: 'avam-vertragswert-suchen',
    templateUrl: './vertragswert-suchen.component.html',
    providers: [BewVertragswerteUebersichtHelperService]
})
export class VertragswertSuchenComponent implements AfterViewInit, OnDestroy, OnInit {
    static readonly CHANNEL_STATE_KEY = 'vertragswert-search';

    public get CHANNEL_STATE_KEY() {
        return VertragswertSuchenComponent.CHANNEL_STATE_KEY;
    }

    @ViewChild('suchenFormComponent') suchenFormComponent: VertragswertSuchenFormComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    data: VwFiltersData;
    lastUpdate: VertragswertViewDTO[];
    dataSource: any[];
    langSubscription: Subscription;
    statusOptions: any[];
    toolboxSubscription: Subscription;

    constructor(
        private stesDataRestService: StesDataRestService,
        private facade: FacadeService,
        private infopanelService: AmmInfopanelService,
        private vertraegeService: VertraegeRestService,
        private ammHelper: AmmHelper,
        private searchSession: SearchSessionStorageService,
        private vertragswerteHelperService: BewVertragswerteUebersichtHelperService
    ) {}

    ngOnInit() {
        this.setupInfobar();
        this.configureToolbox();

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.dataSource = this.lastUpdate ? this.lastUpdate.map((row, index) => this.createRow(row, index)) : [];
        });
        this.toolboxSubscription = this.subscribeToToolbox();
    }

    ngAfterViewInit() {
        this.getData();
    }

    ngOnDestroy() {
        this.langSubscription.unsubscribe();
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.resetTemplateInInfobar();
        this.toolboxSubscription.unsubscribe();
        this.infopanelService.updateInformation({ hideInfobar: false, tableCount: undefined });
    }

    search() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.suchenFormComponent.formGroup.valid) {
            const storageParam = this.suchenFormComponent.mapToDTO(true);
            this.fillStorage(storageParam);

            const suchenParam = this.suchenFormComponent.mapToDTO();
            this.searchRestCall(suchenParam);
        } else {
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    onItemSelected(selected) {
        this.vertragswerteHelperService.onVwRowSelected(selected, selected.lvAnbieterId, this.CHANNEL_STATE_KEY);
    }

    reset() {
        this.suchenFormComponent.reset(() => {
            this.dataSource = undefined;
            this.lastUpdate = undefined;
            this.infopanelService.updateInformation({ tableCount: undefined });
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);

        forkJoin([this.stesDataRestService.getActiveCodeByDomain(DomainEnum.VIERAUGENSTATUS), this.stesDataRestService.getFixedCode(DomainEnum.YES_NO_OPTIONS)]).subscribe(
            ([statusOptionsResponse, yesNoOptions]) => {
                const state = this.searchSession.restoreStateByKey(this.CHANNEL_STATE_KEY);
                this.data = { statusOptions: statusOptionsResponse, yesNoOptions };
                this.statusOptions = statusOptionsResponse;

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

    private fillStorage(dataToStore: VertragswertSuchenParamDTO): void {
        const controls = this.suchenFormComponent.formGroup.controls;
        const anbieterParam = controls.anbieterParam.value ? controls.anbieterParam['unternehmenAutosuggestObject'] : null;

        if (anbieterParam) {
            dataToStore.anbieterId = anbieterParam.unternehmenId;
            dataToStore.anbieterName = anbieterParam.name1;
        }

        this.searchSession.storeFieldsByKey(this.CHANNEL_STATE_KEY, dataToStore);
    }

    private subscribeToToolbox(): Subscription {
        return this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.dataSource);
            }
        });
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.ZURUECK, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, VertragswertSuchenComponent.CHANNEL_STATE_KEY, null, true);
    }

    private searchRestCall(vwSuchenParam: VertragswertSuchenParamDTO) {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);

        this.vertraegeService.searchVertragswert(vwSuchenParam).subscribe(
            response => {
                this.lastUpdate = response.data;
                this.dataSource = response.data.map((row: VertragswertViewDTO, index) => this.createRow(row, index));
                this.infopanelService.updateInformation({ tableCount: this.dataSource ? this.dataSource.length : 0 });

                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            },
            () => {
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            }
        );
    }

    private setupInfobar() {
        this.infopanelService.dispatchInformation({
            title: 'amm.akquisition.label.vertragswerte',
            tableCount: undefined,
            hideInfobar: true
        });
    }

    private createRow(vertragswert: VertragswertViewDTO, index: number) {
        return {
            index,
            vertragswertNr: vertragswert.vertragswertNr,
            chfBetrag: vertragswert.chfBetrag,
            gueltigVon: vertragswert.gueltigVon,
            gueltigBis: vertragswert.gueltigBis,
            gueltigB:
                vertragswert.gueltigB === true ? this.facade.dbTranslateService.instant('common.label.jagross') : this.facade.dbTranslateService.instant('common.label.neingross'),
            profilNr: vertragswert.profilNr,
            vertragswerttyp: this.facade.dbTranslateService.translate(vertragswert, 'typText'),
            titel: this.facade.dbTranslateService.translateWithOrder(vertragswert, 'massnahmeTitel'),
            leistungsvereinbarungNr: vertragswert.leistungsvereinbarungNr,
            anbieterName: this.ammHelper.concatenateUnternehmensnamen(
                vertragswert.anbieterUnternehmenName1,
                vertragswert.anbieterUnternehmenName2,
                vertragswert.anbieterUnternehmenName3
            ),
            status: vertragswert.leistungsvereinbarungStatusId ? this.setStatusByStatusId(vertragswert.leistungsvereinbarungStatusId) : '',
            lvAnbieterId: vertragswert.lvAnbieterId,
            leistungsvereinbarungId: vertragswert.leistungsvereinbarungId,
            vertragswertId: vertragswert.vertragswertId
        };
    }

    private setStatusByStatusId(statusId) {
        let selectedStatus = null;
        this.statusOptions.forEach(element => {
            if (element.codeId === statusId) {
                selectedStatus = this.facade.dbTranslateService.translate(element, 'kurzText');
            }
        });
        return selectedStatus;
    }
}
