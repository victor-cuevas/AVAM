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
import { ProduktDTO } from '@app/shared/models/dtos-generated/produktDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FacadeService } from '@app/shared/services/facade.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Permissions } from '@shared/enums/permissions.enum';
import { SpinnerService } from 'oblique-reactive';
import { forkJoin, Subject, Subscription } from 'rxjs';

@Component({
    selector: 'avam-bew-produkt-planwerte-uebersicht',
    templateUrl: './bew-produkt-planwerte-uebersicht.component.html',
    styleUrls: ['./bew-produkt-planwerte-uebersicht.component.scss']
})
export class BewProduktPlanwerteUebersichtComponent implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    dataSource: PlanwertDTO[];
    channel = 'bew-produkt-planwerte-uebersicht';
    produktId: number;
    permissions: typeof Permissions = Permissions;
    toolboxSubscription: Subscription;
    langChangeSubscription: Subscription;
    produktDto: ProduktDTO;
    buttons: Subject<any[]> = new Subject();
    buttonsEnum = BaseResponseWrapperListButtonsEnumWarningMessages.DataEnum;

    constructor(
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private route: ActivatedRoute,
        private toolboxService: ToolboxService,
        private modalService: NgbModal,
        private translateService: TranslateService,
        private infopanelService: AmmInfopanelService,
        private dbTranslateService: DbTranslateService,
        private fehlermeldungenService: FehlermeldungenService,
        private router: Router,
        private facade: FacadeService,
        private ammHelper: AmmHelper
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
        this.route.parent.params.subscribe(params => {
            this.produktId = +params['produktId'];
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
            entityIDsMapping: { PRODUKT_ID: this.produktId },
            uiSuffix: AmmPlanwerttypEnum.AMM_PLANWERTTYP_PRODUKT
        };
    }

    subscribeToLangChange(): Subscription {
        return this.translateService.onLangChange.subscribe(() => {
            this.fehlermeldungenService.closeMessage();
            this.getData();
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);
        forkJoin(
            this.bewirtschaftungRestService.getProduktPlanwerteList(this.produktId),
            this.bewirtschaftungRestService.getProdukt(this.produktId),
            this.bewirtschaftungRestService.getProduktButtons(this.produktId)
        ).subscribe(
            ([planwerteList, produkt, buttons]) => {
                this.dataSource = planwerteList.data;
                this.produktDto = produkt.data;
                this.updateInfopanel(produkt.data);
                this.buttons.next(buttons.data);

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    updateInfopanel(data: ProduktDTO) {
        this.infopanelService.dispatchInformation({
            title: 'amm.planung.label.produkt',
            secondTitle: data ? this.dbTranslateService.translateWithOrder(data, 'titel') : undefined,
            subtitle: 'amm.planung.subnavmenuitem.planwerte',
            hideInfobar: false,
            tableCount: this.dataSource.length
        });
        this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
    }

    zurProduktplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.produktId, ElementPrefixEnum.PRODUKT_PREFIX);
    }

    planwertErfassen() {
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/planwerte/erfassen`]);
    }

    itemSelected(data: PlanwertDTO) {
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/planwerte/planwert/bearbeiten`], { queryParams: { planwertId: data.planwertId } });
    }

    ngOnDestroy() {
        this.fehlermeldungenService.closeMessage();
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.infopanelService.resetTemplateInInfobar();
        this.toolboxSubscription.unsubscribe();
    }
}
