import { RouterModule, Routes } from '@angular/router';
import { StesSearchHomeComponent } from './pages/search/stes-search-home.component';
import { NgModule } from '@angular/core';
import {
    StesAbmeldungComponent,
    StesAnmeldungComponent,
    StesDatenfreigabeComponent,
    StesDetailsBerufsdatenAnzeigenComponent,
    StesDetailsGrunddatenComponent,
    StesDetailsHomeComponent,
    StesDetailsPersonalienComponent,
    StesDetailsPersonenstammdatenComponent,
    StesDetailsSprachkenntnisseComponent,
    StesDetailsStellensucheComponent,
    StesDetailsZusatzadresseComponent
} from './pages/details';
import { CanDeactivateGuard } from 'src/app/shared/services/can-deactive-guard.service';
import { StesRahmenfristenComponent } from './pages/rahmenfristen/stes-rahmenfristen.component';
import { StesBerufsdatenBearbeitenComponent } from './pages/details/pages/stes-details-berufsdaten/stes-berufsdaten-bearbeiten/stes-berufsdaten-bearbeiten.component';
import { StesRahmenfristenDetailsComponent } from './pages/rahmenfristen/rahmenfristen-details/stes-rahmenfristen-details.component';
import { StesPersonenstammdatenSuchenComponent } from './pages/personenstammdaten-suchen/stes-personenstammdaten-suchen.component';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import {
    StesInfotagBeschreibungDurchfuehrungsortComponent,
    StesInfotagGrunddatenBuchungComponent,
    StesInfotagTeilnehmerlisteComponent,
    StesTerminComponent,
    StesTermineAnzeigenComponent
} from '@stes/pages/termine';
import { ZwischenverdienstBearbeitenComponent, ZwischenverdiensteComponent, ZwischenverdienstErfassenComponent } from '@stes/pages/zwischenverdienste';

import { LeistungsexporteComponent } from '@stes/pages/leistungsexporte/leistungsexporte.component';
import { LeistungsexportBearbeitenComponent, LeistungsexportErfassenComponent } from '@stes/pages/leistungsexporte';
import { StesRahmenfristenZaehlerstandComponent } from './pages/rahmenfristen/rahmenfristen-details/stes-rahmenfristen-zaehlerstand/stes-rahmenfristen-zaehlerstand.component';
import { PermissionGuard } from '@app/core/guards/permission.guard';
import {
    AMMPaths,
    FachberatungPaths,
    StesArbeitsvermittlungPaths,
    StesAufgabenPaths,
    StesFachberatungPaths,
    StesGeschaeftePaths,
    StesKontrollperioden,
    StesLeistunsexportePaths,
    StesMatchingprofilPaths,
    StesMeldungenPaths,
    StesRahmenfristenPaths,
    StesSanktionen,
    StesTerminePaths,
    StesVermittlungsfaehigkeits,
    StesWiedereingliederungPaths,
    StesZwischenverdienstPaths,
    UnternehmenPaths
} from '@shared/enums/stes-navigation-paths.enum';
import {
    AMMLabels,
    ArbeitsvermittlungLabels,
    FachberatungLabels,
    GekoAufgabenLabels,
    KontrollperiodenLabels,
    MatchingprofilLabels,
    SanktionLabels,
    SchnellzuweisungLabels,
    StesDetailsLabels,
    StesLeistunsexporteLabels,
    StesRahmenfristenLabels,
    StesTermineLabels,
    StesZwischenverdienstLabels,
    UnternehmenSideNavLabels,
    VermittlungLabels,
    VermittlungsfaehigkeitLabels,
    WidereingliederungLabels
} from '@shared/enums/stes-routing-labels.enum';
import {
    AusgangslagenAnzeigenComponent,
    AusgangslageErfassenPageComponent,
    AusgangslageBearbeitenPageComponent,
    WdgAktionenAnzeigenComponent,
    WdgAktionenBearbeitenComponent,
    WdgAktionenErfassenComponent,
    WdgZielBearbeitenComponent,
    WdgZieleAnzeigenComponent,
    WdgZielErfassenComponent
} from '@stes/pages/wiedereingliederung';
import { Permissions } from '@shared/enums/permissions.enum';
import { FachberatungBearbeitenComponent, FachberatungenAnzeigenComponent } from '@stes/pages/fachberatung';
import { ArbeitsvermittlungenAnzeigenComponent, SchnellzuweisungBearbeitenPageComponent, SchnellzuweisungErfassenComponent } from '@stes/pages/arbeitsvermittlungen';
import { FachberatungsangebotSuchenComponent } from './pages/fachberatung/pages/wizard/pages/fachberatungsangebot-suchen/fachberatungsangebot-suchen.component';
import { FachberatungErfassenWizardComponent } from './pages/fachberatung/pages/wizard/fachberatung-erfassen-wizard.component';
import { ZuweisungWizardComponent } from './pages/arbeitsvermittlungen/zuweisung/wizard/zuweisung-wizard.component';
import { OsteSuchenComponent } from './pages/arbeitsvermittlungen/zuweisung/pages/oste-suchen/oste-suchen.component';
import { FachberatungsangebotPruefenComponent } from './pages/fachberatung/pages/wizard/pages/fachberatungsangebot-pruefen/fachberatungsangebot-pruefen.component';
import { ResetButtonsPermissionsResolver, ResetSideNavigationPermissionsResolver } from '@app/shared';
import { FachberatungVmtlFertigstellenComponent } from './pages/fachberatung/pages/wizard/pages/fachberatung-vmtl-fertigstellen/fachberatung-vmtl-fertigstellen.component';
import { StesVermittlungsfaehigkeitAnzeigenComponent } from '@stes/pages/vermittlungsfaehigkeit/anzeigen/stes-vermittlungsfaehigkeit-anzeigen.component';
import { StesSachverhaltComponent } from './pages/vermittlungsfaehigkeit/sachverhalt/stes-sachverhalt.component';
import { VermittlungBearbeitenComponent } from './pages/arbeitsvermittlungen/zuweisung/pages/vermittlung-bearbeiten/vermittlung-bearbeiten.component';
import { StesEntscheidComponent } from '@stes/pages/vermittlungsfaehigkeit/entscheid/stes-entscheid.component';
import { StesStellungnahmeComponent } from '@stes/pages/vermittlungsfaehigkeit/stellungnahme/stes-stellungnahme.component';
import { StesMatchingprofilComponent } from '@stes/pages/stes-matchingprofil';
import { MatchingtreffernSuchenComponent } from './pages/matchingtreffern-suchen/matchingtreffern-suchen.component';
import { WizardStepGuard } from '@shared/components/new/avam-wizard/wizard-step.guard';
import { StesSanktionenAnzeigenComponent } from '@stes/pages/sanktionen/anzeigen/stes-sanktionen-anzeigen.component';
import { SanktionErfassenArbeitsbemuehungenComponent } from '@stes/pages/sanktionen/sanktion-erfassen-arbeitsbemuehungen/sanktion-erfassen-arbeitsbemuehungen.component';
import { SanktionErfassenBeratungComponent } from '@stes/pages/sanktionen/sanktion-erfassen-beratung/sanktion-erfassen-beratung.component';
import { SanktionErfassenMassnahmenComponent } from '@stes/pages/sanktionen/sanktion-erfassen-massnahmen/sanktion-erfassen-massnahmen.component';
import { SanktionErfassenKontrollWeisungenComponent } from '@stes/pages/sanktionen/sanktion-erfassen-kontroll-weisungen/sanktion-erfassen-kontroll-weisungen.component';
import { SanktionErfassenVermittlungComponent } from '@stes/pages/sanktionen/sanktion-erfassen-vermittlung/sanktion-erfassen-vermittlung.component';
import { SanktionStellungnahmeComponent } from '@stes/pages/sanktionen/stellungnahme/sanktion-stellungnahme.component';
import { SanktionErfassenBearbeitenComponent } from '@stes/pages/sanktionen/sanktion-erfassen-bearbeiten/sanktion-erfassen-bearbeiten.component';
import { StesGeschaefteComponent } from '@stes/pages/stes-geschaefte/stes-geschaefte.component';
import { StesMeldungenComponent } from '@stes/pages/stes-meldungen/stes-meldungen.component';
import { KontrollperiodenAnzeigenComponent } from '@stes/pages/kontrollperioden/anzeigen/kontrollperioden-anzeigen.component';
import { SanktionEntscheidComponent } from '@stes/pages/sanktionen/sanktion-entscheid/sanktion-entscheid.component';
import { KontrollperiodenErfassenBearbeitenComponent } from '@stes/pages/kontrollperioden/erfassen-bearbeiten/kontrollperioden-erfassen-bearbeiten.component';
import { KontrollperiodenStesSuchenComponent } from '@stes/pages/kontrollperioden/kontrollperioden-stes-suchen/kontrollperioden-stes-suchen.component';
import { StesAufgabenAnzeigenComponent } from './pages/aufgaben/stes-aufgaben-anzeigen/stes-aufgaben-anzeigen.component';
import { StesAufgabenErfassenComponent } from './pages/aufgaben/stes-aufgaben-erfassen/stes-aufgaben-erfassen.component';
import { FehlenderKontrollperiodenStesSuchenComponent } from '@stes/pages/kontrollperioden/fehlender-kontrollperioden-stes-suchen/fehlender-kontrollperioden-stes-suchen.component';
import { UnternehmenTitles, UnternehmenTypes } from '@shared/enums/unternehmen.enum';
import { WizardStandortadresseComponent } from '@shared/components/unternehmen/erfassen/wizard-standortadresse/wizard-standortadresse.component';
import { WizardDoppelerfassungComponent } from '@shared/components/unternehmen/erfassen/wizard-doppelerfassung/wizard-doppelerfassung.component';
import { UnternehmenSuchenPageComponent } from '@stes/pages/unternehmen/unternehmen-suchen-page/unternehmen-suchen-page.component';
import { UnternehmenErfassenPageComponent } from '@stes/pages/unternehmen/unternehmen-erfassen-page/unternehmen-erfassen-page.component';
import { KontaktpersonSuchenPageComponent } from '@stes/pages/unternehmen/kontaktperson-suchen-page/kontaktperson-suchen-page.component';
import { MainContainerPageComponent } from '@stes/pages/unternehmen/main-container-page/main-container-page.component';
import { AdressdatenPageComponent } from '@stes/pages/unternehmen/unternehmen-details/adressdaten-page/adressdaten-page.component';
import { KontaktpersonenPageComponent } from '@stes/pages/unternehmen/kontaktpflege/kontaktpersonen/kontaktpersonen-page.component';
import { KontaktPersonErfassenPageComponent } from '@stes/pages/unternehmen/kontaktpflege/kontaktpersonen/kontakt-person-erfassen-page/kontakt-person-erfassen-page.component';
import { KontaktePageComponent } from '@stes/pages/unternehmen/kontaktpflege/kontakte/kontakte-page.component';
import { KontaktErfassenPageComponent } from '@stes/pages/unternehmen/kontaktpflege/kontakte/kontakt-erfassen-page/kontakt-erfassen-page.component';
import { MutationsantraegeAnzeigenPageComponent } from '@stes/pages/unternehmen/bur-bfs/mutationsantraege-anzeigen-page/mutationsantraege-anzeigen-page.component';
import { BurDatenAnzeigenPageComponent } from '@stes/pages/unternehmen/bur-bfs/bur-daten-anzeigen-page/bur-daten-anzeigen-page.component';
import { KundenberaterPageComponent } from '@stes/pages/unternehmen/kontaktpflege/kundenberater/kundenberater-page.component';
import { MutationsantragSichtenPageComponent } from '@stes/pages/unternehmen/bur-bfs/mutationsantrag-sichten-page/mutationsantrag-sichten-page.component';
import { FachberatungsangeboteSuchenComponent } from '@stes/pages/unternehmen/unternehmen-details/fachberatungsangebote/suchen/fachberatungsangebote-suchen.component';
import { FachberatungsangeboteComponent } from '@stes/pages/unternehmen/unternehmen-details/fachberatungsangebote/anzeigen/fachberatungsangebote.component';
import { FachberatungsangebotErfassenComponent } from '@stes/pages/unternehmen/unternehmen-details/fachberatungsangebote/erfassen/fachberatungsangebot-erfassen.component';
import { MitteilungenAnzeigenPageComponent } from '@stes/pages/unternehmen/bur-bfs/mitteilung/mitteilungen-anzeigen-page/mitteilungen-anzeigen-page.component';
import { MitteilungAnzeigenPageComponent } from '@stes/pages/unternehmen/bur-bfs/mitteilung/mitteilung-anzeigen-page/mitteilung-anzeigen-page.component';
import { OsteVermittlungSuchenComponent } from '@stes/pages/oste-vermittlung-suchen/oste-vermittlung-suchen.component';
import { StesProfilVergleichPageComponent } from '@stes/pages/arbeitsvermittlungen/zuweisung/pages/stes-profil-vergleich-page/stes-profil-vergleich-page.component';
// prettier-ignore
import {
    StesVermittlungFertigstellenPageComponent
} from '@stes/pages/arbeitsvermittlungen/zuweisung/pages/stes-vermittlung-fertigstellen-page/stes-vermittlung-fertigstellen.component';
import { MatchingWizardComponent } from '@stes/pages/stes-matchingprofil/vermittlung-erfassen/matching-wizard/matching-wizard.component';
// prettier-ignore
import {
    MatchingProfilvergleichPageComponent
} from '@stes/pages/stes-matchingprofil/vermittlung-erfassen/pages/matching-profilvergleich-page/matching-profilvergleich-page.component';
// prettier-ignore
import {
    MatchingFertigstellenPageComponent
} from '@stes/pages/stes-matchingprofil/vermittlung-erfassen/pages/matching-fertigstellen-page/matching-fertigstellen-page.component';
import { MeldungenPageComponent } from '@stes/pages/unternehmen/geschaeftskontrolle/meldungen/meldungen-page.component';
import { FachberatungsstelleAufgabenAnzeigenPageComponent } from '@stes/pages/unternehmen/geschaeftskontrolle/aufgaben/fachberatungsstelle-aufgaben-anzeigen-page.component';
import { AufgabenErfassenPageComponent } from '@stes/pages/unternehmen/geschaeftskontrolle/aufgaben-erfassen/aufgaben-erfassen-page.component';
import { FormModeEnum } from '@shared/enums/form-mode.enum';
import { UebersichtComponent } from '@stes/pages/amm/pages/uebersicht/uebersicht.component';
import { AuszugComponent } from '@stes/pages/amm/pages/auszug/auszug.component';
import { AmmControllerComponent } from '@stes/pages/amm/amm-controller.component';
import { GesuchComponent } from '@stes/pages/amm/pages/uebersicht/spezielle-amm/ausbildungszuschuss/gesuch/gesuch.component';
import { AzKostenComponent } from '@stes/pages/amm/pages/uebersicht/spezielle-amm/ausbildungszuschuss/az-kosten/az-kosten.component';
import { EazGesuchComponent } from '@stes/pages/amm/pages/uebersicht/spezielle-amm/einarbeitungszuschuss/eaz-gesuch/eaz-gesuch.component';
import { EazKostenComponent } from '@stes/pages/amm/pages/uebersicht/spezielle-amm/einarbeitungszuschuss/eaz-kosten/eaz-kosten.component';
import { FseGesuchComponent } from '@stes/pages/amm/pages/uebersicht/spezielle-amm/fse/fse-gesuch/fse-gesuch.component';
import { FseKostenComponent } from '@stes/pages/amm/pages/uebersicht/spezielle-amm/fse/fse-kosten/fse-kosten.component';
import { PewoGesuchComponent } from '@stes/pages/amm/pages/uebersicht/spezielle-amm/pewo/pewo-gesuch/pewo-gesuch.component';
import { PewoKostenComponent } from '@stes/pages/amm/pages/uebersicht/spezielle-amm/pewo/pewo-kosten/pewo-kosten.component';
import { AmmSpeziellEntscheidComponent } from '@stes/pages/amm/pages/uebersicht/amm-speziell-entscheid/amm-speziell-entscheid.component';
import { BuchungComponent } from '@stes/pages/amm/pages/uebersicht/individuelle-amm/buchung/buchung.component';
import { BeschreibungComponent } from '@stes/pages/amm/pages/uebersicht/beschreibung/beschreibung.component';
import { DurchfuehrungsortComponent } from '@stes/pages/amm/pages/uebersicht/individuelle-amm/durchfuehrungsort/durchfuehrungsort.component';
import { BPKostenComponent } from '@stes/pages/amm/pages/uebersicht/bp-kosten/bp-kosten.component';
import { IndividuelleKostenComponent } from '@stes/pages/amm/pages/uebersicht/individuelle-amm/individuelle-kosten/individuelle-kosten.component';
import { BuchungAngebotComponent } from '@stes/pages/amm/pages/uebersicht/kollektive-amm/kurs-individuell-angebot/buchung-angebot/buchung-angebot.component';
// prettier-ignore
import {
    DurchfuehrungsortAngebotComponent
} from '@stes/pages/amm/pages/uebersicht/kollektive-amm/kurs-individuell-angebot/durchfuehrungsort-angebot/durchfuehrungsort-angebot.component';
import { KursKollektivBearbeitenComponent } from '@stes/pages/amm/pages/uebersicht/kollektive-amm/kurs-kollektiv-bearbeiten/kurs-kollektiv-bearbeiten.component';
import { PsakBearbeitenComponent } from '@stes/pages/amm/pages/uebersicht/kollektive-amm/psak-bearbeiten/psak-bearbeiten.component';
import { SpesenComponent } from '@stes/pages/amm/pages/uebersicht/spesen/spesen.component';
import { AmmBimBemEntscheidComponent } from '@stes/pages/amm/pages/uebersicht/amm-bim-bem-entscheid/amm-bim-bem-entscheid.component';
import { TeilnehmerWartelisteComponent } from '@stes/pages/amm/pages/uebersicht/kollektive-amm/teilnehmer/teilnehmer-warteliste.component';
import { TeilnehmerplaetzeComponent } from '@stes/pages/amm/pages/uebersicht/teilnehmerplaetze/teilnehmerplaetze.component';

const stesRoutes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'search', component: StesSearchHomeComponent, data: { title: 'stes.label.stellensuchendeSuchen', formNumber: StesFormNumberEnum.STELLENSUCHENDE_SUCHEN } },
    {
        path: 'anmeldung',
        component: StesAnmeldungComponent,
        data: { isAnmeldung: true },
        canDeactivate: [CanDeactivateGuard],
        children: [
            {
                path: 'personenstammdaten',
                component: StesDetailsPersonenstammdatenComponent,
                data: { title: 'stes.label.personenstammdaten', formNumber: StesFormNumberEnum.ANMELDUNG_PERSONENSTAMMDATEN },
                canActivate: [WizardStepGuard]
            },
            {
                path: 'personalien/:stesId',
                component: StesDetailsPersonalienComponent,
                data: { title: StesDetailsLabels.PERSONALIEN, formNumber: StesFormNumberEnum.ANMELDUNG_PERSONALIEN }
            },
            {
                path: 'zusatzadresse/:stesId',
                component: StesDetailsZusatzadresseComponent,
                data: { title: StesDetailsLabels.ZUSATZADRESSE, formNumber: StesFormNumberEnum.ZUSATZADRESSE }
            },
            {
                path: 'grunddaten/:stesId',
                component: StesDetailsGrunddatenComponent,
                data: { title: StesDetailsLabels.GRUNDDATEN, formNumber: StesFormNumberEnum.ANMELDUNG_GRUNDDATEN }
            },
            {
                path: 'berufsdaten/:stesId',
                component: StesDetailsBerufsdatenAnzeigenComponent,
                data: { title: StesDetailsLabels.BERUFSDATEN, formNumber: StesFormNumberEnum.ANMELDUNG_BERUFSDATEN_ANZEIGEN }
            },
            {
                path: 'berufsdaten/erfassen/:stesId',
                component: StesBerufsdatenBearbeitenComponent,
                data: { title: StesDetailsLabels.BERUFSDATENERFASSEN, formNumber: StesFormNumberEnum.ANMELDUNG_BERUFSDATEN_ERFASSEN }
            },
            {
                path: 'berufsdaten/bearbeiten/:stesId/:berufId',
                component: StesBerufsdatenBearbeitenComponent,
                data: { title: StesDetailsLabels.BERUFSDATENBEARBEITEN, formNumber: StesFormNumberEnum.ANMELDUNG_BERUFSDATEN_BEARBEITEN }
            },
            {
                path: 'stellensuche/:stesId',
                component: StesDetailsStellensucheComponent,
                data: { title: StesDetailsLabels.STELLENSUCHE, formNumber: StesFormNumberEnum.ANMELDUNG_STELLENSUCHE }
            },
            {
                path: 'sprachkenntnisse/:stesId',
                component: StesDetailsSprachkenntnisseComponent,
                data: { title: StesDetailsLabels.SPRACHKENNTNISSE, formNumber: StesFormNumberEnum.ANMELDUNG_SPRACHKENNTNISSE }
            },
            {
                path: 'personenstammdatensuchen',
                component: StesPersonenstammdatenSuchenComponent,
                data: { title: 'stes.label.personenstammdaten', formNumber: StesFormNumberEnum.ANMELDUNG_PERSONENSTAMMDATEN_SUCHEN }
            },
            {
                // TODO to be removed when personenstammdaten (B) and stes-daten (C) are implemented (see getRoute() in StesDetailsAnmeldungComponent)
                path: '',
                component: StesPersonenstammdatenSuchenComponent,
                data: { title: 'stes.label.personenstammdaten', formNumber: StesFormNumberEnum.ANMELDUNG_PERSONENSTAMMDATEN_SUCHEN }
            }
        ]
    },
    {
        path: ':stesId/fachberatungen-erfassen',
        component: FachberatungErfassenWizardComponent,
        data: {
            permissions: [Permissions.FEATURE_32, Permissions.STES_VM_ZUWEISUNG_FB_BEARBEITEN]
        },
        canActivate: [PermissionGuard],
        children: [
            {
                path: 'step1',
                component: FachberatungsangebotSuchenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.STES_VM_ZUWEISUNG_FB_BEARBEITEN],
                    title: FachberatungLabels.FACHBERATUNGSANGEBOT_SUCHEN,
                    formNumber: StesFormNumberEnum.FACHBERATUNGSANGEBOT_SUCHEN
                }
            },
            {
                path: 'step2/fachberatungsangebot/:fachberatungsangebotId',
                component: FachberatungsangebotPruefenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.STES_VM_ZUWEISUNG_FB_BEARBEITEN],
                    title: FachberatungLabels.FACHBERATUNGSANGEBOT_PRUEFEN,
                    formNumber: StesFormNumberEnum.FACHBERATUNGSANGEBOT_PRUEFEN
                }
            },
            {
                path: 'step3/fachberatungsangebot/:fachberatungsangebotId',
                component: FachberatungVmtlFertigstellenComponent,
                canActivate: [PermissionGuard],
                canDeactivate: [CanDeactivateGuard],
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.STES_VM_ZUWEISUNG_FB_BEARBEITEN],
                    title: FachberatungLabels.VERMITTLUNG_FERTIGSTELLEN,
                    formNumber: StesFormNumberEnum.FB_VMTL_FERTIGSTELLEN
                }
            }
        ]
    },
    {
        path: ':stesId/matchingprofil/:stesMatchingProfilId/vermittlung-erfassen/:osteId',
        component: MatchingWizardComponent,
        canActivate: [PermissionGuard],
        children: [
            {
                path: 'step1',
                component: MatchingProfilvergleichPageComponent,
                data: {
                    title: VermittlungLabels.VERMITTLUNG_ERFASSEN,
                    permissions: [Permissions.FEATURE_32, Permissions.STES_VM_ZUWEISUNG_BEARBEITEN],
                    formNumber: StesFormNumberEnum.STES_MATCHING_PROFILVERGLEICH
                },
                canActivate: [PermissionGuard]
            },
            {
                path: 'step2',
                component: MatchingFertigstellenPageComponent,
                data: {
                    title: VermittlungLabels.VERMITTLUNG_ERFASSEN,
                    permissions: [Permissions.FEATURE_32, Permissions.STES_VM_ZUWEISUNG_BEARBEITEN],
                    formNumber: StesFormNumberEnum.STES_MATCHING_VERMITTLUNG_FERTIGSTELLEN
                },
                canDeactivate: [CanDeactivateGuard],
                canActivate: [PermissionGuard]
            }
        ],
        data: { permissions: [Permissions.FEATURE_32, Permissions.STES_VM_ZUWEISUNG_BEARBEITEN] }
    },
    {
        path: `:stesId/vermittlung/erfassen`,
        component: ZuweisungWizardComponent,
        data: {
            permissions: [Permissions.FEATURE_32, Permissions.STES_VM_ZUWEISUNG_BEARBEITEN]
        },
        canActivate: [PermissionGuard],
        children: [
            { path: '', redirectTo: 'step1', pathMatch: 'full' },
            {
                path: 'step1',
                component: OsteSuchenComponent,
                data: {
                    title: VermittlungLabels.VERMITTLUNG_STELLEANGEBOT_SUCHEN,
                    permissions: [Permissions.FEATURE_32, Permissions.STES_VM_ZUWEISUNG_BEARBEITEN],
                    formNumber: StesFormNumberEnum.VERMITTLUNG_ERFASSEN
                },
                canActivate: [PermissionGuard]
            },
            {
                path: 'step2',
                component: StesProfilVergleichPageComponent,
                data: {
                    title: VermittlungLabels.VERMITTLUNG_PROFILDATEN_VERGLEICHEN,
                    permissions: [Permissions.FEATURE_32, Permissions.STES_VM_ZUWEISUNG_BEARBEITEN],
                    formNumber: StesFormNumberEnum.PROFILVERGLEICH_ANZEIGEN
                },
                canActivate: [PermissionGuard]
            },
            {
                path: 'step3',
                component: StesVermittlungFertigstellenPageComponent,
                data: {
                    title: VermittlungLabels.VERMITTLUNG_FERTIGSTELLEN,
                    permissions: [Permissions.FEATURE_32, Permissions.STES_VM_ZUWEISUNG_BEARBEITEN],
                    formNumber: StesFormNumberEnum.VERMITTLUNG_FERTIGSTELLEN
                },
                canDeactivate: [CanDeactivateGuard],
                canActivate: [PermissionGuard]
            }
        ]
    },
    {
        path: 'details/:stesId',
        component: StesDetailsHomeComponent,
        resolve: { ResetButtonsPermissionsResolver, ResetSideNavigationPermissionsResolver },
        data: { isAnmeldung: false },
        children: [
            {
                path: 'personalien',
                component: StesDetailsPersonalienComponent,
                data: {
                    title: StesDetailsLabels.PERSONALIEN,
                    formNumber: StesFormNumberEnum.PERSONALIEN,
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'zusatzadresse',
                component: StesDetailsZusatzadresseComponent,
                data: {
                    title: StesDetailsLabels.ZUSATZADRESSE,
                    formNumber: StesFormNumberEnum.ZUSATZADRESSE,
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'grunddaten',
                component: StesDetailsGrunddatenComponent,
                data: {
                    title: StesDetailsLabels.GRUNDDATEN,
                    formNumber: StesFormNumberEnum.GRUNDDATEN,
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'berufsdaten',
                component: StesDetailsBerufsdatenAnzeigenComponent,
                data: {
                    title: StesDetailsLabels.BERUFSDATEN,
                    formNumber: StesFormNumberEnum.BERUFSDATEN_ANZEIGEN,
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }]
                }
            },
            {
                path: 'berufsdaten/erfassen',
                component: StesBerufsdatenBearbeitenComponent,
                data: {
                    title: StesDetailsLabels.BERUFSDATENERFASSEN,
                    formNumber: StesFormNumberEnum.BERUFSDATEN_ERFASSEN,
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'berufsdaten/bearbeiten',
                component: StesBerufsdatenBearbeitenComponent,
                data: {
                    title: StesDetailsLabels.BERUFSDATENBEARBEITEN,
                    formNumber: StesFormNumberEnum.BERUFSDATEN_BEARBEITEN,
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'stellensuche',
                component: StesDetailsStellensucheComponent,
                data: {
                    title: StesDetailsLabels.STELLENSUCHE,
                    formNumber: StesFormNumberEnum.STELLENSUCHE,
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'sprachkenntnisse',
                component: StesDetailsSprachkenntnisseComponent,
                data: {
                    title: StesDetailsLabels.SPRACHKENNTNISSE,
                    formNumber: StesFormNumberEnum.SPRACHKENNTNISSE,
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'datenfreigabe',
                component: StesDatenfreigabeComponent,
                data: {
                    title: StesDetailsLabels.DATENFREIGABE_ERFASSEN,
                    formNumber: StesFormNumberEnum.DATENFREIGABE_ERFASSEN,
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesKontrollperioden.KONTROLLPERIODEN,
                component: KontrollperiodenAnzeigenComponent,
                data: { title: KontrollperiodenLabels.KONTROLLPERIODEN, formNumber: StesFormNumberEnum.KONTROLLPERIODE_ANZEIGEN }
            },
            {
                path: StesKontrollperioden.ERFASSEN,
                canDeactivate: [CanDeactivateGuard],
                component: KontrollperiodenErfassenBearbeitenComponent,
                data: {
                    title: KontrollperiodenLabels.ERFASSEN,
                    formNumber: StesFormNumberEnum.KONTROLLPERIODE_ERFASSEN,
                    type: 'erfassen'
                }
            },
            {
                path: StesKontrollperioden.BEARBEITEN,
                canDeactivate: [CanDeactivateGuard],
                component: KontrollperiodenErfassenBearbeitenComponent,
                data: {
                    title: KontrollperiodenLabels.BEARBEITEN,
                    formNumber: StesFormNumberEnum.KONTROLLPERIODE_BEARBEITEN,
                    type: 'bearbeiten'
                }
            },
            {
                path: StesVermittlungsfaehigkeits.VERMITTLUNGSFAEHIGKEIT,
                component: StesVermittlungsfaehigkeitAnzeigenComponent,
                data: { title: StesDetailsLabels.VERMITTLUNGSFAEHIGKEIT, formNumber: StesFormNumberEnum.VERMITTLUNG_FAEHIGKEIT }
            },
            {
                path: StesSanktionen.SANKTIONEN,
                component: StesSanktionenAnzeigenComponent,
                data: { title: SanktionLabels.SANKTIONEN, formNumber: StesFormNumberEnum.SANKTIONEN_AUSWAEHLEN }
            },
            {
                path: StesSanktionen.SANKTIONEN,
                component: SanktionErfassenBearbeitenComponent,
                data: { title: SanktionLabels.SACHVERHALT_ERFASSEN, formNumber: StesFormNumberEnum.SANKTION_ERFASSEN_BEMUEHUNGEN },
                canDeactivate: [CanDeactivateGuard],
                children: [
                    {
                        path: StesSanktionen.SANKTION_ERFASSEN_BEMUEHUNGEN,
                        component: SanktionErfassenArbeitsbemuehungenComponent,
                        data: {
                            title: SanktionLabels.SACHVERHALT_ERFASSEN,
                            formNumber: StesFormNumberEnum.SANKTION_ERFASSEN_BEMUEHUNGEN,
                            type: StesSanktionen.SANKTION_ERFASSEN_BEMUEHUNGEN
                        }
                    },
                    {
                        path: StesSanktionen.SANKTION_ERFASSEN_MASSNAHMEN,
                        component: SanktionErfassenMassnahmenComponent,
                        data: {
                            title: SanktionLabels.SACHVERHALT_ERFASSEN,
                            formNumber: StesFormNumberEnum.SANKTION_ERFASSEN_MASSNAHMEN,
                            type: StesSanktionen.SANKTION_ERFASSEN_MASSNAHMEN
                        }
                    },
                    {
                        path: StesSanktionen.SANKTION_ERFASSEN_BERATUNG,
                        component: SanktionErfassenBeratungComponent,
                        data: {
                            title: SanktionLabels.SACHVERHALT_ERFASSEN,
                            formNumber: StesFormNumberEnum.SANKTION_ERFASSEN_BERATUNG,
                            type: StesSanktionen.SANKTION_ERFASSEN_BERATUNG
                        }
                    },
                    {
                        path: StesSanktionen.SANKTION_ERFASSEN_KONTROLL_WEISUNGEN,
                        component: SanktionErfassenKontrollWeisungenComponent,
                        data: {
                            title: SanktionLabels.SACHVERHALT_ERFASSEN,
                            formNumber: StesFormNumberEnum.SANKTION_ERFASSEN_KONTROLL_WEISUNGEN,
                            type: StesSanktionen.SANKTION_ERFASSEN_KONTROLL_WEISUNGEN
                        }
                    },
                    {
                        path: StesSanktionen.SANKTION_ERFASSEN_VERMITTLUNG,
                        component: SanktionErfassenVermittlungComponent,
                        data: {
                            title: SanktionLabels.SACHVERHALT_ERFASSEN,
                            formNumber: StesFormNumberEnum.SANKTION_ERFASSEN_VERMITTLUNG,
                            type: StesSanktionen.SANKTION_ERFASSEN_VERMITTLUNG
                        }
                    }
                ]
            },
            {
                path: StesSanktionen.SANKTIONEN,
                component: SanktionErfassenBearbeitenComponent,
                data: { title: SanktionLabels.SACHVERHALT_BEARBEITEN, formNumber: StesFormNumberEnum.SANKTION_BEARBEITEN_BEMUEHUNGEN },
                canDeactivate: [CanDeactivateGuard],
                children: [
                    {
                        path: StesSanktionen.SANKTION_BEARBEITEN_BEMUEHUNGEN,
                        component: SanktionErfassenArbeitsbemuehungenComponent,
                        data: {
                            title: SanktionLabels.SACHVERHALT_BEARBEITEN,
                            formNumber: StesFormNumberEnum.SANKTION_BEARBEITEN_BEMUEHUNGEN,
                            type: StesSanktionen.SANKTION_BEARBEITEN_BEMUEHUNGEN
                        }
                    },
                    {
                        path: StesSanktionen.SANKTION_BEARBEITEN_MASSNAHMEN,
                        component: SanktionErfassenMassnahmenComponent,
                        data: {
                            title: SanktionLabels.SACHVERHALT_BEARBEITEN,
                            formNumber: StesFormNumberEnum.SANKTION_BEARBEITEN_MASSNAHMEN,
                            type: StesSanktionen.SANKTION_BEARBEITEN_MASSNAHMEN
                        }
                    },
                    {
                        path: StesSanktionen.SANKTION_BEARBEITEN_BERATUNG,
                        component: SanktionErfassenBeratungComponent,
                        data: {
                            title: SanktionLabels.SACHVERHALT_BEARBEITEN,
                            formNumber: StesFormNumberEnum.SANKTION_BEARBEITEN_BERATUNG,
                            type: StesSanktionen.SANKTION_BEARBEITEN_BERATUNG
                        }
                    },
                    {
                        path: StesSanktionen.SANKTION_BEARBEITEN_KONTROLL_WEISUNGEN,
                        component: SanktionErfassenKontrollWeisungenComponent,
                        data: {
                            title: SanktionLabels.SACHVERHALT_BEARBEITEN,
                            formNumber: StesFormNumberEnum.SANKTION_BEARBEITEN_KONTROLL_WEISUNGEN,
                            type: StesSanktionen.SANKTION_BEARBEITEN_KONTROLL_WEISUNGEN
                        }
                    },
                    {
                        path: StesSanktionen.SANKTION_BEARBEITEN_VERMITTLUNG,
                        component: SanktionErfassenVermittlungComponent,
                        data: {
                            title: SanktionLabels.SACHVERHALT_BEARBEITEN,
                            formNumber: StesFormNumberEnum.SANKTION_BEARBEITEN_VERMITTLUNG,
                            type: StesSanktionen.SANKTION_BEARBEITEN_VERMITTLUNG
                        }
                    }
                ]
            },
            {
                path: StesSanktionen.SANKTIONEN,
                component: SanktionStellungnahmeComponent,
                data: { title: SanktionLabels.STELLUNGNAHME_ERFASSEN, formNumber: StesFormNumberEnum.SANKTION_STELLUNGNAHME_ERFASSEN_MASSNAHMEN },
                canDeactivate: [CanDeactivateGuard],
                children: [
                    {
                        path: StesSanktionen.SANKTION_BEMUEHUNGEN_STELLUNGNAHME_ERFASSEN,
                        component: SanktionErfassenArbeitsbemuehungenComponent,
                        data: { title: SanktionLabels.STELLUNGNAHME_ERFASSEN, formNumber: StesFormNumberEnum.SANKTION_STELLUNGNAHME_ERFASSEN_BEMUEHUNGEN }
                    },
                    {
                        path: StesSanktionen.SANKTION_MASSNAHMEN_STELLUNGNAHME_ERFASSEN,
                        component: SanktionErfassenMassnahmenComponent,
                        data: { title: SanktionLabels.STELLUNGNAHME_ERFASSEN, formNumber: StesFormNumberEnum.SANKTION_STELLUNGNAHME_ERFASSEN_MASSNAHMEN }
                    },
                    {
                        path: StesSanktionen.SANKTION_BERATUNG_STELLUNGNAHME_ERFASSEN,
                        component: SanktionErfassenBeratungComponent,
                        data: { title: SanktionLabels.STELLUNGNAHME_ERFASSEN, formNumber: StesFormNumberEnum.SANKTION_STELLUNGNAHME_ERFASSEN_BERATUNG }
                    },
                    {
                        path: StesSanktionen.SANKTION_KONTROLL_WEISUNGEN_STELLUNGNAHME_ERFASSEN,
                        component: SanktionErfassenKontrollWeisungenComponent,
                        data: { title: SanktionLabels.STELLUNGNAHME_ERFASSEN, formNumber: StesFormNumberEnum.SANKTION_STELLUNGNAHME_ERFASSEN_KONTROLL_WEISUNGEN }
                    },
                    {
                        path: StesSanktionen.SANKTION_VERMITTLUNG_STELLUNGNAHME_ERFASSEN,
                        component: SanktionErfassenVermittlungComponent,
                        data: { title: SanktionLabels.STELLUNGNAHME_ERFASSEN, formNumber: StesFormNumberEnum.SANKTION_STELLUNGNAHME_ERFASSEN_VERMITTLUNG }
                    }
                ]
            },
            {
                path: StesSanktionen.SANKTIONEN,
                component: SanktionStellungnahmeComponent,
                data: { title: SanktionLabels.STELLUNGNAHME_BEARBEITEN, formNumber: StesFormNumberEnum.SANKTION_STELLUNGNAHME_BEARBEITEN_MASSNAHMEN },
                canDeactivate: [CanDeactivateGuard],
                children: [
                    {
                        path: StesSanktionen.SANKTION_BEMUEHUNGEN_STELLUNGNAHME_BEARBEITEN,
                        component: SanktionErfassenArbeitsbemuehungenComponent,
                        data: { title: SanktionLabels.STELLUNGNAHME_BEARBEITEN, formNumber: StesFormNumberEnum.SANKTION_STELLUNGNAHME_BEARBEITEN_BEMUEHUNGEN }
                    },
                    {
                        path: StesSanktionen.SANKTION_MASSNAHMEN_STELLUNGNAHME_BEARBEITEN,
                        component: SanktionErfassenMassnahmenComponent,
                        data: { title: SanktionLabels.STELLUNGNAHME_BEARBEITEN, formNumber: StesFormNumberEnum.SANKTION_STELLUNGNAHME_BEARBEITEN_MASSNAHMEN }
                    },
                    {
                        path: StesSanktionen.SANKTION_BERATUNG_STELLUNGNAHME_BEARBEITEN,
                        component: SanktionErfassenBeratungComponent,
                        data: { title: SanktionLabels.STELLUNGNAHME_BEARBEITEN, formNumber: StesFormNumberEnum.SANKTION_STELLUNGNAHME_BEARBEITEN_BERATUNG }
                    },
                    {
                        path: StesSanktionen.SANKTION_KONTROLL_WEISUNGEN_STELLUNGNAHME_BEARBEITEN,
                        component: SanktionErfassenKontrollWeisungenComponent,
                        data: { title: SanktionLabels.STELLUNGNAHME_BEARBEITEN, formNumber: StesFormNumberEnum.SANKTION_STELLUNGNAHME_BEARBEITEN_KONTROLL_WEISUNGEN }
                    },
                    {
                        path: StesSanktionen.SANKTION_VERMITTLUNG_STELLUNGNAHME_BEARBEITEN,
                        component: SanktionErfassenVermittlungComponent,
                        data: { title: SanktionLabels.STELLUNGNAHME_BEARBEITEN, formNumber: StesFormNumberEnum.SANKTION_STELLUNGNAHME_BEARBEITEN_VERMITTLUNG }
                    }
                ]
            },
            {
                path: StesSanktionen.SANKTIONEN,
                component: SanktionEntscheidComponent,
                canDeactivate: [CanDeactivateGuard],
                children: [
                    {
                        path: StesSanktionen.SANKTION_BEMUEHUNGEN_ENTSCHEID_ERFASSEN,
                        component: SanktionErfassenArbeitsbemuehungenComponent,
                        data: {
                            title: SanktionLabels.ENTSCHEID_ERFASSEN,
                            formNumber: StesFormNumberEnum.SANKTION_ENTSCHEID_ERFASSEN_BEMUEHUNGEN
                        }
                    },
                    {
                        path: StesSanktionen.SANKTION_MASSNAHMEN_ENTSCHEID_ERFASSEN,
                        component: SanktionErfassenMassnahmenComponent,
                        data: {
                            title: SanktionLabels.ENTSCHEID_ERFASSEN,
                            formNumber: StesFormNumberEnum.SANKTION_ENTSCHEID_ERFASSEN_MASSNAHMEN
                        }
                    },
                    {
                        path: StesSanktionen.SANKTION_BERATUNG_ENTSCHEID_ERFASSEN,
                        component: SanktionErfassenBeratungComponent,
                        data: {
                            title: SanktionLabels.ENTSCHEID_ERFASSEN,
                            formNumber: StesFormNumberEnum.SANKTION_ENTSCHEID_ERFASSEN_BERATUNG
                        }
                    },
                    {
                        path: StesSanktionen.SANKTION_KONTROLL_WEISUNGEN_ENTSCHEID_ERFASSEN,
                        component: SanktionErfassenKontrollWeisungenComponent,
                        data: {
                            title: SanktionLabels.ENTSCHEID_ERFASSEN,
                            formNumber: StesFormNumberEnum.SANKTION_ENTSCHEID_ERFASSEN_KONTROLL_WEISUNGEN
                        }
                    },
                    {
                        path: StesSanktionen.SANKTION_VERMITTLUNG_ENTSCHEID_ERFASSEN,
                        component: SanktionErfassenVermittlungComponent,
                        data: {
                            title: SanktionLabels.ENTSCHEID_ERFASSEN,
                            formNumber: StesFormNumberEnum.SANKTION_ENTSCHEID_ERFASSEN_VERMITTLUNG
                        }
                    }
                ]
            },
            {
                path: StesSanktionen.SANKTIONEN,
                component: SanktionEntscheidComponent,
                canDeactivate: [CanDeactivateGuard],
                children: [
                    {
                        path: StesSanktionen.SANKTION_BEMUEHUNGEN_ENTSCHEID_BEARBEITEN,
                        component: SanktionErfassenArbeitsbemuehungenComponent,
                        data: { title: SanktionLabels.ENTSCHEID_BEARBEITEN, formNumber: StesFormNumberEnum.SANKTION_ENTSCHEID_BEARBEITEN_BEMUEHUNGEN }
                    },
                    {
                        path: StesSanktionen.SANKTION_MASSNAHMEN_ENTSCHEID_BEARBEITEN,
                        component: SanktionErfassenMassnahmenComponent,
                        data: { title: SanktionLabels.ENTSCHEID_BEARBEITEN, formNumber: StesFormNumberEnum.SANKTION_ENTSCHEID_BEARBEITEN_MASSNAHMEN }
                    },
                    {
                        path: StesSanktionen.SANKTION_BERATUNG_ENTSCHEID_BEARBEITEN,
                        component: SanktionErfassenBeratungComponent,
                        data: { title: SanktionLabels.ENTSCHEID_BEARBEITEN, formNumber: StesFormNumberEnum.SANKTION_ENTSCHEID_BEARBEITEN_BERATUNG }
                    },
                    {
                        path: StesSanktionen.SANKTION_KONTROLL_WEISUNGEN_ENTSCHEID_BEARBEITEN,
                        component: SanktionErfassenKontrollWeisungenComponent,
                        data: { title: SanktionLabels.ENTSCHEID_BEARBEITEN, formNumber: StesFormNumberEnum.SANKTION_ENTSCHEID_BEARBEITEN_KONTROLL_WEISUNGEN }
                    },
                    {
                        path: StesSanktionen.SANKTION_VERMITTLUNG_ENTSCHEID_BEARBEITEN,
                        component: SanktionErfassenVermittlungComponent,
                        data: { title: SanktionLabels.ENTSCHEID_BEARBEITEN, formNumber: StesFormNumberEnum.SANKTION_ENTSCHEID_BEARBEITEN_VERMITTLUNG }
                    }
                ]
            },
            {
                path: StesVermittlungsfaehigkeits.SACHVERHALT,
                component: StesSachverhaltComponent,
                data: { title: VermittlungsfaehigkeitLabels.SACHVERHALT_ERFASSEN, formNumber: StesFormNumberEnum.SACHVERHALT_ERFASSEN },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesVermittlungsfaehigkeits.SACHVERHALT_BEARBEITEN,
                component: StesSachverhaltComponent,
                data: {
                    title: VermittlungsfaehigkeitLabels.SACHVERHALT_BEARBEITEN,
                    formNumber: StesFormNumberEnum.SACHVERHALT_BEARBEITEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesVermittlungsfaehigkeits.ENTSCHEID_ERFASSEN,
                component: StesEntscheidComponent,
                data: { title: VermittlungsfaehigkeitLabels.ENTSCHEID_ERFASSEN, formNumber: StesFormNumberEnum.ENTSCHEID_ERFASSEN },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesVermittlungsfaehigkeits.ENTSCHEID_BEARBEITEN,
                component: StesEntscheidComponent,
                data: { title: VermittlungsfaehigkeitLabels.ENTSCHEID_BEARBEITEN, formNumber: StesFormNumberEnum.ENTSCHEID_BEARBEITEN },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesVermittlungsfaehigkeits.STELLUNGNAHME_ERFASSEN,
                component: StesStellungnahmeComponent,
                data: { title: VermittlungsfaehigkeitLabels.STELLUNGNAHME_ERFASSEN, formNumber: StesFormNumberEnum.STELLUNGNAHME_ERFASSEN },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesVermittlungsfaehigkeits.STELLUNGNAHME_BEARBEITEN,
                component: StesStellungnahmeComponent,
                data: {
                    title: VermittlungsfaehigkeitLabels.STELLUNGNAHME_BEARBEITEN,
                    formNumber: StesFormNumberEnum.STELLUNGNAHME_BEARBEITEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'abmeldung',
                component: StesAbmeldungComponent,
                resolve: { ResetButtonsPermissionsResolver },
                data: {
                    title: 'stes.subnavmenuitem.stesabmeldung',
                    formNumber: StesFormNumberEnum.ABMELDUNG_ERFASSEN,
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesMeldungenPaths.MELDUNGEN,
                component: StesMeldungenComponent,
                data: { title: 'geko.subnavmenuitem.meldungen', formNumber: StesFormNumberEnum.STES_MELDUNGEN }
            },
            {
                path: StesAufgabenPaths.AUFGABEN,
                component: StesAufgabenAnzeigenComponent,
                data: {
                    permissions: [Permissions.GEKO_AUFGABEN_SUCHEN, Permissions.FEATURE_32],
                    title: GekoAufgabenLabels.AUFGABEN,
                    formNumber: StesFormNumberEnum.STES_AUFGABEN_ANZEIGEN
                }
            },
            {
                path: StesAufgabenPaths.AUFGABEN_ERFASSEN,
                component: StesAufgabenErfassenComponent,
                data: {
                    permissions: [Permissions.GEKO_AUFGABEN_ERFASSEN],
                    title: GekoAufgabenLabels.AUFGABEN,
                    formNumber: StesFormNumberEnum.AUFGABE_ERFASSEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesAufgabenPaths.AUFGABEN_BEARBEITEN,
                component: StesAufgabenErfassenComponent,
                data: {
                    permissions: [Permissions.GEKO_AUFGABEN_BEARBEITEN],
                    title: GekoAufgabenLabels.AUFGABEN,
                    formNumber: StesFormNumberEnum.AUFGABE_BEARBEITEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesGeschaeftePaths.GESCHAEFTE,
                component: StesGeschaefteComponent,
                data: { title: 'geko.subnavmenuitem.geschaefte', formNumber: StesFormNumberEnum.STES_SUCHE_GESCHAEFTE }
            },
            {
                path: StesTerminePaths.TERMINEANZEIGEN,
                component: StesTermineAnzeigenComponent,
                data: {
                    title: StesTermineLabels.TERMINEANZEIGEN,
                    formNumber: StesFormNumberEnum.TERMINE_ANZEIGEN,
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN, Permissions.AMM_INFOTAG_NUTZEN] }]
                }
            },
            {
                path: StesTerminePaths.TERMINERFASSEN,
                component: StesTerminComponent,
                data: {
                    title: StesTermineLabels.TERMINERFASSEN,
                    formNumber: StesFormNumberEnum.TERMIN_ERFASSEN,
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN, Permissions.AMM_INFOTAG_NUTZEN] }]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesTerminePaths.TERMINBEARBEITEN,
                component: StesTerminComponent,
                resolve: { ResetButtonsPermissionsResolver },
                data: {
                    title: StesTermineLabels.TERMINBEARBEITEN,
                    formNumber: StesFormNumberEnum.TERMIN_BEARBEITEN,
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN, Permissions.AMM_INFOTAG_NUTZEN] }]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesTerminePaths.INFOTAG,
                redirectTo: StesTerminePaths.INFOTAGGRUNDDATENBUCHUNG
            },
            {
                path: StesTerminePaths.INFOTAGBESCHREIBUNGDURCHFUEHRUNGSORT,
                component: StesInfotagBeschreibungDurchfuehrungsortComponent,
                data: {
                    title: StesTermineLabels.INFOTAGBESCHREIBUNGDURCHFUEHRUNGSORT,
                    formNumber: StesFormNumberEnum.INFOTAG_BESCHREIBUNG_DURCHFUEHRUNGSORT,
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN, Permissions.AMM_INFOTAG_NUTZEN] }]
                }
            },
            {
                path: StesTerminePaths.INFOTAGGRUNDDATENBUCHUNG,
                component: StesInfotagGrunddatenBuchungComponent,
                resolve: { ResetButtonsPermissionsResolver },
                data: {
                    title: StesTermineLabels.INFOTAGGRUNDDATENBUCHUNG,
                    formNumber: StesFormNumberEnum.INFOTAG_GRUNDDATEN_BUCHUNG,
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN, Permissions.AMM_INFOTAG_NUTZEN] }]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesTerminePaths.INFOTAGTEILNEHMERLISTE,
                component: StesInfotagTeilnehmerlisteComponent,
                data: {
                    title: StesTermineLabels.INFOTAGTEILNEHMERLISTE,
                    formNumber: StesFormNumberEnum.INFOTAG_TEILNEHMER_LISTE,
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN, Permissions.AMM_INFOTAG_NUTZEN] }]
                }
            },
            {
                path: StesRahmenfristenPaths.RAHMENFRISTEN,
                component: StesRahmenfristenComponent,
                data: { title: StesRahmenfristenLabels.RAHMENFRISTEN, formNumber: StesFormNumberEnum.RAHMENFRISTEN_ANZEIGEN }
            },
            {
                path: 'rahmenfristen/rahmenfristdetails',
                component: StesRahmenfristenDetailsComponent,
                data: { title: StesRahmenfristenLabels.RAHMENFRISTDETAILS, formNumber: StesFormNumberEnum.RAHMENFRIST_DETAIL_ANZEIGEN }
            },
            {
                path: 'rahmenfristen/rahmenfristdetails/zaehlerstand',
                component: StesRahmenfristenZaehlerstandComponent,
                data: { title: StesRahmenfristenLabels.RAHMENFRISTZAELERSTAND, formNumber: StesFormNumberEnum.RAHMENFRIST_ZAEHLERSTAND_ANZEIGEN }
            },
            {
                path: StesZwischenverdienstPaths.ZWISCHENVERDIENSTE,
                component: ZwischenverdiensteComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.STES_SUCHEN_SICHTEN, Permissions.FEATURE_32],
                    title: StesZwischenverdienstLabels.ZWISCHENVERDIENSTE,
                    formNumber: StesFormNumberEnum.ZWISCHENVERDIENSTE
                }
            },
            {
                path: StesZwischenverdienstPaths.ZWISCHENVERDIENSTEERFASSEN,
                component: ZwischenverdienstErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.STES_ANMELDEN_BEARBEITEN, Permissions.FEATURE_32],
                    title: StesZwischenverdienstLabels.ZWISCHENVERDIENSTEERFASSEN,
                    formNumber: StesFormNumberEnum.ZWISCHENVERDIENST_ERFASSEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesZwischenverdienstPaths.ZWISCHENVERDIENSTEBEARBEITEN,
                component: ZwischenverdienstBearbeitenComponent,
                canActivate: [PermissionGuard],
                resolve: { ResetButtonsPermissionsResolver },
                data: {
                    permissions: [Permissions.STES_SUCHEN_SICHTEN, Permissions.FEATURE_32],
                    title: StesZwischenverdienstLabels.ZWISCHENVERDIENSTEBEARBEITEN,
                    formNumber: StesFormNumberEnum.ZWISCHENVERDIENST_BEARBEITEN
                },
                canDeactivate: [CanDeactivateGuard]
            },

            /*STES AMM Sub menu*/
            {
                path: AMMPaths.AMM,
                redirectTo: AMMPaths.UEBERSICHT,
                pathMatch: 'full',
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN]
                }
            },
            {
                path: AMMPaths.UEBERSICHT,
                component: UebersichtComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN],
                    title: AMMLabels.UEBERSICHT,
                    formNumber: StesFormNumberEnum.AMM_UEBERSICHT
                }
            },
            {
                path: AMMPaths.AUSZUG,
                component: AuszugComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_32],
                    title: AMMLabels.AMM_AUSZUG,
                    formNumber: StesFormNumberEnum.AMM_AUSZUG
                }
            },
            {
                path: AMMPaths.AMM_GENERAL,
                component: AmmControllerComponent,
                pathMatch: 'full',
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN]
                }
            },
            {
                path: AMMPaths.AZ_GESUCH,
                component: GesuchComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32],
                    title: AMMLabels.AZ_GESUCH_HEADER,
                    formNumber: StesFormNumberEnum.AZ_GESUCH
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: AMMPaths.AZ_KOSTEN,
                component: AzKostenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32],
                    title: AMMLabels.AZ_KOSTEN_HEADER,
                    formNumber: StesFormNumberEnum.AZ_KOSTEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: AMMPaths.EAZ_GESUCH,
                component: EazGesuchComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32],
                    title: AMMLabels.EAZ_GESUCH_HEADER,
                    formNumber: StesFormNumberEnum.EAZ_GESUCH
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: AMMPaths.EAZ_KOSTEN,
                component: EazKostenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32],
                    title: AMMLabels.EAZ_KOSTEN_HEADER,
                    formNumber: StesFormNumberEnum.EAZ_KOSTEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: AMMPaths.FSE_GESUCH,
                component: FseGesuchComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32],
                    title: AMMLabels.FSE_GESUCH_HEADER,
                    formNumber: StesFormNumberEnum.FSE_GESUCH
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: AMMPaths.FSE_KOSTEN,
                component: FseKostenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32],
                    title: AMMLabels.FSE_KOSTEN_HEADER,
                    formNumber: StesFormNumberEnum.FSE_KOSTEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: AMMPaths.PEWO_GESUCH,
                component: PewoGesuchComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32],
                    title: AMMLabels.PEWO_GESUCH_HEADER,
                    formNumber: StesFormNumberEnum.PEWO_GESUCH
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: AMMPaths.PEWO_KOSTEN,
                component: PewoKostenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32],
                    title: AMMLabels.PEWO_KOSTEN_HEADER,
                    formNumber: StesFormNumberEnum.PEWO_KOSTEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: AMMPaths.SPEZIELL_ENTSCHEID,
                component: AmmSpeziellEntscheidComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32],
                    title: AMMLabels.ENTSCHEID,
                    formNumber: StesFormNumberEnum.AMM_ENTSCHEID
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: AMMPaths.INDIVIDUELL_BUCHUNG,
                component: BuchungComponent,
                canActivate: [PermissionGuard],
                canDeactivate: [CanDeactivateGuard],
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN],
                    title: AMMLabels.BUCHUNG,
                    formNumber: StesFormNumberEnum.KURS_INDIVIDUELL_BUCHUNG,
                    wizard: false
                }
            },
            {
                path: AMMPaths.BESCHREIBUNG,
                component: BeschreibungComponent,
                canActivate: [PermissionGuard],
                canDeactivate: [CanDeactivateGuard],
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN],
                    title: AMMLabels.BESCHREIBUNG,
                    formNumber: StesFormNumberEnum.BESCHREIBUNG_AMM_ERFASSEN,
                    wizard: false
                }
            },
            {
                path: AMMPaths.INDIVIDUELL_DURCHFUHRUNG,
                canActivate: [PermissionGuard],
                canDeactivate: [CanDeactivateGuard],
                component: DurchfuehrungsortComponent,
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN],
                    title: AMMLabels.DURCHFUHRUNGSORT,
                    formNumber: StesFormNumberEnum.DURCHSFUEHRUNGSORT,
                    wizard: false
                }
            },
            {
                path: AMMPaths.BP_KOSTEN,
                canActivate: [PermissionGuard],
                component: BPKostenComponent,
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN],
                    title: AMMLabels.KOSTEN,
                    formNumber: StesFormNumberEnum.BP_KOSTEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: AMMPaths.INDIVIDUELL_KOSTEN,
                canActivate: [PermissionGuard],
                component: IndividuelleKostenComponent,
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN],
                    title: AMMLabels.KOSTEN,
                    formNumber: StesFormNumberEnum.KURS_INDIVIDUELL_KOSTEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: AMMPaths.KURS_INDIV_IM_ANGEBOT_BUCHUNG,
                component: BuchungAngebotComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN],
                    title: AMMLabels.BUCHUNG,
                    formNumber: StesFormNumberEnum.MASSNAHME_BUCHEN_KURS_INDIV_IM_ANGEBOT,
                    wizard: false
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: AMMPaths.KURS_INDIV_IM_ANGEBOT_BESCHREIBUNG,
                component: BeschreibungComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_32],
                    title: AMMLabels.BESCHREIBUNG,
                    formNumber: StesFormNumberEnum.BESCHREIBUNG_AMM_ERFASSEN,
                    wizard: false
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: AMMPaths.KURS_INDIV_IM_ANGEBOT_DURCHFUEHRUNGSORT,
                component: DurchfuehrungsortAngebotComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_32],
                    title: AMMLabels.DURCHFUHRUNGSORT,
                    formNumber: StesFormNumberEnum.DURCHSFUEHRUNGSORT_IM_ANGEBOT,
                    wizard: false
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: AMMPaths.KOLLEKTIV_BUCHUNG,
                component: KursKollektivBearbeitenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN],
                    title: AMMLabels.BUCHUNG,
                    formNumber: StesFormNumberEnum.MASSNAHME_BUCHEN_KURS_KOLLEKTIV
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: AMMPaths.KOLLEKTIV_DURCHFUHRUNG,
                component: DurchfuehrungsortAngebotComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_32],
                    title: AMMLabels.DURCHFUHRUNGSORT,
                    formNumber: StesFormNumberEnum.DURCHSFUEHRUNGSORT_IM_ANGEBOT,
                    wizard: false
                }
            },
            {
                path: AMMPaths.PSAK_BUCHUNG,
                component: PsakBearbeitenComponent,
                canActivate: [PermissionGuard],
                canDeactivate: [CanDeactivateGuard],
                data: {
                    permissions: [Permissions.FEATURE_32],
                    title: AMMLabels.BUCHUNG,
                    formNumber: StesFormNumberEnum.MASSNAHME_BUCHEN
                }
            },
            {
                path: AMMPaths.SPESEN,
                component: SpesenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN],
                    title: AMMLabels.SPESEN,
                    formNumber: StesFormNumberEnum.AMM_SPESEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: AMMPaths.BIM_BEM_ENTSCHEID,
                component: AmmBimBemEntscheidComponent,
                canActivate: [PermissionGuard],
                canDeactivate: [CanDeactivateGuard],
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN],
                    title: AMMLabels.ENTSCHEID,
                    formNumber: StesFormNumberEnum.AMM_ENTSCHEID,
                    wizard: false
                }
            },
            {
                path: AMMPaths.TEILNEHMERWARTELISTE,
                component: TeilnehmerWartelisteComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN],
                    title: AMMLabels.TEILNEHMERWARTELISTE,
                    formNumber: StesFormNumberEnum.TEILNEHMER_WARTELISTE
                }
            },
            {
                path: AMMPaths.TEILNEHMERPLAETZE,
                component: TeilnehmerplaetzeComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN],
                    title: AMMLabels.TEILNEHMERPLAETZE,
                    formNumber: StesFormNumberEnum.TEILNEHMERPLAETZE
                }
            },

            /* STES Leistungsexporte*/
            {
                path: StesLeistunsexportePaths.LEISTUNGSEXPORTE,
                component: LeistungsexporteComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [{ or: [Permissions.STES_LEISTUNGSEXPORT_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }, Permissions.FEATURE_32],
                    title: StesLeistunsexporteLabels.LEISTUNGSEXPORTE,
                    formNumber: StesFormNumberEnum.LEISTUNGSEXPORTE
                }
            },
            {
                path: StesLeistunsexportePaths.LEISTUNGSEXPORTEERFASSEN,
                component: LeistungsexportErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.STES_LEISTUNGSEXPORT_BEARBEITEN, Permissions.FEATURE_32],
                    title: StesLeistunsexporteLabels.LEISTUNGSEXPORTEERFASSEN,
                    formNumber: StesFormNumberEnum.LEISTUNGSEXPORTERFASSEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesLeistunsexportePaths.LEISTUNGSEXPORTEBEARBEITEN,
                component: LeistungsexportBearbeitenComponent,
                canActivate: [PermissionGuard],
                resolve: { ResetButtonsPermissionsResolver },
                data: {
                    permissions: [{ or: [Permissions.STES_LEISTUNGSEXPORT_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }, Permissions.FEATURE_32],
                    title: StesLeistunsexporteLabels.LEISTUNGSEXPORTEBEARBEITEN,
                    formNumber: StesFormNumberEnum.LEISTUNGSEXPORT_BEARBEITEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesWiedereingliederungPaths.WIEDEREINGLIEDERUNG,
                redirectTo: StesWiedereingliederungPaths.AUSGANGSLAGEN_ANZEIGEN,
                pathMatch: 'full'
            },
            {
                path: StesWiedereingliederungPaths.AUSGANGSLAGEN_ANZEIGEN,
                component: AusgangslagenAnzeigenComponent,
                data: {
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }, Permissions.FEATURE_32],
                    title: WidereingliederungLabels.AUSGANGSLAGEN,
                    formNumber: StesFormNumberEnum.AUSGANGSLAGEN
                }
            },
            {
                path: StesWiedereingliederungPaths.AUSGANGSLAGEN_ERFASSEN,
                component: AusgangslageErfassenPageComponent,
                data: {
                    permissions: [Permissions.STES_ANMELDEN_BEARBEITEN, Permissions.FEATURE_32],
                    title: WidereingliederungLabels.AUSGANGSLAGE_ERFASSEN,
                    formNumber: StesFormNumberEnum.AUSGANGSLAGEERFASSEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesWiedereingliederungPaths.AUSGANGSLAGEN_BEARBEITEN,
                component: AusgangslageBearbeitenPageComponent,
                resolve: { ResetButtonsPermissionsResolver },
                data: {
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }, Permissions.FEATURE_32],
                    title: WidereingliederungLabels.AUSGANGSLAGE_BEARBEITEN,
                    formNumber: StesFormNumberEnum.AUSGANGSLAGEBEARBEITEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesWiedereingliederungPaths.ZIELE_ANZEIGEN,
                component: WdgZieleAnzeigenComponent,
                data: {
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }, Permissions.FEATURE_32],
                    title: WidereingliederungLabels.ZIELE,
                    formNumber: StesFormNumberEnum.WIEDEREINGLIEDERUNGSZIELE
                }
            },
            {
                path: StesWiedereingliederungPaths.ZIEL_ERFASSEN,
                component: WdgZielErfassenComponent,
                data: {
                    permissions: [Permissions.STES_ANMELDEN_BEARBEITEN, Permissions.FEATURE_32],
                    title: WidereingliederungLabels.ZIEL_ERFASSEN,
                    formNumber: StesFormNumberEnum.WIEDEREINGLIEDERUNGSZIELERFASSEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesWiedereingliederungPaths.ZIEL_BEARBEITEN,
                component: WdgZielBearbeitenComponent,
                resolve: { ResetButtonsPermissionsResolver },
                data: {
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }, Permissions.FEATURE_32],
                    title: WidereingliederungLabels.ZIEL_BEARBEITEN,
                    formNumber: StesFormNumberEnum.WIEDEREINGLIEDERUNGSZIELEBEARBEITEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesWiedereingliederungPaths.AKTIONEN_ANZEIGEN,
                component: WdgAktionenAnzeigenComponent,
                data: {
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }, Permissions.FEATURE_32],
                    title: WidereingliederungLabels.AKTIONEN,
                    formNumber: StesFormNumberEnum.WIEDEREINGLIEDERUNGSAKTIONEN
                }
            },
            {
                path: StesWiedereingliederungPaths.AKTION_ERFASSEN,
                component: WdgAktionenErfassenComponent,
                data: {
                    permissions: [Permissions.STES_ANMELDEN_BEARBEITEN, Permissions.FEATURE_32],
                    title: WidereingliederungLabels.AKTION_ERFASSEN,
                    formNumber: StesFormNumberEnum.WIEDEREINGLIEDERUNGSAKTION_ERFASSEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: FachberatungPaths.FACHBERATUNGEN,
                component: FachberatungenAnzeigenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_32],
                    title: FachberatungLabels.FACHBERATUNGEN,
                    formNumber: StesFormNumberEnum.FACHBERATUNGEN_ANZEIGEN
                }
            },
            {
                path: FachberatungPaths.FACHBERATUNG_BEARBEITEN,
                component: FachberatungBearbeitenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.STES_VM_ZUWEISUNG_FB_SUCHEN],
                    title: FachberatungLabels.VERMITTLUNG,
                    formNumber: StesFormNumberEnum.FACHBERATUNG_BEARBEITEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesWiedereingliederungPaths.AKTIONEN_BEARBEITEN,
                component: WdgAktionenBearbeitenComponent,
                resolve: { ResetButtonsPermissionsResolver },
                data: {
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }, Permissions.FEATURE_32],
                    title: WidereingliederungLabels.AKTION_BEARBEITEN,
                    formNumber: StesFormNumberEnum.WIEDEREINGLIEDERUNGSAKTION_BEARBEITEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            { path: '', redirectTo: 'personalien', pathMatch: 'full' },
            {
                path: StesArbeitsvermittlungPaths.ARBEITSVERMITTLUNGEN_ANZEIGEN,
                component: ArbeitsvermittlungenAnzeigenComponent,
                resolve: { ResetButtonsPermissionsResolver },
                canActivate: [PermissionGuard],
                data: {
                    permissions: [{ or: [Permissions.STES_VM_STES_ZUWEISUNG_SUCHEN, Permissions.STES_SCHNELLZUWEISUNG_ANZEIGEN] }, Permissions.FEATURE_32],
                    title: ArbeitsvermittlungLabels.ARBEITSVERMITTLUNG,
                    formNumber: StesFormNumberEnum.ARBEITSVERMITTLUNGEN_ANZEIGEN
                }
            },
            {
                path: StesArbeitsvermittlungPaths.SCHNELLZUWEISUNG_ERFASSEN,
                component: SchnellzuweisungErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.STES_SCHNELLZUWEISUNG_BEARBEITEN],
                    title: SchnellzuweisungLabels.SCHNELLZUWEISUNG_ERFASSEN,
                    formNumber: StesFormNumberEnum.SCHNELLZUWEISUNG_ERFASSEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesArbeitsvermittlungPaths.VERMITTLUNG_BEARBEITEN,
                component: VermittlungBearbeitenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.STES_VM_STES_ZUWEISUNG_SUCHEN],
                    title: VermittlungLabels.VERMITTLUNG_BEARBEITEN,
                    formNumber: StesFormNumberEnum.VERMITTLUNG_BEARBEITEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesArbeitsvermittlungPaths.SCHNELLZUWEISUNG_BEARBEITEN,
                component: SchnellzuweisungBearbeitenPageComponent,
                resolve: { ResetButtonsPermissionsResolver },
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.STES_SCHNELLZUWEISUNG_ANZEIGEN],
                    title: SchnellzuweisungLabels.SCHNELLZUWEISUNG_BEARBEITEN,
                    formNumber: StesFormNumberEnum.SCHNELLZUWEISUNG_BEARBEITEN
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: StesMatchingprofilPaths.MATCHINGPROFIL,
                component: StesMatchingprofilComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_32, Permissions.STES_SUCHEN_SICHTEN],
                    title: MatchingprofilLabels.MATCHING,
                    formNumber: StesFormNumberEnum.MATCHINGPROFIL_BEARBEITEN
                }
            }
        ]
    },
    {
        path: 'arbeitsvermittlung/search',
        data: { permissions: [Permissions.FEATURE_32] },
        canActivate: [PermissionGuard],
        children: [
            { path: '', redirectTo: 'matchingtreffern', pathMatch: 'full' },
            {
                path: 'matchingtreffern',
                component: MatchingtreffernSuchenComponent,
                data: {
                    title: ArbeitsvermittlungLabels.STELLESUCHEND_MIT_MATCHINGTREFFEN,
                    formNumber: StesFormNumberEnum.ARBEITSVERMITTLUNG_SEARCH_MATCHINGTREFFERN,
                    permissions: [Permissions.FEATURE_32, Permissions.STES_VM_MATCHING]
                }
            },
            {
                path: 'stellenangebot',
                component: OsteVermittlungSuchenComponent,
                data: {
                    title: ArbeitsvermittlungLabels.STELLENANGEBOT_OSTE_VERMITTLUNG,
                    formNumber: StesFormNumberEnum.ARBEITSVERMITTLUNG_SEARCH_OSTE,
                    permissions: [Permissions.FEATURE_33, Permissions.STES_VM_ZUWEISUNG_BEARBEITEN]
                }
            }
        ]
    },
    {
        path: 'arbeitsbemuehungen/search',
        data: { permissions: [Permissions.STES_LEISTUNGSEXPORT_SUCHEN_SICHTEN] },
        canActivate: [PermissionGuard],
        children: [
            {
                path: 'kontrollperioden',
                component: KontrollperiodenStesSuchenComponent,
                data: {
                    title: 'stes.subnavmenuitem.kontrollperioden.anzeigen',
                    formNumber: StesFormNumberEnum.ARBEITSBEMUEHUNGEN_KONTROLLPERIODE_SUCHEN,
                    permissions: [Permissions.STES_GESCHAEFT_SUCHEN_SICHTEN]
                }
            },
            {
                path: 'fehlender-kontrollperioden',
                component: FehlenderKontrollperiodenStesSuchenComponent,
                data: {
                    title: 'stes.label.kontrollperiode-fehlend',
                    formNumber: StesFormNumberEnum.ARBEITSBEMUEHUNGEN_FEHLENDER_KONTROLLPERIODE_SUCHEN,
                    permissions: [Permissions.STES_GESCHAEFT_SUCHEN_SICHTEN]
                }
            }
        ]
    },
    {
        path: StesFachberatungPaths.FACHBERATUNG,
        data: { navPath: 'stes' },
        children: [
            {
                path: UnternehmenPaths.SUCHEN,
                component: UnternehmenSuchenPageComponent,
                data: { title: UnternehmenTitles.FACHBERATUNG_SUCHEN, formNumber: StesFormNumberEnum.UNTERNEHMEN_SUCHEN, type: UnternehmenTypes.FACHBERATUNG }
            },
            {
                path: UnternehmenPaths.ERFASSEN,
                component: UnternehmenErfassenPageComponent,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        component: WizardStandortadresseComponent,
                        canActivate: [PermissionGuard],
                        canDeactivate: [CanDeactivateGuard],
                        data: {
                            title: UnternehmenTitles.WIZARD_STANDORTADRESSE,
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_ERFASSEN],
                            formNumber: StesFormNumberEnum.UNTERNEHMEN_ERFASSEN
                        }
                    },
                    {
                        path: 'step2',
                        component: WizardDoppelerfassungComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: UnternehmenTitles.WIZARD_DOPPELERFASSUNG,
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_ERFASSEN],
                            formNumber: StesFormNumberEnum.UNTERNEHMEN_DOPPELERFASSUNG
                        }
                    }
                ],
                data: { title: UnternehmenTitles.FACHBERATUNG_ERFASSEN, type: UnternehmenTypes.FACHBERATUNG }
            },
            {
                path: UnternehmenPaths.KONTAKTPERSON_SUCHEN,
                component: KontaktpersonSuchenPageComponent,
                data: { title: UnternehmenTitles.KONTAKTPERSON_SUCHEN, formNumber: StesFormNumberEnum.KONTAKTPERSON_SUCHEN, type: UnternehmenTypes.FACHBERATUNG }
            },
            {
                path: 'fachberatungsangebote/suchen',
                component: FachberatungsangeboteSuchenComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: UnternehmenSideNavLabels.FACHBERATUNGSANGEBOTE_SUCHEN,
                    formNumber: StesFormNumberEnum.FACHBERATUNGSANGEBOTE_SUCHEN,
                    permissions: [Permissions.FEATURE_33, Permissions.STES_FACHBERATUNG_SUCHEN]
                }
            },
            {
                path: ':unternehmenId',
                component: MainContainerPageComponent,
                data: { type: UnternehmenTypes.FACHBERATUNG },
                children: [
                    { path: '', redirectTo: 'adressdaten', pathMatch: 'full' },
                    {
                        path: 'adressdaten',
                        component: AdressdatenPageComponent,
                        canActivate: [PermissionGuard],
                        canDeactivate: [CanDeactivateGuard],
                        data: {
                            title: UnternehmenSideNavLabels.ADRESSDATEN,
                            formNumber: StesFormNumberEnum.UNTERNEHMEN_ADRESSDATEN,
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_SUCHEN]
                        }
                    },
                    {
                        path: 'fachberatungsangebote',
                        component: FachberatungsangeboteComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: UnternehmenSideNavLabels.FACHBERATUNGSANGEBOTE,
                            formNumber: StesFormNumberEnum.FACHBERATUNGSANGEBOTE_ANZEIGEN,
                            permissions: [Permissions.FEATURE_33, Permissions.STES_FACHBERATUNG_SUCHEN]
                        }
                    },
                    {
                        path: 'fachberatungsangebote/erfassen',
                        component: FachberatungsangebotErfassenComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: UnternehmenSideNavLabels.FACHBERATUNGSANGEBOTE,
                            formNumber: StesFormNumberEnum.FACHBERATUNGSANGEBOT_ERFASSEN,
                            permissions: [Permissions.FEATURE_33, Permissions.STES_FACHBERATUNG_BEARBEITEN]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    },
                    {
                        path: 'fachberatungsangebote/bearbeiten',
                        component: FachberatungsangebotErfassenComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: UnternehmenSideNavLabels.FACHBERATUNGSANGEBOTE,
                            formNumber: StesFormNumberEnum.FACHBERATUNGSANGEBOT_BEARBEITEN,
                            permissions: [Permissions.FEATURE_33, Permissions.STES_FACHBERATUNG_SUCHEN]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    },
                    {
                        path: 'zertifikate',
                        component: AdressdatenPageComponent,
                        data: {
                            title: UnternehmenSideNavLabels.ZERTIFIKATE
                        }
                    },
                    {
                        path: 'kontaktpersonen',
                        component: KontaktpersonenPageComponent,
                        data: {
                            title: UnternehmenSideNavLabels.KONTAKTPERSONEN,
                            formNumber: StesFormNumberEnum.KONTAKTPERSONEN_ANZEIGEN,
                            type: UnternehmenTypes.FACHBERATUNG,
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTPERSON_SUCHEN]
                        }
                    },
                    {
                        path: 'kontaktpersonen/erfassen',
                        component: KontaktPersonErfassenPageComponent,
                        data: {
                            title: UnternehmenSideNavLabels.KONTAKTPERSON_ERFASSEN,
                            formNumber: StesFormNumberEnum.KONTAKTPERSON_ERFASSEN,
                            type: UnternehmenTypes.FACHBERATUNG,
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTPERSON_BEARBEITEN]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    },
                    {
                        path: 'kontaktpersonen/bearbeiten',
                        component: KontaktPersonErfassenPageComponent,
                        data: {
                            title: UnternehmenSideNavLabels.KONTAKTPERSON_BEARBEITEN,
                            formNumber: StesFormNumberEnum.KONTAKTPERSON_BEARBEITEN,
                            type: UnternehmenTypes.FACHBERATUNG,
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTPERSON_SUCHEN]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    },
                    {
                        path: 'kundenberater',
                        component: KundenberaterPageComponent,
                        data: {
                            title: UnternehmenSideNavLabels.KUNDENBERATER,
                            formNumber: StesFormNumberEnum.KUNDENBERATER,
                            type: UnternehmenTypes.ARBEITGEBER,
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_BENUTZER_SICHTEN]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    },
                    {
                        path: 'kontakte',
                        component: KontaktePageComponent,
                        data: {
                            title: UnternehmenSideNavLabels.KONTAKTE,
                            formNumber: StesFormNumberEnum.KONTAKTE_ANZEIGEN,
                            type: UnternehmenTypes.FACHBERATUNG,
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTE_SICHTEN]
                        }
                    },
                    {
                        path: 'kontakte/erfassen',
                        component: KontaktErfassenPageComponent,
                        data: {
                            title: UnternehmenSideNavLabels.KONTAKT_ERFASSEN,
                            formNumber: StesFormNumberEnum.KONTAKT_ERFASSEN,
                            type: UnternehmenTypes.FACHBERATUNG,
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTE_BEARBEITEN]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    },
                    {
                        path: 'kontakte/bearbeiten',
                        component: KontaktErfassenPageComponent,
                        data: {
                            title: UnternehmenSideNavLabels.KONTAKT_BEARBEITEN,
                            formNumber: StesFormNumberEnum.KONTAKT_BEARBEITEN,
                            type: UnternehmenTypes.FACHBERATUNG,
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTE_SICHTEN]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    },
                    {
                        path: 'bur-daten',
                        component: BurDatenAnzeigenPageComponent,
                        data: {
                            title: UnternehmenSideNavLabels.BUR_DATEN,
                            formNumber: StesFormNumberEnum.BUR_DATEN_ANZEIGEN,
                            type: UnternehmenTypes.FACHBERATUNG,
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_BURDATEN_BFSMITTEILUNG]
                        }
                    },
                    {
                        path: 'mutationsantraege',
                        component: MutationsantraegeAnzeigenPageComponent,
                        data: {
                            title: 'unternehmen.label.mutationsantraege',
                            formNumber: StesFormNumberEnum.MUTATIONSANTRAEGE,
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_BURMUTATIONEN_SICHTEN]
                        }
                    },
                    {
                        path: 'mutationsantraege/bearbeiten',
                        component: MutationsantragSichtenPageComponent,
                        data: {
                            title: 'unternehmen.label.mutationsantrag',
                            formNumber: StesFormNumberEnum.DETAIL_MUTATION,
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_BURMUTATIONEN_SICHTEN]
                        }
                    },
                    {
                        path: 'mitteilungen',
                        component: MitteilungenAnzeigenPageComponent,
                        data: {
                            title: 'unternehmen.label.mitteilungen',
                            formNumber: StesFormNumberEnum.BUR_MITTEILUNGEN,
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_BURMUTATIONEN_SICHTEN]
                        }
                    },
                    {
                        path: 'mitteilungen/bearbeiten',
                        component: MitteilungAnzeigenPageComponent,
                        data: {
                            title: 'unternehmen.label.mitteilung',
                            formNumber: StesFormNumberEnum.BUR_MITTEILUNG,
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_BURMUTATIONEN_SICHTEN]
                        }
                    },
                    {
                        path: 'aufgaben',
                        component: FachberatungsstelleAufgabenAnzeigenPageComponent,
                        data: {
                            title: UnternehmenTitles.UNTERNEHMEN_AUFGABEN,
                            formNumber: StesFormNumberEnum.FACHBERATUNG_AUFGABEN_ANZEIGEN,
                            type: UnternehmenTypes.FACHBERATUNG,
                            permissions: [Permissions.FEATURE_33, Permissions.GEKO_AUFGABEN_SUCHEN]
                        }
                    },
                    {
                        path: 'aufgaben/erfassen',
                        component: AufgabenErfassenPageComponent,
                        data: {
                            title: UnternehmenTitles.UNTERNEHMEN_AUFGABE_ERFASSEN,
                            formNumber: StesFormNumberEnum.FACHBERATUNG_AUFGABE_ERFASSEN,
                            type: UnternehmenTypes.FACHBERATUNG,
                            mode: FormModeEnum.CREATE,
                            permissions: [Permissions.FEATURE_33, Permissions.GEKO_AUFGABEN_ERFASSEN]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    },
                    {
                        path: 'aufgaben/bearbeiten',
                        component: AufgabenErfassenPageComponent,
                        data: {
                            title: UnternehmenTitles.UNTERNEHMEN_AUFGABE_BEARBEITEN,
                            formNumber: StesFormNumberEnum.FACHBERATUNG_AUFGABE_BEARBEITEN,
                            type: UnternehmenTypes.FACHBERATUNG,
                            mode: FormModeEnum.EDIT,
                            permissions: [Permissions.FEATURE_33, Permissions.GEKO_AUFGABEN_BEARBEITEN]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    },
                    {
                        path: 'meldungen',
                        component: MeldungenPageComponent,
                        data: {
                            title: UnternehmenTitles.UNTERNEHMEN_MELDUNGEN,
                            formNumber: StesFormNumberEnum.FACHBERATUNGSSTELLE_MELDUNGEN,
                            type: UnternehmenTypes.FACHBERATUNG,
                            permissions: [Permissions.FEATURE_33, Permissions.GEKO_MELDUNGEN_SUCHEN]
                        }
                    }
                ]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(stesRoutes)],
    exports: [RouterModule]
})
export class StesRoutingModule {}
