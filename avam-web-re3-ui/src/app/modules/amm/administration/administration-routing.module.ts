import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StrukturAnzeigenComponent } from './pages/struktur-anzeigen/struktur-anzeigen.component';
import { PermissionGuard } from '@app/core/guards/permission.guard';
import { Permissions } from '@shared/enums/permissions.enum';
import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';

const administrationRoutes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'massnahmeartstruktur' },
    {
        path: 'massnahmeartstruktur',
        component: StrukturAnzeigenComponent,
        canActivate: [PermissionGuard],
        data: {
            title: 'amm.administration.topnavmenuitem.massnahmenart',
            formNumber: AmmFormNumberEnum.STRUKTUR_ANZEIGEN,
            permissions: [Permissions.FEATURE_34, Permissions.AMM_ADMINISTRATION_SICHTEN_STRUKTUR]
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(administrationRoutes)],
    exports: [RouterModule]
})
export class AdministrationRoutingModule {}
