import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormGroupDirective } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { forkJoin } from 'rxjs';
import { SpinnerService, Unsubscribable, NotificationService } from 'oblique-reactive';
import { AmmBudgetierungRestService } from '../../services/amm-budgetierung-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ElementKategorieDTO } from '@app/shared/models/dtos-generated/elementKategorieDTO';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { BudgetDTO } from '@app/shared/models/dtos-generated/budgetDTO';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { FormUtilsService, ToolboxService } from '@app/shared';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { KantonDTO } from '@app/shared/models/dtos-generated/kantonDTO';
import { TeilbudgetErstellenParamDTO } from '@app/shared/models/dtos-generated/teilbudgetErstellenParamDTO';
import { TeilBudgetDTO } from '@app/shared/models/dtos-generated/teilBudgetDTO';
import { TranslateService } from '@ngx-translate/core';
import { BudgetvergleichService } from '../../services/budgetvergleich.service';
import { NavigationService } from '@app/shared/services/navigation-service';
import { MessageBus } from '@app/shared/services/message-bus';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-teilbudget-erfassen',
    templateUrl: './teilbudget-erfassen.component.html',
    styleUrls: ['./teilbudget-erfassen.component.scss']
})
export class TeilbudgetErfassenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    formGroup: FormGroup;
    rowCheckboxes: FormArray;
    channel = 'teilbudget-erfassen';

    budgetId: number;
    budget: BudgetDTO;
    institutionOptions: any[];
    kantonOptions: any[];

    dataSource: any[];

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private infopanelService: AmmInfopanelService,
        private resetDialogService: ResetDialogService,
        private fehlermeldungenService: FehlermeldungenService,
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private budgetierungRestService: AmmBudgetierungRestService,
        private stesRestService: StesDataRestService,
        private dbTranslateService: DbTranslateService,
        private notificationService: NotificationService,
        private translateService: TranslateService,
        private budgetvergleichService: BudgetvergleichService,
        private navigationService: NavigationService,
        private messageBus: MessageBus,
        private obliqueHelper: ObliqueHelperService,
        private facade: FacadeService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.formGroup = this.createForm();
        this.obliqueHelper.ngForm = this.ngForm;
        this.rowCheckboxes = this.formGroup.get('rowCheckboxes') as FormArray;
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.budgetId = params['budgetId'];
            this.getData();
        });
        this.configureToolbox();
        this.subscribeToToolbox();
        this.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => (this.dataSource = this.dataSource.map(this.mapTeilbudget)));
        this.navigationService.showNavigationTreeRoute('./teilbudgets/erfassen');
        this.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(message => {
                if (message.type === 'close-nav-item' && message.data) {
                    this.cancel();
                }
            });
    }

    createForm(): FormGroup {
        return this.formBuilder.group({
            institution: [null, Validators.required],
            kanton: [null, Validators.required],
            rowCheckboxes: this.formBuilder.array([])
        });
    }

    getData() {
        this.spinnerService.activate(this.channel);

        forkJoin(
            this.budgetierungRestService.getBudget(this.budgetId),
            this.stesRestService.getCode(DomainEnum.INSTITUTION),
            this.budgetierungRestService.getBudgetierungsrelevanteKantone(),
            this.budgetierungRestService.searchTeilbudgets({})
        )
            .pipe(
                map(([budget, institutions, kantone, teilbudgets]) => {
                    this.institutionOptions = this.facade.formUtilsService.mapDropdownKurztext(institutions);
                    this.kantonOptions = kantone.data.map(this.kantonePropertyMapper);

                    this.dataSource = [...teilbudgets.data]
                        .sort((a, b) => {
                            const firstEl = this.dbTranslateService.translate(a.institution, 'kurzText');
                            const secondEl = this.dbTranslateService.translate(b.institution, 'kurzText');
                            return firstEl > secondEl ? -1 : secondEl > firstEl ? 1 : 0;
                        })
                        .sort((a, b) => {
                            const firstEl = this.dbTranslateService.translate(a.kanton, 'name');
                            const secondEl = this.dbTranslateService.translate(b.kanton, 'name');
                            return firstEl > secondEl ? -1 : secondEl > firstEl ? 1 : 0;
                        })
                        .sort((a, b) => {
                            return b.budget.version - a.budget.version;
                        })
                        .map(this.createTeilbudgetRow);

                    if (budget.data) {
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
                    this.deactivateSpinnerAndScrollToTop();
                },
                error => {
                    this.deactivateSpinnerAndScrollToTop();
                }
            );
    }

    configureInfoleiste(elementkategorie: ElementKategorieDTO) {
        this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
        this.infopanelService.dispatchInformation({
            title: 'common.label.budget',
            secondTitle: `${this.budget.jahr.toString()} ${this.dbTranslateService.translate(elementkategorie, 'beschreibung')}`,
            subtitle: 'amm.budgetierung.topnavmenuitem.teilbudgeterfassen'
        });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel);
    }

    subscribeToToolbox() {
        this.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                }
            });
    }

    save() {
        this.fehlermeldungenService.closeMessage();

        if (!this.formGroup.valid) {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.deactivateSpinnerAndScrollToTop();
            return;
        }

        this.spinnerService.activate(this.channel);

        const checkedIndex = this.rowCheckboxes.controls.findIndex(control => control.value);
        const teilbudgetId = checkedIndex > -1 ? this.dataSource[checkedIndex].teilbudgetId : null;

        this.budgetierungRestService.createNewTeilbudget(this.mapToDTO(teilbudgetId)).subscribe(
            response => {
                if (response.data) {
                    this.formGroup.markAsPristine();
                    this.notificationService.success(this.dbTranslateService.instant('common.message.datengespeichert'));
                    const listeKopieParam = checkedIndex > -1 ? response.data : null;
                    this.budgetvergleichService.setListeKopieParam(listeKopieParam);
                    this.router.navigate([`amm/budget/${this.budgetId}/teilbudgets/bearbeiten`], { queryParams: { teilbudgetId: response.data.id } });
                }
                this.deactivateSpinnerAndScrollToTop();
            },
            error => {
                this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgespeichert'));
                this.deactivateSpinnerAndScrollToTop();
            }
        );
    }

    cancel() {
        this.router.navigate([`amm/budget/${this.budgetId}/teilbudgets`]);
    }

    reset() {
        if (this.formGroup.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                this.formGroup.reset();
            });
        }
    }

    createTeilbudgetRow = (data: TeilBudgetDTO) => {
        this.rowCheckboxes.push(this.formBuilder.control(false));

        return this.mapTeilbudget(data);
    };

    mapTeilbudget = data => {
        return {
            teilbudgetId: data.teilbudgetId,
            budget: data.budget,
            institution: data.institution,
            institutionText: this.dbTranslateService.translate(data.institution, 'kurzText') || '',
            kanton: data.kanton,
            kantonText: this.dbTranslateService.translate(data.kanton, 'name') || '',
            jahr: data.budget.jahr || '',
            version: data.budget.version || '',
            status: data.budget.status,
            statusText: this.dbTranslateService.translate(data.budget.status, 'kurzText') || ''
        };
    };

    mapToDTO(teilbudgetId: number): TeilbudgetErstellenParamDTO {
        return {
            teilbudgetId,
            budgetId: this.budgetId,
            kantonKuerzel: this.formGroup.controls.kanton.value,
            institutionId: this.formGroup.controls.institution.value,
            language: this.dbTranslateService.getCurrentLang()
        };
    }

    canDeactivate() {
        return this.formGroup.dirty;
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.fehlermeldungenService.closeMessage();
        this.infopanelService.resetTemplateInInfobar();
        this.toolboxService.sendConfiguration([]);
        this.navigationService.hideNavigationTreeRoute('./teilbudgets/erfassen');
    }

    private deactivateSpinnerAndScrollToTop(): void {
        this.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    private kantonePropertyMapper(element: KantonDTO) {
        return {
            value: element.kantonsKuerzel,
            labelDe: element.nameDe,
            labelFr: element.nameFr,
            labelIt: element.nameIt
        };
    }
}
