import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, TemplateRef, OnDestroy } from '@angular/core';
import { BewBeschaeftigungseinheitenTableComponent } from '../../components';
import { ActivatedRoute, Router } from '@angular/router';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { SpinnerService } from 'oblique-reactive';
import { StandortDTO } from '@app/shared/models/dtos-generated/standortDTO';
import { BeschaeftigungseinheitDTO } from '@app/shared/models/dtos-generated/beschaeftigungseinheitDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { Subscription, forkJoin } from 'rxjs';
import { ToolboxService } from '@app/shared';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { TranslateService } from '@ngx-translate/core';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';

@Component({
    selector: 'avam-bew-praktikumsstellen-uebersicht',
    templateUrl: './bew-praktikumsstellen-uebersicht.component.html'
})
export class BewPraktikumsstellenUebersichtComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('tableComponent') table: BewBeschaeftigungseinheitenTableComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    channel = 'praktikumsstellen-uebersicht';
    firstRowHeader = 'amm.massnahmen.label.praktikumsstelle.nummer';
    datasource = [];
    standortDto: StandortDTO;
    massnahmeId: number;
    dfeId: number;
    produktId: number;
    zurStandortplannungAktiv: boolean;
    praktikumstelleNeuErfassenAktiv: boolean;
    toolboxSubscription: Subscription;
    kuerzelMassnahmentyp: string;
    zulassungstyp: string;
    unternehmensname: string;
    massnahme: MassnahmeDTO;
    langSubscription: Subscription;
    permissions: typeof Permissions = Permissions;
    unternehmenStatus: string;
    burNr: string | number;

    constructor(
        private route: ActivatedRoute,
        private spinnerService: SpinnerService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private dbTranslateService: DbTranslateService,
        private toolboxService: ToolboxService,
        private modalService: NgbModal,
        private infopanelService: AmmInfopanelService,
        private translateService: TranslateService,
        private router: Router,
        private ammHelper: AmmHelper
    ) {}

    ngOnInit() {
        this.getRouteParams();
    }

    ngAfterViewInit() {
        this.infopanelService.appendToInforbar(this.infobarTemplate);
        this.getData();
        this.configureToolbox();
        this.setSubscriptions();
    }

    setSubscriptions() {
        this.toolboxSubscription = this.subscribeToToolbox();

        this.langSubscription = this.translateService.onLangChange.subscribe(() => {
            this.updateInfopanel();
            this.mapToTableDatasource();
        });
    }

    ngOnDestroy(): void {
        this.toolboxSubscription.unsubscribe();
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.langSubscription.unsubscribe();
    }

    getData() {
        this.spinnerService.activate(this.channel);

        forkJoin(
            this.bewirtschaftungRestService.getStandortWithBeschaeftigungseinheiten(this.produktId, this.massnahmeId, this.dfeId),
            this.bewirtschaftungRestService.getMassnahme(this.massnahmeId)
        ).subscribe(
            ([standortResponse, massnahmeResponse]) => {
                if (standortResponse.data) {
                    this.standortDto = standortResponse.data;
                    this.zurStandortplannungAktiv = this.standortDto.inPlanungAkquisitionSichtbar;
                    this.praktikumstelleNeuErfassenAktiv = this.standortDto.hasNeuErfassenButtonForBeschaeftigungseinheiten;

                    this.infopanelService.updateInformation({ tableCount: this.standortDto.beschaeftigungseinheiten ? this.standortDto.beschaeftigungseinheiten.length : 0 });
                    this.mapToTableDatasource();
                }

                if (massnahmeResponse.data) {
                    this.massnahme = massnahmeResponse.data;
                    this.updateInfopanel();
                }

                this.spinnerService.deactivate(this.channel);
            },
            () => {
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    mapToTableDatasource() {
        this.datasource =
            this.standortDto && this.standortDto.beschaeftigungseinheiten
                ? this.standortDto.beschaeftigungseinheiten
                      .map((row: BeschaeftigungseinheitDTO, index) => this.table.createTableRow(row, index))
                      .sort((v1, v2) => +v1.beschaeftigungseinheitId - +v2.beschaeftigungseinheitId)
                      .sort((v1, v2) => +v1.gueltigVon - +v2.gueltigVon)
                : [];
    }

    getRouteParams() {
        const routeparamMap = this.route.snapshot.queryParamMap;
        this.massnahmeId = Number(routeparamMap.get('massnahmeId'));
        this.dfeId = Number(routeparamMap.get('dfeId'));
        this.produktId = Number(this.route.parent.parent.parent.snapshot.paramMap.get('produktId'));
    }

    zurStandortplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.dfeId, ElementPrefixEnum.DURCHFUEHRUNGSEINHEIT_PREFIX);
    }

    praktikumsstelleErfassen() {
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen/${this.massnahmeId}/standort/${this.dfeId}/beschaeftigungseinheit/erfassen/grunddaten`]);
    }

    onItemSelected(event) {
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen/massnahme/standorte/standort/praktikumsstellen/praktikumsstelle/grunddaten`], {
            queryParams: { massnahmeId: this.massnahmeId, dfeId: this.dfeId, beId: event.beschaeftigungseinheitId }
        });
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, ToolboxDataHelper.createForAmmDfe(this.dfeId), true);
    }

    private subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    private openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: this.channel, windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    private updateInfopanel() {
        if (this.massnahme && this.standortDto) {
            this.kuerzelMassnahmentyp = this.getKuerzelMassnahmentyp(this.massnahme);
            const standortLabel = this.translateService.instant('amm.massnahmen.subnavmenuitem.standort');
            const titelLabel = this.dbTranslateService.translateWithOrder(this.standortDto, 'titel');
            this.zulassungstyp = this.dbTranslateService.translate(this.massnahme.zulassungstypObject, 'text');
            this.unternehmensname = this.setUnternehmensname(this.standortDto);
            this.burNr = this.getBurnummerInfo(this.standortDto.durchfuehrungsortObject.unternehmenObject);
            this.unternehmenStatus = this.dbTranslateService.translate(this.standortDto.durchfuehrungsortObject.unternehmenObject.statusObject, 'text');
            this.infopanelService.dispatchInformation({
                title: `${standortLabel} ${titelLabel}`,
                subtitle: this.translateService.instant('arbeitgeber.label.praktikumsstellen'),
                tableCount: this.standortDto && this.standortDto.beschaeftigungseinheiten ? this.standortDto.beschaeftigungseinheiten.length : undefined
            });
        }
    }

    private setUnternehmensname(standort: StandortDTO): string {
        return `${standort.durchfuehrungsortObject.unternehmenObject.name1}
        ${standort.durchfuehrungsortObject.unternehmenObject.name2 ? ' ' + standort.durchfuehrungsortObject.unternehmenObject.name2 : ''}${
            standort.durchfuehrungsortObject.unternehmenObject.name3 ? ' ' + standort.durchfuehrungsortObject.unternehmenObject.name3 : ''
        }`;
    }

    private getKuerzelMassnahmentyp(massnahmeDto: MassnahmeDTO): string {
        const kuerzel = massnahmeDto && massnahmeDto.produktObject.elementkategorieAmtObject ? massnahmeDto.produktObject.elementkategorieAmtObject.organisation : '';
        const massnahmentyp =
            massnahmeDto && massnahmeDto.produktObject.strukturelementGesetzObject
                ? this.dbTranslateService.translate(massnahmeDto.produktObject.strukturelementGesetzObject, 'elementName')
                : '';

        return kuerzel && massnahmentyp ? `${kuerzel} - ${massnahmentyp}` : kuerzel ? kuerzel : massnahmentyp ? massnahmentyp : '';
    }

    private getBurnummerInfo(unternehmen: UnternehmenDTO): string | number {
        if (unternehmen.provBurNr) {
            return `${unternehmen.provBurNr} (${this.translateService.instant('unternehmen.label.provisorisch')})`;
        } else {
            return unternehmen.burNummer;
        }
    }
}
