import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ToolboxService } from '@app/shared';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { forkJoin } from 'rxjs';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { BudgetSuchenFormData, BudgetSuchenFormComponent } from '../../components/budget-suchen-form/budget-suchen-form.component';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { Unsubscribable } from 'oblique-reactive';
import { ElementKategorieEnum } from '@app/shared/enums/element-kategorie.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AmmBudgetierungRestService } from '../../services/amm-budgetierung-rest.service';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { BudgetDTO } from '@dtos/budgetDTO';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { FacadeService } from '@app/shared/services/facade.service';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { BudgetSuchenTableComponent } from '@modules/amm/budgetierung/components';

@Component({
    selector: 'avam-budget-suchen',
    templateUrl: './budget-suchen.component.html',
    styleUrls: ['./budget-suchen.component.scss']
})
export class BudgetSuchenComponent extends Unsubscribable implements OnInit, OnDestroy {
    static readonly STATE_KEY = 'budget-search-cache-state-key';
    @ViewChild('searchForm') searchForm: BudgetSuchenFormComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    budgetSuchenFormData: BudgetSuchenFormData;
    budgets: BudgetDTO[];
    dataSource = [];
    searchChannel = 'budget-search-channel';
    tableChannel = 'budget-table-channel';

    constructor(
        private facade: FacadeService,
        private infopanelService: AmmInfopanelService,
        private ammRestService: AmmRestService,
        private stesRestService: StesDataRestService,
        private budgetierungRestService: AmmBudgetierungRestService,
        private searchSession: SearchSessionStorageService,
        private modalService: NgbModal,
        private router: Router
    ) {
        super();
        ToolboxService.CHANNEL = this.searchChannel;
    }

    ngOnInit() {
        this.configureToolbox();
        this.subscribeToToolbox();
        this.subscribeToLangChange();
        this.infopanelService.dispatchInformation({
            title: 'amm.budgetierung.alttext.budgets',
            hideInfobar: true
        });
        this.getData();
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.searchChannel);
    }

    subscribeToToolbox() {
        this.facade.toolboxService
            .observeClickAction(this.searchChannel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    this.openPrintModal();
                }
            });
    }

    subscribeToLangChange() {
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.setDataSource(this.budgets);
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.searchChannel);
        forkJoin(
            this.ammRestService.getElementkategoriesByAuthorizationKeyScope(ElementKategorieEnum.KEY_AMM_BUDGETIERUNG_SICHTEN_BUDGET),
            this.stesRestService.getCode(DomainEnum.VIERAUGENSTATUS)
        ).subscribe(
            ([elementkategorien, statusOptions]) => {
                const state = this.searchSession.restoreStateByKey(BudgetSuchenComponent.STATE_KEY);

                this.budgetSuchenFormData = { elementkategorien: elementkategorien.data, statusOptions };

                if (state) {
                    this.budgetSuchenFormData.state = state.fields;
                    this.searchForm.mapToForm(state.fields);
                    this.searchBudgets();
                }

                this.facade.spinnerService.deactivate(this.searchChannel);
            },
            error => {
                this.facade.spinnerService.deactivate(this.searchChannel);
            }
        );
    }

    reset() {
        this.searchForm.reset();
        this.facade.fehlermeldungenService.closeMessage();
        this.dataSource = [];
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.searchSession.clearStorageByKey(BudgetSuchenComponent.STATE_KEY);
        this.searchSession.restoreDefaultValues(BudgetSuchenTableComponent.STATE_KEY);
    }

    search() {
        this.facade.fehlermeldungenService.closeMessage();

        if (!this.searchForm.formGroup.valid) {
            this.searchForm.ngForm.onSubmit(undefined);
            this.facade.openModalFensterService.openInfoModal('stes.error.bearbeiten.pflichtfelder');
            return;
        }
        this.searchSession.resetSelectedTableRow(BudgetSuchenTableComponent.STATE_KEY);
        this.searchBudgets();
        this.searchSession.storeFieldsByKey(BudgetSuchenComponent.STATE_KEY, this.searchForm.formGroup.value);
    }

    itemSelected(budgetId: number) {
        this.router.navigate([`amm/budget/${budgetId}/gesamtbudget`]);
    }

    searchBudgets() {
        this.facade.spinnerService.activate(this.tableChannel);

        this.budgetierungRestService.search(this.searchForm.mapToDTO()).subscribe(
            response => {
                if (response.data) {
                    this.budgets = response.data;
                    this.setDataSource(response.data);
                    this.infopanelService.updateInformation({ tableCount: this.dataSource.length });
                }
                this.facade.spinnerService.deactivate(this.tableChannel);
            },
            error => {
                this.facade.spinnerService.deactivate(this.tableChannel);
            }
        );
    }

    createBudgetRow(data: BudgetDTO) {
        return {
            budgetId: data.budgetId,
            struktur: this.getStrukturLabel(data.organisation),
            jahr: data.jahr ? data.jahr : '',
            status: data.status ? this.facade.dbTranslateService.translate(data.status, 'kurzText') : '',
            version: data.version ? data.version : ''
        };
    }

    setDataSource(data: BudgetDTO[]) {
        this.dataSource = data
            .map(el => this.createBudgetRow(el))
            .sort((a, b) => (a.version > b.version ? -1 : 1))
            .sort((a, b) => (a.struktur > b.struktur ? -1 : 1));
    }

    getStrukturLabel(organisation: string) {
        const struktur = this.budgetSuchenFormData.elementkategorien.find(element => element.organisation === organisation);
        return struktur ? this.facade.dbTranslateService.translate(struktur, 'beschreibung') : '';
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true });
    }

    ngOnDestroy() {
        this.infopanelService.updateInformation({ hideInfobar: false, tableCount: undefined });
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }
}
