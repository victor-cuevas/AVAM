import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { Component, AfterViewInit, ElementRef, ViewChild, TemplateRef, OnDestroy, OnInit } from '@angular/core';
import { Subscription, forkJoin } from 'rxjs';
import { ToolboxService } from '@app/shared';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { ProduktSuchenParamDTO } from '@app/shared/models/dtos-generated/produktSuchenParamDTO';
import { MassnahmeViewDTO } from '@app/shared/models/dtos-generated/massnahmeViewDTO';
import { SpinnerService } from 'oblique-reactive';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { DateRangeFormComponent } from '@app/shared/components/date-range-form/date-range-form.component';
import { ProduktDTO } from '@app/shared/models/dtos-generated/produktDTO';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';

@Component({
    selector: 'avam-bew-massnahmen-uebersicht',
    templateUrl: './bew-massnahmen-uebersicht.component.html'
})
export class BewMassnahmenUebersichtComponent implements OnInit, AfterViewInit, OnDestroy {
    static readonly CHANNEL_STATE_KEY = 'massnahme-uebersicht';

    @ViewChild('suchenFormComponent') suchenFormComponent: DateRangeFormComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    data = { state: null };
    datasource = [];
    lastUpdate: MassnahmeViewDTO[];

    toolboxSubscription: Subscription;
    langSubscription: Subscription;

    produktSuchenParam: ProduktSuchenParamDTO;
    permissions: typeof Permissions = Permissions;
    produktId: number;
    organisationInfoBar: string;
    produktDto: ProduktDTO;

    isInPlanungSichtbar: boolean;
    isIndividuelleAmm: boolean;
    benutzerKuerzelMatches: boolean;

    constructor(
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private translateService: TranslateService,
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private modalService: NgbModal,
        private infopanelService: AmmInfopanelService,
        private searchSession: SearchSessionStorageService,
        private fehlermeldungenService: FehlermeldungenService,
        private dbTranslateService: DbTranslateService,
        private route: ActivatedRoute,
        private router: Router,
        private ammHelper: AmmHelper,
        private authService: AuthenticationService
    ) {}

    ngOnInit() {
        this.parseRoute();
        this.restoreState();

        this.infopanelService.appendToInforbar(this.infobarTemplate);
        this.initInfopanel();

        this.configureToolbox();
        this.toolboxSubscription = this.subscribeToToolbox();

        this.langSubscription = this.translateService.onLangChange.subscribe(() => {
            this.updateSecondLabel(this.produktDto);
            this.appendToInforbar(this.produktDto);
            this.datasource = this.lastUpdate ? this.lastUpdate.map((row, index) => this.createRow(row, index)) : [];
        });
    }

    ngAfterViewInit() {
        this.getData();
    }

    ngOnDestroy() {
        if (this.toolboxSubscription) {
            this.toolboxSubscription.unsubscribe();
        }

        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.infopanelService.updateInformation({
            tableCount: undefined
        });

        this.fehlermeldungenService.closeMessage();
        this.langSubscription.unsubscribe();
    }

    getData() {
        if (this.suchenFormComponent.isValid()) {
            this.massnahmenSearch(this.suchenFormComponent.mapToDTO());
        } else {
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    massnahmenSearch(params) {
        params.produktId = this.produktId;
        this.spinnerService.activate(BewMassnahmenUebersichtComponent.CHANNEL_STATE_KEY);

        forkJoin([
            //NOSONAR
            this.bewirtschaftungRestService.getMassnahmenByProdukt(params),
            this.bewirtschaftungRestService.getProdukt(this.produktId)
        ]).subscribe(
            ([massnahmenByProduktResponse, produktResponse]) => {
                if (massnahmenByProduktResponse.data) {
                    this.lastUpdate = massnahmenByProduktResponse.data;
                    this.datasource = massnahmenByProduktResponse.data.map((row: MassnahmeViewDTO, index) => this.createRow(row, index));
                    this.infopanelService.updateInformation({ tableCount: this.datasource.length });
                    this.searchSession.storeFieldsByKey(BewMassnahmenUebersichtComponent.CHANNEL_STATE_KEY, this.suchenFormComponent.mapToDTO());
                }

                if (produktResponse.data) {
                    this.produktDto = produktResponse.data;

                    this.isInPlanungSichtbar = this.produktDto.inPlanungSichtbar;
                    this.isIndividuelleAmm = this.produktDto.individuellenAMM;

                    const benutzerCode = this.authService.getLoggedUser().benutzerstelleCode;
                    const benutzerKuerzel = benutzerCode ? benutzerCode.substring(0, 2) : null;
                    const strukturKuerzel = this.produktDto.elementkategorieAmtObject ? this.produktDto.elementkategorieAmtObject.organisation : null;

                    this.benutzerKuerzelMatches = benutzerKuerzel === strukturKuerzel;
                }

                this.updateSecondLabel(this.produktDto);
                this.appendToInforbar(this.produktDto);
                this.spinnerService.deactivate(BewMassnahmenUebersichtComponent.CHANNEL_STATE_KEY);
            },
            () => {
                this.spinnerService.deactivate(BewMassnahmenUebersichtComponent.CHANNEL_STATE_KEY);
            }
        );
    }

    onRefresh() {
        this.fehlermeldungenService.closeMessage();
        this.getData();
    }

    zurProduktplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.produktId, ElementPrefixEnum.PRODUKT_PREFIX);
    }

    massnahmeErfassen() {
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahme/erfassen/grunddaten`]);
    }

    public get CHANNEL_STATE_KEY() {
        return BewMassnahmenUebersichtComponent.CHANNEL_STATE_KEY;
    }

    public onRowSelected(event) {
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen/massnahme/grunddaten`], { queryParams: { massnahmeId: event.massnahmenNr } });
    }

    private parseRoute() {
        this.route.parent.params.subscribe(params => {
            this.produktId = +params['produktId'];
        });
    }

    private restoreState() {
        const state = this.searchSession.restoreStateByKey(BewMassnahmenUebersichtComponent.CHANNEL_STATE_KEY);

        if (state) {
            this.data = { state: state.fields };
        }
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.ZURUECK, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, BewMassnahmenUebersichtComponent.CHANNEL_STATE_KEY, ToolboxDataHelper.createForAmmProdukt(this.produktId), true);
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

    private initInfopanel() {
        this.infopanelService.dispatchInformation({
            title: 'amm.massnahmen.subnavmenuitem.produkt',
            subtitle: 'amm.massnahmen.subnavmenuitem.massnahmen',
            tableCount: this.data && this.datasource ? this.datasource.length : undefined
        });
    }

    private updateSecondLabel(produktDto: ProduktDTO) {
        if (produktDto) {
            this.infopanelService.updateInformation({
                secondTitle: this.dbTranslateService.translateWithOrder(produktDto, 'titel')
            });
        }
    }

    private appendToInforbar(produktDto: ProduktDTO) {
        this.organisationInfoBar = this.ammHelper.getMassnahmenOrganisationTypKuerzel(produktDto.elementkategorieAmtObject, produktDto.strukturelementGesetzObject);

        this.infopanelService.appendToInforbar(this.infobarTemplate);
    }

    private createRow(responseDTO: MassnahmeViewDTO, index: number) {
        return {
            id: index,
            massnahmenNr: responseDTO.massnahmeId,
            titel: this.dbTranslateService.translateWithOrder(responseDTO, 'titel'),
            zulassungsTyp: this.dbTranslateService.translateWithOrder(responseDTO, 'zulassungstypText'),
            gueltigVon: responseDTO.gueltigVon ? new Date(responseDTO.gueltigVon) : '',
            gueltigBis: responseDTO.gueltigBis ? new Date(responseDTO.gueltigBis) : '',
            anbieter: this.setUnternehmen(responseDTO.unternehmenName1, responseDTO.unternehmenName2, responseDTO.unternehmenName3)
        };
    }

    private setUnternehmen(name1: string, name2: string, name3: string): string {
        return `${name1}${name2 ? ' ' + name2 : ''}${name3 ? ' ' + name3 : ''}`;
    }
}
