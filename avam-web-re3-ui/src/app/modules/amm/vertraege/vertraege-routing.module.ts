import { AmmVertraegeLabels } from './../../../shared/enums/stes-routing-labels.enum';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';
import { LeistungsvereinbarungSuchenComponent, VertragswertSuchenComponent, RahmenvertragSuchenComponent } from './pages';

const vertraegeRoutes: Routes = [
    {
        path: AMMPaths.VERTRAEGE_LEISTUNGSVEREINBARUNG,
        redirectTo: AMMPaths.VERTRAEGE_LEISTUNGSVEREINBARUNG_SUCHEN,
        pathMatch: 'full'
    },
    {
        path: AMMPaths.VERTRAEGE_RAHMENVERTRAG_SUCHEN,
        component: RahmenvertragSuchenComponent,
        data: {
            title: AmmVertraegeLabels.RAHMENVERTRAG_SUCHEN,
            permissions: [{ or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN] }, Permissions.FEATURE_34],
            formNumber: AmmFormNumberEnum.AMM_RAHMENVERTRAG_SUCHEN
        }
    },
    {
        path: AMMPaths.VERTRAEGE_LEISTUNGSVEREINBARUNG_SUCHEN,
        component: LeistungsvereinbarungSuchenComponent,
        data: {
            title: AmmVertraegeLabels.LEISTUNGSVEREINBARUNG_SUCHEN,
            permissions: [{ or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN] }, Permissions.FEATURE_34],
            formNumber: AmmFormNumberEnum.AMM_LEISTUNGSVEREINBARUNG_SUCHEN
        }
    },
    {
        path: AMMPaths.VERTRAEGE_VERTRAGSWERT_SUCHEN,
        component: VertragswertSuchenComponent,
        data: {
            title: AmmVertraegeLabels.VERTRAGSWERT_SUCHEN,
            permissions: [{ or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN] }, Permissions.FEATURE_34],
            formNumber: AmmFormNumberEnum.AMM_VERTRAGSWERT_SUCHEN
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(vertraegeRoutes)],
    exports: [RouterModule]
})
export class VertraegeRoutingModule {}
