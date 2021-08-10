import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef, ElementRef, OnDestroy } from '@angular/core';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { MassnahmeSuchenParamDTO } from '@app/shared/models/dtos-generated/massnahmeSuchenParamDTO';
import { DurchfuehrungseinheitListeViewDTO } from '@app/shared/models/dtos-generated/durchfuehrungseinheitListeViewDTO';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Subscription } from 'rxjs';
import { SpinnerService } from 'oblique-reactive';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { PermissionContextService } from '@app/shared/services/permission.context.service';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { ActivatedRoute, Router } from '@angular/router';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { DateRangeFormComponent } from '@app/shared/components/date-range-form/date-range-form.component';
import { AmmBewirtschaftungNavigationHelper } from '../../services/amm-bewirtschaftung-navigation-helper.service';
import { BewMassnahmenUebersichtComponent } from '../bew-massnahmen-uebersicht/bew-massnahmen-uebersicht.component';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { AmmZulassungstypCode } from '@app/shared/enums/domain-code/amm-zulassungstyp-code.enum';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';

@Component({
    selector: 'avam-bew-dfe-uebersicht',
    templateUrl: './bew-dfe-uebersicht.component.html',
    providers: [PermissionContextService]
})
export class BewDfeUebersichtComponent implements OnInit, AfterViewInit, OnDestroy {
    static readonly CHANNEL_STATE_KEY = 'massnahme-dfe-uebersicht';

    @ViewChild('suchenFormComponent') suchenFormComponent: DateRangeFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    data = { state: null };
    datasource = [];
    lastUpdate: DurchfuehrungseinheitListeViewDTO[];
    massnahme: MassnahmeDTO;

    toolboxSubscription: Subscription;
    langChangeSubscription: Subscription;
    zulassungstyp: string;
    unternehmensName: string;
    unternehmensStatus: string;
    burNummer: number;
    organisationInfoBar: string;
    provBurNr: number;

    isKurse = false;
    isStandort = false;
    isMassnahmeKollektiv = false;
    inPlanungAkquisitionSichtbar = false;
    subtitle: string;

    produktId: number;
    massnahmeId: number;
    permissions: typeof Permissions = Permissions;

    constructor(
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private permissionContextService: PermissionContextService,
        private fehlermeldungenService: FehlermeldungenService,
        private searchSession: SearchSessionStorageService,
        private translateService: TranslateService,
        private spinnerService: SpinnerService,
        private infopanelService: AmmInfopanelService,
        private dbTranslateService: DbTranslateService,
        private toolboxService: ToolboxService,
        private modalService: NgbModal,
        private route: ActivatedRoute,
        private router: Router,
        private ammHelper: AmmHelper
    ) {}

    ngOnInit() {
        this.parseRoute();
        this.restoreState();
        this.configureToolbox();

        this.toolboxSubscription = this.subscribeToToolbox();

        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
            this.datasource = this.lastUpdate ? this.lastUpdate.map((row, index) => this.createRow(row, index)) : [];
            if (this.massnahme) {
                this.initInfopanel();
            }
        });
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

        this.fehlermeldungenService.closeMessage();
    }

    getData() {
        if (this.suchenFormComponent.isValid()) {
            this.search(this.suchenFormComponent.mapToDTO());
        } else {
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    search(massnahmeSuchenParam: MassnahmeSuchenParamDTO) {
        this.spinnerService.activate(BewDfeUebersichtComponent.CHANNEL_STATE_KEY);

        massnahmeSuchenParam.massnahmeId = this.massnahmeId;

        forkJoin([this.bewirtschaftungRestService.getDfeByMassnahmeId(massnahmeSuchenParam), this.bewirtschaftungRestService.getMassnahme(this.massnahmeId)]).subscribe(
            ([dfeResponse, massnahmeResponse]) => {
                if (dfeResponse.data) {
                    this.lastUpdate = dfeResponse.data;
                    this.datasource = dfeResponse.data.map((row: DurchfuehrungseinheitListeViewDTO, index) => this.createRow(row, index));
                    this.searchSession.storeFieldsByKey(BewDfeUebersichtComponent.CHANNEL_STATE_KEY, this.suchenFormComponent.mapToDTO());
                }

                if (massnahmeResponse.data) {
                    this.massnahme = massnahmeResponse.data;
                    this.inPlanungAkquisitionSichtbar = this.massnahme.inPlanungAkquisitionSichtbar;
                    this.permissionContextService.getContextPermissions(this.massnahme.ownerId);

                    this.handleDfeTypes(this.massnahme.durchfuehrungseinheitType);

                    this.initInfopanel();
                }

                this.spinnerService.deactivate(BewDfeUebersichtComponent.CHANNEL_STATE_KEY);
            },
            () => {
                this.spinnerService.deactivate(BewDfeUebersichtComponent.CHANNEL_STATE_KEY);
            }
        );
    }

    onRefresh() {
        this.fehlermeldungenService.closeMessage();
        this.getData();
    }

    zurMassnahmenplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.massnahmeId, ElementPrefixEnum.MASSNAHME_PREFIX);
    }

    kursErfassen() {
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen/${this.massnahmeId}/kurs/erfassen/grunddaten`]);
    }

    standortErfassen() {
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen/${this.massnahmeId}/standort/erfassen/grunddaten`]);
    }

    public get CHANNEL_STATE_KEY() {
        return BewMassnahmenUebersichtComponent.CHANNEL_STATE_KEY;
    }

    public onRowSelected(event) {
        if (MassnahmeDTO.DurchfuehrungseinheitTypeEnum.SESSION === this.massnahme.durchfuehrungseinheitType) {
            this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen/massnahme/kurse/kurs/grunddaten`], {
                queryParams: { dfeId: event.durchfuehrungseinheitId, massnahmeId: this.massnahmeId }
            });
        } else if (MassnahmeDTO.DurchfuehrungseinheitTypeEnum.STANDORT === this.massnahme.durchfuehrungseinheitType) {
            this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen/massnahme/standorte/standort/grunddaten`], {
                queryParams: { dfeId: event.durchfuehrungseinheitId, massnahmeId: this.massnahmeId }
            });
        }
    }

    private parseRoute() {
        this.route.parent.queryParams.subscribe(params => {
            this.massnahmeId = +params['massnahmeId'];
        });
        this.route.parent.parent.params.subscribe(params => {
            this.produktId = +params['produktId'];
        });
    }

    private restoreState() {
        const state = this.searchSession.restoreStateByKey(BewDfeUebersichtComponent.CHANNEL_STATE_KEY);

        if (state) {
            this.data = { state: state.fields };
        }
    }

    private initInfopanel() {
        const massnahmeLabel = this.translateService.instant('amm.massnahmen.subnavmenuitem.massnahme');
        const titelLabel = this.dbTranslateService.translateWithOrder(this.massnahme, 'titel');
        const subtitleTranslated = this.translateService.instant(this.subtitle);

        this.zulassungstyp = this.dbTranslateService.translateWithOrder(this.massnahme.zulassungstypObject, 'text');

        this.organisationInfoBar = this.ammHelper.getMassnahmenOrganisationTypKuerzel(
            this.massnahme.produktObject.elementkategorieAmtObject,
            this.massnahme.produktObject.strukturelementGesetzObject
        );

        if (this.massnahme.ammAnbieterObject && this.massnahme.ammAnbieterObject.unternehmen) {
            const unternehmen = this.massnahme.ammAnbieterObject.unternehmen;

            this.unternehmensName = this.ammHelper.concatenateUnternehmensnamen(unternehmen.name1, unternehmen.name2, unternehmen.name3);
            this.unternehmensStatus = this.dbTranslateService.translate(unternehmen.statusObject, 'text');
            this.provBurNr = unternehmen.provBurNr;
            this.burNummer = this.provBurNr ? unternehmen.provBurNr : unternehmen.burNummer;
        }

        this.infopanelService.dispatchInformation({
            title: `${massnahmeLabel} ${titelLabel}`,
            subtitle: subtitleTranslated,
            tableCount: this.data && this.datasource ? this.datasource.length : undefined
        });

        this.infopanelService.sendTemplateToInfobar(this.infobarTemplate);
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, BewDfeUebersichtComponent.CHANNEL_STATE_KEY, ToolboxDataHelper.createForAmmMassnahme(this.massnahmeId), true);
    }

    private subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    private openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: BewDfeUebersichtComponent.CHANNEL_STATE_KEY, windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    private handleDfeTypes(type: MassnahmeDTO.DurchfuehrungseinheitTypeEnum) {
        if (MassnahmeDTO.DurchfuehrungseinheitTypeEnum.SESSION === type) {
            this.isKurse = true;
            this.subtitle = 'amm.massnahmen.subnavmenuitem.kurse';
        } else if (MassnahmeDTO.DurchfuehrungseinheitTypeEnum.STANDORT === type) {
            this.isStandort = true;
            this.subtitle = 'amm.massnahmen.subnavmenuitem.standorte';
        } else {
            this.subtitle = '';
            this.isStandort = false;
            this.isKurse = false;
        }

        if (this.massnahme && this.massnahme.zulassungstypObject) {
            this.isMassnahmeKollektiv = this.massnahme.zulassungstypObject.code === AmmZulassungstypCode.KOLLEKTIV;
        }
    }

    private createRow(responseDTO: DurchfuehrungseinheitListeViewDTO, index: number) {
        const ort = this.dbTranslateService.translateWithOrder(responseDTO, 'ortsbezeichnung');
        const titel = this.dbTranslateService.translateWithOrder(responseDTO, 'durchfuehrungseinheitTitel');

        return {
            id: index,
            durchfuehrungseinheitId: responseDTO.durchfuehrungseinheitId,
            titel: titel || '',
            ort: ort || '',
            status: responseDTO.statusKurztextDe ? this.dbTranslateService.translateWithOrder(responseDTO, 'statusKurztext') : '',
            gueltigVon: responseDTO.durchfuehrungseinheitGueltigVon ? new Date(responseDTO.durchfuehrungseinheitGueltigVon) : '',
            gueltigBis: responseDTO.durchfuehrungseinheitGueltigBis ? new Date(responseDTO.durchfuehrungseinheitGueltigBis) : ''
        };
    }
}
