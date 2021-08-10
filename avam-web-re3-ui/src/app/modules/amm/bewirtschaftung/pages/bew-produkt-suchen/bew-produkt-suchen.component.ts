import { Component, ViewChild, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { BewProduktSuchenFormComponent } from '../../components/bew-produkt-suchen-form/bew-produkt-suchen-form.component';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { ProduktSuchenParamDTO } from '@app/shared/models/dtos-generated/produktSuchenParamDTO';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { AmmZulassungstypCode } from '@app/shared/enums/domain-code/amm-zulassungstyp-code.enum';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { ToolboxService, ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { BewProduktSuchenTableComponent } from '../../components/bew-produkt-suchen-table/bew-produkt-suchen-table.component';
import { XProduktDTO } from '@app/shared/models/dtos-generated/xProduktDTO';
import { TranslateService } from '@ngx-translate/core';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { Router } from '@angular/router';

@Component({
    selector: 'avam-bew-produkt-suchen',
    templateUrl: './bew-produkt-suchen.component.html',
    providers: [SearchSessionStorageService]
})
export class BewProduktSuchenComponent extends Unsubscribable implements AfterViewInit, OnDestroy {
    static readonly CHANNEL_STATE_KEY = 'produkt-search';

    @ViewChild('formComponent') formComponent: BewProduktSuchenFormComponent;
    @ViewChild('tableComponent') tableComponent: BewProduktSuchenTableComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    searchNotAvailable: boolean;
    dataSource: any[];
    data: any;
    toolboxSubscription: Subscription;

    tableChannel = 'tablePanelChannel';
    searchChannel = 'searchPanelChannel';
    lastUpdate: XProduktDTO[];

    constructor(
        private stesDataRestService: StesDataRestService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private fehlermeldungenService: FehlermeldungenService,
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private modalService: NgbModal,
        private searchSession: SearchSessionStorageService,
        private ammInfopanelService: AmmInfopanelService,
        private translateService: TranslateService,
        private router: Router
    ) {
        super();
    }

    ngAfterViewInit() {
        this.getData();
        this.toggleSearchAvailability();
        this.formComponent.toggleEnabledInputs(this.formComponent.formGroup.controls.produktId.value);

        this.formComponent.handler.reactiveForms.searchForm.valueChanges.subscribe(() => {
            this.toggleSearchAvailability();
        });

        this.setupInfobar();

        this.configureToolbox();
        this.toolboxSubscription = this.subscribeToToolbox();

        this.translateService.onLangChange.subscribe(() => {
            this.dataSource = this.lastUpdate ? this.lastUpdate.map((row, index) => this.formComponent.handler.createRow(row, index)) : [];
        });
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    ngOnDestroy() {
        if (this.toolboxSubscription) {
            this.toolboxSubscription.unsubscribe();
        }

        this.ammInfopanelService.resetTemplateInInfobar();
        super.ngOnDestroy();
    }

    getData() {
        this.spinnerService.activate(this.searchChannel);
        this.stesDataRestService.getActiveCodeByDomain(DomainEnum.ZULASSUNG_TYP_AMM).subscribe(
            (response: CodeDTO[]) => {
                const state = this.searchSession.restoreStateByKey(BewProduktSuchenComponent.CHANNEL_STATE_KEY);
                this.data = {
                    zulassungstypOptions: response.filter(option => option.code === AmmZulassungstypCode.KOLLEKTIV || option.code === AmmZulassungstypCode.INDIVIDUELL),
                    state: null
                };
                if (state) {
                    this.data.state = state.fields;
                    const params = state.fields;
                    params.anbieterParam =
                        params.anbieterParam && params.anbieterParam.unternehmenId !== -1
                            ? {
                                  id: params.anbieterParam.unternehmenId,
                                  bezeichnung: this.formComponent.setBezeichnung(params.anbieterParam.name1, params.anbieterParam.name2, params.anbieterParam.name3)
                              }
                            : null;

                    this.searchRestCall(state.fields);
                }
                this.spinnerService.deactivate(this.searchChannel);
            },
            () => {
                this.spinnerService.deactivate(this.searchChannel);
            }
        );
    }

    search() {
        this.fehlermeldungenService.closeMessage();
        if (this.formComponent.formGroup.valid) {
            const produktSuchenParamState = this.formComponent.mapToDTO(true);
            this.fillStorage(produktSuchenParamState);

            const produktSuchenParam = this.formComponent.mapToDTO();
            this.searchRestCall(produktSuchenParam);
        } else {
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    searchRestCall(produktSuchenParam) {
        this.spinnerService.activate(this.tableChannel);
        this.bewirtschaftungRestService.searchProdukt(produktSuchenParam).subscribe(
            response => {
                this.dataSource = response.data;

                this.lastUpdate = response.data;
                this.dataSource = response.data ? response.data.map((row, index) => this.formComponent.handler.createRow(row, index)) : [];
                this.formComponent.formGroup.markAsDirty();

                this.ammInfopanelService.updateInformation({ tableCount: this.dataSource.length });

                this.spinnerService.deactivate(this.tableChannel);
            },
            () => {
                this.spinnerService.deactivate(this.tableChannel);
            }
        );
    }

    reset() {
        this.formComponent.reset();
        this.dataSource = undefined;
        this.lastUpdate = undefined;
        this.ammInfopanelService.updateInformation({ tableCount: undefined });
        this.searchSession.restoreDefaultValues(BewProduktSuchenTableComponent.STATE_KEY);
    }

    toggleSearchAvailability() {
        if (this.formComponent.handler.reactiveForms.isOnlyZulassungstypSet()) {
            this.searchNotAvailable = true;
        } else {
            this.searchNotAvailable = false;
        }
    }

    private fillStorage(dataToStore: ProduktSuchenParamDTO): void {
        const anbieterParam = this.formComponent.formGroup.controls.anbieterParam;
        const completeData = { ...dataToStore, strukturelementText: this.formComponent.handler.selectedElement };
        completeData.anbieterParam = anbieterParam.value ? anbieterParam['unternehmenAutosuggestObject'] : null;

        const defaultValues = this.formComponent.handler.getDefaultValues();
        completeData.zulassungsTyp = completeData.zulassungsTyp ? completeData.zulassungsTyp : defaultValues.zulassungsTyp;
        completeData.gueltigVon = completeData.gueltigVon ? completeData.gueltigVon : null;
        completeData.gueltigBis = completeData.gueltigBis ? completeData.gueltigBis : null;

        this.searchSession.storeFieldsByKey(BewProduktSuchenComponent.CHANNEL_STATE_KEY, completeData);
    }

    private setupInfobar() {
        this.ammInfopanelService.dispatchInformation({
            title: 'amm.massnahmen.label.produkte',
            tableCount: undefined,
            hideInfobar: true
        });
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, BewProduktSuchenComponent.CHANNEL_STATE_KEY, null, true);
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
}
