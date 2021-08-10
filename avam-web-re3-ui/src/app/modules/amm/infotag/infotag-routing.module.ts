import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '@app/core/guards/permission.guard';
import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';
import { CanDeactivateGuard } from '@app/shared/services/can-deactive-guard.service';
import { CanDeleteGuard } from '@app/shared/services/can-delete-guard.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { AMMPaths } from '@shared/enums/stes-navigation-paths.enum';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import * as pages from './pages/index';

const infotagRoutes: Routes = [
    { path: '', redirectTo: AMMPaths.INFOTAG_MASSNAHME_SUCHEN, pathMatch: 'full' },
    {
        path: 'massnahme',
        redirectTo: AMMPaths.INFOTAG_MASSNAHME_SUCHEN,
        pathMatch: 'full'
    },
    {
        path: AMMPaths.INFOTAG_MASSNAHME_SUCHEN,
        component: pages.InfotagMassnahmeSuchenComponent,
        canActivate: [PermissionGuard],
        data: {
            title: 'amm.administration.topnavmenuitem.massnahmesuchen',
            formNumber: AmmFormNumberEnum.INFOTAG_MASSNAHME_SUCHEN,
            permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN]
        }
    },
    {
        path: AMMPaths.INFOTAG_MASSNAHME_ERFASSEN,
        component: pages.InfotagMassnahmeErfassenWizardComponent,
        canActivate: [PermissionGuard],
        data: { permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN] },
        canDeactivate: [CanDeleteGuard],
        children: [
            { path: '', redirectTo: 'grunddaten', pathMatch: 'full' },
            {
                path: 'grunddaten',
                component: pages.InfotagMassnahmeGrunddatenErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: 'amm.infotag.subnavmenuitem.grunddaten',
                    mode: FormModeEnum.CREATE,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN],
                    formNumber: AmmFormNumberEnum.INFOTAG_MASSNAHME_GRUNDDATEN
                }
            },
            {
                path: 'beschreibung',
                component: pages.InfotagMassnahmeBeschreibungErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: 'amm.infotag.subnavmenuitem.beschreibungDurchfuerungsort',
                    mode: FormModeEnum.CREATE,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN],
                    formNumber: AmmFormNumberEnum.INFOTAG_MASSNAHME_BESCHREIBUNG
                }
            }
        ]
    },
    {
        path: AMMPaths.INFOTAG_BEWIRTSCHAFTUNG_SUCHEN,
        component: pages.InfotagBewirtschaftungSuchenComponent,
        canActivate: [PermissionGuard],
        data: {
            title: 'amm.infotag.topnavmenuitem.infotagsuchen',
            formNumber: AmmFormNumberEnum.AMM_INFOTAG_BEWIRTSCHAFTUNG_SUCHEN,
            permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN]
        }
    },
    {
        path: AMMPaths.INFOTAG_BEWIRTSCHAFTUNG_ERFASSEN,
        component: pages.InfotagMassnahmeErfassenWizardComponent,
        canActivate: [PermissionGuard],
        data: { permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN] },
        canDeactivate: [CanDeleteGuard],
        children: [
            { path: '', redirectTo: 'grunddaten', pathMatch: 'full' },
            {
                path: 'grunddaten',
                component: pages.InfotagBewirtschaftungGrunddatenErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: 'amm.infotag.subnavmenuitem.grunddaten',
                    mode: FormModeEnum.CREATE,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN],
                    formNumber: AmmFormNumberEnum.AMM_INFOTAG_BEWIRTSCHAFTUNG_GRUNDDATEN
                }
            },
            {
                path: 'beschreibung',
                component: pages.InfotagBewirtschaftungBeschreibungErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: 'amm.infotag.subnavmenuitem.beschreibungDurchfuerungsort',
                    mode: FormModeEnum.CREATE,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN],
                    formNumber: AmmFormNumberEnum.AMM_INFOTAG_BEWIRTSCHAFTUNG_BESCHREIBUNG
                }
            }
        ]
    },
    {
        path: 'massnahme/:massnahmeId',
        redirectTo: 'massnahme/:massnahmeId/grunddaten',
        pathMatch: 'full'
    },
    {
        path: 'massnahme/:massnahmeId',
        component: pages.InfotagMassnahmeHomeComponent,
        canActivate: [PermissionGuard],
        data: { permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN] },
        children: [
            {
                path: 'grunddaten',
                component: pages.InfotagMassnahmeGrunddatenBearbeitenComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: 'amm.infotag.subnavmenuitem.grunddaten',
                    mode: FormModeEnum.EDIT,
                    formNumber: AmmFormNumberEnum.INFOTAG_MASSNAHME_GRUNDDATEN,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'beschreibung',
                component: pages.InfotagMassnahmeBeschreibungBearbeitenComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: 'amm.infotag.subnavmenuitem.beschreibungDurchfuerungsort',
                    mode: FormModeEnum.EDIT,
                    formNumber: AmmFormNumberEnum.INFOTAG_MASSNAHME_BESCHREIBUNG,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'infotage',
                component: pages.InfotageUebersichtComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: 'amm.infotag.label.listeinfotage',
                    formNumber: AmmFormNumberEnum.INFOTAG_MASSNAHME_INFOTAGE,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN]
                }
            },
            {
                path: 'infotage/infotag',
                redirectTo: 'infotage',
                pathMatch: 'full'
            },
            {
                path: 'infotage/infotag',
                component: pages.InfotagHomeComponent,
                canActivate: [PermissionGuard],
                data: { permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN] },
                children: [
                    {
                        path: 'grunddaten',
                        component: pages.InfotagGrunddatenBearbeitenComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: 'amm.infotag.subnavmenuitem.grunddaten',
                            formNumber: AmmFormNumberEnum.AMM_INFOTAG_BEWIRTSCHAFTUNG_GRUNDDATEN,
                            permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    },
                    {
                        path: 'beschreibung',
                        component: pages.InfotagBeschreibungBearbeitenComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: 'amm.infotag.subnavmenuitem.beschreibungDurchfuerungsort',
                            mode: FormModeEnum.EDIT,
                            formNumber: AmmFormNumberEnum.AMM_INFOTAG_BEWIRTSCHAFTUNG_BESCHREIBUNG,
                            permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    },
                    {
                        path: 'teilnehmerliste',
                        component: pages.InfotagTeilnehmerlisteBearbeitenComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: 'amm.infotag.subnavmenuitem.teilnehmerliste',
                            formNumber: AmmFormNumberEnum.AMM_INFOTAG_TEILNEHMERLISTE,
                            permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN]
                        }
                    }
                ]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(infotagRoutes)],
    exports: [RouterModule]
})
export class InfotagRoutingModule {}
