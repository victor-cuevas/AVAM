import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '@app/core/guards/permission.guard';
import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { CanDeactivateGuard } from '@app/shared/services/can-deactive-guard.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import * as pages from './pages/index';
import { AmmBudgetLabels } from '@app/shared/enums/stes-routing-labels.enum';

const budgetierungRoutes: Routes = [
    { path: '', redirectTo: AMMPaths.BUDGET_SUCHEN, pathMatch: 'full' },
    {
        path: AMMPaths.BUDGET_SUCHEN,
        component: pages.BudgetSuchenComponent,
        canActivate: [PermissionGuard],
        data: {
            title: AmmBudgetLabels.BUDGET_SUCHEN,
            formNumber: AmmFormNumberEnum.BUDGET_SUCHEN,
            permissions: [Permissions.FEATURE_34, Permissions.AMM_BUDGETIERUNG_SICHTEN_BUDGET]
        }
    },
    {
        path: 'gesamtbudget',
        redirectTo: 'gesamtbudget/erfassen',
        pathMatch: 'full'
    },
    {
        path: 'gesamtbudget',
        component: pages.BudgetHomeComponent,
        canActivate: [PermissionGuard],
        data: { permissions: [Permissions.FEATURE_34], sideMenu: 'budgetErfassenNavItems' },
        children: [
            {
                path: 'erfassen',
                component: pages.BudgetErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: 'amm.budgetierung.subnavmenuitem.gesamtbudgeterfassen',
                    formNumber: AmmFormNumberEnum.BUDGET_ERFASSEN,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_BUDGETIERUNG_ERSTELLEN_BUDGET]
                },
                canDeactivate: [CanDeactivateGuard]
            }
        ]
    },
    {
        path: ':budgetId',
        redirectTo: ':budgetId/gesamtbudget',
        pathMatch: 'full'
    },
    {
        path: ':budgetId',
        component: pages.BudgetHomeComponent,
        canActivate: [PermissionGuard],
        data: { permissions: [Permissions.FEATURE_34], sideMenu: 'budgetNavItems' },
        children: [
            {
                path: 'gesamtbudget',
                component: pages.GesamtbudgetComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: AmmBudgetLabels.BUDGET,
                    mode: FormModeEnum.EDIT,
                    formNumber: AmmFormNumberEnum.BUDGET_GESAMTBUDGET,
                    permissions: [
                        Permissions.FEATURE_34,
                        { or: [Permissions.AMM_BUDGETIERUNG_SICHTEN_BUDGET, Permissions.AMM_BUDGETIERUNG_ERSTELLEN_BUDGET, Permissions.AMM_BUDGETIERUNG_UNTERSCHREIBEN_BUDGET] }
                    ]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'teilbudgets',
                component: pages.TeilbudgetsComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: AmmBudgetLabels.TEILBUDGETS,
                    formNumber: AmmFormNumberEnum.BUDGET_TEILBUDGETS,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_BUDGETIERUNG_SICHTEN_BUDGET]
                }
            },
            {
                path: 'teilbudgets/erfassen',
                children: [
                    {
                        path: '',
                        component: pages.TeilbudgetErfassenComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: AmmBudgetLabels.TEILBUDGET_ERFASSEN,
                            mode: FormModeEnum.CREATE,
                            formNumber: AmmFormNumberEnum.BUDGET_TEILBUDGET_ERFASSEN,
                            permissions: [Permissions.FEATURE_34, Permissions.AMM_BUDGETIERUNG_ERSTELLEN_BUDGET]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    }
                ]
            },
            {
                path: 'teilbudgets/bearbeiten',
                children: [
                    {
                        path: '',
                        component: pages.TeilbudgetBearbeitenComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: AmmBudgetLabels.TEILBUDGET,
                            mode: FormModeEnum.EDIT,
                            formNumber: AmmFormNumberEnum.BUDGET_TEILBUDGET_BEARBEITEN,
                            permissions: [
                                Permissions.FEATURE_34,
                                {
                                    or: [
                                        Permissions.AMM_BUDGETIERUNG_SICHTEN_BUDGET,
                                        Permissions.AMM_BUDGETIERUNG_ERSTELLEN_BUDGET,
                                        Permissions.AMM_BUDGETIERUNG_UNTERSCHREIBEN_BUDGET
                                    ]
                                }
                            ]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    }
                ]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(budgetierungRoutes)],
    exports: [RouterModule]
})
export class BudgetierungRoutingModule {}
