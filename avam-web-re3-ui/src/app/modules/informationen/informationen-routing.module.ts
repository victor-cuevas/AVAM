import { NgModule } from '@angular/core';
import { Data, RouterModule, Routes } from '@angular/router';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { PermissionGuard } from '@core/guards/permission.guard';
import { Permissions } from '@shared/enums/permissions.enum';
import { FormModeEnum } from '@shared/enums/form-mode.enum';
import { CanDeactivateGuard } from '@shared/services/can-deactive-guard.service';
import { BenutzerstelleHomePageComponent } from '@modules/informationen/pages/benutzerstelle-home/benutzerstelle-home-page.component';
// prettier-ignore
import { BenutzerstelleErweiterteDatenBearbeitenPageComponent }
    from '@modules/informationen/pages/benutzerstelle-erweiterte-daten-bearbeiten/benutzerstelle-erweiterte-daten-bearbeiten-page.component';
import { InformationenPaths } from '@shared/enums/stes-navigation-paths.enum';
import { BenutzerstellenSuchenPageComponent } from '@modules/informationen/pages/benutzerstellen-suchen/benutzerstellen-suchen-page.component';
import { BenutzerstelleErfassenWizardComponent } from '@modules/informationen/pages/benutzerstelle-erfassen/benutzerstelle-erfassen-wizard.component';
// prettier-ignore
import { BenutzerstelleErfassenGrunddatenPageComponent } from
        '@modules/informationen/pages/benutzerstelle-erfassen/pages/grunddaten/benutzerstelle-erfassen-grunddaten-page.component';
// prettier-ignore
import { BenutzerstelleErfassenErwDatenPageComponent } from
        '@modules/informationen/pages/benutzerstelle-erfassen/pages/erw-daten/benutzerstelle-erfassen-erw-daten-page.component';
import { CanDeleteGuard } from '@shared/services/can-delete-guard.service';
import { ZahlstellenSuchenPageComponent } from '@modules/informationen/pages/zahlstellen-suchen-page/zahlstellen-suchen-page.component';
import { ZahlstellenErfassenBearbeitenComponent } from '@modules/informationen/pages/zahlstellen-erfassen-bearbeiten/zahlstellen-erfassen-bearbeiten.component';
import { InformationsmeldungenSuchenComponent } from '@modules/informationen/pages/informationsmeldungen-suchen/informationsmeldungen-suchen.component';
// prettier-ignore
import { BenutzerstelleGrundDatenBearbeitenPageComponent }
    from '@modules/informationen/pages/benutzerstelle-grunddaten-bearbeiten/benutzerstelle-grunddaten-bearbeiten-page.component';
import { InformationenLabels } from '@shared/enums/stes-routing-labels.enum';
import { RollenSuchenPageComponent } from '@modules/informationen/pages/rollen-suchen-page/rollen-suchen-page.component';
//prettier-ignore
import {
    InformationsmeldungErfassenBearbeitenComponent
} from '@modules/informationen/pages/informationsmeldung-erfassen-bearbeiten/informationsmeldung-erfassen-bearbeiten.component';
import { VollzugsregionSuchenComponent } from '@modules/informationen/pages/vollzugsregion-suchen/vollzugsregion-suchen.component';
import { RolleErfassenWizardComponent } from '@modules/informationen/pages/rolle-erfassen/rolle-erfassen-wizard.component';
import { RolleErfassenGrunddatenPageComponent } from '@modules/informationen/pages/rolle-erfassen/pages/grunddaten/rolle-erfassen-grunddaten-page.component';
import { RolleErfassenBerechtigungenPageComponent } from '@modules/informationen/pages/rolle-erfassen/pages/berechtigungen/rolle-erfassen-berechtigungen-page.component';
import { RollenBearbeitenHomePageComponent } from '@modules/informationen/pages/rollen-bearbeiten-home/rollen-bearbeiten-home-page.component';
import { RollenGrunddatenBearbeitenPageComponent } from '@modules/informationen/pages/rollen-grunddaten-bearbeiten-page/rollen-grunddaten-bearbeiten-page.component';
import { VollzugsregionErfassenBearbeitenComponent } from '@modules/informationen/pages/vollzugsregion-erfassen-bearbeiten/vollzugsregion-erfassen-bearbeiten.component';
import { CodesSuchenComponent } from './pages/codes-suchen/codes-suchen.component';
import { InformationenFormNumberEnum } from '@app/shared/enums/informationen-form-number.enum';
import { RollenBerechtigungenBearbeitenPageComponent } from '@modules/informationen/pages/rollen-berechtigungen-bearbeiten-page/rollen-berechtigungen-bearbeiten-page.component';
import { BerufSuchenComponent } from '@modules/informationen/pages/beruf-suchen/beruf-suchen.component';
import { BenutzermeldungenSuchenPageComponent } from '@modules/informationen/pages/benutzermeldungen-suchen-page/benutzermeldungen-suchen-page.component';
import { BerufErfassenBearbeitenComponent } from '@modules/informationen/pages/beruf-erfassen-bearbeiten/beruf-erfassen-bearbeiten.component';
import { SchlagwortSuchenComponent } from './pages/schlagwort-suchen/schlagwort-suchen.component';
import { CodeBearbeitenComponent } from './pages/code-bearbeiten/code-bearbeiten.component';
import { BenutzerSuchenPageComponent } from '@modules/informationen/pages/benutzer-suchen-page/benutzer-suchen-page.component';

const benutzerstelleSuchenSichtenFeature35: Permissions[] = [Permissions.FEATURE_35, Permissions.INFORMATIONEN_VERZEICHNISSE_BENUTZERSTELLE_SUCHENSICHTEN];
const benutzermeldungenSuchenData: Data = {
    title: 'benutzerverwaltung.topnavmenuitem.benutzertmeldungensuchen',
    formNumber: StesFormNumberEnum.INFORMATIONEN_BENUTZERMELDUNGEN_SUCHEN,
    permissions: [Permissions.FEATURE_35]
};
const benutzerSuchenData: Data = {
    title: 'benutzerverwaltung.topnavmenuitem.benutzersuchen',
    formNumber: StesFormNumberEnum.INFORMATIONEN_BENUTZERVERWALTUNG_BENUTZER_SUCHEN
};
const rollenSuchenData: Data = {
    title: 'benutzerverwaltung.topnavmenuitem.rollensuchen',
    formNumber: StesFormNumberEnum.INFORMATIONEN_ROLLEN_SUCHEN,
    permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_BENUTZERVERWALTUNG_ROLLE_SUCHENSICHTEN]
};

const rollenBearbeitenData: Data = {
    title: 'benutzerverwaltung.subnavmenuitem.rollengrunddatenbearbeiten',
    formNumber: StesFormNumberEnum.INFORMATIONEN_ROLLEN_GRUNDDATEN_BEARBEITEN,
    permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_BENUTZERVERWALTUNG_ROLLE_SUCHENSICHTEN]
};

const rollenBerechtigungBearbeitenData: Data = {
    title: 'benutzerverwaltung.subnavmenuitem.berechtigungen',
    formNumber: StesFormNumberEnum.INFORMATIONEN_ROLLEN_BERECHTIGUNG_BEARBEITEN,
    permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_BENUTZERVERWALTUNG_ROLLE_SUCHENSICHTEN]
};

const benutzerstelleSuchenData: Data = {
    title: 'informationen.topmenuitem.benutzerstellensuchen',
    formNumber: StesFormNumberEnum.INFORMATIONEN_BENUTZERSTELLE_SUCHEN,
    permissions: benutzerstelleSuchenSichtenFeature35
};
const benutzerstelleHomeData: Data = {
    permissions: benutzerstelleSuchenSichtenFeature35
};
const benutzerstelleErweiterteDatenBearbeitenData: Data = {
    title: InformationenLabels.ERWEITERTE_DATEN,
    mode: FormModeEnum.EDIT,
    formNumber: StesFormNumberEnum.INFORMATIONEN_BENUTZERSTELLE_ERWEITERTE_DATEN_BEARBEITEN,
    permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_VERZEICHNISSE_BENUTZERSTELLE_ERWEITERT_SPEICHERN]
};

const benutzerstelleGrundDatenBearbeitenData: Data = {
    title: InformationenLabels.GRUNDDATEN,
    mode: FormModeEnum.EDIT,
    formNumber: StesFormNumberEnum.INFORMATIONEN_BENUTZERSTELLE_GRUNDDATEN_BEARBEITEN,
    permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_VERZEICHNISSE_BENUTZERSTELLE_SUCHENSICHTEN]
};

const zahlstelleSuchenData: Data = {
    title: 'informationen.topmenuitem.zahlstellensuchen',
    formNumber: StesFormNumberEnum.INFORMATIONEN_ZAHLSTELLEN_SUCHEN,
    permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_VERZEICHNISSE_ZAHLSTELLEN_SUCHEN]
};

const routes: Routes = [
    {
        path: InformationenPaths.BENUTZERVERWALTUNG_BENUTZER_SUCHEN,
        component: BenutzerSuchenPageComponent,
        data: benutzerSuchenData
    },
    {
        path: InformationenPaths.BENUTZERVERWALTUNG_BENUTZERMELDUNGEN_SUCHEN,
        component: BenutzermeldungenSuchenPageComponent,
        data: benutzermeldungenSuchenData
    },
    {
        path: InformationenPaths.BENUTZERVERWALTUNG_ROLLEN_SUCHEN,
        component: RollenSuchenPageComponent,
        data: rollenSuchenData
    },
    {
        path: InformationenPaths.BENUTZERVERWALTUNG_ROLLE_ERFASSEN,
        component: RolleErfassenWizardComponent,
        canDeactivate: [CanDeleteGuard],
        children: [
            {
                path: 'grunddaten',
                component: RolleErfassenGrunddatenPageComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_BENUTZERVERWALTUNG_ROLLE_ERFASSEN],
                    title: 'benutzerverwaltung.subnavmenuitem.grunddaten',
                    formNumber: StesFormNumberEnum.INFORMATIONEN_ROLLE_ERFASSEN_GRUNDDATEN,
                    mode: FormModeEnum.CREATE
                }
            },
            {
                path: 'berechtigungen',
                component: RolleErfassenBerechtigungenPageComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_BENUTZERVERWALTUNG_ROLLE_ERFASSEN],
                    title: 'benutzerverwaltung.subnavmenuitem.berechtigungen',
                    formNumber: StesFormNumberEnum.INFORMATIONEN_ROLLE_ERFASSEN_BERECHTIGUNGEN,
                    mode: FormModeEnum.CREATE
                }
            }
        ]
    },
    {
        path: InformationenPaths.BENUTZERVERWALTUNG_ROLLE,
        redirectTo: `${InformationenPaths.BENUTZERVERWALTUNG_ROLLE}/${InformationenPaths.VERZEICHNISSE_BENUTZERSTELLE_GRUNDDATEN_BEARBEITEN}`,
        pathMatch: 'full'
    },
    {
        path: InformationenPaths.BENUTZERVERWALTUNG_ROLLE,
        component: RollenBearbeitenHomePageComponent,
        children: [
            {
                path: InformationenPaths.BENUTZERVERWALTUNG_ROLLEN_GRUNDDATEN_BEARBEITEN,
                component: RollenGrunddatenBearbeitenPageComponent,
                data: rollenBearbeitenData,
                canActivate: [PermissionGuard],
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: InformationenPaths.BENUTZERVERWALTUNG_ROLLEN_BERECHTIGUNGEN_BEARBEITEN,
                component: RollenBerechtigungenBearbeitenPageComponent,
                data: rollenBerechtigungBearbeitenData,
                canActivate: [PermissionGuard],
                canDeactivate: [CanDeactivateGuard]
            }
        ]
    },
    {
        path: InformationenPaths.VERZEICHNISSE_BENUTZERSTELLEN_SUCHEN,
        component: BenutzerstellenSuchenPageComponent,
        data: benutzerstelleSuchenData
    },
    {
        path: InformationenPaths.VERZEICHNISSE_ZAHLSTELLEN_SUCHEN,
        component: ZahlstellenSuchenPageComponent,
        data: zahlstelleSuchenData
    },
    {
        path: 'verzeichnisse/zahlstellen/erfassen',
        component: ZahlstellenErfassenBearbeitenComponent,
        data: {
            permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_VERZEICHNISSE_ZAHLSTELLEN_ERFASSEN],
            title: 'verzeichnisse.topnavmenuitem.zahlstelleerfassen',
            formNumber: StesFormNumberEnum.INFORMATIONEN_ZAHLSTELLEN_ERFASSEN,
            mode: FormModeEnum.CREATE
        },
        canActivate: [PermissionGuard],
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'verzeichnisse/zahlstellen/bearbeiten',
        component: ZahlstellenErfassenBearbeitenComponent,
        data: {
            permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_VERZEICHNISSE_ZAHLSTELLEN_SPEICHERN],
            title: 'stes.label.zahlstelle',
            formNumber: StesFormNumberEnum.INFORMATIONEN_ZAHLSTELLEN_BEARBEITEN,
            mode: FormModeEnum.EDIT
        },
        canActivate: [PermissionGuard],
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: InformationenPaths.VERZEICHNISSE_BENUTZERSTELLE_ERFASSEN,
        component: BenutzerstelleErfassenWizardComponent,
        canDeactivate: [CanDeleteGuard],
        children: [
            {
                path: 'grunddaten',
                component: BenutzerstelleErfassenGrunddatenPageComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_VERZEICHNISSE_BENUTZERSTELLE_ERFASSEN],
                    title: 'verzeichnisse.subnavmenuitem.benutzerstellegrunddaten',
                    formNumber: StesFormNumberEnum.INFORMATIONEN_BENUTZERSTELLE_ERFASSEN_GRUNDDATEN,
                    mode: FormModeEnum.CREATE
                }
            },
            {
                path: 'erw-daten',
                component: BenutzerstelleErfassenErwDatenPageComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_VERZEICHNISSE_BENUTZERSTELLE_ERFASSEN],
                    title: 'verzeichnisse.subnavmenuitem.benutzerstelleerweitert',
                    formNumber: StesFormNumberEnum.INFORMATIONEN_BENUTZERSTELLE_ERFASSEN_ERWDATEN,
                    mode: FormModeEnum.CREATE
                }
            }
        ]
    },
    {
        path: InformationenPaths.VERZEICHNISSE_BENUTZERSTELLE,
        redirectTo: `${InformationenPaths.VERZEICHNISSE_BENUTZERSTELLE}/${InformationenPaths.VERZEICHNISSE_BENUTZERSTELLE_GRUNDDATEN_BEARBEITEN}`,
        pathMatch: 'full'
    },
    {
        path: InformationenPaths.VERZEICHNISSE_BENUTZERSTELLE,
        component: BenutzerstelleHomePageComponent,
        canActivate: [PermissionGuard],
        data: benutzerstelleHomeData,
        children: [
            {
                path: InformationenPaths.VERZEICHNISSE_BENUTZERSTELLE_ERWEITERTE_DATEN_BEARBEITEN,
                component: BenutzerstelleErweiterteDatenBearbeitenPageComponent,
                canActivate: [PermissionGuard],
                data: benutzerstelleErweiterteDatenBearbeitenData,
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: InformationenPaths.VERZEICHNISSE_BENUTZERSTELLE_GRUNDDATEN_BEARBEITEN,
                component: BenutzerstelleGrundDatenBearbeitenPageComponent,
                canActivate: [PermissionGuard],
                data: benutzerstelleGrundDatenBearbeitenData,
                canDeactivate: [CanDeactivateGuard]
            }
        ]
    },
    {
        path: 'informationsmeldungen/meldungen/suchen',
        component: InformationsmeldungenSuchenComponent,
        data: {
            title: 'informationen.topmenuitem.informationsmeldungensuchen',
            formNumber: StesFormNumberEnum.INFORMATIONSMELDUNGEN_SUCHEN,
            permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_INFORMATIONSMELDUNGEN_SUCHEN]
        }
    },
    {
        path: InformationenPaths.INFORMATIONSMELDUNGEN_MELDUNG_ERFASSEN,
        component: InformationsmeldungErfassenBearbeitenComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
            permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_INFORMATIONSMELDUNGEN_INFORMATIONSMELDUNGEN_BEARBEITEN],
            title: 'informationen.topmenuitem.informationsmekdungenerfassen',
            formNumber: StesFormNumberEnum.INFORMATIONSMELDUNGEN_ERFASSEN
        }
    },
    {
        path: 'benutzerverwaltung/vollzugsregion/suchen',
        component: VollzugsregionSuchenComponent,
        data: {
            title: 'benutzerverwaltung.topnavmenuitem.vollzugsregionsuchen',
            formNumber: StesFormNumberEnum.INFORMATIONEN_BENUTZERVERWALTUNG_VOLLZUGSREGIONR_SUCHEN,
            permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_BENUTZERVERWALTUNG_VOLLZREGION_SUCHEN_SICHTEN]
        }
    },
    {
        path: 'benutzerverwaltung/vollzugsregion/erfassen',
        component: VollzugsregionErfassenBearbeitenComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
            title: 'benutzerverwaltung.topnavmenuitem.vollzugsregionerfassen',
            formNumber: StesFormNumberEnum.INFORMATIONEN_BENUTZERVERWALTUNG_VOLLZUGSREGIONR_ERFASSEN,
            permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_BENUTZERVERWALTUNG_VOLLZREGION_ERFASSEN]
        }
    },
    {
        path: 'benutzerverwaltung/vollzugsregion/bearbeiten',
        component: VollzugsregionErfassenBearbeitenComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
            title: 'benutzerverwaltung.topnavmenuitem.vollzugsregionbearbeiten',
            formNumber: StesFormNumberEnum.INFORMATIONEN_BENUTZERVERWALTUNG_VOLLZUGSREGIONR_BEARBEITEN,
            permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_BENUTZERVERWALTUNG_VOLLZREGION_SUCHEN_SICHTEN],
            isBearbeiten: true
        }
    },
    {
        path: InformationenPaths.INFORMATIONSMELDUNGEN_MELDUNG_BEARBEITEN,
        component: InformationsmeldungErfassenBearbeitenComponent,
        data: {
            permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_INFORMATIONSMELDUNGEN_INFORMATIONSMELDUNGEN_BEARBEITEN],
            title: 'informationen.topmenuitem.informationsmekdungenbearbeiten',
            formNumber: StesFormNumberEnum.INFORMATIONSMELDUNGEN_BEARBEITEN
        },
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'verzeichnisse/code/suchen',
        component: CodesSuchenComponent,
        data: {
            permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_VERZEICHNISSE_CODE_SUCHENSICHTEN],
            title: 'verzeichnisse.topnavmenuitem.codesuchen',
            formNumber: InformationenFormNumberEnum.CODES_SUCHEN
        }
    },
    {
        path: 'verzeichnisse/code/:codeId/bearbeiten',
        component: CodeBearbeitenComponent,
        data: {
            permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_VERZEICHNISSE_CODE_SUCHENSICHTEN],
            title: 'amm.administration.label.code',
            formNumber: InformationenFormNumberEnum.CODE_BEARBEITEN,
            sideMenu: 'codeNavItems'
        }
    },

    {
        path: 'verzeichnisse/beruf/suchen',
        component: BerufSuchenComponent,
        data: {
            permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_VERZEICHNISSE_BERUF_SUCHEN],
            title: 'stes.alttext.berufsdaten',
            formNumber: StesFormNumberEnum.BERUF_SUCHEN
        }
    },
    {
        path: 'verzeichnisse/beruf/erfassen',
        component: BerufErfassenBearbeitenComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
            permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_VERZEICHNISSE_BERUF_ERFASSEN],
            title: 'stes.subnavmenuitem.stesBerufErfassen',
            formNumber: StesFormNumberEnum.BERUF_ERFASSEN,
            isBearbeiten: false
        }
    },
    {
        path: 'verzeichnisse/beruf/bearbeiten',
        component: BerufErfassenBearbeitenComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
            permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_VERZEICHNISSE_BERUF_BEARBEITEN],
            title: 'stes.label.vermittlung.beruf',
            formNumber: StesFormNumberEnum.BERUF_BEARBEITEN,
            isBearbeiten: true
        }
    },
    {
        path: 'verzeichnisse/schlagwort/suchen',
        component: SchlagwortSuchenComponent,
        data: {
            permissions: [
                { or: [Permissions.INFORMATIONEN_VERZEICHNISSE_SCHLAGWORT_SUCHEN, Permissions.INFORMATIONEN_VERZEICHNISSE_SCHLAGWORT_GRUPPE_SUCHEN] },
                Permissions.FEATURE_35
            ],
            title: 'verzeichnisse.topnavmenuitem.schlagwortsuchen',
            formNumber: InformationenFormNumberEnum.SCHLAGWORT_SUCHEN
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InformationenRoutingModule {}
