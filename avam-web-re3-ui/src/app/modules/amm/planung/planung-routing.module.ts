import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';
import { PermissionGuard } from '@app/core/guards/permission.guard';
import { Permissions } from '@shared/enums/permissions.enum';
import * as pages from './pages/index';

const planungRoutes: Routes = [
    {
        path: 'planwert/suchen',
        component: pages.PlanwertSuchenComponent,
        canActivate: [PermissionGuard],
        data: {
            title: 'amm.planung.topnavmenuitem.planwertsuchen',
            formNumber: AmmFormNumberEnum.PLANUNG_PLANWERT_SUCHEN,
            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN]
        }
    },
    {
        path: 'anzeigen',
        component: pages.PlanungAnzeigenComponent,
        canActivate: [PermissionGuard],
        data: {
            title: 'amm.planung.topnavmenuitem.planunganzeigen',
            formNumber: AmmFormNumberEnum.PLANUNG_ANZEIGEN,
            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN]
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(planungRoutes)],
    exports: [RouterModule]
})
export class PlanungRoutingModule {}
