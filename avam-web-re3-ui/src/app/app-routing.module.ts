import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { PermissionGuard } from '@core/guards/permission.guard';
import { navigationModel } from '@shared/models/navigation-model';
import { Permissions } from '@shared/enums/permissions.enum';
import { CorePreloadStrategy, corePreloadSetup } from './library/core/core-preload-strategy';

const appRoutes: Routes = [
    { path: 'login', loadChildren: './modules/auth/auth.module#AuthModule', data: { preload: true } },
    { path: 'home', loadChildren: './modules/home/home.module#HomeModule', canActivate: [AuthGuard], data: { ...corePreloadSetup } },
    {
        path: 'stes',
        loadChildren: './modules/stes/stes.module#StesModule',
        canActivate: [AuthGuard, PermissionGuard],
        data: { permissions: [Permissions.STES], navItems: navigationModel.stes, fachberatungNavItems: navigationModel.fachberatungsStelle, ...corePreloadSetup }
    },
    {
        path: 'arbeitgeber',
        loadChildren: './modules/arbeitgeber/arbeitgeber.module#ArbeitgeberModule',
        canActivate: [AuthGuard, PermissionGuard],
        data: { permissions: [Permissions.FEATURE_33], navItems: navigationModel.arbeitgeber, ...corePreloadSetup }
    },
    {
        path: 'amm',
        loadChildren: './modules/amm/amm.module#AMMModule',
        canActivate: [AuthGuard, PermissionGuard],
        data: {
            permissions: [Permissions.FEATURE_34],
            navItems: navigationModel.amm,
            infotagMassnahmeNavItems: navigationModel.amm.infotagMassnahme,
            bewirtschaftungNavItems: navigationModel.amm.bewirtschaftung,
            budgetNavItems: navigationModel.amm.budgetNavItems,
            budgetErfassenNavItems: navigationModel.amm.budgetErfassenNavItems,
            ...corePreloadSetup
        }
    },
    {
        path: 'geko',
        loadChildren: './modules/geko/geko.module#GekoModule',
        canActivate: [AuthGuard, PermissionGuard],
        data: { permissions: [Permissions.FEATURE_32], navItems: navigationModel.geschaeftsregeln, ...corePreloadSetup }
    },
    {
        path: 'myavam',
        loadChildren: './modules/myAvam/my-avam.module#MyAvamModule',
        canActivate: [AuthGuard, PermissionGuard],
        data: { permissions: [], navItems: navigationModel.myAvam, ...corePreloadSetup }
    },
    {
        path: 'informationen',
        loadChildren: './modules/informationen/informationen.module#InformationenModule',
        canActivate: [AuthGuard, PermissionGuard],
        data: {
            permissions: [Permissions.FEATURE_35],
            benutzerstelleNavItems: navigationModel.benutzerstelle,
            rolleNavItems: navigationModel.rolle,
            codeNavItems: navigationModel.code,
            ...corePreloadSetup
        }
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes, { preloadingStrategy: CorePreloadStrategy, onSameUrlNavigation: 'reload' })],
    exports: [RouterModule]
})
export class AppRoutingModule {}
