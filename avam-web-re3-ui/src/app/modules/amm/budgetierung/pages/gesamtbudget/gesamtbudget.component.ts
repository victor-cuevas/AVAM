import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, ElementRef, AfterViewInit } from '@angular/core';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { SpinnerService, NotificationService, Unsubscribable } from 'oblique-reactive';
import { AmmBudgetierungRestService } from '../../services/amm-budgetierung-rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GesamtBudgetFormData, GesamtbudgetFormComponent } from '../../components/gesamtbudget-form/gesamtbudget-form.component';
import { forkJoin, Subject, NEVER, Observable } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { BudgetDTO } from '@app/shared/models/dtos-generated/budgetDTO';
import { ElementKategorieDTO } from '@app/shared/models/dtos-generated/elementKategorieDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { BaseResponseWrapperListButtonsEnumWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListButtonsEnumWarningMessages';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { BudgetTreeService } from '../../services/budget-tree.service';
import { TranslateService } from '@ngx-translate/core';
import { AmmStrukturAggregatDTO } from '@app/shared/models/dtos-generated/ammStrukturAggregatDTO';
import { GenericConfirmComponent, ToolboxService } from '@app/shared';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { DmsMetadatenKopierenModalComponent, DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { HttpResponse } from '@angular/common/http';
import { HttpResponseHelper } from '@app/shared/helpers/http-response.helper';
import { BaseResponseWrapperBudgetDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperBudgetDTOWarningMessages';
import { ListeKopieParamDTO } from '@app/shared/models/dtos-generated/listeKopieParamDTO';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import { BudgetvergleichService } from '../../services/budgetvergleich.service';
import { TreeNodeInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-node.interface';

enum UpdateType {
    UPDATE,
    FREIGEBEN,
    ZURUECKNEHMEN,
    UEBERARBEITEN,
    ERSETZEN
}
@Component({
    selector: 'avam-gesamtbudget',
    templateUrl: './gesamtbudget.component.html',
    styleUrls: ['./gesamtbudget.component.scss']
})
export class GesamtbudgetComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('budgetForm') budgetForm: GesamtbudgetFormComponent;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;
    @ViewChild('budgetvergleichModal') budgetvergleichModal: ElementRef;

    channel = 'gesamtbudget-bearbeiten';
    budgetId: number;
    budget: BudgetDTO;
    strukturData: AmmStrukturAggregatDTO;
    listeKopieParam: ListeKopieParamDTO = null;
    formData: GesamtBudgetFormData;
    treeArray: TreeNodeInterface[] = [];
    buttons: Subject<any[]> = new Subject();
    buttonsEnum = BaseResponseWrapperListButtonsEnumWarningMessages.DataEnum;
    updateType = UpdateType;

    constructor(
        private infopanelService: AmmInfopanelService,
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private budgetierungRestService: AmmBudgetierungRestService,
        private route: ActivatedRoute,
        private dbTranslateService: DbTranslateService,
        private modalService: NgbModal,
        private fehlermeldungenService: FehlermeldungenService,
        private notificationService: NotificationService,
        private router: Router,
        private budgetTreeService: BudgetTreeService,
        private translateService: TranslateService,
        private budgetvergleichService: BudgetvergleichService
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

        this.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.treeArray = [this.budgetTreeService.buildTree(this.strukturData.strukturelementRoot, this.strukturData.additionalData)];
        });
        this.subscribeToToolbox();
    }

    ngAfterViewInit() {
        this.openBudgetvergleich();
    }

    getData() {
        this.spinnerService.activate(this.channel);

        this.budgetierungRestService
            .getBudget(this.budgetId)
            .pipe(
                map(response => {
                    this.budget = response.data;

                    return this.budget;
                }),
                switchMap((budget: BudgetDTO) =>
                    forkJoin(
                        this.budgetierungRestService.getAvailableStati(budget.status ? budget.status.code : null),
                        this.budgetierungRestService.getElementkategorieByOrganisation(budget.organisation),
                        this.budgetierungRestService.getAvailableActionButtons(budget.budgetId, budget.status.code),
                        this.budgetierungRestService.getBudgetStruktur(budget.budgetId)
                    )
                )
            )
            .subscribe(
                ([stati, elementkategorie, buttons, struktur]) => {
                    if (stati.data && elementkategorie.data) {
                        const mode = this.budget.budgetMutierbar ? FormModeEnum.EDIT : FormModeEnum.READONLY;
                        this.budgetForm.changeMode(mode);
                        this.formData = { budget: this.budget, statusOptions: stati.data };
                        this.buttons.next(buttons.data);
                        this.configureInfoleiste(elementkategorie.data);
                        this.strukturData = struktur.data;
                        this.treeArray = [this.budgetTreeService.buildTree(struktur.data.strukturelementRoot, struktur.data.additionalData)];
                    }
                    this.spinnerService.deactivate(this.channel);
                },
                error => {
                    this.spinnerService.deactivate(this.channel);
                }
            );
    }

    openBudgetvergleich() {
        const listeKopieParam = this.budgetvergleichService.getListeKopieParam();

        if (listeKopieParam) {
            this.listeKopieParam = listeKopieParam;
            this.modalService.open(this.budgetvergleichModal, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-xl', backdrop: 'static', centered: true });
            this.budgetvergleichService.setListeKopieParam(null);
        }
    }

    update(updateType: UpdateType) {
        const update = this.getUpdateType(updateType);

        if (!update) {
            return;
        }

        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);

        update
            .pipe(
                map(
                    response => {
                        if (response.data) {
                            this.budget = response.data;
                            this.infopanelService.sendLastUpdate(this.budget);
                            this.notificationService.success(this.dbTranslateService.instant('common.message.datengespeichert'));
                            return this.budget;
                        }
                        return NEVER;
                    },
                    error => {
                        this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgespeichert'));
                        this.deactivateSpinnerAndScrollToTop();
                    }
                ),
                switchMap((budget: BudgetDTO) =>
                    forkJoin(
                        this.budgetierungRestService.getAvailableStati(budget.status ? budget.status.code : null),
                        this.budgetierungRestService.getAvailableActionButtons(budget.budgetId, budget.status.code)
                    )
                )
            )
            .subscribe(
                ([stati, buttons]) => {
                    if (updateType === UpdateType.ERSETZEN) {
                        this.router.navigate([`amm/budget/${this.budget.budgetId}/gesamtbudget`]);
                        return;
                    }
                    const mode = this.budget.budgetMutierbar ? FormModeEnum.EDIT : FormModeEnum.READONLY;
                    this.budgetForm.changeMode(mode);
                    this.formData = { budget: this.budget, statusOptions: stati.data };
                    this.buttons.next(buttons.data);

                    this.deactivateSpinnerAndScrollToTop();
                },
                error => {
                    this.deactivateSpinnerAndScrollToTop();
                }
            );
    }

    reset() {
        this.budgetForm.reset();
    }

    openDeleteDialog() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
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

    delete() {
        this.fehlermeldungenService.closeMessage();

        this.spinnerService.activate(this.channel);

        this.budgetierungRestService.deleteBudget(this.budgetId).subscribe(
            response => {
                if (!response.warning) {
                    this.budgetForm.formGroup.markAsPristine();
                    this.notificationService.success(this.dbTranslateService.instant('common.message.datengeloescht'));

                    const url = this.budget.vorgaenger ? `amm/budget/${this.budget.vorgaenger.budgetId}` : 'amm/budget/suchen';

                    this.router.navigateByUrl(url);
                }
                this.deactivateSpinnerAndScrollToTop();
            },
            error => {
                this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgeloescht'));
                this.deactivateSpinnerAndScrollToTop();
            }
        );
    }

    subscribeToToolbox() {
        this.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.COPY) {
                    this.openDmsCopyModal();
                } else if (action.message.action === ToolboxActionEnum.EXCEL) {
                    this.onExcelExport();
                }
            });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EXCEL, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
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

    configureInfoleiste(elementkategorie: ElementKategorieDTO) {
        this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
        this.infopanelService.dispatchInformation({
            title: 'common.label.budget',
            secondTitle: `${this.budget.jahr.toString()} ${this.dbTranslateService.translate(elementkategorie, 'beschreibung')}`,
            subtitle: 'amm.budgetierung.subnavmenuitem.budget'
        });
        this.infopanelService.sendLastUpdate(this.budget);
    }

    onExcelExport() {
        this.budgetierungRestService.exportBudget(this.budgetId).subscribe((res: HttpResponse<Blob>) => {
            HttpResponseHelper.openBlob(res);
        });
    }

    openDmsCopyModal() {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;

        comp.context = DmsMetadatenContext.DMS_CONTEXT_AMM_BUDGET;
        comp.id = this.budgetId.toString();
    }

    canDeactivate(): boolean {
        return this.budgetForm.formGroup.dirty;
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

    private isFormValid(): boolean {
        if (!this.budgetForm.formGroup.value.bearbeitungDurch) {
            this.budgetForm.appendCurrentUser();
        }

        if (!this.budgetForm.formGroup.valid) {
            this.budgetForm.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.deactivateSpinnerAndScrollToTop();
            return false;
        }
        return true;
    }

    private getUpdateType(updateType: UpdateType): Observable<BaseResponseWrapperBudgetDTOWarningMessages> | undefined {
        switch (updateType) {
            case UpdateType.UPDATE:
                if (this.isFormValid()) {
                    return this.budgetierungRestService.updateBudget(this.budgetForm.mapToDTO(), this.translateService.currentLang);
                }
                break;
            case UpdateType.FREIGEBEN:
                return this.budgetierungRestService.budgetFreigeben(this.budgetForm.mapToDTO(), this.translateService.currentLang);
            case UpdateType.ZURUECKNEHMEN:
                return this.budgetierungRestService.budgetZuruecknehmen(this.budgetForm.mapToDTO(), this.translateService.currentLang);
            case UpdateType.UEBERARBEITEN:
                return this.budgetierungRestService.budgetUeberarbeiten(this.budgetForm.mapToDTO(), this.translateService.currentLang);
            case UpdateType.ERSETZEN:
                return this.budgetierungRestService.budgetErsetzen(this.budgetForm.mapToDTO(), this.translateService.currentLang);
        }
    }
}
