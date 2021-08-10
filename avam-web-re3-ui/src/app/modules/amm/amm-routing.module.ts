import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards/auth.guard';
import { PermissionGuard } from '@core/guards/permission.guard';
import { Permissions } from '@shared/enums/permissions.enum';

const amm: Routes = [
    { path: '', redirectTo: '/home/start-page', pathMatch: 'full' },
    {
        path: 'administration',
        loadChildren: './administration/administration.module#AdministrationModule',
        canActivate: [AuthGuard, PermissionGuard],
        data: {
            permissions: [Permissions.FEATURE_34]
        }
    },
    {
        path: 'bewirtschaftung',
        loadChildren: './bewirtschaftung/bewirtschaftung.module#BewirtschaftungModule',
        canActivate: [AuthGuard, PermissionGuard],
        data: {
            permissions: [Permissions.FEATURE_34]
        }
    },
    {
        path: 'budget',
        loadChildren: './budgetierung/budgetierung.module#BudgetierungModule',
        canActivate: [AuthGuard, PermissionGuard],
        data: {
            permissions: [Permissions.FEATURE_34]
        }
    },
    {
        path: 'anbieter',
        loadChildren: './anbieter/anbieter.module#AnbieterModule',
        canActivate: [AuthGuard, PermissionGuard],
        data: {
            permissions: [Permissions.FEATURE_34],
            navPath: 'amm'
        }
    },
    {
        path: 'planung',
        loadChildren: './planung/planung.module#PlanungModule',
        canActivate: [AuthGuard, PermissionGuard],
        data: {
            permissions: [Permissions.FEATURE_34]
        }
    },
    {
        path: 'vertraege',
        loadChildren: './vertraege/vertraege.module#VertraegeModule',
        canActivate: [AuthGuard, PermissionGuard],
        data: {
            permissions: [Permissions.FEATURE_34]
        }
    },
    {
        path: 'teilzahlungen',
        loadChildren: './teilzahlungen/teilzahlungen.module#TeilzahlungenModule',
        canActivate: [AuthGuard, PermissionGuard],
        data: {
            permissions: [Permissions.FEATURE_34]
        }
    },
    {
        path: 'infotag',
        loadChildren: './infotag/infotag.module#InfotagModule',
        canActivate: [AuthGuard, PermissionGuard],
        data: {
            permissions: [Permissions.FEATURE_34]
        }
    }
];
@NgModule({
    declarations: [],
    imports: [RouterModule.forChild(amm)],
    exports: [RouterModule]
})
export class AmmSectionRoutingModule {}
