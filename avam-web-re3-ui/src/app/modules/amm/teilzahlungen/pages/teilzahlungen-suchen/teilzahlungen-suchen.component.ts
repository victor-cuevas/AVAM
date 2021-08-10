import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { forkJoin, Subscription } from 'rxjs';
import { FacadeService } from '@app/shared/services/facade.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { TeilzahlungenSuchenTableComponent, TeilzahlungenSuchenFormComponent } from '../../components';
import { ToolboxService } from '@app/shared';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { TranslateService } from '@ngx-translate/core';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { TeilzahlungenRestService } from '@app/core/http/teilzahlungen-rest.service';
import { ZahlungenSuchenParameterDTO } from '@app/shared/models/dtos-generated/zahlungenSuchenParameterDTO';
import { FormGroup } from '@angular/forms';
import { TeilzahlungenSuchenHandlerService } from '../../components/teilzahlungen-suchen-form/teilzahlungen-suchen-handler.service';
import { TeilzahlungenSuchenReactiveFormService } from '../../components/teilzahlungen-suchen-form/teilzahlungen-suchen-reactive-forms.service';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { Router } from '@angular/router';
import { ReloadHelper } from '@app/shared/helpers/reload.helper';

@Component({
    selector: 'avam-teilzahlungen-suchen',
    templateUrl: './teilzahlungen-suchen.component.html',
    providers: [TeilzahlungenSuchenHandlerService, TeilzahlungenSuchenReactiveFormService, SearchSessionStorageService]
})
export class TeilzahlungenSuchenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    static readonly CHANNEL_STATE_KEY = 'teilzahlungen-search';

    @ViewChild('suchenFormComponent') suchenFormComponent: TeilzahlungenSuchenFormComponent;
    @ViewChild('tableComponent') tableComponent: TeilzahlungenSuchenTableComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    public formGroup: FormGroup;

    searchChannel = 'teilzahlungen-suchen';
    data: any;
    dataSource: any[] = [];
    searchPanelChannel = 'teilzahlungenSuchenChanel';
    lastUpdate: any;
    searchNotAvailable = true;
    toolboxSubscription: Subscription;

    constructor(
        private teilzahlungenSuchenHandlerService: TeilzahlungenSuchenHandlerService,
        private facade: FacadeService,
        private stesDataRestService: StesDataRestService,
        private ammInfopanelService: AmmInfopanelService,
        private toolboxService: ToolboxService,
        private modalService: NgbModal,
        private spinnerService: SpinnerService,
        private fehlermeldungenService: FehlermeldungenService,
        private searchSession: SearchSessionStorageService,
        private translateService: TranslateService,
        private teilzahlungenRestService: TeilzahlungenRestService,
        private router: Router
    ) {
        super();
        this.formGroup = this.teilzahlungenSuchenHandlerService.reactiveForms.teilzahlungenSuchenForm;
    }

    ngOnInit() {
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    ngAfterViewInit() {
        this.setupInfobar();
        this.configureToolbox();
        this.toolboxSubscription = this.subscribeToToolbox();

        this.toggleSearchAvailability();
        this.getData();

        this.suchenFormComponent.handler.reactiveForms.teilzahlungenSuchenForm.valueChanges.subscribe(() => {
            this.toggleSearchAvailability();
        });

        this.translateService.onLangChange.subscribe(() => {
            this.dataSource = this.lastUpdate ? this.lastUpdate.map((row, index) => this.suchenFormComponent.handler.createRow(row, index)) : [];
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.searchChannel);
        forkJoin(this.stesDataRestService.getActiveCodeByDomain(DomainEnum.VIERAUGENSTATUS)).subscribe(
            ([vierAugenStatus]) => {
                const state = this.searchSession.restoreStateByKey(TeilzahlungenSuchenComponent.CHANNEL_STATE_KEY);
                this.data = {
                    vierAugenStatus,
                    state: null
                };

                if (state) {
                    this.data.state = state.fields;

                    this.searchRestCall(state.fields);
                }

                this.facade.spinnerService.deactivate(this.searchChannel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.searchChannel);
            }
        );
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        this.ammInfopanelService.updateInformation({
            tableCount: undefined,
            hideInfobar: false
        });
        this.ammInfopanelService.resetTemplateInInfobar();
        this.toolboxSubscription.unsubscribe();
        this.facade.fehlermeldungenService.closeMessage();
    }

    search() {
        this.fehlermeldungenService.closeMessage();
        if (this.suchenFormComponent.teilzahlungenSuchenForm.valid) {
            const zahlungenSuchenParameterState = this.suchenFormComponent.mapToDTO(true);
            this.fillStorage(zahlungenSuchenParameterState);

            const zahlungenSuchenParameter = this.suchenFormComponent.mapToDTO();
            this.searchRestCall(zahlungenSuchenParameter);

            this.searchSession.resetSelectedTableRow(TeilzahlungenSuchenTableComponent.STATE_KEY);
        } else {
            this.suchenFormComponent.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    searchRestCall(zahlungenSuchenParameter) {
        this.spinnerService.activate(TeilzahlungenSuchenComponent.CHANNEL_STATE_KEY);
        this.teilzahlungenRestService.searchTeilzahlungen(zahlungenSuchenParameter).subscribe(
            response => {
                this.lastUpdate = response.data;
                this.dataSource = response.data ? response.data.map((row, index) => this.suchenFormComponent.handler.createRow(row, index)) : [];

                this.ammInfopanelService.updateInformation({ tableCount: this.dataSource ? this.dataSource.length : 0 });

                this.spinnerService.deactivate(TeilzahlungenSuchenComponent.CHANNEL_STATE_KEY);
            },
            () => {
                this.spinnerService.deactivate(TeilzahlungenSuchenComponent.CHANNEL_STATE_KEY);
            }
        );
    }

    reset() {
        this.suchenFormComponent.reset();
        this.dataSource = [];
        this.lastUpdate = undefined;
        this.ammInfopanelService.updateInformation({ tableCount: undefined });
        this.searchSession.clearStorageByKey(this.CHANNEL_STATE_KEY);
        this.searchSession.restoreDefaultValues(TeilzahlungenSuchenTableComponent.STATE_KEY);
    }

    toggleSearchAvailability() {
        if (this.suchenFormComponent.reactiveForm.noSearchCriteriaGiven()) {
            this.searchNotAvailable = true;
        } else {
            this.searchNotAvailable = false;
        }
    }

    public get CHANNEL_STATE_KEY() {
        return TeilzahlungenSuchenComponent.CHANNEL_STATE_KEY;
    }

    onItemSelected(event) {
        this.router.navigate([`/amm/anbieter/${event.anbieterId}/teilzahlungen/bearbeiten`], {
            queryParams: { teilzahlungId: event.teilzahlungId }
        });
    }

    private fillStorage(dataToStore: ZahlungenSuchenParameterDTO) {
        const anbieterParam = this.suchenFormComponent.teilzahlungenSuchenForm.controls.anbieter;

        const completeData = {
            ...dataToStore,
            anbieterParam: anbieterParam.value ? anbieterParam['unternehmenAutosuggestObject'] : null
        };

        completeData.ausfuehrungsdatumVon = completeData.ausfuehrungsdatumVon ? completeData.ausfuehrungsdatumVon : null;
        completeData.ausfuehrungsdatumBis = completeData.ausfuehrungsdatumBis ? completeData.ausfuehrungsdatumBis : null;

        this.searchSession.storeFieldsByKey(TeilzahlungenSuchenComponent.CHANNEL_STATE_KEY, completeData);
    }

    private setupInfobar() {
        this.ammInfopanelService.dispatchInformation({
            title: 'amm.zahlungen.topnavmenuitem.teilzahlung',
            tableCount: undefined,
            hideInfobar: true
        });
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, TeilzahlungenSuchenComponent.CHANNEL_STATE_KEY, null, true);
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
