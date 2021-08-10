import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { ArbeitgeberDetailsRoutingModule } from './arbeitgeber-details-routing.module';
import { MainContainerPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/main-container-page/main-container-page.component';
import { UnternehmenErfassenPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-erfassen-page/unternehmen-erfassen-page.component';
import { UnternehmenSuchenPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-suchen-page/unternehmen-suchen-page.component';
import { KontaktpersonSuchenPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/kontaktperson-suchen-page/kontaktperson-suchen-page.component';
import { AdressdatenPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/adressdaten-page/adressdaten-page.component';
import { KontaktpersonenPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/kontaktpflege/kontaktpersonen/kontaktpersonen-page.component';
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
import { MutationsantragSichtenPageComponent } from './pages/bur-bfs/mutationsantrag-sichten-page/mutationsantrag-sichten-page.component';
import { MitteilungenAnzeigenPageComponent } from './pages/bur-bfs/mitteilung/mitteilungen-anzeigen-page/mitteilungen-anzeigen-page.component';
import { MitteilungAnzeigenPageComponent } from './pages/bur-bfs/mitteilung/mitteilung-anzeigen-page/mitteilung-anzeigen-page.component';
import { ArbeitgeberAkquisitionComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/kontaktpflege/akquisition/arbeitgeber-akquisition.component';
import { GeschaeftsStatistikComponent } from './pages/unternehmen-details/geschaefts-statistik/geschaefts-statistik.component';
import { CdkTableModule } from '@angular/cdk/table';
import { BerufeTaetigkeitComponent } from './pages/kontaktpflege/berufe-taetigkeit/berufe-taetigkeit.component';
import { BeruftaetigkeitErfassenBearbeitenComponent } from './pages/kontaktpflege/beruftaetigkeit-erfassen-bearbeiten/beruftaetigkeit-erfassen-bearbeiten.component';
import { GeschlechtPipe } from '@app/shared';
import { VoranmeldungenComponent } from './pages/unternehmen-details/voranmeldungen/voranmeldungen.component';
import { VoranmeldungErfassenComponent } from './pages/unternehmen-details/voranmeldung-erfassen/voranmeldung-erfassen.component';
import { SchnellzuweisungenComponent } from './pages/unternehmen-details/schnellzuweisungen/schnellzuweisungen.component';
import { VoranmeldungenTableComponent } from './components/voranmeldungen-table/voranmeldungen-table.component';
import { SchnellzuweisungenBearbeitenPageComponent } from './pages/unternehmen-details/schnellzuweisungen-bearbeiten-page/schnellzuweisungen-bearbeiten-page.component';
import { VermittlungenComponent } from './pages/unternehmen-details/stellenangebote/vermittlung/vermittlungen/vermittlungen.component';
// prettier-ignore
import {
    StellenangeboteVermittlungBearbeitenComponent
} from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/vermittlung/vermittlung-bearbeiten/stellenangebote-vermittlung-bearbeiten.component';
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
// prettier-ignore
import {
    OsteZuweisungSuchenResultsComponent
} from './pages/unternehmen-details/stellenangebote/vermittlung/erfassen/pages/oste-suchen-zuweisung/oste-zuweisung-suchen-results/oste-zuweisung-suchen-results.component';
import { MatchingprofilComponent } from './pages/unternehmen-details/stellenangebote/matchinprofil/matchingprofil.component';
import { StellenangeboteComponent } from './pages/unternehmen-details/stellenangebote/stellenangebote.component';
import { StellenangebotDetailComponent } from './pages/unternehmen-details/stellenangebote/stellenangebot-detail/stellenangebot-detail.component';
import { SweMeldungenComponent } from './pages/unternehmen-details/swe-meldungen/swe-meldungen.component';
import { StellenAngeboteTableComponent } from './pages/unternehmen-details/stellenangebote/vermittlung/stellen-angebote-table/stellen-angebote-table.component';
import { OsteErfassenWizardComponent } from './pages/unternehmen-details/stellenangebote/erfassen/wizard/oste-erfassen-wizard/oste-erfassen-wizard.component';
import { Step1OsteErfassenWizardComponent } from './pages/unternehmen-details/stellenangebote/erfassen/pages/step1-oste-erfassen-wizard/step1-oste-erfassen-wizard.component';
import { Step2OsteErfassenWizardComponent } from './pages/unternehmen-details/stellenangebote/erfassen/pages/step2-oste-erfassen-wizard/step2-oste-erfassen-wizard.component';
import { Step3OsteErfassenWizardComponent } from './pages/unternehmen-details/stellenangebote/erfassen/pages/step3-oste-erfassen-wizard/step3-oste-erfassen-wizard.component';
import { Step4OsteErfassenWizardComponent } from './pages/unternehmen-details/stellenangebote/erfassen/pages/step4-oste-erfassen-wizard/step4-oste-erfassen-wizard.component';
import { WizardErfassenService } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/erfassen/wizard/wizard-erfassen.service';
import { SweMeldungenTableComponent } from './components/swe-meldungen-table/swe-meldungen-table.component';

// prettier-ignore
import {
    MatchingprofilAnzeigenTableComponent
} from './pages/unternehmen-details/stellenangebote/matchinprofil/matchingprofil-anzeigen-table/matchingprofil-anzeigen-table.component';
import { BetriebsabteilungenComponent } from './pages/unternehmen-details/betriebsabteilungen/betriebsabteilungen.component';

import { MatchingWizardComponent } from './pages/unternehmen-details/stellenangebote/matchinprofil/vermittlung-erfassen/matching-wizard/matching-wizard.component';
// prettier-ignore
import {
    MatchingProfilvergleichPageComponent
} from './pages/unternehmen-details/stellenangebote/matchinprofil/vermittlung-erfassen/pages/matching-profilvergleich-page/matching-profilvergleich-page.component';
// prettier-ignore
import {
    MatchingFertigstellenPageComponent
} from './pages/unternehmen-details/stellenangebote/matchinprofil/vermittlung-erfassen/pages/matching-fertigstellen-page/matching-fertigstellen-page.component';
import { SweMeldungErfassenComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/swe-meldung-erfassen/swe-meldung-erfassen.component';
import { BewirtschaftungComponent } from './pages/unternehmen-details/stellenangebote/bewirtschaftung/bewirtschaftung.component';
import { RahmenfristenComponent } from './pages/unternehmen-details/rahmenfristen/rahmenfristen.component';
import { RahmenfristenKaeSweTableComponent } from './components/rahmenfristen-kae-swe-table/rahmenfristen-kae-swe-table.component';
import { RahmenfristZahlungenComponent } from './pages/unternehmen-details/rahmenfrist-zahlungen/rahmenfrist-zahlungen.component';
import { DetailsProRahmenfristComponent } from './pages/unternehmen-details/details-pro-rahmenfrist/details-pro-rahmenfrist.component';
import { BasisangabenComponent } from './pages/unternehmen-details/stellenangebote/basisangaben/basisangaben.component';
import { DetailsProRahmenfristTableComponent } from './pages/unternehmen-details/details-pro-rahmenfrist/details-pro-rahmenfrist-table/details-pro-rahmenfrist-table.component';
import { RahmenfristZahlungenTableComponent } from './pages/unternehmen-details/rahmenfrist-zahlungen/rahmenfrist-zahlungen-table/rahmenfrist-zahlungen-table.component';
import { BewerbungComponent } from './pages/unternehmen-details/stellenangebote/bewerbung/bewerbung.component';
import { RahmenfristKaeSweComponent } from './pages/unternehmen-details/rahmenfrist-kae-swe/rahmenfrist-kae-swe.component';
import { AnforderungenComponent } from './pages/unternehmen-details/stellenangebote/anforderungen/anforderungen.component';
import { RahmenfristKaeSweFormComponent } from './components/rahmenfrist-kae-swe-form/rahmenfrist-kae-swe-form.component';
import { RahmenfristKaeSweZahlungenComponent } from './pages/unternehmen-details/rahmenfrist-kae-swe-zahlungen/rahmenfrist-kae-swe-zahlungen.component';
// prettier-ignore
import {
    RahmenfristKaeSweZahlungenTableComponent
} from './pages/unternehmen-details/rahmenfrist-kae-swe-zahlungen/rahmenfrist-kae-swe-zahlungen-table/rahmenfrist-kae-swe-zahlungen-table.component';
import { AvamAlkZahlstelleAutosuggestModule } from '@app/library/wrappers/form/autosuggests/avam-alk-zahlstelle-autosuggest/avam-alk-zahlstelle-autosuggest.module';
import { BetriebsabteilungenTableComponent } from './pages/unternehmen-details/betriebsabteilungen/betriebsabteilungen-table.component';
// prettier-ignore
import {
    SweMeldungArbeitsstellenTableComponent
} from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/swe-meldung-erfassen/swe-meldung-arbeitsstellen-table.component';
import { MeldungenPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/geschaeftskontrolle/meldungen/meldungen-page.component';
// prettier-ignore
import {
    ArbeitgeberAufgabenAnzeigenPageComponent
} from '@modules/arbeitgeber/arbeitgeber-details/pages/geschaeftskontrolle/aufgaben/arbeitgeber-aufgaben-anzeigen-page.component';
import { GeschaeftePageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/geschaeftskontrolle/geschaefte/geschaefte-page.component';
import { AufgabenErfassenPageComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/geschaeftskontrolle/aufgaben-erfassen/aufgaben-erfassen-page.component';

@NgModule({
    declarations: [
        MainContainerPageComponent,
        UnternehmenErfassenPageComponent,
        UnternehmenSuchenPageComponent,
        KontaktpersonSuchenPageComponent,
        AdressdatenPageComponent,
        KontaktpersonenPageComponent,
        KontaktPersonErfassenPageComponent,
        KontaktePageComponent,
        KontaktErfassenPageComponent,
        KundenberaterPageComponent,
        BurDatenAnzeigenPageComponent,
        MutationsantraegeAnzeigenPageComponent,
        MutationsantragSichtenPageComponent,
        MitteilungenAnzeigenPageComponent,
        MitteilungAnzeigenPageComponent,
        ArbeitgeberAkquisitionComponent,
        GeschaeftsStatistikComponent,
        BerufeTaetigkeitComponent,
        BeruftaetigkeitErfassenBearbeitenComponent,
        VoranmeldungenComponent,
        VoranmeldungErfassenComponent,
        SweMeldungErfassenComponent,
        SweMeldungArbeitsstellenTableComponent,
        SchnellzuweisungenComponent,
        VoranmeldungenTableComponent,
        StellenangeboteVermittlungBearbeitenComponent,
        SchnellzuweisungenBearbeitenPageComponent,
        VermittlungenComponent,
        OsteZuweisungErfassenWizardComponent,
        OsteSuchenZuweisungErfassenComponent,
        OsteProfilVergleichPageComponent,
        OsteVermittlungFertigstellenPageComponent,
        OsteZuweisungSuchenResultsComponent,
        MatchingprofilComponent,
        StellenangeboteComponent,
        StellenangebotDetailComponent,
        StellenAngeboteTableComponent,
        SweMeldungenTableComponent,
        SweMeldungenComponent,
        BetriebsabteilungenComponent,
        OsteErfassenWizardComponent,
        Step1OsteErfassenWizardComponent,
        Step2OsteErfassenWizardComponent,
        Step3OsteErfassenWizardComponent,
        Step4OsteErfassenWizardComponent,
        MatchingprofilAnzeigenTableComponent,
        MatchingWizardComponent,
        MatchingProfilvergleichPageComponent,
        MatchingFertigstellenPageComponent,
        BewirtschaftungComponent,
        RahmenfristenComponent,
        RahmenfristenKaeSweTableComponent,
        RahmenfristZahlungenComponent,
        DetailsProRahmenfristComponent,
        BasisangabenComponent,
        DetailsProRahmenfristTableComponent,
        RahmenfristZahlungenTableComponent,
        BewerbungComponent,
        RahmenfristKaeSweComponent,
        AnforderungenComponent,
        RahmenfristKaeSweFormComponent,
        RahmenfristKaeSweZahlungenComponent,
        RahmenfristKaeSweZahlungenTableComponent,
        BetriebsabteilungenTableComponent,
        MeldungenPageComponent,
        ArbeitgeberAufgabenAnzeigenPageComponent,
        GeschaeftePageComponent,
        AufgabenErfassenPageComponent
    ],
    imports: [CommonModule, ArbeitgeberDetailsRoutingModule, ReactiveFormsModule, FormsModule, SharedModule, CdkTableModule, AvamAlkZahlstelleAutosuggestModule],
    providers: [GeschlechtPipe, WizardErfassenService]
})
export class ArbeitgeberDetailsModule {}
