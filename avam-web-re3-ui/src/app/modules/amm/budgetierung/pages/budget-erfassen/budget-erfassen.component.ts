import { Component, OnInit, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxService } from '@app/shared';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { takeUntil, map, switchMap } from 'rxjs/operators';
import { ElementKategorieEnum } from '@app/shared/enums/element-kategorie.enum';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ElementKategorieDTO } from '@app/shared/models/dtos-generated/elementKategorieDTO';
import { FormGroup, FormBuilder, Validators, FormArray, FormGroupDirective } from '@angular/forms';
import { NumberValidator } from '@app/shared/validators/number-validator';
import PrintHelper from '@app/shared/helpers/print.helper';
import { Router } from '@angular/router';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { AmmBudgetierungRestService } from '../../services/amm-budgetierung-rest.service';
import { BudgetDTO } from '@app/shared/models/dtos-generated/budgetDTO';
import { BudgetvergleichService } from '../../services/budgetvergleich.service';
import { FacadeService } from '@app/shared/services/facade.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

@Component({
    selector: 'avam-budget-erfassen',
    templateUrl: './budget-erfassen.component.html',
    styleUrls: ['./budget-erfassen.component.scss']
})
export class BudgetErfassenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    channel = 'gesamtbudget-erfassen';

    formGroup: FormGroup;
    rowCheckboxes: FormArray;

    dataSource: any[];

    constructor(
        private infopanelService: AmmInfopanelService,
        private facade: FacadeService,
        private formBuilder: FormBuilder,
        private ammRestService: AmmRestService,
        private budgetierungRestService: AmmBudgetierungRestService,
        private router: Router,
        private resetDialogService: ResetDialogService,
        private budgetvergleichService: BudgetvergleichService,
        private obliqueHelper: ObliqueHelperService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.getData();
        this.formGroup = this.createForm();
        this.obliqueHelper.ngForm = this.ngForm;
        this.rowCheckboxes = this.formGroup.get('rowCheckboxes') as FormArray;
        this.configureToolbox();
        this.subscribeToToolbox();
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => (this.dataSource = this.dataSource.map(this.mapBudget)));
        this.facade.messageBus
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
            jahr: [new Date().getFullYear() + 1, [Validators.required, NumberValidator.isPositiveInteger, NumberValidator.val211, NumberValidator.val210(1900, 9999)]],
            rowCheckboxes: this.formBuilder.array([])
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        this.ammRestService
            .getElementkategoriesByAuthorizationKeyScope(ElementKategorieEnum.KEY_AMM_BUDGETIERUNG_SICHTEN_BUDGET)
            .pipe(
                map(
                    response => {
                        let currentUserStruktur;
                        if (response.data) {
                            currentUserStruktur = response.data.find(struktur => struktur.aktuell);
                            this.configureInfoleiste(currentUserStruktur);
                        }

                        return currentUserStruktur ? currentUserStruktur.organisation : null;
                    },
                    error => this.deactivateSpinnerAndScrollToTop()
                ),
                switchMap((organisation: string) => this.budgetierungRestService.search({ organisation }))
            )
            .subscribe(
                response => {
                    if (response.data) {
                        this.dataSource = [...response.data]
                            .sort((a, b) => {
                                return b.version - a.version;
                            })
                            .sort((a, b) => {
                                return b.jahr - a.jahr;
                            })
                            .map(this.createBudgetRow);
                    }
                    this.deactivateSpinnerAndScrollToTop();
                },
                error => {
                    this.deactivateSpinnerAndScrollToTop();
                }
            );
    }

    createBudgetRow = (data: BudgetDTO) => {
        this.rowCheckboxes.push(this.formBuilder.control(false));

        return this.mapBudget(data);
    };

    mapBudget = data => {
        return {
            budgetId: data.budgetId,
            jahr: data.jahr ? data.jahr : '',
            version: data.version ? data.version : '',
            status: data.status,
            statusText: data.status ? this.facade.dbTranslateService.translate(data.status, 'kurzText') : ''
        };
    };

    configureInfoleiste(elementkategorie: ElementKategorieDTO) {
        this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
        this.infopanelService.dispatchInformation({
            title: 'common.label.budget',
            secondTitle: elementkategorie ? this.facade.dbTranslateService.translateWithOrder(elementkategorie, 'beschreibung') : '',
            subtitle: 'amm.budgetierung.subnavmenuitem.gesamtbudgeterfassen'
        });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel);
    }

    subscribeToToolbox() {
        this.facade.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                }
            });
    }

    save() {
        this.facade.fehlermeldungenService.closeMessage();

        if (!this.formGroup.valid) {
            this.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.deactivateSpinnerAndScrollToTop();
            return;
        }

        this.facade.spinnerService.activate(this.channel);

        const checkedIndex = this.rowCheckboxes.controls.findIndex(control => control.value);

        const operation =
            checkedIndex > -1
                ? this.budgetierungRestService.copyBudget(this.dataSource[checkedIndex].budgetId, +this.formGroup.value.jahr, this.facade.dbTranslateService.getCurrentLang())
                : this.budgetierungRestService.createNewBudget(+this.formGroup.value.jahr, this.facade.dbTranslateService.getCurrentLang());

        operation.subscribe(
            response => {
                if (response.data) {
                    this.formGroup.markAsPristine();
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
                    const listeKopieParam = checkedIndex > -1 ? response.data : null;
                    this.budgetvergleichService.setListeKopieParam(listeKopieParam);
                    this.router.navigate([`amm/budget/${response.data.id}/gesamtbudget`]);
                }
                this.deactivateSpinnerAndScrollToTop();
            },
            error => {
                this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
                this.deactivateSpinnerAndScrollToTop();
            }
        );
    }

    cancel() {
        this.router.navigate(['home']);
    }

    reset() {
        if (this.formGroup.dirty) {
            this.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                const jahr = new Date().getFullYear() + 1;
                this.formGroup.reset({ jahr });
            });
        }
    }

    canDeactivate() {
        return this.formGroup.dirty;
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.resetTemplateInInfobar();
        this.facade.toolboxService.sendConfiguration([]);
    }

    private deactivateSpinnerAndScrollToTop() {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }
}
