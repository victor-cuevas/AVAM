import { Component, OnInit, ViewChild, TemplateRef, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { DateRangeFormComponent } from '@app/shared/components/date-range-form/date-range-form.component';
import { FacadeService } from '@app/shared/services/facade.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LeistungsvereinbarungSuchenParamDTO } from '@app/shared/models/dtos-generated/leistungsvereinbarungSuchenParamDTO';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { LeistungsvereinbarungDTO } from '@app/shared/models/dtos-generated/leistungsvereinbarungDTO';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { Subscription } from 'rxjs';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { Permissions } from '@shared/enums/permissions.enum';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';

@Component({
    selector: 'avam-leistungsvereinbarungen-uebersicht',
    templateUrl: './leistungsvereinbarungen-uebersicht.component.html'
})
export class LeistungsvereinbarungenUebersichtComponent implements OnInit, AfterViewInit, OnDestroy {
    static readonly CHANNEL_STATE_KEY = 'leistungsvereinbarungen-uebersicht';

    @ViewChild('suchenFormComponent') suchenFormComponent: DateRangeFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    public permissions: typeof Permissions = Permissions;
    data = { state: null };
    unternehmensStatus: string;
    burNummer: number;
    provBurNr: number;
    anbieterId: number;
    lastUpdate: LeistungsvereinbarungDTO[];
    dataSource: any[];

    toolboxSubscription: Subscription;
    langChangeSubscription: Subscription;

    constructor(
        private facade: FacadeService,
        private route: ActivatedRoute,
        private anbieterRestService: AnbieterRestService,
        private infopanelService: AmmInfopanelService,
        private router: Router,
        private searchSession: SearchSessionStorageService
    ) {}

    ngOnInit() {
        this.route.parent.params.subscribe(data => {
            this.anbieterId = data['unternehmenId'];
        });

        this.restoreState();

        this.langChangeSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.dataSource = this.lastUpdate ? this.lastUpdate.map((row, index) => this.createRow(row, index)) : [];
        });

        this.updateInfopanel();
        this.configureToolbox();
        this.toolboxSubscription = this.subscribeToToolbox();
    }

    ngAfterViewInit() {
        this.getData();
    }

    ngOnDestroy() {
        if (this.toolboxSubscription) {
            this.toolboxSubscription.unsubscribe();
        }

        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }

        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.infopanelService.updateInformation({
            tableCount: undefined
        });

        this.facade.fehlermeldungenService.closeMessage();
    }

    restoreState() {
        const state = this.searchSession.restoreStateByKey(LeistungsvereinbarungenUebersichtComponent.CHANNEL_STATE_KEY);

        if (state) {
            this.data = { state: state.fields };
        }
    }

    updateInfopanel() {
        this.infopanelService.updateInformation({
            subtitle: 'amm.akquisition.subnavmenuitem.leistungsvereinbarungen',
            hideInfobar: false
        });
    }

    getData() {
        if (this.suchenFormComponent.isValid()) {
            const suchenDto: LeistungsvereinbarungSuchenParamDTO = this.suchenFormComponent.mapToDTO();
            suchenDto.anbieterId = this.anbieterId;
            this.search(suchenDto);
        } else {
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    search(lvSuchenParam: LeistungsvereinbarungSuchenParamDTO) {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);
        this.anbieterRestService.searchLeistungsvereinbarungen(lvSuchenParam).subscribe(
            response => {
                this.lastUpdate = response.data;
                this.dataSource = [...response.data]
                    .sort((v1, v2) => (v1.leistungsvereinbarungNr > v2.leistungsvereinbarungNr ? 1 : v1.leistungsvereinbarungNr < v2.leistungsvereinbarungNr ? -1 : 0))
                    .map((row: LeistungsvereinbarungDTO, index) => this.createRow(row, index));

                this.infopanelService.updateInformation({ tableCount: this.dataSource ? this.dataSource.length : 0 });
                this.updateInfopanel();
                this.searchSession.storeFieldsByKey(LeistungsvereinbarungenUebersichtComponent.CHANNEL_STATE_KEY, this.suchenFormComponent.mapToDTO());

                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            },
            () => {
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            }
        );
    }

    createRow(leistungsvereinbarung: LeistungsvereinbarungDTO, index: number) {
        return {
            index,
            leistungsvereinbarungId: leistungsvereinbarung.leistungsvereinbarungId,
            leistungsvereinbarungNr: leistungsvereinbarung.leistungsvereinbarungNr,
            titel: leistungsvereinbarung.titel ? leistungsvereinbarung.titel : '',
            gueltigVon: this.facade.formUtilsService.parseDate(leistungsvereinbarung.gueltigVon),
            gueltigBis: this.facade.formUtilsService.parseDate(leistungsvereinbarung.gueltigBis),
            status: leistungsvereinbarung.statusObject ? this.facade.dbTranslateService.translateWithOrder(leistungsvereinbarung.statusObject, 'text') : '',
            rahmenvertragNr: leistungsvereinbarung.rahmenvertragObject ? leistungsvereinbarung.rahmenvertragObject.rahmenvertragNr : ''
        };
    }

    onRefresh() {
        this.facade.fehlermeldungenService.closeMessage();
        this.getData();
    }

    openPrintModal() {
        this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.dataSource);
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.CHANNEL_STATE_KEY, this.getToolboxConfigData());
    }

    getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { UNTERNEHMEN_ID: this.anbieterId }
        };
    }

    leistungsvereinbarungErfassen() {
        this.router.navigate([`amm/anbieter/${this.anbieterId}/leistungsvereinbarungen/erfassen`]);
    }

    onRowSelected(event) {
        this.router.navigate([`/amm/anbieter/${this.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung`], {
            queryParams: { lvId: event.leistungsvereinbarungId }
        });
    }

    private subscribeToToolbox(): Subscription {
        return this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    public get CHANNEL_STATE_KEY() {
        return LeistungsvereinbarungenUebersichtComponent.CHANNEL_STATE_KEY;
    }
}
