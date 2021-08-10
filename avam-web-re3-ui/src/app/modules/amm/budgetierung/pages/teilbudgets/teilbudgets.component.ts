import { Component, OnInit, TemplateRef, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AmmBudgetierungRestService } from '../../services/amm-budgetierung-rest.service';
import { BudgetDTO } from '@app/shared/models/dtos-generated/budgetDTO';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { ElementKategorieDTO } from '@app/shared/models/dtos-generated/elementKategorieDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { TeilBudgetDTO } from '@app/shared/models/dtos-generated/teilBudgetDTO';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Subject } from 'rxjs';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ToolboxService } from '@app/shared';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BaseResponseWrapperListButtonsEnumWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListButtonsEnumWarningMessages';

@Component({
    selector: 'avam-teilbudgets',
    templateUrl: './teilbudgets.component.html',
    styleUrls: ['./teilbudgets.component.scss']
})
export class TeilbudgetsComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    channel = 'teilbudgets-channel';

    budgetId: number;
    budget: BudgetDTO;
    teilbudgets: TeilBudgetDTO[];
    dataSource: any[];

    buttons: Subject<any[]> = new Subject();
    buttonsEnum = BaseResponseWrapperListButtonsEnumWarningMessages.DataEnum;

    constructor(
        private infopanelService: AmmInfopanelService,
        private route: ActivatedRoute,
        private router: Router,
        private budgetierungRestService: AmmBudgetierungRestService,
        private dbTranslateService: DbTranslateService,
        private translate: TranslateService,
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private fehlermeldungenService: FehlermeldungenService,
        private modalService: NgbModal
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.route.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.budgetId = params['budgetId'];
            this.getData();
            this.configureToolbox();
        });
        this.subscribeToLangChange();
        this.subscribeToToolbox();
    }

    subscribeToLangChange() {
        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.dataSource = this.teilbudgets.map(this.createTeilbudgetRow);
        });
    }

    subscribeToToolbox() {
        this.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true });
                }
            });
    }

    getData() {
        this.spinnerService.activate(this.channel);

        forkJoin(
            this.budgetierungRestService.getBudget(this.budgetId),
            this.budgetierungRestService.getTeilbudgets(this.budgetId),
            this.budgetierungRestService.getTeilbudgetSearchAvailableButtons(this.budgetId)
        )
            .pipe(
                map(([budget, teilbudgets, buttons]) => {
                    this.buttons.next(buttons.data);
                    if (budget.data && teilbudgets.data) {
                        this.teilbudgets = teilbudgets.data;
                        this.dataSource = teilbudgets.data.map(this.createTeilbudgetRow);
                        this.budget = budget.data;
                        return this.budget.organisation;
                    }

                    return null;
                }),
                switchMap(organisation => this.budgetierungRestService.getElementkategorieByOrganisation(organisation))
            )
            .subscribe(
                response => {
                    if (response.data) {
                        this.configureInfoleiste(response.data);
                    }
                    this.spinnerService.deactivate(this.channel);
                },
                error => {
                    this.spinnerService.deactivate(this.channel);
                }
            );
    }

    createTeilbudgetRow = (data: TeilBudgetDTO) => {
        return {
            teilbudgetId: data.teilbudgetId,
            institution: data.institution ? this.dbTranslateService.translate(data.institution, 'kurzText') : '',
            kanton: data.kanton ? this.dbTranslateService.translate(data.kanton, 'name') : ''
        };
    };

    configureInfoleiste(elementkategorie: ElementKategorieDTO) {
        this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
        this.infopanelService.dispatchInformation({
            title: 'common.label.budget',
            secondTitle: `${this.budget.jahr.toString()} ${this.dbTranslateService.translate(elementkategorie, 'beschreibung')}`,
            subtitle: 'amm.budgetierung.subnavmenuitem.teilbudgets',
            tableCount: this.dataSource.length
        });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData());
    }

    getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { BUDGET_ID: this.budgetId }
        };
    }

    itemSelected(teilbudgetId: number) {
        this.router.navigate([`amm/budget/${this.budgetId}/teilbudgets/bearbeiten`], { queryParams: { teilbudgetId } });
    }

    navigateToCreate() {
        this.router.navigate([`amm/budget/${this.budgetId}/teilbudgets/erfassen`]);
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        this.fehlermeldungenService.closeMessage();

        this.infopanelService.resetTemplateInInfobar();

        this.infopanelService.updateInformation({
            tableCount: undefined
        });

        this.toolboxService.sendConfiguration([]);
    }
}
