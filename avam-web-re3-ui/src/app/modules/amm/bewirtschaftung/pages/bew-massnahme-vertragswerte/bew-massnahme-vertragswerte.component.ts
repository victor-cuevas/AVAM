import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ToolboxService } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { AmmDmsTypeEnum } from '@app/shared/enums/amm-dms-type.enum';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';
import { VertragswertTypCodeEnum } from '@app/shared/enums/domain-code/vertragswert-typ-code.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { VertragswertDTO } from '@app/shared/models/dtos-generated/vertragswertDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { forkJoin, Subscription } from 'rxjs';
import { BewVertragswerteUebersichtTableComponent } from '../../components';
import { BewVertragswerteUebersichtHelperService, VertragswerteUebersichtInfobarData } from '../../services/bew-vertragswerte-uebersicht-helper.service';

@Component({
    selector: 'avam-bew-massnahme-vertragswerte',
    templateUrl: './bew-massnahme-vertragswerte.component.html',
    providers: [BewVertragswerteUebersichtHelperService]
})
export class BewMassnahmeVertragswerteComponent implements OnInit, AfterViewInit, OnDestroy {
    static readonly CHANNEL_STATE_KEY = 'massnahme-vertragswerte-uebersicht';

    public get CHANNEL_STATE_KEY() {
        return BewMassnahmeVertragswerteComponent.CHANNEL_STATE_KEY;
    }

    @ViewChild('table') table: BewVertragswerteUebersichtTableComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    massnahmeId: number;
    vertragswerteListDto: VertragswertDTO[];
    datasource = [];
    massnahmeDto: MassnahmeDTO;

    langSubscription: Subscription;
    toolboxSubscription: Subscription;
    types = VertragswertTypCodeEnum;
    infobarData: VertragswerteUebersichtInfobarData;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private facade: FacadeService,
        private vertraegeRestService: VertraegeRestService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private vertragswerteHelperService: BewVertragswerteUebersichtHelperService,
        private infopanelService: AmmInfopanelService,
        private ammHelper: AmmHelper
    ) {
        ToolboxService.CHANNEL = this.CHANNEL_STATE_KEY;
    }

    ngOnInit() {
        this.route.parent.queryParams.subscribe(params => {
            this.massnahmeId = +params['massnahmeId'];
        });

        this.toolboxSubscription = this.vertragswerteHelperService.subscribeToToolbox(this.CHANNEL_STATE_KEY, this.modalPrint);
        this.vertragswerteHelperService.configureToolbox(this.CHANNEL_STATE_KEY, this.getToolboxConfigData());
        this.initInfopanel();

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.vertragswerteHelperService.updateSecondLabel(this.massnahmeDto);
            this.infobarData = this.vertragswerteHelperService.addToInforbar(this.massnahmeDto);
            this.infopanelService.appendToInforbar(this.infobarTemplate);
            this.datasource = this.vertragswerteListDto ? this.vertragswerteListDto.map((row: VertragswertDTO) => this.table.createTableRow(row)) : [];
        });
    }

    ngAfterViewInit() {
        this.getData();
    }

    ngOnDestroy() {
        this.langSubscription.unsubscribe();
        this.toolboxSubscription.unsubscribe();
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.infopanelService.updateInformation({
            tableCount: undefined
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);

        forkJoin([this.bewirtschaftungRestService.getMassnahme(this.massnahmeId), this.vertraegeRestService.getVertragswerteUebersichtForMassnahme(this.massnahmeId)]).subscribe(
            ([massnahmeResponse, vertragswerteResponse]) => {
                if (massnahmeResponse.data) {
                    this.massnahmeDto = massnahmeResponse.data;

                    this.vertragswerteHelperService.updateSecondLabel(this.massnahmeDto);
                    this.infobarData = this.vertragswerteHelperService.addToInforbar(this.massnahmeDto);
                    this.infopanelService.appendToInforbar(this.infobarTemplate);
                }

                if (vertragswerteResponse.data) {
                    this.vertragswerteListDto = vertragswerteResponse.data;
                    this.datasource = this.vertragswerteListDto ? this.vertragswerteListDto.map((row: VertragswertDTO) => this.table.createTableRow(row)) : [];
                    this.infopanelService.updateInformation({ tableCount: this.datasource.length });
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            }
        );
    }

    onRowSelected(event: any) {
        const anbieterId = this.massnahmeDto.ammAnbieterObject.unternehmen.unternehmenId;
        this.vertragswerteHelperService.onVwRowSelected(event, anbieterId, this.CHANNEL_STATE_KEY);
    }

    zurMassnahmeplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.massnahmeId, ElementPrefixEnum.MASSNAHME_PREFIX);
    }

    private initInfopanel() {
        this.infopanelService.dispatchInformation({
            title: 'amm.massnahmen.subnavmenuitem.massnahme',
            subtitle: 'amm.akquisition.subnavmenuitem.vertragswerte',
            tableCount: this.datasource ? this.datasource.length : undefined
        });
    }

    private getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { MASSNAHME_ID: this.massnahmeId },
            uiSuffix: AmmDmsTypeEnum.DMS_TYP_MASSNAHME
        };
    }
}
