import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AmmBudgetierungRestService } from '../../services/amm-budgetierung-rest.service';
import { Subject, forkJoin, NEVER } from 'rxjs';
import { BaseResponseWrapperListButtonsEnumWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListButtonsEnumWarningMessages';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericConfirmComponent } from '@app/shared';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { SpinnerService, NotificationService, Unsubscribable } from 'oblique-reactive';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { TeilBudgetDTO } from '@app/shared/models/dtos-generated/teilBudgetDTO';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { BudgetDTO } from '@dtos/budgetDTO';
import { ElementKategorieDTO } from '@app/shared/models/dtos-generated/elementKategorieDTO';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { takeUntil, map, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { BudgetvergleichService } from '../../services/budgetvergleich.service';
import { NavigationService } from '@app/shared/services/navigation-service';
import { MessageBus } from '@app/shared/services/message-bus';
import { HttpResponseHelper } from '@app/shared/helpers/http-response.helper';
import { HttpResponse } from '@angular/common/http';
import { AmmStrukturAggregatDTO } from '@app/shared/models/dtos-generated/ammStrukturAggregatDTO';
import { BudgetTreeService } from '../../services/budget-tree.service';
import { TreeNodeInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-node.interface';
import { TeilbudgetTreeTableComponent, BudgetvergleichAnzeigenModalComponent } from '../../components';

@Component({
    selector: 'avam-teilbudget-bearbeiten',
    templateUrl: './teilbudget-bearbeiten.component.html',
    styleUrls: ['./teilbudget-bearbeiten.component.scss']
})
export class TeilbudgetBearbeitenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('teilbudgetTable') teilbudgetTable: TeilbudgetTreeTableComponent;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    channel = 'teilbudget-bearbeiten';

    teilbudgetId: number;
    teilbudget: TeilBudgetDTO;
    struktur: AmmStrukturAggregatDTO;
    treeArray: TreeNodeInterface[];
    budgetId: number;
    budget: BudgetDTO;
    tableReadonlyMode = false;

    buttons: Subject<any[]> = new Subject();
    buttonsEnum = BaseResponseWrapperListButtonsEnumWarningMessages.DataEnum;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private budgetierungRestService: AmmBudgetierungRestService,
        private modalService: NgbModal,
        private fehlermeldungenService: FehlermeldungenService,
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private notificationService: NotificationService,
        private dbTranslateService: DbTranslateService,
        private translateService: TranslateService,
        private infopanelService: AmmInfopanelService,
        private budgetvergleichService: BudgetvergleichService,
        private navigationService: NavigationService,
        private messageBus: MessageBus,
        private budgetTreeService: BudgetTreeService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.budgetId = params['budgetId'];
        });
        this.route.parent.queryParams.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.teilbudgetId = params['teilbudgetId'];

            this.getData();
        });
        this.subscribeToToolbox();
        this.navigationService.showNavigationTreeRoute('./teilbudgets/bearbeiten', { teilbudgetId: this.teilbudgetId });
        this.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                this.cancel();
            }
        });
    }

    getData() {
        this.spinnerService.activate(this.channel);

        forkJoin(
            this.budgetierungRestService.getTeilbudget(this.teilbudgetId),
            this.budgetierungRestService.getTeilbudgetBearbeitenAvailableButtons(this.teilbudgetId),
            this.budgetierungRestService.getTeilbudgetStruktur(this.teilbudgetId)
        )
            .pipe(
                map(
                    ([teilbudget, buttons, struktur]) => {
                        if (teilbudget.data && struktur.data) {
                            this.teilbudget = teilbudget.data;
                            this.struktur = struktur.data;
                            this.budget = teilbudget.data.budget;
                            this.treeArray = [this.budgetTreeService.buildTree(struktur.data.strukturelementRoot, struktur.data.additionalData)];
                        }
                        this.buttons.next(buttons.data);
                        this.tableReadonlyMode = !buttons.data.includes(this.buttonsEnum.COMMONBUTTONSPEICHERN);
                        this.configureToolbox(buttons.data);
                        return this.budget;
                    },
                    error => {
                        this.deactivateSpinnerAndScrollToTop();
                    }
                ),
                switchMap((budget: BudgetDTO) => this.budgetierungRestService.getElementkategorieByOrganisation(budget.organisation))
            )
            .subscribe(
                elementkategorie => {
                    this.configureInfoleiste(elementkategorie.data);
                    this.openBudgetvergleich();
                    this.deactivateSpinnerAndScrollToTop();
                },
                error => {
                    this.deactivateSpinnerAndScrollToTop();
                }
            );
    }

    configureInfoleiste(elementkategorie: ElementKategorieDTO) {
        this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
        const institution = this.dbTranslateService.translate(this.teilbudget.institution, 'kurzText') || '';
        const kanton = this.dbTranslateService.translate(this.teilbudget.kanton, 'name') || '';
        this.infopanelService.dispatchInformation({
            title: 'common.label.budget',
            secondTitle: `${this.budget.jahr.toString()} ${this.dbTranslateService.translate(elementkategorie, 'beschreibung')}`,
            subtitle: `${this.translateService.instant('amm.budgetierung.subnavmenuitem.teilbudget')} ${institution} ${kanton}`
        });
        this.infopanelService.sendLastUpdate(this.teilbudget);
    }

    configureToolbox(enabledButtons: any[]) {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        if (enabledButtons.includes(this.buttonsEnum.COMMONBUTTONEXCELEXPORT)) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EXCEL, true, true));
        }

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData());
    }

    getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { BUDGET_ID: this.budgetId }
        };
    }

    subscribeToToolbox() {
        this.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.EXCEL) {
                    this.onExportTeilbudget();
                }
            });
    }

    onExportTeilbudget() {
        this.budgetierungRestService.exportTeilbudget(this.teilbudgetId).subscribe((res: HttpResponse<Blob>) => {
            HttpResponseHelper.openBlob(res);
        });
    }

    canDeactivate() {
        return false;
    }

    openDeleteDialog() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static', centered: true });
        modalRef.result.then(result => {
            if (result) {
                this.delete();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    openBudgetvergleich() {
        const listeKopieParam = this.budgetvergleichService.getListeKopieParam();

        if (listeKopieParam) {
            const modalRef = this.modalService.open(BudgetvergleichAnzeigenModalComponent, {
                ariaLabelledBy: 'modal-basic-title',
                windowClass: 'avam-modal-xl',
                backdrop: 'static',
                centered: true
            });
            modalRef.componentInstance.listeKopieParam = listeKopieParam;
            this.budgetvergleichService.setListeKopieParam(null);
        }
    }

    berechnen() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);

        if (!this.teilbudgetTable.formGroup.valid) {
            this.teilbudgetTable.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.deactivateSpinnerAndScrollToTop();
            return;
        }

        this.budgetierungRestService.teilbudgetBerechnen(this.teilbudgetId, this.teilbudgetTable.mapToDTO(this.struktur)).subscribe(
            response => {
                if (response.data) {
                    this.notificationService.success(this.dbTranslateService.instant('amm.planundakqui.message.datenberechnet'));
                    this.struktur = response.data;
                    this.treeArray = [this.budgetTreeService.buildTree(response.data.strukturelementRoot, response.data.additionalData)];
                }
                this.deactivateSpinnerAndScrollToTop();
            },
            error => {
                this.deactivateSpinnerAndScrollToTop();
            }
        );
    }

    save() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);

        if (!this.teilbudgetTable.formGroup.valid) {
            this.teilbudgetTable.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.deactivateSpinnerAndScrollToTop();
            return;
        }

        this.budgetierungRestService
            .updateTeilbudget({ teilbudget: this.teilbudget, struktur: this.teilbudgetTable.mapToDTO(this.struktur) })
            .pipe(
                map(
                    response => {
                        if (response.data) {
                            this.notificationService.success(this.dbTranslateService.instant('common.message.datengespeichert'));
                            this.struktur = response.data;
                            this.treeArray = [this.budgetTreeService.buildTree(response.data.strukturelementRoot, response.data.additionalData)];
                            return this.teilbudgetId;
                        }
                        return NEVER;
                    },
                    error => {
                        this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgespeichert'));
                        this.deactivateSpinnerAndScrollToTop();
                    }
                ),
                switchMap(() => this.budgetierungRestService.getTeilbudget(this.teilbudgetId))
            )
            .subscribe(
                response => {
                    if (response.data) {
                        this.teilbudget = response.data;
                        this.infopanelService.sendLastUpdate(this.teilbudget);
                    }
                    this.deactivateSpinnerAndScrollToTop();
                },
                error => this.deactivateSpinnerAndScrollToTop()
            );
    }

    delete() {
        this.fehlermeldungenService.closeMessage();

        this.spinnerService.activate(this.channel);

        this.budgetierungRestService.deleteTeilbudget(this.teilbudgetId).subscribe(
            response => {
                if (!response.warning) {
                    this.notificationService.success(this.dbTranslateService.instant('common.message.datengeloescht'));
                    this.cancel();
                }
                this.deactivateSpinnerAndScrollToTop();
            },
            error => {
                this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgeloescht'));
                this.deactivateSpinnerAndScrollToTop();
            }
        );
    }

    cancel() {
        this.router.navigate([`amm/budget/${this.budgetId}/teilbudgets`]);
        this.navigationService.hideNavigationTreeRoute('./teilbudgets/bearbeiten');
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.fehlermeldungenService.closeMessage();
        this.infopanelService.resetTemplateInInfobar();
        this.infopanelService.sendLastUpdate({}, true);

        this.toolboxService.sendConfiguration([]);
    }

    private deactivateSpinnerAndScrollToTop(): void {
        this.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }
}
