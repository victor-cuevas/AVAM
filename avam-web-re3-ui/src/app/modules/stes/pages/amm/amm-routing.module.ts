import { SpesenComponent } from './pages/uebersicht/spesen/spesen.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { StesDetailsHomeComponent } from '../details';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { UebersichtComponent } from './pages/uebersicht/uebersicht.component';
import { PermissionGuard } from '@app/core/guards/permission.guard';
import { AMMLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { KursKollektivBearbeitenComponent } from './pages/uebersicht/kollektive-amm/kurs-kollektiv-bearbeiten/kurs-kollektiv-bearbeiten.component';
import { GesuchComponent } from './pages/uebersicht/spezielle-amm/ausbildungszuschuss/gesuch/gesuch.component';
import { CanDeactivateGuard } from '@app/shared/services/can-deactive-guard.service';
import { AzKostenComponent } from './pages/uebersicht/spezielle-amm/ausbildungszuschuss/az-kosten/az-kosten.component';
import { AmmSpeziellEntscheidComponent } from './pages/uebersicht/amm-speziell-entscheid/amm-speziell-entscheid.component';
import { EazGesuchComponent } from './pages/uebersicht/spezielle-amm/einarbeitungszuschuss/eaz-gesuch/eaz-gesuch.component';
import { EazKostenComponent } from './pages/uebersicht/spezielle-amm/einarbeitungszuschuss/eaz-kosten/eaz-kosten.component';
import { FseGesuchComponent } from './pages/uebersicht/spezielle-amm/fse/fse-gesuch/fse-gesuch.component';
import { FseKostenComponent } from './pages/uebersicht/spezielle-amm/fse/fse-kosten/fse-kosten.component';
import { PewoGesuchComponent } from './pages/uebersicht/spezielle-amm/pewo/pewo-gesuch/pewo-gesuch.component';
import { PewoKostenComponent } from './pages/uebersicht/spezielle-amm/pewo/pewo-kosten/pewo-kosten.component';
import { BuchungComponent } from './pages/uebersicht/individuelle-amm/buchung/buchung.component';
import { BeschreibungComponent } from './pages/uebersicht/beschreibung/beschreibung.component';
import { DurchfuehrungsortComponent } from './pages/uebersicht/individuelle-amm/durchfuehrungsort/durchfuehrungsort.component';
import { AmmBimBemEntscheidComponent } from './pages/uebersicht/amm-bim-bem-entscheid/amm-bim-bem-entscheid.component';
import { AuszugComponent } from './pages/auszug/auszug.component';
import { Permissions } from '@shared/enums/permissions.enum';
import { ResetButtonsPermissionsResolver, ResetSideNavigationPermissionsResolver } from '@app/shared';
import { BPKostenComponent } from './pages/uebersicht/bp-kosten/bp-kosten.component';
import { IndividuelleKostenComponent } from './pages/uebersicht/individuelle-amm/individuelle-kosten/individuelle-kosten.component';
import { DurchfuehrungsortAngebotComponent } from './pages/uebersicht/kollektive-amm/kurs-individuell-angebot/durchfuehrungsort-angebot/durchfuehrungsort-angebot.component';
import { TeilnehmerWartelisteComponent } from './pages/uebersicht/kollektive-amm/teilnehmer/teilnehmer-warteliste.component';
import { TeilnehmerplaetzeComponent } from './pages/uebersicht/teilnehmerplaetze/teilnehmerplaetze.component';
import { BuchungAngebotComponent } from './pages/uebersicht/kollektive-amm/kurs-individuell-angebot/buchung-angebot/buchung-angebot.component';
import { AmmControllerComponent } from './amm-controller.component';
import { AmmnutzungWizardComponent } from './pages/uebersicht/individuelle-amm/ammnutzung-wizard.component';
import { CanDeleteGuard } from '@app/shared/services/can-delete-guard.service';
import { MassnahmeBuchenWizardComponent } from './pages/uebersicht/kollektive-amm/wizard/massnahme-buchen-wizard.component';
import { AngebotSuchenComponent } from './pages/uebersicht/kollektive-amm/wizard/pages/angebot-suchen/angebot-suchen.component';
import { BuchungErfassenComponent } from './pages/uebersicht/kollektive-amm/wizard/pages/buchung-erfassen/buchung-erfassen.component';
import { MassnahmeBuchenComponent } from './pages/uebersicht/kollektive-amm/wizard/pages/massnahme-buchen/massnahme-buchen.component';
import { BeschreibungAngebotComponent } from './pages/uebersicht/kollektive-amm/kurs-individuell-angebot/beschreibung-angebot/beschreibung-angebot.component';
import { PsakBearbeitenComponent } from './pages/uebersicht/kollektive-amm/psak-bearbeiten/psak-bearbeiten.component';
import { AmmGeschaeftSuchenComponent } from '@stes/pages/amm/pages/amm-geschaeft-suchen/amm-geschaeft-suchen.component';

const ammRoutes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: AMMPaths.AMM_GESCHAEFT_SUCHEN,
        component: AmmGeschaeftSuchenComponent,
        data: {
            title: 'amm.nutzung.topnavmenuitem.ammGeschaeftSuchenTabTitle',
            permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN],
            formNumber: StesFormNumberEnum.AMM_GESCHAEFT_SUCHEN
        },
        canActivate: [PermissionGuard]
    },
    {
        path: ':stesId/ammnutzung/:type',
        component: AmmnutzungWizardComponent,
        data: { permissions: [Permissions.FEATURE_32] },
        canActivate: [PermissionGuard],
        canDeactivate: [CanDeleteGuard],
        children: [
            {
                path: 'buchung/:gfId',
                component: BuchungComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_ERFASSEN],
                    title: 'amm.nutzung.title.grunddatenbuchung',
                    formNumber: StesFormNumberEnum.KURS_INDIVIDUELL_BUCHUNG,
                    wizard: true
                }
            },
            {
                path: 'beschreibung/:gfId',
                component: BeschreibungComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_ERFASSEN],
                    title: 'amm.nutzung.title.beschreibung',
                    formNumber: StesFormNumberEnum.BESCHREIBUNG_AMM_ERFASSEN,
                    wizard: true
                }
            },
            {
                path: 'durchsfuhrungsort/:gfId',
                canActivate: [PermissionGuard],
                component: DurchfuehrungsortComponent,
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_ERFASSEN],
                    title: 'amm.nutzung.label.durchfuehrungsort',
                    formNumber: StesFormNumberEnum.DURCHSFUEHRUNGSORT,
                    wizard: true
                }
            }
        ]
    },
    {
        path: ':stesId/massnahme-buchen',
        component: MassnahmeBuchenWizardComponent,
        data: {
            permissions: [Permissions.FEATURE_32]
        },
        canActivate: [PermissionGuard],
        canDeactivate: [CanDeleteGuard],
        children: [
            { path: '', redirectTo: AMMPaths.ANGEBOT_SUCHEN, pathMatch: 'full' },
            {
                path: AMMPaths.ANGEBOT_SUCHEN,
                component: AngebotSuchenComponent,
                data: {
                    title: 'stes.label.infotag.angebotWaehlen',
                    permissions: [Permissions.FEATURE_32],
                    formNumber: StesFormNumberEnum.MASSNAHME_ANGEBOT_SUCHEN_DETAILSUCHE
                },
                canActivate: [PermissionGuard]
            },
            {
                path: AMMPaths.KOLLEKTIV_KURS_ERFASSEN,
                component: BuchungErfassenComponent,
                data: {
                    title: 'stes.label.infotag.angebotWaehlen',
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN],
                    formNumber: StesFormNumberEnum.MASSNAHME_BUCHEN_KURS_KOLLEKTIV
                },
                canActivate: [PermissionGuard]
            },
            {
                path: AMMPaths.PSAK_ERFASSEN,
                component: MassnahmeBuchenComponent,
                data: {
                    title: 'stes.label.infotag.angebotWaehlen',
                    permissions: [Permissions.FEATURE_32],
                    formNumber: StesFormNumberEnum.MASSNAHME_BUCHEN
                },
                canActivate: [PermissionGuard]
            },
            {
                path: AMMPaths.KURS_INDIV_IM_ANGEBOT_ERFASSEN,
                component: BuchungAngebotComponent,
                data: {
                    title: 'stes.label.infotag.angebotWaehlen',
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN],
                    formNumber: StesFormNumberEnum.MASSNAHME_BUCHEN_KURS_INDIV_IM_ANGEBOT,
                    wizard: true
                },
                canActivate: [PermissionGuard]
            },
            {
                path: AMMPaths.KURS_INDIV_IM_ANGEBOT_BESCHREIBUNG_ERFASSEN,
                component: BeschreibungAngebotComponent,
                data: {
                    title: 'stes.label.infotag.angebotWaehlen',
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN],
                    formNumber: StesFormNumberEnum.BESCHREIBUNG_AMM_ERFASSEN,
                    wizard: true
                },
                canActivate: [PermissionGuard]
            },
            {
                path: AMMPaths.KURS_INDIV_IM_ANGEBOT_DURCHFUEHRUNGSORT_ERFASSEN,
                component: DurchfuehrungsortAngebotComponent,
                data: {
                    title: 'stes.label.infotag.angebotWaehlen',
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN],
                    formNumber: StesFormNumberEnum.DURCHSFUEHRUNGSORT_IM_ANGEBOT,
                    wizard: true
                },
                canActivate: [PermissionGuard]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(ammRoutes)],
    exports: [RouterModule]
})
export class AmmRoutingModule {}
