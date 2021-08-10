import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { DateRangeFormComponent } from '@app/shared/components/date-range-form/date-range-form.component';
import { FacadeService } from '@app/shared/services/facade.service';
import { TeilzahlungenSuchenParameterDTO } from '@app/shared/models/dtos-generated/teilzahlungenSuchenParameterDTO';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { TeilzahlungenUebersichtTableComponent, TeilzahlungenTableType } from '../../../components/teilzahlungen-uebersicht-table/teilzahlungen-uebersicht-table.component';
import { TeilzahlungDTO } from '@app/shared/models/dtos-generated/teilzahlungDTO';
import { Subscription } from 'rxjs';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxService } from '@app/shared';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';

@Component({
    selector: 'avam-teilzahlungen-uebersicht',
    templateUrl: './teilzahlungen-uebersicht.component.html'
})
export class TeilzahlungenUebersichtComponent implements OnInit, OnDestroy, AfterViewInit {
    static readonly CHANNEL_STATE_KEY = 'teilzahlungen-uebersicht-channel';

    @ViewChild('searchForm') suchenFormComponent: DateRangeFormComponent;
    @ViewChild('tableComponent') tableComponent: TeilzahlungenUebersichtTableComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    tableType = TeilzahlungenTableType;

    permissions: typeof Permissions = Permissions;
    langSubscription: Subscription;
    toolboxSubscription: Subscription;

    data = { state: null };
    dataSource;
    lastUpdate: TeilzahlungDTO[];

    anbieterId: number;

    public get CHANNEL_STATE_KEY() {
        return TeilzahlungenUebersichtComponent.CHANNEL_STATE_KEY;
    }

    constructor(
        private facade: FacadeService,
        private anbieterRestService: AnbieterRestService,
        private route: ActivatedRoute,
        private searchSession: SearchSessionStorageService,
        private infopanelService: AmmInfopanelService,
        private router: Router
    ) {
        ToolboxService.CHANNEL = this.CHANNEL_STATE_KEY;
    }

    ngOnInit() {
        this.route.parent.params.subscribe(data => {
            this.anbieterId = data['unternehmenId'];
        });

        this.infopanelService.updateInformation({
            subtitle: 'amm.anbieter.subnavmenuitem.teilzahlungen'
        });
        this.toolboxSubscription = this.subscribeToToolbox();

        this.restoreState();

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.dataSource = this.lastUpdate ? this.lastUpdate.map((row, index) => this.createRow(row, index)) : [];
        });
    }

    ngAfterViewInit() {
        this.searchTeilzahlungen();
    }

    ngOnDestroy() {
        this.facade.fehlermeldungenService.closeMessage();
        this.langSubscription.unsubscribe();
        this.toolboxSubscription.unsubscribe();
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.facade.toolboxService.sendConfiguration([]);
    }

    onRefresh() {
        if (!this.suchenFormComponent.formGroup.valid) {
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            return;
        }

        this.searchTeilzahlungen();
    }

    searchTeilzahlungen() {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);

        this.anbieterRestService.getTeilzahlungenUebersicht(this.mapToDTO()).subscribe(
            response => {
                if (response.data) {
                    this.lastUpdate = response.data.teilzahlungen;
                    this.dataSource = response.data.teilzahlungen.map((row: TeilzahlungDTO, index) => this.createRow(row, index));

                    this.searchSession.storeFieldsByKey(this.CHANNEL_STATE_KEY, this.suchenFormComponent.mapToDTO());

                    this.configureToolbox();
                    this.infopanelService.updateInformation({ tableCount: this.lastUpdate ? this.lastUpdate.length : undefined });
                }

                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            },
            () => {
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            }
        );
    }

    teilzahlungErfassen() {
        this.router.navigate([`amm/anbieter/${this.anbieterId}/teilzahlungen/erfassen`]);
    }

    onItemSelected(event) {
        this.router.navigate([`/amm/anbieter/${this.anbieterId}/teilzahlungen/bearbeiten`], {
            queryParams: { teilzahlungId: event.teilzahlungId }
        });
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.CHANNEL_STATE_KEY);
    }

    private subscribeToToolbox(): Subscription {
        return this.facade.toolboxService.observeClickAction(this.CHANNEL_STATE_KEY).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.dataSource);
            }
        });
    }

    private mapToDTO(): TeilzahlungenSuchenParameterDTO {
        const ausfuehrungsDates = this.suchenFormComponent.mapToDTO();
        return {
            anbieterId: this.anbieterId,
            ausfuehrungsdatumVon: ausfuehrungsDates.gueltigVon,
            ausfuehrungsdatumBis: ausfuehrungsDates.gueltigBis
        };
    }

    private createRow(teilzahlung: TeilzahlungDTO, index: number) {
        return {
            index,
            teilzahlungId: teilzahlung.teilzahlungId,
            teilzahlungNr: teilzahlung.teilzahlungNr,
            titel: teilzahlung.titel,
            ausfuehrungsdatum: teilzahlung.ausfuehrungsdatum,
            status: this.facade.dbTranslateService.translateWithOrder(teilzahlung.statusObject, 'kurzText')
        };
    }

    private restoreState() {
        const state = this.searchSession.restoreStateByKey(this.CHANNEL_STATE_KEY);

        if (state) {
            this.data = { state: state.fields };
        }
    }
}
