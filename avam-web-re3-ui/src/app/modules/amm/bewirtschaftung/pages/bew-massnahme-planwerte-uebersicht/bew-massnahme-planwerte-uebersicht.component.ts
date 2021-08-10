import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { AmmPlanwerttypEnum } from '@app/shared/enums/domain-code/amm-planwerttyp-code.enum';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { BaseResponseWrapperListButtonsEnumWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListButtonsEnumWarningMessages';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { PlanwertDTO } from '@app/shared/models/dtos-generated/planwertDTO';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Permissions } from '@shared/enums/permissions.enum';
import { SpinnerService } from 'oblique-reactive';
import { forkJoin, Subject, Subscription } from 'rxjs';

@Component({
    selector: 'avam-bew-massnahme-planwerte-uebersicht',
    templateUrl: './bew-massnahme-planwerte-uebersicht.component.html',
    styleUrls: ['./bew-massnahme-planwerte-uebersicht.component.scss']
})
export class BewMassnahmePlanwerteUebersichtComponent implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    dataSource: PlanwertDTO[];
    channel = 'massnahme-planwerte-uebersicht';
    massnahmeId: number;
    produktId: number;
    permissions: typeof Permissions = Permissions;
    toolboxSubscription: Subscription;
    langChangeSubscription: Subscription;
    massnahmeDto: MassnahmeDTO;
    anbieter: UnternehmenDTO;
    organisationInfoBar: string;
    zulassungsTyp: string;
    buttons: Subject<any[]> = new Subject();
    buttonsEnum = BaseResponseWrapperListButtonsEnumWarningMessages.DataEnum;

    constructor(
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private route: ActivatedRoute,
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private modalService: NgbModal,
        private translateService: TranslateService,
        private infopanelService: AmmInfopanelService,
        private dbTranslateService: DbTranslateService,
        private fehlermeldungenService: FehlermeldungenService,
        private ammHelper: AmmHelper,
        private router: Router
    ) {
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.getRouteData();
        this.configureToolbox();
        this.getData();
        this.toolboxSubscription = this.subscribeToToolbox();
        this.langChangeSubscription = this.subscribeToLangChange();
    }

    getRouteData() {
        this.route.parent.queryParams.subscribe(params => {
            this.massnahmeId = +params['massnahmeId'];
        });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData(), true);
    }

    subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(this.channel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true });
    }

    getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { MASSNAHME_ID: this.massnahmeId },
            uiSuffix: AmmPlanwerttypEnum.AMM_PLANWERTTYP_MASSNAHME
        };
    }

    subscribeToLangChange(): Subscription {
        return this.translateService.onLangChange.subscribe(() => {
            this.fehlermeldungenService.closeMessage();
            this.getData();
        });
    }

    getData() {
        this.spinnerService.activate(this.channel);
        forkJoin(
            this.bewirtschaftungRestService.getMassnahmePlanwerteList(this.massnahmeId),
            this.bewirtschaftungRestService.getMassnahme(this.massnahmeId),
            this.bewirtschaftungRestService.getMassnahmeButtons(this.massnahmeId)
        ).subscribe(
            ([planwerteList, massnahmeDTO, buttons]) => {
                this.massnahmeDto = massnahmeDTO.data;
                this.produktId = massnahmeDTO.data.produktObject.produktId;
                this.dataSource = planwerteList.data;
                this.updateInfopanel(massnahmeDTO.data);
                this.buttons.next(buttons.data);

                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    updateInfopanel(data: MassnahmeDTO) {
        this.infopanelService.dispatchInformation({
            title: 'amm.massnahmen.subnavmenuitem.massnahme',
            secondTitle: data ? this.dbTranslateService.translateWithOrder(data, 'titel') : undefined,
            subtitle: 'amm.planung.subnavmenuitem.planwerte',
            hideInfobar: false,
            tableCount: this.dataSource.length
        });

        this.anbieter = data.ammAnbieterObject.unternehmen;
        this.zulassungsTyp = data.zulassungstypObject ? this.dbTranslateService.translateWithOrder(data.zulassungstypObject, 'text') : '';
        this.getKurzel(data);
        this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
    }

    getKurzel(data) {
        if (data && data.produktObject) {
            this.organisationInfoBar = this.ammHelper.getMassnahmenOrganisationTypKuerzel(
                data.produktObject.elementkategorieAmtObject,
                data.produktObject.strukturelementGesetzObject
            );
        }
    }

    zurMassnahmenplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.massnahmeId, ElementPrefixEnum.MASSNAHME_PREFIX);
    }

    planwertErfassen() {
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen/massnahme/planwerte/erfassen`], {
            queryParams: { massnahmeId: this.massnahmeId }
        });
    }

    itemSelected(data: PlanwertDTO) {
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen/massnahme/planwerte/planwert/bearbeiten`], {
            queryParams: { massnahmeId: this.massnahmeId, planwertId: data.planwertId }
        });
    }

    ngOnDestroy() {
        this.fehlermeldungenService.closeMessage();
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.infopanelService.resetTemplateInInfobar();
        this.toolboxSubscription.unsubscribe();
        this.toolboxSubscription.unsubscribe();
    }
}
