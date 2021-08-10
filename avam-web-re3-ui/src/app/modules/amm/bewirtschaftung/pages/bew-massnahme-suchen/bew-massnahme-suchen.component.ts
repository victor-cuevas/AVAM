import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { Subscription, forkJoin } from 'rxjs';
import { ToolboxService } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { MassnahmeSuchenParamDTO } from '@app/shared/models/dtos-generated/massnahmeSuchenParamDTO';
import { MassnahmeViewDTO } from '@app/shared/models/dtos-generated/massnahmeViewDTO';
import { TranslateService } from '@ngx-translate/core';
import { BewMassnahmeSuchenTableComponent, BewMassnahmeSuchenFormComponent } from '../../components';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { Router } from '@angular/router';

@Component({
    selector: 'avam-bew-massnahme-suchen',
    templateUrl: './bew-massnahme-suchen.component.html',
    providers: [SearchSessionStorageService]
})
export class BewMassnahmeSuchenComponent extends Unsubscribable implements AfterViewInit, OnDestroy {
    static readonly CHANNEL_STATE_KEY = 'massnahme-search-cache-state-key';

    @ViewChild('suchenFormComponent') suchenFormComponent: BewMassnahmeSuchenFormComponent;
    @ViewChild('tableComponent') tableComponent: BewMassnahmeSuchenTableComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    searchPanelChannel = 'bewirtschaftungMassnahmeSuchenChanel';
    toolboxSubscription: Subscription;

    dataSource: any[];
    data: any;
    searchNotAvailable: boolean;
    lastUpdate: MassnahmeViewDTO[];

    constructor(
        private ammInfopanelService: AmmInfopanelService,
        private toolboxService: ToolboxService,
        private modalService: NgbModal,
        private spinnerService: SpinnerService,
        private stesDataRestService: StesDataRestService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private fehlermeldungenService: FehlermeldungenService,
        private searchSession: SearchSessionStorageService,
        private translateService: TranslateService,
        private router: Router
    ) {
        super();
    }

    ngAfterViewInit() {
        this.setupInfobar();
        this.configureToolbox();
        this.toolboxSubscription = this.subscribeToToolbox();

        this.toggleSearchAvailability();
        this.getData();

        this.suchenFormComponent.handler.reactiveForms.searchForm.valueChanges.subscribe(() => {
            this.toggleSearchAvailability();
        });

        this.translateService.onLangChange.subscribe(() => {
            this.dataSource = this.lastUpdate ? this.lastUpdate.map((row, index) => this.suchenFormComponent.handler.createRow(row, index)) : [];
        });

        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    ngOnDestroy() {
        this.ammInfopanelService.resetTemplateInInfobar();
        this.toolboxSubscription.unsubscribe();
        super.ngOnDestroy();
    }

    getData() {
        this.spinnerService.activate(this.searchPanelChannel);

        forkJoin(this.stesDataRestService.getFixedCode(DomainEnum.YES_NO_OPTIONS), this.stesDataRestService.getActiveCodeByDomain(DomainEnum.ZULASSUNG_TYP_AMM)).subscribe(
            ([yesNoOptionsResponse, zulassungstypResponse]) => {
                const state = this.searchSession.restoreStateByKey(BewMassnahmeSuchenComponent.CHANNEL_STATE_KEY);
                this.data = {
                    yesNoOptions: yesNoOptionsResponse,
                    zulassungstypOptions: zulassungstypResponse,
                    state: null
                };

                if (state) {
                    this.data.state = state.fields;
                    const params = state.fields;
                    params.anbieterParam =
                        params.anbieterParam && params.anbieterParam.unternehmenId !== -1
                            ? {
                                  id: params.anbieterParam.unternehmenId,
                                  bezeichnung: this.suchenFormComponent.setBezeichnung(params.anbieterParam.name1, params.anbieterParam.name2, params.anbieterParam.name3)
                              }
                            : null;

                    this.searchRestCall(state.fields);
                }
                this.spinnerService.deactivate(this.searchPanelChannel);
            },
            () => {
                this.spinnerService.deactivate(this.searchPanelChannel);
            }
        );
    }

    search() {
        this.fehlermeldungenService.closeMessage();
        if (this.suchenFormComponent.formGroup.valid) {
            const produktSuchenParamState = this.suchenFormComponent.mapToDTO(true);
            this.fillStorage(produktSuchenParamState);

            const massnahmeSuchenParam = this.suchenFormComponent.mapToDTO();
            this.searchRestCall(massnahmeSuchenParam);
        } else {
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    searchRestCall(masssnahmeSuchenParam) {
        this.spinnerService.activate(BewMassnahmeSuchenComponent.CHANNEL_STATE_KEY);
        this.bewirtschaftungRestService.searchMassnahme(masssnahmeSuchenParam).subscribe(
            response => {
                this.lastUpdate = response.data;
                this.dataSource = response.data ? response.data.map((row, index) => this.suchenFormComponent.handler.createRow(row, index)) : [];

                this.ammInfopanelService.updateInformation({ tableCount: this.dataSource ? this.dataSource.length : 0 });

                this.spinnerService.deactivate(BewMassnahmeSuchenComponent.CHANNEL_STATE_KEY);
            },
            () => {
                this.spinnerService.deactivate(BewMassnahmeSuchenComponent.CHANNEL_STATE_KEY);
            }
        );
    }

    reset() {
        this.suchenFormComponent.reset();
        this.dataSource = undefined;
        this.lastUpdate = undefined;
        this.ammInfopanelService.updateInformation({ tableCount: undefined });
        this.searchSession.restoreDefaultValues(BewMassnahmeSuchenTableComponent.STATE_KEY);
    }

    toggleSearchAvailability() {
        if (this.suchenFormComponent.handler.reactiveForms.noSearchCriteriaGiven()) {
            this.searchNotAvailable = true;
        } else {
            this.searchNotAvailable = false;
        }
    }

    public get CHANNEL_STATE_KEY() {
        return BewMassnahmeSuchenComponent.CHANNEL_STATE_KEY;
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, BewMassnahmeSuchenComponent.CHANNEL_STATE_KEY, null, true);
    }

    private subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    private openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: 'zahlstelle-basic-title', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    private setupInfobar() {
        this.ammInfopanelService.dispatchInformation({
            title: 'amm.massnahmen.label.massnahmen',
            tableCount: undefined,
            hideInfobar: true
        });
    }

    private fillStorage(dataToStore: MassnahmeSuchenParamDTO): void {
        const anbieterParam = this.suchenFormComponent.formGroup.controls.anbieterParam;
        const completeData = {
            ...dataToStore,
            strukturelementText: this.suchenFormComponent.handler.selectedElement
        };
        completeData.anbieterParam = anbieterParam.value ? anbieterParam['unternehmenAutosuggestObject'] : null;

        const defaultValues = this.suchenFormComponent.handler.reactiveForms.getDefaultValues();
        completeData.zulassungstypId = completeData.zulassungstypId ? completeData.zulassungstypId : defaultValues.zulassungstypId;
        completeData.gueltigVon = completeData.gueltigVon ? completeData.gueltigVon : null;
        completeData.gueltigBis = completeData.gueltigBis ? completeData.gueltigBis : null;

        this.searchSession.storeFieldsByKey(BewMassnahmeSuchenComponent.CHANNEL_STATE_KEY, completeData);
    }
}
