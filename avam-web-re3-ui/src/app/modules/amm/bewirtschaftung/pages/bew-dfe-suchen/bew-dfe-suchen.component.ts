import { Component, ViewChild, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { DurchfuehrungseinheitSuchenParamDTO } from '@app/shared/models/dtos-generated/durchfuehrungseinheitSuchenParamDTO';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { BewDfeSuchenFormComponent } from '../../components/bew-dfe-suchen-form/bew-dfe-suchen-form.component';
import { forkJoin, Subscription } from 'rxjs';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { FacadeService } from '@app/shared/services/facade.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DurchfuehrungseinheitListeViewDTO } from '@app/shared/models/dtos-generated/durchfuehrungseinheitListeViewDTO';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { TranslateService } from '@ngx-translate/core';
import { AmmConstants } from '@app/shared/enums/amm-constants';
import { Router } from '@angular/router';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { BewDfeSuchenTableComponent } from '@modules/amm/bewirtschaftung/components';

@Component({
    selector: 'avam-bew-dfe-suchen',
    templateUrl: './bew-dfe-suchen.component.html'
})
export class BewDfeSuchenComponent extends Unsubscribable implements AfterViewInit, OnDestroy {
    static readonly STATE_KEY = 'dfe-search';
    static readonly CHANNEL_TABLE = 'tablePanelChannel';
    static readonly CHANNEL_FORM = 'searchPanelChannel';

    @ViewChild('formComponent') formComponent: BewDfeSuchenFormComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    dfeSearchparams: DurchfuehrungseinheitSuchenParamDTO;
    channel = 'dfe-search';
    tableChannel = 'tablePanelChannel';
    searchChannel = 'searchPanelChannel';
    data: any;
    dataSource: any[] = [];
    toolboxSubscription: Subscription;
    closeResult: string;
    lastUpdate: DurchfuehrungseinheitListeViewDTO[];
    formDataFromCache: object;
    searchNotAvailable: boolean;

    constructor(
        private ammInfopanelService: AmmInfopanelService,
        private facade: FacadeService,
        private searchSession: SearchSessionStorageService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private modalService: NgbModal,
        private stesDataRestService: StesDataRestService,
        private router: Router
    ) {
        super();
    }

    ngAfterViewInit() {
        this.formDataFromCache = this.searchSession.restoreStateByKey(BewDfeSuchenComponent.STATE_KEY);
        this.getData(this.formDataFromCache);
        this.configureToolbox();
        this.toolboxSubscription = this.subscribeToToolbox();
        this.setupInfobar();

        this.facade.translateService.onLangChange.subscribe(() => {
            this.dataSource = this.lastUpdate ? this.lastUpdate.map((row, index) => this.formComponent.handler.createRow(row, index)) : [];
        });

        this.toggleSearchAvailability();
        this.formComponent.handler.reactiveForms.searchForm.valueChanges.subscribe(() => {
            this.toggleSearchAvailability();
        });
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    search() {
        this.facade.fehlermeldungenService.closeMessage();
        if (this.formComponent.formGroup.valid) {
            const dfeSuchenParam = this.formComponent.mapToDTO();
            this.searchRestCall(dfeSuchenParam, true);
        } else {
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    searchRestCall(dfeSuchenParam: DurchfuehrungseinheitSuchenParamDTO, fillStorage: boolean) {
        this.facade.spinnerService.activate(this.tableChannel);
        this.bewirtschaftungRestService.searchDfe(dfeSuchenParam).subscribe(
            response => {
                this.dataSource = response.data ? response.data.map((row, index) => this.formComponent.handler.createRow(row, index)) : [];
                this.lastUpdate = response.data;
                this.ammInfopanelService.updateInformation({ tableCount: this.dataSource ? this.dataSource.length : 0 });
                if (fillStorage) {
                    this.fillStorage(dfeSuchenParam);
                }

                this.facade.spinnerService.deactivate(this.tableChannel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.tableChannel);
            }
        );
    }

    subscribeToToolbox(): Subscription {
        return this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: 'zahlstelle-basic-title', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, null, true);
    }

    getData(formDataFromCache: any) {
        this.facade.spinnerService.activate(this.searchChannel);
        forkJoin(
            this.stesDataRestService.getFixedCode(DomainEnum.YES_NO_OPTIONS),
            this.stesDataRestService.getFixedCode(DomainEnum.AMM_DFE_ZEITRAUM),
            this.stesDataRestService.getFixedCode(DomainEnum.AMM_DFE_PLATZSITUATION),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.ZULASSUNG_TYP_AMM),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SESSION_STATUS)
        ).subscribe(
            ([yesNoOptionsResponse, ammDfeZeitraumResponse, ammDfePlatzsituationResponse, zulassungstypResponse, sessionStatus]) => {
                this.data = {
                    yesNoOptions: yesNoOptionsResponse,
                    ammDfeZeitraum: ammDfeZeitraumResponse,
                    ammDfePlatzsituation: ammDfePlatzsituationResponse,
                    zulassungstypOptions: zulassungstypResponse,
                    sessionStatus,
                    formData: null
                };

                if (formDataFromCache) {
                    this.data.formData = {
                        ...formDataFromCache.fields.dto,
                        strukturelementText: formDataFromCache.fields.strukturelementText
                    };
                    this.searchRestCall(formDataFromCache.fields.dto, false);
                }
                this.facade.spinnerService.deactivate(this.searchChannel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.searchChannel);
            }
        );
    }

    reset() {
        this.formComponent.reset();
        this.dataSource = [];
        this.lastUpdate = undefined;
        this.ammInfopanelService.updateInformation({ tableCount: undefined });
        this.searchSession.restoreDefaultValues(BewDfeSuchenTableComponent.STATE_KEY);
    }

    ngOnDestroy() {
        if (this.toolboxSubscription) {
            this.toolboxSubscription.unsubscribe();
        }
        this.ammInfopanelService.resetTemplateInInfobar();
    }

    public onRowSelected(row) {
        const typ = row.typ;

        if (typ === AmmConstants.ENTRY_PRAKTIKUMSSTELLE) {
            this.router.navigate([`amm/bewirtschaftung/produkt/${row.produktId}/massnahmen/massnahme/standorte/standort/praktikumsstellen/praktikumsstelle/grunddaten`], {
                queryParams: { massnahmeId: row.massnahmeId, dfeId: row.durchfuehrungseinheitId, beId: row.beschaeftigungseinheitId }
            });
        }

        if (typ === AmmConstants.ENTRY_ARBEITSPLATZKATEGORIE) {
            this.router.navigate([`amm/bewirtschaftung/produkt/${row.produktId}/massnahmen/massnahme/standorte/standort/arbeitsplatzkategorien/arbeitsplatzkategorie/grunddaten`], {
                queryParams: { massnahmeId: row.massnahmeId, dfeId: row.durchfuehrungseinheitId, beId: row.beschaeftigungseinheitId }
            });
        }

        if (typ === AmmConstants.ENTRY_SESSION) {
            this.router.navigate([`amm/bewirtschaftung/produkt/${row.produktId}/massnahmen/massnahme/kurse/kurs/grunddaten`], {
                queryParams: { massnahmeId: row.massnahmeId, dfeId: row.durchfuehrungseinheitId }
            });
        }

        if (typ === AmmConstants.ENTRY_STANDORT) {
            this.router.navigate([`amm/bewirtschaftung/produkt/${row.produktId}/massnahmen/massnahme/standorte/standort/grunddaten`], {
                queryParams: { massnahmeId: row.massnahmeId, dfeId: row.durchfuehrungseinheitId }
            });
        }
    }

    toggleSearchAvailability() {
        if (this.formComponent.handler.reactiveForms.noSearchCriteriaGiven()) {
            this.searchNotAvailable = true;
        } else {
            this.searchNotAvailable = false;
        }
    }

    get STATE_KEY(): string {
        return BewDfeSuchenComponent.STATE_KEY;
    }

    get CHANNEL_TABLE(): string {
        return BewDfeSuchenComponent.CHANNEL_TABLE;
    }
    get CHANNEL_FORM(): string {
        return BewDfeSuchenComponent.CHANNEL_FORM;
    }

    private fillStorage(dataToStore: DurchfuehrungseinheitSuchenParamDTO): void {
        const dto = this.formComponent.mapToDTO();
        const complateData = {
            dto,
            strukturelementText: this.formComponent.handler.selectedElement
        };
        this.searchSession.storeFieldsByKey(BewDfeSuchenComponent.STATE_KEY, complateData);
    }

    private setupInfobar() {
        this.ammInfopanelService.dispatchInformation({
            title: 'amm.massnahmen.label.durchfuehrungseinheit',
            tableCount: undefined,
            hideInfobar: true
        });
    }
}
