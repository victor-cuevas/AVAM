import { NgModule } from '@angular/core';
import { RouterModule, Routes, UrlSegment } from '@angular/router';
import { AMMPaths, AmmBewirtschaftungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { BewProduktSuchenComponent } from './pages/bew-produkt-suchen/bew-produkt-suchen.component';
import { BewProduktErfassenWizardComponent } from './pages/bew-produkt-erfassen-wizard/bew-produkt-erfassen-wizard.component';
import { BewProduktBeschreibungBearbeitenComponent } from './pages/bew-produkt-beschreibung-bearbeiten/bew-produkt-beschreibung-bearbeiten.component';
import { BewProduktGrunddatenBearbeitenComponent } from './pages/bew-produkt-grunddaten-bearbeiten/bew-produkt-grunddaten-bearbeiten.component';
import { BewProduktBeschreibungErfassenComponent } from './pages/bew-produkt-erfassen-wizard/pages/bew-produkt-beschreibung-erfassen/bew-produkt-beschreibung-erfassen.component';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { PermissionGuard } from '@app/core/guards/permission.guard';
import { BewProduktGrunddatenErfassenComponent } from './pages/bew-produkt-erfassen-wizard/pages/bew-produkt-grunddaten-erfassen/bew-produkt-grunddaten-erfassen.component';
import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';
import { BewMassnahmeSuchenComponent } from './pages/bew-massnahme-suchen/bew-massnahme-suchen.component';
import { CanDeleteGuard } from '@app/shared/services/can-delete-guard.service';
import { CanDeactivateGuard } from '@app/shared/services/can-deactive-guard.service';
import { BewDfeSuchenComponent } from './pages/bew-dfe-suchen/bew-dfe-suchen.component';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import { BewMassnahmenUebersichtComponent } from './pages/bew-massnahmen-uebersicht/bew-massnahmen-uebersicht.component';
import { BewDfeUebersichtComponent } from './pages/bew-dfe-uebersicht/bew-dfe-uebersicht.component';
import { BewMassnahmeErfassenWizardComponent } from './pages/bew-massnahme-erfassen-wizard/bew-massnahme-erfassen-wizard.component';
import { BewMassnahmeGrunddatenErfassenComponent } from './pages/bew-massnahme-erfassen-wizard/pages/bew-massnahme-grunddaten-erfassen/bew-massnahme-grunddaten-erfassen.component';
// prettier-ignore
import { BewMassnahmeBeschreibungErfassenComponent } from 
'./pages/bew-massnahme-erfassen-wizard/pages/bew-massnahme-beschreibung-erfassen/bew-massnahme-beschreibung-erfassen.component';
import {
    BewMassnahmeKostenComponent,
    BewMassnahmeBeschreibungBearbeitenComponent,
    BewMassnahmeDurchfuehrungsortErfassenComponent,
    BewMassnahmeGrunddatenBearbeitenComponent,
    BewProduktHomeComponent,
    BewMassnahmeReserviertePlaetzeComponent,
    BewKursGrunddatenErfassenComponent,
    BewKursBeschreibungErfassenComponent,
    BewKursDurchfuehrungsortErfassenComponent,
    BewKursErfassenWizardComponent,
    BewMassnahmeTeilnehmerlisteComponent,
    BewPraktikumsstellenUebersichtComponent,
    BewKursGrunddatenBearbeitenComponent,
    BewArbeitsplatzkategorienComponent,
    BewStandortErfassenWizardComponent,
    BewStandortGrunddatenErfassenComponent,
    BewStandortBeschreibungErfassenComponent,
    BewStandortDurchfortErfassenComponent,
    BewProduktPlanwerteUebersichtComponent,
    BewMassnahmePlanwerteUebersichtComponent,
    BewKursPlanwerteUebersichtComponent,
    BewStandortPlanwerteUebersichtComponent,
    BewDfeTeilnehmerlisteComponent,
    BewStandortTeilnehmerlisteComponent,
    BewStandortGrunddatenBearbeitenComponent,
    BewStandortTeilnehmerplaetzeComponent,
    BewProduktPlanwertErfassenComponent,
    BewStandortPlanwertErfassenComponent,
    BewKursPlanwertErfassenComponent,
    BewMassnahmePlanwertErfassenComponent,
    BewBeschaeftigungseinheitErfassenWizardComponent,
    BewBeschaeftigungseinheitGrunddatenErfassenComponent,
    BewBeschaeftigungseinheitDurchfortErfassenComponent,
    BewBeschaeftigungseinheitBeschreibungErfassenComponent,
    BewKursWartelisteComponent,
    BewBeschaeftigungseinheitTeilnehmerlisteComponent,
    BewBeschaeftigungseinheitHomeComponent,
    BewStandortBeschreibungBearbeitenComponent,
    BewKursBeschreibungBearbeitenComponent,
    BewBeeGrunddatenBearbeitenComponent,
    BewBeeBeschreibungBearbeitenComponent,
    BewBeschaeftigungseinheitTeilnehmerplaetzeComponent,
    BewStandortPlanwertBearbeitenComponent,
    BewKursPlanwertBearbeitenComponent,
    BewMassnahmePlanwertBearbeitenComponent,
    BewProduktPlanwertBearbeitenComponent,
    BewMassnahmeDurchfuehrungsortBearbeitenComponent,
    BewStandortDurchfuehrungsortBearbeitenComponent,
    BewBeeDurchfuehrungsortBearbeitenComponent,
    BewProduktPlanwertControllingwerteComponent,
    BewKursPlanwertControllingwerteComponent,
    BewStandortPlanwertControllingwerteComponent,
    BewMassnahmePlanwertControllingwerteComponent,
    BewMassnahmeVertragswerteComponent,
    BewKursVertragswerteComponent,
    BewStandortVertragswerteComponent,
    BewKursPlanwertHomeComponent,
    BewMassnahmePlanwertHomeComponent,
    BewProduktPlanwertHomeComponent
} from './pages';
import { AmmBewirtschaftungLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { BewMassnahmeHomeComponent } from './pages/bew-massnahme-home/bew-massnahme-home.component';
import { BewKursHomeComponent } from './pages/bew-kurs-home/bew-kurs-home.component';
import { BewStandortHomeComponent } from './pages/bew-standort-home/bew-standort-home.component';
import { BewKursDurchfuehrungsortBearbeitenComponent } from './pages/bew-kurs-durchfuehrungsort-bearbeiten/bew-kurs-durchfuehrungsort-bearbeiten.component';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { BewStandortPlanwertHomeComponent } from './pages/bew-standort-planwert-home/bew-standort-planwert-home.component';

const bewirtschaftungRoutes: Routes = [
    {
        path: AMMPaths.BEW_PRODUKT,
        redirectTo: AMMPaths.BEW_PRODUKT_SUCHEN,
        pathMatch: 'full'
    },
    {
        path: AMMPaths.BEW_PRODUKT_SUCHEN,
        component: BewProduktSuchenComponent,
        data: {
            title: AmmBewirtschaftungLabels.PRODUKT_SUCHEN,
            permissions: [Permissions.AMM_MASSNAHMEN_SICHTEN, Permissions.FEATURE_34],
            formNumber: AmmFormNumberEnum.AMM_PRODUKT_SUCHEN
        }
    },
    {
        path: AMMPaths.BEW_PRODUKT_ERFASSEN,
        component: BewProduktErfassenWizardComponent,
        data: {
            title: AmmBewirtschaftungLabels.PRODUKT_ERFASSEN,
            permissions: [Permissions.FEATURE_34, Permissions.AMM_MASSNAHMEN_BEARBEITEN]
        },
        canActivate: [PermissionGuard],
        canDeactivate: [CanDeleteGuard],
        children: [
            {
                path: AMMPaths.BEW_GRUNDDATEN,
                component: BewProduktGrunddatenErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_MASSNAHMEN_SICHTEN],
                    title: AmmBewirtschaftungLabels.GRUNDDATEN,
                    formNumber: AmmFormNumberEnum.AMM_PRODUKT_GRUNDDATEN
                }
            },
            {
                path: AMMPaths.BEW_BESCHREIBUNG,
                component: BewProduktBeschreibungErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_MASSNAHMEN_SICHTEN],
                    title: AmmBewirtschaftungLabels.BESCHREIBUNG,
                    formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_BESCHREIBUNG
                }
            }
        ]
    },
    {
        path: AMMPaths.BEW_MASSNAHME_SUCHEN,
        component: BewMassnahmeSuchenComponent,
        data: {
            title: AmmBewirtschaftungLabels.MASSNAHMEN_SUCHEN,
            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
            formNumber: AmmFormNumberEnum.AMM_BEWIRTSCHAFTUNG_MASSNAHME_SUCHEN
        }
    },
    {
        path: AMMPaths.BEW_DFE_SUCHEN,
        component: BewDfeSuchenComponent,
        data: {
            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
            title: AmmBewirtschaftungLabels.DFE_SUCHEN,
            formNumber: AmmFormNumberEnum.AMM_DFE_SUCHEN
        },
        canActivate: [PermissionGuard]
    },
    {
        path: AMMPaths.BEW_MASSNAHME_ERFASSEN,
        component: BewMassnahmeErfassenWizardComponent,
        data: {
            title: AmmBewirtschaftungLabels.MASSNAHMEN_ERFASSEN,
            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34]
        },
        canActivate: [PermissionGuard],
        canDeactivate: [CanDeleteGuard],
        children: [
            {
                path: AMMPaths.BEW_GRUNDDATEN,
                component: BewMassnahmeGrunddatenErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
                    title: AmmBewirtschaftungLabels.GRUNDDATEN,
                    formNumber: AmmFormNumberEnum.AMM_MASSNAHME_GRUNDDATEN,
                    mode: FormModeEnum.CREATE
                }
            },
            {
                path: AMMPaths.BEW_BESCHREIBUNG,
                component: BewMassnahmeBeschreibungErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
                    title: AmmBewirtschaftungLabels.BESCHREIBUNG,
                    formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_BESCHREIBUNG,
                    mode: FormModeEnum.CREATE
                }
            },
            {
                path: AMMPaths.BEW_DURCHFUEHRUNGSORT,
                component: BewMassnahmeDurchfuehrungsortErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
                    title: AmmBewirtschaftungLabels.DURCHFUHRUNGSORT,
                    formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_DURCHFUEHRUNGSORT,
                    mode: FormModeEnum.CREATE
                }
            }
        ]
    },
    {
        path: AMMPaths.BEW_KURS_ERFASSEN,
        component: BewKursErfassenWizardComponent,
        data: {
            title: AmmBewirtschaftungLabels.KURS_ERFASSEN,
            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34]
        },
        canActivate: [PermissionGuard],
        canDeactivate: [CanDeleteGuard],
        children: [
            {
                path: AMMPaths.BEW_GRUNDDATEN,
                component: BewKursGrunddatenErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
                    title: AmmBewirtschaftungLabels.GRUNDDATEN,
                    formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_KURS_GRUNDDATEN,
                    mode: FormModeEnum.CREATE
                }
            },
            {
                path: AMMPaths.BEW_BESCHREIBUNG,
                component: BewKursBeschreibungErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
                    title: AmmBewirtschaftungLabels.BESCHREIBUNG,
                    formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_BESCHREIBUNG,
                    mode: FormModeEnum.CREATE
                }
            },
            {
                path: AMMPaths.BEW_DURCHFUEHRUNGSORT,
                component: BewKursDurchfuehrungsortErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
                    title: AmmBewirtschaftungLabels.DURCHFUHRUNGSORT,
                    formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_DURCHFUEHRUNGSORT,
                    mode: FormModeEnum.CREATE
                }
            }
        ]
    },
    {
        path: AMMPaths.BEW_STANDORT_ERFASSEN,
        component: BewStandortErfassenWizardComponent,
        data: {
            title: AmmBewirtschaftungLabels.STANDORT_ERFASSEN,
            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34]
        },
        canActivate: [PermissionGuard],
        canDeactivate: [CanDeleteGuard],
        children: [
            {
                path: AMMPaths.BEW_GRUNDDATEN,
                component: BewStandortGrunddatenErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
                    title: AmmBewirtschaftungLabels.GRUNDDATEN,
                    formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_STANDORT_GRUNDDATEN,
                    mode: FormModeEnum.CREATE
                }
            },
            {
                path: AMMPaths.BEW_BESCHREIBUNG,
                component: BewStandortBeschreibungErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
                    title: AmmBewirtschaftungLabels.BESCHREIBUNG,
                    formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_BESCHREIBUNG,
                    mode: FormModeEnum.CREATE
                }
            },
            {
                path: AMMPaths.BEW_DURCHFUEHRUNGSORT,
                component: BewStandortDurchfortErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
                    title: AmmBewirtschaftungLabels.DURCHFUHRUNGSORT,
                    formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_DURCHFUEHRUNGSORT,
                    mode: FormModeEnum.CREATE
                }
            }
        ]
    },
    {
        path: AMMPaths.BEW_BESCHAEFTIGUNGSEINHEIT_ERFASSEN,
        component: BewBeschaeftigungseinheitErfassenWizardComponent,
        data: {
            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34]
        },
        canActivate: [PermissionGuard],
        canDeactivate: [CanDeleteGuard],
        children: [
            {
                path: AMMPaths.BEW_GRUNDDATEN,
                component: BewBeschaeftigungseinheitGrunddatenErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
                    title: AmmBewirtschaftungLabels.GRUNDDATEN,
                    mode: FormModeEnum.CREATE
                }
            },
            {
                path: AMMPaths.BEW_BESCHREIBUNG,
                component: BewBeschaeftigungseinheitBeschreibungErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
                    title: AmmBewirtschaftungLabels.BESCHREIBUNG,
                    formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_BESCHREIBUNG,
                    mode: FormModeEnum.CREATE
                }
            },
            {
                path: AMMPaths.BEW_DURCHFUEHRUNGSORT,
                component: BewBeschaeftigungseinheitDurchfortErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
                    title: AmmBewirtschaftungLabels.DURCHFUHRUNGSORT,
                    formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_DURCHFUEHRUNGSORT,
                    mode: FormModeEnum.CREATE
                }
            }
        ]
    },
    {
        path: 'produkt/:produktId',
        redirectTo: 'produkt/:produktId/grunddaten',
        pathMatch: 'full'
    },
    {
        path: AMMPaths.BEW_PRODUKT_HOME,
        component: BewProduktHomeComponent,
        data: { permissions: [Permissions.FEATURE_34, Permissions.AMM_MASSNAHMEN_SICHTEN] },
        children: [
            {
                path: AMMPaths.BEW_GRUNDDATEN,
                component: BewProduktGrunddatenBearbeitenComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: AmmBewirtschaftungLabels.GRUNDDATEN,
                    mode: FormModeEnum.EDIT,
                    formNumber: AmmFormNumberEnum.AMM_PRODUKT_GRUNDDATEN,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_MASSNAHMEN_SICHTEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: AMMPaths.BEW_BESCHREIBUNG,
                component: BewProduktBeschreibungBearbeitenComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: AmmBewirtschaftungLabels.BESCHREIBUNG,
                    mode: FormModeEnum.EDIT,
                    formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_BESCHREIBUNG,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_MASSNAHMEN_SICHTEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: AMMPaths.BEW_PRODUKT_MASSNAHMEN,
                component: BewMassnahmenUebersichtComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: AmmBewirtschaftungLabels.MASSNAHMEN,
                    formNumber: AmmFormNumberEnum.AMM_PRODUKT_MASSNAHMEN_UEBERSICHT,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_MASSNAHMEN_SICHTEN]
                }
            },
            {
                path: AMMPaths.BEW_PLANWERTE,
                component: BewProduktPlanwerteUebersichtComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: AmmBewirtschaftungLabels.PLANWERTE,
                    formNumber: AmmFormNumberEnum.AMM_PLANWERTE_UEBERSICHT,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN]
                }
            },
            {
                path: AMMPaths.PLANWERT_ERFASSEN,
                component: BewProduktPlanwertErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: AmmBewirtschaftungLabels.PLANWERT_ERFASSEN,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                    formNumber: AmmFormNumberEnum.AMM_PLANWERT,
                    mode: FormModeEnum.CREATE
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: AMMPaths.PLANWERT,
                redirectTo: AMMPaths.PLANWERT_BEARBEITEN_FULL,
                pathMatch: 'full'
            },
            {
                path: AMMPaths.PLANWERT,
                component: BewProduktPlanwertHomeComponent,
                canActivate: [PermissionGuard],
                data: { permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN] },
                children: [
                    {
                        path: AMMPaths.PLANWERT_BEARBEITEN,
                        component: BewProduktPlanwertBearbeitenComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: AmmBewirtschaftungLabels.PLANWERT_BEARBEITEN,
                            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                            formNumber: AmmFormNumberEnum.AMM_PLANWERT,
                            mode: FormModeEnum.EDIT
                        },
                        canDeactivate: [CanDeactivateGuard]
                    },
                    {
                        path: AMMPaths.PLANWERT_CONTROLLINGWERTE,
                        component: BewProduktPlanwertControllingwerteComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: AmmBewirtschaftungLabels.PLANWERT_CONTROLLINGWERTE,
                            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                            formNumber: AmmFormNumberEnum.AMM_PLANWERT_CONTROLLINGWERTE,
                            mode: FormModeEnum.EDIT
                        },
                        canDeactivate: [CanDeactivateGuard]
                    }
                ]
            },
            {
                path: AMMPaths.BEW_MASSNAHMEN_HOME,
                redirectTo: AMMPaths.BEW_MASSNAHMEN_GRUNDDATEN_HOME,
                pathMatch: 'full'
            },
            {
                path: AMMPaths.BEW_MASSNAHMEN_HOME,
                component: BewMassnahmeHomeComponent,
                data: { permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34] },
                children: [
                    {
                        path: AMMPaths.BEW_GRUNDDATEN,
                        component: BewMassnahmeGrunddatenBearbeitenComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: AmmBewirtschaftungLabels.GRUNDDATEN,
                            mode: FormModeEnum.EDIT,
                            formNumber: AmmFormNumberEnum.AMM_MASSNAHME_GRUNDDATEN,
                            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    },
                    {
                        path: AMMPaths.BEW_BESCHREIBUNG,
                        component: BewMassnahmeBeschreibungBearbeitenComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: AmmBewirtschaftungLabels.BESCHREIBUNG,
                            mode: FormModeEnum.EDIT,
                            formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_BESCHREIBUNG,
                            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    },
                    {
                        path: AMMPaths.BEW_DURCHFUEHRUNGSORT,
                        component: BewMassnahmeDurchfuehrungsortBearbeitenComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: AmmBewirtschaftungLabels.DURCHFUHRUNGSORT,
                            mode: FormModeEnum.EDIT,
                            formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_DURCHFUEHRUNGSORT,
                            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    },
                    {
                        path: AMMPaths.BEW_KURSE,
                        component: BewDfeUebersichtComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: AmmBewirtschaftungLabels.KURSE,
                            formNumber: AmmFormNumberEnum.AMM_PRODUKT_MASSNAHMEN_KURSE_UEBERSICHT,
                            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34]
                        }
                    },
                    {
                        path: AMMPaths.BEW_STANDORTE,
                        component: BewDfeUebersichtComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: AmmBewirtschaftungLabels.MASSNAHMEN,
                            formNumber: AmmFormNumberEnum.AMM_PRODUKT_MASSNAHMEN_KURSE_UEBERSICHT,
                            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34]
                        }
                    },
                    {
                        path: AMMPaths.BEW_TEILNEHMERLISTE,
                        component: BewMassnahmeTeilnehmerlisteComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: AmmBewirtschaftungLabels.TEILNEHMERLISTE,
                            formNumber: AmmFormNumberEnum.AMM_MASSNAHME_TEILNEHMERLISTE,
                            permissions: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.FEATURE_34]
                        }
                    },
                    {
                        path: AMMPaths.BEW_KOSTEN,
                        component: BewMassnahmeKostenComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: AmmBewirtschaftungLabels.KOSTEN,
                            formNumber: AmmFormNumberEnum.AMM_MASSNAHME_KOSTEN,
                            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34]
                        }
                    },
                    {
                        path: AMMPaths.BEW_PLANWERTE,
                        component: BewMassnahmePlanwerteUebersichtComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: AmmBewirtschaftungLabels.PLANWERTE,
                            formNumber: AmmFormNumberEnum.AMM_PLANWERTE_UEBERSICHT,
                            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN]
                        }
                    },
                    {
                        path: AMMPaths.BEW_VERTRAGSWERTE,
                        component: BewMassnahmeVertragswerteComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: AmmBewirtschaftungLabels.VERTRAGSWERTE,
                            formNumber: AmmFormNumberEnum.AMM_BEW_VERTRAGSWERTE,
                            permissions: [{ or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN] }, Permissions.FEATURE_34]
                        }
                    },
                    {
                        path: AMMPaths.PLANWERT_ERFASSEN,
                        component: BewMassnahmePlanwertErfassenComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: AmmBewirtschaftungLabels.PLANWERTE,
                            formNumber: AmmFormNumberEnum.AMM_PLANWERT,
                            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                            mode: FormModeEnum.CREATE
                        }
                    },
                    {
                        path: AMMPaths.PLANWERT,
                        redirectTo: AMMPaths.PLANWERT_BEARBEITEN_FULL,
                        pathMatch: 'full'
                    },
                    {
                        path: AMMPaths.PLANWERT,
                        component: BewMassnahmePlanwertHomeComponent,
                        canActivate: [PermissionGuard],
                        data: { permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN] },
                        children: [
                            {
                                path: AMMPaths.PLANWERT_BEARBEITEN,
                                component: BewMassnahmePlanwertBearbeitenComponent,
                                canActivate: [PermissionGuard],
                                data: {
                                    title: AmmBewirtschaftungLabels.PLANWERT_BEARBEITEN,
                                    formNumber: AmmFormNumberEnum.AMM_PLANWERT,
                                    permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                                    mode: FormModeEnum.EDIT
                                }
                            },
                            {
                                path: AMMPaths.PLANWERT_CONTROLLINGWERTE,
                                component: BewMassnahmePlanwertControllingwerteComponent,
                                canActivate: [PermissionGuard],
                                data: {
                                    title: AmmBewirtschaftungLabels.PLANWERT_CONTROLLINGWERTE,
                                    permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                                    formNumber: AmmFormNumberEnum.AMM_PLANWERT_CONTROLLINGWERTE,
                                    mode: FormModeEnum.EDIT
                                },
                                canDeactivate: [CanDeactivateGuard]
                            }
                        ]
                    },
                    {
                        path: AMMPaths.BEW_KURSE_HOME,
                        redirectTo: AMMPaths.BEW_KURSE_GRUNDDATEN_HOME,
                        pathMatch: 'full'
                    },
                    {
                        path: AMMPaths.BEW_KURSE_HOME,
                        data: { permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34] },
                        component: BewKursHomeComponent,
                        children: [
                            {
                                path: AMMPaths.BEW_GRUNDDATEN,
                                component: BewKursGrunddatenBearbeitenComponent,
                                canActivate: [PermissionGuard],
                                data: {
                                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
                                    title: AmmBewirtschaftungLabels.GRUNDDATEN,
                                    formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_KURS_GRUNDDATEN,
                                    mode: FormModeEnum.EDIT
                                },
                                canDeactivate: [CanDeactivateGuard]
                            },
                            {
                                path: AMMPaths.BEW_BESCHREIBUNG,
                                component: BewKursBeschreibungBearbeitenComponent,
                                canActivate: [PermissionGuard],
                                data: {
                                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
                                    title: AmmBewirtschaftungLabels.BESCHREIBUNG,
                                    formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_BESCHREIBUNG,
                                    mode: FormModeEnum.EDIT
                                },
                                canDeactivate: [CanDeactivateGuard]
                            },
                            {
                                path: AMMPaths.BEW_DURCHFUEHRUNGSORT,
                                component: BewKursDurchfuehrungsortBearbeitenComponent,
                                canActivate: [PermissionGuard],
                                data: {
                                    title: AmmBewirtschaftungLabels.DURCHFUHRUNGSORT,
                                    mode: FormModeEnum.EDIT,
                                    formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_DURCHFUEHRUNGSORT,
                                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34]
                                },
                                canDeactivate: [CanDeactivateGuard]
                            },
                            {
                                path: AMMPaths.BEW_PLANWERTE,
                                component: BewKursPlanwerteUebersichtComponent,
                                canActivate: [PermissionGuard],
                                data: {
                                    title: AmmBewirtschaftungLabels.PLANWERTE,
                                    formNumber: AmmFormNumberEnum.AMM_PLANWERTE_UEBERSICHT,
                                    permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN]
                                }
                            },
                            {
                                path: AMMPaths.BEW_VERTRAGSWERTE,
                                component: BewKursVertragswerteComponent,
                                canActivate: [PermissionGuard],
                                data: {
                                    title: AmmBewirtschaftungLabels.VERTRAGSWERTE,
                                    formNumber: AmmFormNumberEnum.AMM_BEW_VERTRAGSWERTE,
                                    permissions: [{ or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN] }, Permissions.FEATURE_34]
                                }
                            },
                            {
                                path: AMMPaths.PLANWERT_ERFASSEN,
                                component: BewKursPlanwertErfassenComponent,
                                canActivate: [PermissionGuard],
                                data: {
                                    title: AmmBewirtschaftungLabels.PLANWERT_ERFASSEN,
                                    permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                                    formNumber: AmmFormNumberEnum.AMM_PLANWERT,
                                    mode: FormModeEnum.CREATE
                                },
                                canDeactivate: [CanDeactivateGuard]
                            },
                            {
                                path: AMMPaths.PLANWERT,
                                redirectTo: AMMPaths.PLANWERT_BEARBEITEN_FULL,
                                pathMatch: 'full'
                            },
                            {
                                path: AMMPaths.PLANWERT,
                                component: BewKursPlanwertHomeComponent,
                                canActivate: [PermissionGuard],
                                data: { permissions: [Permissions.AMM_PLANUNG_LESEN, Permissions.FEATURE_34] },
                                children: [
                                    {
                                        path: AMMPaths.PLANWERT_BEARBEITEN,
                                        component: BewKursPlanwertBearbeitenComponent,
                                        canActivate: [PermissionGuard],
                                        data: {
                                            title: AmmBewirtschaftungLabels.PLANWERT_BEARBEITEN,
                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                                            formNumber: AmmFormNumberEnum.AMM_PLANWERT,
                                            mode: FormModeEnum.EDIT
                                        },
                                        canDeactivate: [CanDeactivateGuard]
                                    },
                                    {
                                        path: AMMPaths.PLANWERT_CONTROLLINGWERTE,
                                        component: BewKursPlanwertControllingwerteComponent,
                                        canActivate: [PermissionGuard],
                                        data: {
                                            title: AmmBewirtschaftungLabels.PLANWERT_CONTROLLINGWERTE,
                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                                            formNumber: AmmFormNumberEnum.AMM_PLANWERT_CONTROLLINGWERTE,
                                            mode: FormModeEnum.EDIT
                                        },
                                        canDeactivate: [CanDeactivateGuard]
                                    }
                                ]
                            },
                            {
                                path: AMMPaths.BEW_RESERVIERTE_PLAETZE,
                                component: BewMassnahmeReserviertePlaetzeComponent,
                                canActivate: [PermissionGuard],
                                canDeactivate: [CanDeactivateGuard],
                                data: {
                                    title: AmmBewirtschaftungLabels.RESERVIERTE_PLAETZE,
                                    formNumber: AmmFormNumberEnum.AMM_PRODUKT_KURSE_RESERVIERTE_PLAETZE,
                                    permissions: [Permissions.FEATURE_34, Permissions.KEY_AMM_MASSNAHMEN_RESERVATION_SICHTEN],
                                    mode: FormModeEnum.EDIT
                                }
                            },
                            {
                                path: AMMPaths.BEW_TEILNEHMERLISTE,
                                component: BewDfeTeilnehmerlisteComponent,
                                canActivate: [PermissionGuard],
                                data: {
                                    title: AmmBewirtschaftungLabels.TEILNEHMERLISTE,
                                    formNumber: AmmFormNumberEnum.AMM_MASSNAHME_TEILNEHMERLISTE,
                                    permissions: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.FEATURE_34]
                                }
                            },
                            {
                                path: AMMPaths.BEW_WARTELISTE,
                                component: BewKursWartelisteComponent,
                                canActivate: [PermissionGuard],
                                data: {
                                    title: AmmBewirtschaftungLabels.WARTELISTE,
                                    formNumber: AmmFormNumberEnum.BEW_KURS_WARTELISTE,
                                    permissions: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.FEATURE_34]
                                }
                            }
                        ]
                    },
                    {
                        path: AMMPaths.BEW_STANDORTE_HOME,
                        redirectTo: AMMPaths.BEW_STANDORTE_GRUNDDATEN_HOME,
                        pathMatch: 'full'
                    },
                    {
                        path: AMMPaths.BEW_STANDORTE_HOME,
                        data: { permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34] },
                        component: BewStandortHomeComponent,
                        children: [
                            {
                                path: AMMPaths.BEW_GRUNDDATEN,
                                component: BewStandortGrunddatenBearbeitenComponent,
                                canActivate: [PermissionGuard],
                                data: {
                                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
                                    title: AmmBewirtschaftungLabels.GRUNDDATEN,
                                    formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_STANDORT_GRUNDDATEN,
                                    mode: FormModeEnum.EDIT
                                },
                                canDeactivate: [CanDeactivateGuard]
                            },
                            {
                                path: AMMPaths.BEW_BESCHREIBUNG,
                                component: BewStandortBeschreibungBearbeitenComponent,
                                canActivate: [PermissionGuard],
                                data: {
                                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
                                    title: AmmBewirtschaftungLabels.BESCHREIBUNG,
                                    formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_BESCHREIBUNG,
                                    mode: FormModeEnum.EDIT
                                },
                                canDeactivate: [CanDeactivateGuard]
                            },
                            {
                                path: AMMPaths.BEW_DURCHFUEHRUNGSORT,
                                component: BewStandortDurchfuehrungsortBearbeitenComponent,
                                canActivate: [PermissionGuard],
                                data: {
                                    title: AmmBewirtschaftungLabels.DURCHFUHRUNGSORT,
                                    mode: FormModeEnum.EDIT,
                                    formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_DURCHFUEHRUNGSORT,
                                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34]
                                },
                                canDeactivate: [CanDeactivateGuard]
                            },
                            {
                                path: AMMPaths.BEW_PLANWERTE,
                                component: BewStandortPlanwerteUebersichtComponent,
                                canActivate: [PermissionGuard],
                                data: {
                                    title: AmmBewirtschaftungLabels.PLANWERTE,
                                    formNumber: AmmFormNumberEnum.AMM_PLANWERTE_UEBERSICHT,
                                    permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN]
                                }
                            },
                            {
                                path: AMMPaths.BEW_VERTRAGSWERTE,
                                component: BewStandortVertragswerteComponent,
                                canActivate: [PermissionGuard],
                                data: {
                                    title: AmmBewirtschaftungLabels.VERTRAGSWERTE,
                                    formNumber: AmmFormNumberEnum.AMM_BEW_VERTRAGSWERTE,
                                    permissions: [{ or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN] }, Permissions.FEATURE_34]
                                }
                            },
                            {
                                path: AMMPaths.PLANWERT_ERFASSEN,
                                component: BewStandortPlanwertErfassenComponent,
                                canActivate: [PermissionGuard],
                                data: {
                                    title: AmmBewirtschaftungLabels.PLANWERT_ERFASSEN,
                                    permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                                    formNumber: AmmFormNumberEnum.AMM_PLANWERT,
                                    mode: FormModeEnum.CREATE
                                },
                                canDeactivate: [CanDeactivateGuard]
                            },
                            {
                                path: AMMPaths.PLANWERT,
                                redirectTo: AMMPaths.PLANWERT_BEARBEITEN_FULL,
                                pathMatch: 'full'
                            },
                            {
                                path: AMMPaths.PLANWERT,
                                component: BewStandortPlanwertHomeComponent,
                                canActivate: [PermissionGuard],
                                data: { permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN] },
                                children: [
                                    {
                                        path: AMMPaths.PLANWERT_BEARBEITEN,
                                        component: BewStandortPlanwertBearbeitenComponent,
                                        canActivate: [PermissionGuard],
                                        data: {
                                            title: AmmBewirtschaftungLabels.PLANWERT_BEARBEITEN,
                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                                            formNumber: AmmFormNumberEnum.AMM_PLANWERT,
                                            mode: FormModeEnum.EDIT
                                        },
                                        canDeactivate: [CanDeactivateGuard]
                                    },
                                    {
                                        path: AMMPaths.PLANWERT_CONTROLLINGWERTE,
                                        component: BewStandortPlanwertControllingwerteComponent,
                                        canActivate: [PermissionGuard],
                                        data: {
                                            title: AmmBewirtschaftungLabels.PLANWERT_CONTROLLINGWERTE,
                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                                            formNumber: AmmFormNumberEnum.AMM_PLANWERT_CONTROLLINGWERTE,
                                            mode: FormModeEnum.EDIT
                                        },
                                        canDeactivate: [CanDeactivateGuard]
                                    }
                                ]
                            },
                            {
                                path: AMMPaths.BEW_TEILNEHMERLISTE,
                                component: BewStandortTeilnehmerlisteComponent,
                                canActivate: [PermissionGuard],
                                data: {
                                    title: AmmBewirtschaftungLabels.TEILNEHMERLISTE,
                                    formNumber: AmmFormNumberEnum.AMM_MASSNAHME_TEILNEHMERLISTE,
                                    permissions: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.FEATURE_34]
                                }
                            },
                            {
                                path: AMMPaths.BEW_TEILNEHMERPLAETZE,
                                component: BewStandortTeilnehmerplaetzeComponent,
                                canActivate: [PermissionGuard],
                                data: {
                                    title: AmmBewirtschaftungLabels.TEILNEHMERPLAETZE,
                                    formNumber: StesFormNumberEnum.TEILNEHMERPLAETZE,
                                    permissions: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.FEATURE_34]
                                }
                            },
                            {
                                path: AMMPaths.BEW_PRAKTIKUMSTELLEN,
                                component: BewPraktikumsstellenUebersichtComponent,
                                canActivate: [PermissionGuard],
                                data: {
                                    title: AmmBewirtschaftungLabels.PRAKTIKUM_STELLEN,
                                    formNumber: AmmFormNumberEnum.AMM_PRODUKT_MASSNAHME_PRAKTIKUMSTELLEN,
                                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34]
                                }
                            },
                            {
                                path: AMMPaths.BEW_PRAKTIKUMSTELLEN_HOME,
                                redirectTo: AMMPaths.BEW_PRAKTIKUMSTELLEN_GRUNDDATEN_HOME,
                                pathMatch: 'full'
                            },
                            {
                                path: AMMPaths.BEW_PRAKTIKUMSTELLEN_HOME,
                                data: { permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34] },
                                component: BewBeschaeftigungseinheitHomeComponent,
                                children: [
                                    {
                                        path: AMMPaths.BEW_GRUNDDATEN,
                                        component: BewBeeGrunddatenBearbeitenComponent,
                                        canActivate: [PermissionGuard],
                                        data: {
                                            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
                                            title: AmmBewirtschaftungLabels.GRUNDDATEN,
                                            formNumber: AmmFormNumberEnum.BEW_ARBEITSPLATZKATEGORIE_GRUNDDATEN,
                                            mode: FormModeEnum.EDIT
                                        },
                                        canDeactivate: [CanDeactivateGuard]
                                    },
                                    {
                                        path: AMMPaths.BEW_BESCHREIBUNG,
                                        component: BewBeeBeschreibungBearbeitenComponent,
                                        canActivate: [PermissionGuard],
                                        data: {
                                            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
                                            title: AmmBewirtschaftungLabels.BESCHREIBUNG,
                                            formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_BESCHREIBUNG,
                                            mode: FormModeEnum.EDIT
                                        },
                                        canDeactivate: [CanDeactivateGuard]
                                    },
                                    {
                                        path: AMMPaths.BEW_DURCHFUEHRUNGSORT,
                                        component: BewBeeDurchfuehrungsortBearbeitenComponent,
                                        canActivate: [PermissionGuard],
                                        data: {
                                            title: AmmBewirtschaftungLabels.DURCHFUHRUNGSORT,
                                            mode: FormModeEnum.EDIT,
                                            formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_DURCHFUEHRUNGSORT,
                                            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34]
                                        },
                                        canDeactivate: [CanDeactivateGuard]
                                    },
                                    {
                                        path: AMMPaths.BEW_TEILNEHMERLISTE,
                                        component: BewBeschaeftigungseinheitTeilnehmerlisteComponent,
                                        canActivate: [PermissionGuard],
                                        data: {
                                            title: AmmBewirtschaftungLabels.TEILNEHMERLISTE,
                                            formNumber: AmmFormNumberEnum.AMM_MASSNAHME_TEILNEHMERLISTE,
                                            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34]
                                        }
                                    },
                                    {
                                        path: AMMPaths.BEW_TEILNEHMERPLAETZE,
                                        component: BewBeschaeftigungseinheitTeilnehmerplaetzeComponent,
                                        canActivate: [PermissionGuard],
                                        data: {
                                            title: AmmBewirtschaftungLabels.TEILNEHMERPLAETZE,
                                            formNumber: StesFormNumberEnum.TEILNEHMERPLAETZE,
                                            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34]
                                        }
                                    }
                                ]
                            },
                            {
                                path: AMMPaths.BEW_ARBEITSPLATZKATEGORIEN,
                                component: BewArbeitsplatzkategorienComponent,
                                canActivate: [PermissionGuard],
                                data: {
                                    title: AmmBewirtschaftungLabels.ARBEITSPLATZKATEGORIEN,
                                    formNumber: AmmFormNumberEnum.AMM_ARBEITSPLATZKATEGORIEN,
                                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34]
                                }
                            },
                            {
                                path: AMMPaths.BEW_ARBEITSPLATZKATEGORIEN_HOME,
                                redirectTo: AMMPaths.BEW_ARBEITSPLATZKATEGORIEN_GRUNDDATEN_HOME,
                                pathMatch: 'full'
                            },
                            {
                                path: AMMPaths.BEW_ARBEITSPLATZKATEGORIEN_HOME,
                                component: BewBeschaeftigungseinheitHomeComponent,
                                data: { permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34] },
                                children: [
                                    {
                                        path: AMMPaths.BEW_GRUNDDATEN,
                                        component: BewBeeGrunddatenBearbeitenComponent,
                                        canActivate: [PermissionGuard],
                                        data: {
                                            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
                                            title: AmmBewirtschaftungLabels.GRUNDDATEN,
                                            formNumber: AmmFormNumberEnum.BEW_PRAKTIKUMSSTELLE_GRUNDDATEN,
                                            mode: FormModeEnum.EDIT
                                        },
                                        canDeactivate: [CanDeactivateGuard]
                                    },
                                    {
                                        path: AMMPaths.BEW_BESCHREIBUNG,
                                        component: BewBeeBeschreibungBearbeitenComponent,
                                        canActivate: [PermissionGuard],
                                        data: {
                                            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34],
                                            title: AmmBewirtschaftungLabels.BESCHREIBUNG,
                                            formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_BESCHREIBUNG,
                                            mode: FormModeEnum.EDIT
                                        },
                                        canDeactivate: [CanDeactivateGuard]
                                    },
                                    {
                                        path: AMMPaths.BEW_DURCHFUEHRUNGSORT,
                                        component: BewBeeDurchfuehrungsortBearbeitenComponent,
                                        canActivate: [PermissionGuard],
                                        data: {
                                            title: AmmBewirtschaftungLabels.DURCHFUHRUNGSORT,
                                            mode: FormModeEnum.EDIT,
                                            formNumber: AmmFormNumberEnum.BEWIRTSCHAFTUNG_DURCHFUEHRUNGSORT,
                                            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34]
                                        },
                                        canDeactivate: [CanDeactivateGuard]
                                    },
                                    {
                                        path: AMMPaths.BEW_TEILNEHMERLISTE,
                                        component: BewBeschaeftigungseinheitTeilnehmerlisteComponent,
                                        canActivate: [PermissionGuard],
                                        data: {
                                            title: AmmBewirtschaftungLabels.TEILNEHMERLISTE,
                                            formNumber: AmmFormNumberEnum.AMM_MASSNAHME_TEILNEHMERLISTE,
                                            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34]
                                        }
                                    },
                                    {
                                        path: AMMPaths.BEW_TEILNEHMERPLAETZE,
                                        component: BewBeschaeftigungseinheitTeilnehmerplaetzeComponent,
                                        canActivate: [PermissionGuard],
                                        data: {
                                            title: AmmBewirtschaftungLabels.TEILNEHMERPLAETZE,
                                            formNumber: StesFormNumberEnum.TEILNEHMERPLAETZE,
                                            permissions: [{ or: [Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN, Permissions.AMM_MASSNAHMEN_SICHTEN] }, Permissions.FEATURE_34]
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(bewirtschaftungRoutes)],
    exports: [RouterModule]
})
export class BewirtschaftungRoutingModule {}
