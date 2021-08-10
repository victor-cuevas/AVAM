import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '@app/core/guards/permission.guard';
import { WizardDoppelerfassungComponent } from '@app/shared/components/unternehmen/erfassen/wizard-doppelerfassung/wizard-doppelerfassung.component';
import { WizardStandortadresseComponent } from '@app/shared/components/unternehmen/erfassen/wizard-standortadresse/wizard-standortadresse.component';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { ArbeitgeberPaths, UnternehmenPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { UnternehmenTitles, UnternehmenTypes } from '@app/shared/enums/unternehmen.enum';
import { Permissions } from '@shared/enums/permissions.enum';
import { CanDeactivateGuard } from '@shared/services/can-deactive-guard.service';
import { UnternehmenErfassenPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-erfassen-page/unternehmen-erfassen-page.component';
import { MainContainerPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/main-container-page/main-container-page.component';
import { UnternehmenSuchenPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-suchen-page/unternehmen-suchen-page.component';
import { AdressdatenPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/adressdaten-page/adressdaten-page.component';
import { KontaktpersonenPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/kontaktpflege/kontaktpersonen/kontaktpersonen-page.component';
import { KontaktpersonSuchenPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/kontaktperson-suchen-page/kontaktperson-suchen-page.component';
// prettier-ignore
import {
    KontaktPersonErfassenPageComponent
} from '@modules/arbeitgeber/arbeitgeber-details/pages/kontaktpflege/kontaktpersonen/kontakt-person-erfassen-page/kontakt-person-erfassen-page.component';
import { KontaktePageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/kontaktpflege/kontakte/kontakte-page.component';
import { KontaktErfassenPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/kontaktpflege/kontakte/kontakt-erfassen-page/kontakt-erfassen-page.component';
import { BurDatenAnzeigenPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/bur-bfs/bur-daten-anzeigen-page/bur-daten-anzeigen-page.component';
// prettier-ignore
import {
    MutationsantraegeAnzeigenPageComponent
} from '@modules/arbeitgeber/arbeitgeber-details/pages/bur-bfs/mutationsantraege-anzeigen-page/mutationsantraege-anzeigen-page.component';
import { KundenberaterPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/kontaktpflege/kundenberater/kundenberater-page.component';
import { MutationsantragSichtenPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/bur-bfs/mutationsantrag-sichten-page/mutationsantrag-sichten-page.component';
// prettier-ignore
import {
    MitteilungenAnzeigenPageComponent
} from '@modules/arbeitgeber/arbeitgeber-details/pages/bur-bfs/mitteilung/mitteilungen-anzeigen-page/mitteilungen-anzeigen-page.component';
import { MitteilungAnzeigenPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/bur-bfs/mitteilung/mitteilung-anzeigen-page/mitteilung-anzeigen-page.component';
import { ArbeitgeberAkquisitionComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/kontaktpflege/akquisition/arbeitgeber-akquisition.component';
import { GeschaeftsStatistikComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/geschaefts-statistik/geschaefts-statistik.component';
import { BerufeTaetigkeitComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/kontaktpflege/berufe-taetigkeit/berufe-taetigkeit.component';
import { VoranmeldungenComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/voranmeldungen/voranmeldungen.component';
// prettier-ignore
import {
    BeruftaetigkeitErfassenBearbeitenComponent
} from '@modules/arbeitgeber/arbeitgeber-details/pages/kontaktpflege/beruftaetigkeit-erfassen-bearbeiten/beruftaetigkeit-erfassen-bearbeiten.component';
import { VoranmeldungErfassenComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/voranmeldung-erfassen/voranmeldung-erfassen.component';
import { SchnellzuweisungenComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/schnellzuweisungen/schnellzuweisungen.component';
// prettier-ignore
import {
    StellenangeboteVermittlungBearbeitenComponent
} from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/vermittlung/vermittlung-bearbeiten/stellenangebote-vermittlung-bearbeiten.component';
// prettier-ignore
import {
    SchnellzuweisungenBearbeitenPageComponent
} from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/schnellzuweisungen-bearbeiten-page/schnellzuweisungen-bearbeiten-page.component';
import { VermittlungenComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/vermittlung/vermittlungen/vermittlungen.component';
import { OsteLabels, VermittlungLabels } from '@shared/enums/stes-routing-labels.enum';
// prettier-ignore
import {
    OsteZuweisungErfassenWizardComponent
} from './pages/unternehmen-details/stellenangebote/vermittlung/erfassen/wizard/oste-zuweisung-erfassen-wizard/oste-zuweisung-erfassen-wizard.component';
// prettier-ignore
import {
    OsteSuchenZuweisungErfassenComponent
} from './pages/unternehmen-details/stellenangebote/vermittlung/erfassen/pages/oste-suchen-zuweisung/oste-suchen-zuweisung-erfassen/oste-suchen-zuweisung-erfassen.component';
// prettier-ignore
import {
    OsteProfilVergleichPageComponent
} from './pages/unternehmen-details/stellenangebote/vermittlung/erfassen/pages/oste-profil-vergleich-page/oste-profil-vergleich-page.component';
// prettier-ignore
import {
    OsteVermittlungFertigstellenPageComponent
} from './pages/unternehmen-details/stellenangebote/vermittlung/erfassen/pages/oste-vermittlung-fertigstellen-page/oste-vermittlung-fertigstellen-page.component';

import { MatchingprofilComponent } from './pages/unternehmen-details/stellenangebote/matchinprofil/matchingprofil.component';
import { StellenangeboteComponent } from './pages/unternehmen-details/stellenangebote/stellenangebote.component';
import { StellenangebotDetailComponent } from './pages/unternehmen-details/stellenangebote/stellenangebot-detail/stellenangebot-detail.component';
import { SweMeldungenComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/swe-meldungen/swe-meldungen.component';
// prettier-ignore
import {
    OsteErfassenWizardComponent
} from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/erfassen/wizard/oste-erfassen-wizard/oste-erfassen-wizard.component';
// prettier-ignore
import {
    Step1OsteErfassenWizardComponent
} from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/erfassen/pages/step1-oste-erfassen-wizard/step1-oste-erfassen-wizard.component';
// prettier-ignore
import {
    Step2OsteErfassenWizardComponent
} from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/erfassen/pages/step2-oste-erfassen-wizard/step2-oste-erfassen-wizard.component';
// prettier-ignore
import {
    Step3OsteErfassenWizardComponent
} from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/erfassen/pages/step3-oste-erfassen-wizard/step3-oste-erfassen-wizard.component';
// prettier-ignore
import {
    Step4OsteErfassenWizardComponent
} from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/erfassen/pages/step4-oste-erfassen-wizard/step4-oste-erfassen-wizard.component';
import { BetriebsabteilungenComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/betriebsabteilungen/betriebsabteilungen.component';
// prettier-ignore
import {
    MatchingWizardComponent
} from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/matchinprofil/vermittlung-erfassen/matching-wizard/matching-wizard.component';
// prettier-ignore
import {
    MatchingProfilvergleichPageComponent
} from './pages/unternehmen-details/stellenangebote/matchinprofil/vermittlung-erfassen/pages/matching-profilvergleich-page/matching-profilvergleich-page.component';
// prettier-ignore
import {
    MatchingFertigstellenPageComponent
} from './pages/unternehmen-details/stellenangebote/matchinprofil/vermittlung-erfassen/pages/matching-fertigstellen-page/matching-fertigstellen-page.component';
import { SweMeldungErfassenComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/swe-meldung-erfassen/swe-meldung-erfassen.component';
import { BewirtschaftungComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/bewirtschaftung/bewirtschaftung.component';
import { RahmenfristenComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/rahmenfristen/rahmenfristen.component';
import { BasisangabenComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/basisangaben/basisangaben.component';
import { BewerbungComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/bewerbung/bewerbung.component';
import { RahmenfristKaeSweComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/rahmenfrist-kae-swe/rahmenfrist-kae-swe.component';
import { AnforderungenComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/anforderungen/anforderungen.component';
// prettier-ignore
import {
    RahmenfristKaeSweZahlungenComponent
} from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/rahmenfrist-kae-swe-zahlungen/rahmenfrist-kae-swe-zahlungen.component';
import { ArbeitgeberAufgabenAnzeigenPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/geschaeftskontrolle/aufgaben/arbeitgeber-aufgaben-anzeigen-page.component';
import { MeldungenPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/geschaeftskontrolle/meldungen/meldungen-page.component';
import { GeschaeftePageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/geschaeftskontrolle/geschaefte/geschaefte-page.component';
import { AufgabenErfassenPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/geschaeftskontrolle/aufgaben-erfassen/aufgaben-erfassen-page.component';
import { FormModeEnum } from '@shared/enums/form-mode.enum';

const arbeitgeberDetailsRoutes: Routes = [
    {
        path: UnternehmenPaths.SUCHEN,
        component: UnternehmenSuchenPageComponent,
        data: { title: UnternehmenTitles.ARBEITGEBER_SUCHEN, formNumber: StesFormNumberEnum.UNTERNEHMEN_SUCHEN, type: UnternehmenTypes.ARBEITGEBER }
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
        data: { title: UnternehmenTitles.ARBEITGEBER_ERFASSEN, type: UnternehmenTypes.ARBEITGEBER }
    },
    {
        path: ':unternehmenId/stellenangebote/stellenangebot/vermittlungen/erfassen',
        component: OsteZuweisungErfassenWizardComponent,
        data: {
            permissions: [Permissions.FEATURE_33, Permissions.STES_VM_ZUWEISUNG_BEARBEITEN]
        },
        canActivate: [PermissionGuard],
        children: [
            { path: '', redirectTo: 'step1', pathMatch: 'full' },
            {
                path: 'step1',
                component: OsteSuchenZuweisungErfassenComponent,
                data: {
                    title: VermittlungLabels.VERMITTLUNG_STELLEANGEBOT_SUCHEN,
                    permissions: [Permissions.FEATURE_33, Permissions.STES_VM_ZUWEISUNG_BEARBEITEN],
                    formNumber: StesFormNumberEnum.OSTE_VERMITTLUNG_ERFASSEN
                },
                canActivate: [PermissionGuard]
            },
            {
                path: 'step2',
                component: OsteProfilVergleichPageComponent,
                data: {
                    title: VermittlungLabels.VERMITTLUNG_PROFILDATEN_VERGLEICHEN,
                    permissions: [Permissions.FEATURE_33, Permissions.STES_VM_ZUWEISUNG_BEARBEITEN],
                    formNumber: StesFormNumberEnum.OSTE_PROFILVERGLEICH_ANZEIGEN
                },
                canActivate: [PermissionGuard]
            },
            {
                path: 'step3',
                component: OsteVermittlungFertigstellenPageComponent,
                data: {
                    title: VermittlungLabels.VERMITTLUNG_FERTIGSTELLEN,
                    permissions: [Permissions.FEATURE_33, Permissions.STES_VM_ZUWEISUNG_BEARBEITEN],
                    formNumber: StesFormNumberEnum.OSTE_VERMITTLUNG_FERTIGSTELLEN
                },
                canActivate: [PermissionGuard]
            }
        ]
    },
    {
        path: ':unternehmenId/stellenangebote/erfassen',
        component: OsteErfassenWizardComponent,
        data: {
            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_BEARBEITEN]
        },
        canActivate: [PermissionGuard],
        children: [
            { path: '', redirectTo: 'step1', pathMatch: 'full' },
            {
                path: 'step1',
                component: Step1OsteErfassenWizardComponent,
                data: {
                    title: OsteLabels.ERFASSEN_STEP_1,
                    permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_BEARBEITEN],
                    formNumber: StesFormNumberEnum.ARBEITGEBER_OSTE_ERFASSEN_STEP1
                },
                canActivate: [PermissionGuard],
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'step2',
                component: Step2OsteErfassenWizardComponent,
                data: {
                    title: OsteLabels.ERFASSEN_STEP_2,
                    permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_BEARBEITEN],
                    formNumber: StesFormNumberEnum.ARBEITGEBER_OSTE_ERFASSEN_STEP2
                },
                canActivate: [PermissionGuard],
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'step3',
                component: Step3OsteErfassenWizardComponent,
                data: {
                    title: OsteLabels.ERFASSEN_STEP_3,
                    permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_BEARBEITEN],
                    formNumber: StesFormNumberEnum.ARBEITGEBER_OSTE_ERFASSEN_STEP3
                },
                canActivate: [PermissionGuard],
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'step4',
                component: Step4OsteErfassenWizardComponent,
                data: {
                    title: OsteLabels.ERFASSEN_STEP_4,
                    permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_BEARBEITEN],
                    formNumber: StesFormNumberEnum.ARBEITGEBER_OSTE_ERFASSEN_STEP4
                },
                canActivate: [PermissionGuard],
                canDeactivate: [CanDeactivateGuard]
            }
        ]
    },
    {
        path: ':unternehmenId',
        component: MainContainerPageComponent,
        data: { type: UnternehmenTypes.ARBEITGEBER },
        children: [
            { path: '', redirectTo: 'adressdaten', pathMatch: 'full' },
            {
                path: 'adressdaten',
                component: AdressdatenPageComponent,
                canActivate: [PermissionGuard],
                canDeactivate: [CanDeactivateGuard],
                data: {
                    title: UnternehmenTitles.ARBEITGEBER_ADRESSDATEN,
                    formNumber: StesFormNumberEnum.UNTERNEHMEN_ADRESSDATEN,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_SUCHEN]
                }
            },
            {
                path: 'kontaktpersonen',
                component: KontaktpersonenPageComponent,
                data: {
                    title: UnternehmenTitles.ARBEITGEBER_KONTAKTPERSONEN,
                    formNumber: StesFormNumberEnum.KONTAKTPERSONEN_ANZEIGEN,
                    type: UnternehmenTypes.ARBEITGEBER,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTPERSON_SUCHEN]
                }
            },
            {
                path: 'kontaktpersonen/erfassen',
                component: KontaktPersonErfassenPageComponent,
                data: {
                    title: UnternehmenTitles.ARBEITGEBER_KONTAKTPERSONEN_ERFASSEN,
                    formNumber: StesFormNumberEnum.KONTAKTPERSON_ERFASSEN,
                    type: UnternehmenTypes.ARBEITGEBER,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTPERSON_BEARBEITEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'kontaktpersonen/bearbeiten',
                component: KontaktPersonErfassenPageComponent,
                data: {
                    title: UnternehmenTitles.ARBEITGEBER_KONTAKTPERSON_BEARBEITEN,
                    formNumber: StesFormNumberEnum.KONTAKTPERSON_BEARBEITEN,
                    type: UnternehmenTypes.ARBEITGEBER,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTPERSON_SUCHEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'kundenberater',
                component: KundenberaterPageComponent,
                data: {
                    title: UnternehmenTitles.ARBEITGEBER_KUNDENBERATER,
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
                    title: UnternehmenTitles.ARBEITGEBER_KONTAKTE,
                    formNumber: StesFormNumberEnum.KONTAKTE_ANZEIGEN,
                    type: UnternehmenTypes.ARBEITGEBER,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTE_SICHTEN]
                }
            },
            {
                path: 'kontakte/erfassen',
                component: KontaktErfassenPageComponent,
                data: {
                    title: UnternehmenTitles.ARBEITGEBER_KONTAKT_ERFASSEN,
                    formNumber: StesFormNumberEnum.KONTAKT_ERFASSEN,
                    type: UnternehmenTypes.ARBEITGEBER,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTE_BEARBEITEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'kontakte/bearbeiten',
                component: KontaktErfassenPageComponent,
                data: {
                    title: UnternehmenTitles.ARBEITGEBER_KONTAKTE,
                    formNumber: StesFormNumberEnum.KONTAKT_BEARBEITEN,
                    type: UnternehmenTypes.ARBEITGEBER,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTE_SICHTEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'bur-daten',
                component: BurDatenAnzeigenPageComponent,
                data: {
                    title: UnternehmenTitles.ARBEITGEBER_BUR_DATEN,
                    formNumber: StesFormNumberEnum.BUR_DATEN_ANZEIGEN,
                    type: UnternehmenTypes.ARBEITGEBER,
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
                path: 'mitteilungen/:mitteilungId',
                component: MitteilungAnzeigenPageComponent,
                data: {
                    title: 'unternehmen.label.mitteilung',
                    formNumber: StesFormNumberEnum.BUR_MITTEILUNG,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_BURMUTATIONEN_SICHTEN]
                }
            },
            {
                path: 'akquisition',
                component: ArbeitgeberAkquisitionComponent,
                data: {
                    title: 'unternehmen.label.akquisition',
                    formNumber: StesFormNumberEnum.KONTAKTFLIEGE_AKQUISITION,
                    permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_ARBEITGEBERDATEN_BEARBEITEN]
                }
            },
            {
                path: 'kurzarbeit',
                redirectTo: 'kurzarbeit/voranmeldungen',
                pathMatch: 'full'
            },
            {
                path: 'kurzarbeit/voranmeldungen',
                component: VoranmeldungenComponent,
                data: {
                    title: UnternehmenTitles.VORANMELDUNGEN_ANZEIGEN,
                    formNumber: StesFormNumberEnum.VORANMELDUNGEN_ANZEIGEN,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KAE_VORANMELDUNG_SUCHEN]
                }
            },
            {
                path: ArbeitgeberPaths.KURZARBEIT_VORANMELDUNGEN_BEARBEITEN,
                component: VoranmeldungErfassenComponent,
                data: {
                    title: UnternehmenTitles.VORANMELDUNGEN_BEARBEITEN,
                    formNumber: StesFormNumberEnum.VORANMELDUNGEN_BEARBEITEN,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KAE_VORANMELDUNG_BEARBEITEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'kurzarbeit/voranmeldungen/erfassen',
                component: VoranmeldungErfassenComponent,
                data: {
                    title: UnternehmenTitles.VORANMELDUNGEN_ERFASSEN,
                    formNumber: StesFormNumberEnum.VORANMELDUNGEN_ERFASSEN,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KAE_VORANMELDUNG_ERFASSEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'schlechtwetter',
                redirectTo: 'schlechtwetter/meldungen',
                pathMatch: 'full'
            },
            {
                path: 'schlechtwetter/meldungen',
                component: SweMeldungenComponent,
                data: {
                    title: UnternehmenTitles.SWE_MELDUNGEN_ANZEIGEN,
                    formNumber: StesFormNumberEnum.SWE_MELDUNGEN_ANZEIGEN,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_SWE_MELDUNG_SUCHEN]
                }
            },
            {
                path: ArbeitgeberPaths.SCHLECHTWETTER_MELDUNGEN_BEARBEITEN,
                component: SweMeldungErfassenComponent,
                data: {
                    title: UnternehmenTitles.SWE_MELDUNG_BEARBEITEN,
                    formNumber: StesFormNumberEnum.SWE_MELDUNG_BEARBEITEN,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_SWE_MELDUNG_BEARBEITEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'schlechtwetter/meldungen/erfassen',
                component: SweMeldungErfassenComponent,
                data: {
                    title: UnternehmenTitles.SWE_MELDUNG_ERFASSEN,
                    formNumber: StesFormNumberEnum.SWE_MELDUNG_ERFASSEN,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_SWE_MELDUNG_ERFASSEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'betriebsabteilungen',
                component: BetriebsabteilungenComponent,
                data: {
                    title: UnternehmenTitles.BETRIEBSABTEILUNGEN,
                    formNumber: StesFormNumberEnum.BETRIEBSABTEILUNGEN,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_SUCHEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'geschaeftsstatistik',
                component: GeschaeftsStatistikComponent,
                data: {
                    title: 'unternehmen.label.geschaeftsstatistik',
                    formNumber: StesFormNumberEnum.UNTERNEHMEN_GESCHAEFTSSTATISTIK,
                    permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_ARBEITGEBERDATEN_BEARBEITEN]
                }
            },
            {
                path: 'berufe-taetigkeit',
                component: BerufeTaetigkeitComponent,
                data: {
                    title: 'arbeitgeber.label.beruf',
                    formNumber: StesFormNumberEnum.BERUFE_TAETIGKEIT,
                    permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_ARBEITGEBERDATEN_BEARBEITEN]
                }
            },
            {
                path: 'berufe-taetigkeit/erfassen',
                component: BeruftaetigkeitErfassenBearbeitenComponent,
                data: {
                    title: 'arbeitgeber.oste.label.beruftaetigkeiterfassen',
                    formNumber: StesFormNumberEnum.BERUF_TAETIGKEIT_ERFASSEN,
                    permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_ARBEITGEBERDATEN_BEARBEITEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'berufe-taetigkeit/bearbeiten',
                component: BeruftaetigkeitErfassenBearbeitenComponent,
                data: {
                    title: 'arbeitgeber.label.beruf',
                    formNumber: StesFormNumberEnum.BERUF_TAETIGKEIT_BEARBEITEN,
                    permissions: [Permissions.FEATURE_33]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'schnellzuweisungen',
                component: SchnellzuweisungenComponent,
                data: {
                    title: 'unternehmen.subnavmenuitem.schnellzuweisungen',
                    formNumber: StesFormNumberEnum.SCHNELLZUWEISUNGEN,
                    permissions: [Permissions.FEATURE_33, Permissions.STES_SCHNELLZUWEISUNG_ANZEIGEN]
                }
            },
            {
                path: 'schnellzuweisungen/bearbeiten',
                component: SchnellzuweisungenBearbeitenPageComponent,
                data: {
                    title: 'stes.label.schnellzuweisungBearbeiten',
                    formNumber: StesFormNumberEnum.ARBEITGEBER_SCHNELLZUWEISUNG_BEARBEITEN,
                    permissions: [Permissions.FEATURE_33, Permissions.STES_SCHNELLZUWEISUNG_ANZEIGEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'rahmenfristen',
                component: RahmenfristenComponent,
                data: {
                    title: UnternehmenTitles.RAHMENFRISTEN,
                    formNumber: StesFormNumberEnum.RAHMENFRISTEN,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KAE_SWE_RAHMENFRISTEN_SUCHEN]
                }
            },
            {
                path: 'rahmenfristen/anzeigen',
                component: RahmenfristKaeSweComponent,
                data: {
                    title: UnternehmenTitles.RAHMENFRIST,
                    formNumber: StesFormNumberEnum.RAHMENFRIST_DETAIL,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KAE_SWE_RAHMENFRISTEN_SUCHEN]
                }
            },
            {
                path: 'rahmenfristen/zahlungen',
                component: RahmenfristKaeSweZahlungenComponent,
                data: {
                    title: UnternehmenTitles.ZAHLUNGEN_KAE_SWE,
                    formNumber: StesFormNumberEnum.RAHMENFRISTEN_KAE_SWE_ZAHLUNGEN,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_RAHMENFRIST_ZAHLUNG_SUCHEN]
                }
            },
            {
                path: 'stellenangebote',
                component: StellenangeboteComponent,
                data: {
                    title: 'stes.label.vermittlung.stellenangebote',
                    formNumber: StesFormNumberEnum.ARBEITGEBER_OSTE_ANZEIGEN,
                    permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_SUCHEN]
                }
            },
            {
                path: 'stellenangebote/stellenangebot',
                component: StellenangebotDetailComponent,
                children: [
                    {
                        path: 'vermittlungen',
                        component: VermittlungenComponent,
                        data: {
                            title: 'arbeitgeber.oste.label.zuweisungen',
                            formNumber: StesFormNumberEnum.STELLENANGEBOT_VERMITTLUNGEN_ANZEIGEN,
                            permissions: [Permissions.FEATURE_33, Permissions.KEY_STES_VM_OSTE_ZUWEISUNG_SUCHEN]
                        }
                    },
                    {
                        path: 'vermittlungen/bearbeiten',
                        component: StellenangeboteVermittlungBearbeitenComponent,
                        data: {
                            title: 'stes.label.vermittlung',
                            formNumber: StesFormNumberEnum.STELLEANGEBOT_VERMITTLUNG,
                            permissions: [Permissions.FEATURE_33, Permissions.KEY_STES_VM_OSTE_ZUWEISUNG_SUCHEN, Permissions.KEY_POPUP_STES_SUCHEN_SICHTEN]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    },
                    {
                        path: 'matchingprofil',
                        component: MatchingprofilComponent,
                        data: {
                            title: 'stes.label.matching',
                            formNumber: StesFormNumberEnum.STELLEANGEBOT_MATCHINGPROFIL,
                            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_SUCHEN]
                        }
                    },
                    {
                        path: 'bewirtschaftung',
                        component: BewirtschaftungComponent,
                        data: {
                            title: 'arbeitgeber.oste.subnavmenuitem.bewirtschaftung',
                            formNumber: StesFormNumberEnum.STELLENANGEBOT_BEWIRTTSCHAFTUNG,
                            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_SUCHEN]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    },
                    {
                        path: 'basisangaben',
                        component: BasisangabenComponent,
                        data: {
                            title: 'arbeitgeber.oste.subnavmenuitem.basisangaben',
                            formNumber: StesFormNumberEnum.STELLENANGEBOT_BASISANGABEN,
                            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_SUCHEN]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    },
                    {
                        path: 'bewerbung',
                        component: BewerbungComponent,
                        data: {
                            title: 'arbeitgeber.oste.subnavmenuitem.bewerbung',
                            formNumber: StesFormNumberEnum.STELLENANGEBOT_BEWERBUNG,
                            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_SUCHEN]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    },
                    {
                        path: 'anforderungen',
                        component: AnforderungenComponent,
                        data: {
                            title: 'arbeitgeber.oste.subnavmenuitem.anforderungen',
                            formNumber: StesFormNumberEnum.STELLENANGEBOT_ANFORDERUNGEN,
                            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_SUCHEN]
                        },
                        canDeactivate: [CanDeactivateGuard]
                    },
                    { path: '', redirectTo: 'bewirtschaftung', pathMatch: 'full' }
                ]
            },
            {
                path: 'aufgaben',
                component: ArbeitgeberAufgabenAnzeigenPageComponent,
                data: {
                    title: UnternehmenTitles.UNTERNEHMEN_AUFGABEN,
                    formNumber: StesFormNumberEnum.ARBEITGEBER_AUFGABEN_ANZEIGEN,
                    type: UnternehmenTypes.ARBEITGEBER,
                    permissions: [Permissions.FEATURE_33, Permissions.GEKO_AUFGABEN_SUCHEN]
                }
            },
            {
                path: 'aufgaben/erfassen',
                component: AufgabenErfassenPageComponent,
                data: {
                    title: UnternehmenTitles.UNTERNEHMEN_AUFGABE_ERFASSEN,
                    formNumber: StesFormNumberEnum.ARBEITGEBER_AUFGABE_ERFASSEN,
                    type: UnternehmenTypes.ARBEITGEBER,
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
                    formNumber: StesFormNumberEnum.ARBEITGEBER_AUFGABE_BEARBEITEN,
                    type: UnternehmenTypes.ARBEITGEBER,
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
                    formNumber: StesFormNumberEnum.ARBEITGEBER_MELDUNGEN,
                    type: UnternehmenTypes.ARBEITGEBER,
                    permissions: [Permissions.FEATURE_33, Permissions.GEKO_MELDUNGEN_SUCHEN]
                }
            },
            {
                path: 'geschaefte',
                component: GeschaeftePageComponent,
                data: {
                    title: UnternehmenTitles.UNTERNEHMEN_GESCHAEFTE,
                    formNumber: StesFormNumberEnum.ARBEITGEBER_GESCHAEFTE,
                    type: UnternehmenTypes.ARBEITGEBER,
                    permissions: [Permissions.FEATURE_33, Permissions.GEKO_MELDUNGEN_SUCHEN, Permissions.GEKO_AUFGABEN_SUCHEN]
                }
            }
        ]
    },
    { path: '', pathMatch: 'full', redirectTo: UnternehmenPaths.SUCHEN },
    {
        path: UnternehmenPaths.KONTAKTPERSON_SUCHEN,
        component: KontaktpersonSuchenPageComponent,
        data: { title: UnternehmenTitles.KONTAKTPERSON_SUCHEN, formNumber: StesFormNumberEnum.KONTAKTPERSON_SUCHEN, type: UnternehmenTypes.ARBEITGEBER }
    },
    {
        path: ':unternehmenId/stellenangebote/stellenangebot/matchingprofil/vermittlung-erfassen',
        component: MatchingWizardComponent,
        children: [
            { path: '', redirectTo: 'step1', pathMatch: 'full' },
            {
                path: 'step1',
                component: MatchingProfilvergleichPageComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: VermittlungLabels.VERMITTLUNG_ERFASSEN,
                    permissions: [Permissions.FEATURE_33, Permissions.STES_VM_ZUWEISUNG_BEARBEITEN],
                    formNumber: StesFormNumberEnum.OSTE_MATCHING_PROFILVERGLEICH
                }
            },
            {
                path: 'step2',
                component: MatchingFertigstellenPageComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: VermittlungLabels.VERMITTLUNG_ERFASSEN,
                    permissions: [Permissions.FEATURE_33, Permissions.STES_VM_ZUWEISUNG_BEARBEITEN],
                    formNumber: StesFormNumberEnum.OSTE_MATCHING_VERMITTLUNG_FERTIGSTELLEN
                }
            }
        ],
        data: { permissions: [Permissions.FEATURE_33, Permissions.STES_VM_ZUWEISUNG_BEARBEITEN] }
    }
];

@NgModule({
    imports: [RouterModule.forChild(arbeitgeberDetailsRoutes)],
    exports: [RouterModule]
})
export class ArbeitgeberDetailsRoutingModule {}
