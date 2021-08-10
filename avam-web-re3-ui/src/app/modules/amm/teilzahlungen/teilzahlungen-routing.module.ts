import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import * as pages from './pages/index';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';
import { AmmTeilzahlungenLabels } from '@app/shared/enums/stes-routing-labels.enum';

const teilzahlungenRoutes: Routes = [
    {
        path: '',
        redirectTo: AMMPaths.TEILZAHLUNGEN_SUCHEN,
        pathMatch: 'full'
    },
    {
        path: AMMPaths.TEILZAHLUNGEN_SUCHEN,
        component: pages.TeilzahlungenSuchenComponent,
        data: {
            title: AmmTeilzahlungenLabels.TEILZAHLUNGEN_SUCHEN,
            permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
            formNumber: AmmFormNumberEnum.AMM_TEILZAHLUNGEN_SUCHEN
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(teilzahlungenRoutes)],
    exports: [RouterModule]
})
export class TeilzahlungenRoutingModule {}
