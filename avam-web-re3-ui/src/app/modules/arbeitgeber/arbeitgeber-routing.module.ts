import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '@core/guards/permission.guard';
import { Permissions } from '@shared/enums/permissions.enum';
import { AuthGuard } from '@core/guards/auth.guard';

const arbeitgeber: Routes = [
    {
        path: 'details',
        loadChildren: './arbeitgeber-details/arbeitgeber-details.module#ArbeitgeberDetailsModule',
        canActivate: [AuthGuard, PermissionGuard],
        data: {
            permissions: [Permissions.FEATURE_33],
            navPath: 'arbeitgeber'
        }
    },
    {
        path: 'stellenangebot',
        loadChildren: './stellenangebot/arbeitgeber-stellenangebot.module#ArbeitgeberStellenangebotModule',
        canActivate: [AuthGuard, PermissionGuard],
        data: {
            permissions: [Permissions.FEATURE_33],
            navPath: 'arbeitgeber'
        }
    },
    {
        path: 'arbeitsvermittlung',
        loadChildren: './arbeitsvermittlung/arbeitgeber-arbeitsvermittlung.module#ArbeitgeberArbeitsvermittlungModule',
        canActivate: [AuthGuard, PermissionGuard],
        data: {
            permissions: [Permissions.FEATURE_33],
            navPath: 'arbeitgeber'
        }
    },
    {
        path: 'kurzarbeit',
        loadChildren: './kurzarbeit/arbeitgeber-kurzarbeit.module#ArbeitgeberKurzarbeitModule',
        canActivate: [AuthGuard, PermissionGuard],
        data: {
            permissions: [Permissions.FEATURE_33],
            navPath: 'arbeitgeber'
        }
    },
    {
        path: 'schlechtwetter',
        loadChildren: './schlechtwetter/arbeitgeber-schlechtwetter.module#ArbeitgeberSchlechtwetterModule',
        canActivate: [AuthGuard, PermissionGuard],
        data: {
            permissions: [Permissions.FEATURE_33],
            navPath: 'arbeitgeber'
        }
    }
];
@NgModule({
    declarations: [],
    imports: [RouterModule.forChild(arbeitgeber)],
    exports: [RouterModule]
})
export class ArbeitgeberRoutingModule {}
