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
import { PlanwertDTO } from '@app/shared/models/dtos-generated/planwertDTO';
import { SessionDTO } from '@app/shared/models/dtos-generated/sessionDTO';
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
    selector: 'avam-bew-kurs-planwerte-uebersicht',
    templateUrl: './bew-kurs-planwerte-uebersicht.component.html',
    styleUrls: ['./bew-kurs-planwerte-uebersicht.component.scss']
})
export class BewKursPlanwerteUebersichtComponent implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    dataSource: PlanwertDTO[];
    channel = 'kurs-planwerte-uebersicht';
    dfeId: number;
    permissions: typeof Permissions = Permissions;
    toolboxSubscription: Subscription;
    langChangeSubscription: Subscription;
    sessionDto: SessionDTO;
    anbieter: UnternehmenDTO;
    organisationInfoBar: string;
    massnahmeId: number;
    produktId: number;
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
            this.dfeId = +params['dfeId'];
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
            entityIDsMapping: { DFE_ID: this.dfeId },
            uiSuffix: AmmPlanwerttypEnum.AMM_PLANWERTTYP_KURS
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
            this.bewirtschaftungRestService.getDfePlanwerteList(this.dfeId),
            this.bewirtschaftungRestService.getDfeSession(this.dfeId),
            this.bewirtschaftungRestService.getDfeButtons(this.dfeId)
        ).subscribe(
            ([list, sessionDto, buttons]) => {
                this.sessionDto = sessionDto.data;
                this.dataSource = list.data;
                this.massnahmeId = sessionDto.data.massnahmeObject.massnahmeId;
                this.produktId = sessionDto.data.massnahmeObject.produktObject.produktId;
                this.updateInfopanel(sessionDto.data);
                this.getKurzel(sessionDto.data);
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

    updateInfopanel(data: SessionDTO) {
        this.infopanelService.dispatchInformation({
            title: 'amm.planung.label.kurs',
            secondTitle: data ? this.dbTranslateService.translateWithOrder(data, 'titel') : undefined,
            subtitle: 'amm.planung.subnavmenuitem.planwerte',
            hideInfobar: false,
            tableCount: this.dataSource.length
        });

        this.anbieter = data.massnahmeObject && data.massnahmeObject.ammAnbieterObject ? data.massnahmeObject.ammAnbieterObject.unternehmen : undefined;
        this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
    }

    getKurzel(data: SessionDTO) {
        if (data && data.massnahmeObject && data.massnahmeObject.produktObject) {
            this.organisationInfoBar = this.ammHelper.getMassnahmenOrganisationTypKuerzel(
                data.massnahmeObject.produktObject.elementkategorieAmtObject,
                data.massnahmeObject.produktObject.strukturelementGesetzObject
            );
        }
    }

    zurKursplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.dfeId, ElementPrefixEnum.DURCHFUEHRUNGSEINHEIT_PREFIX);
    }

    planwertErfassen() {
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen/massnahme/kurse/kurs/planwerte/erfassen`], {
            queryParams: { massnahmeId: this.massnahmeId, dfeId: this.dfeId }
        });
    }

    itemSelected(data: PlanwertDTO) {
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen/massnahme/kurse/kurs/planwerte/planwert/bearbeiten`], {
            queryParams: { massnahmeId: this.massnahmeId, dfeId: this.dfeId, planwertId: data.planwertId }
        });
    }

    ngOnDestroy() {
        this.fehlermeldungenService.closeMessage();
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.infopanelService.resetTemplateInInfobar();
        this.toolboxSubscription.unsubscribe();
        this.toolboxService.sendConfiguration([]);
    }
}
