import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ObliqueModule } from 'oblique-reactive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StesRoutingModule } from './stes-routing.module';
import { StesSearchHomeComponent } from './pages/search/stes-search-home.component';
import { SharedModule } from 'src/app/shared/shared.module';

import { StesDetailsInfoleisteModalComponent, StesInfotagDetailsModalComponent, StesInfotagModalComponent, StesSearchComponent, StesSearchResultComponent } from './components';

import {
    StesDatenfreigabeComponent,
    StesDetailsBerufsdatenAnzeigenComponent,
    StesDetailsContentComponent,
    StesDetailsGrunddatenComponent,
    StesDetailsHomeComponent,
    StesDetailsPersonalienComponent,
    StesDetailsPersonenstammdatenComponent,
    StesDetailsSprachkenntnisseComponent,
    StesDetailsStellensucheComponent,
    StesDetailsZusatzadresseComponent,
    StesErwerbssituationComponent,
    StesZasAbgleichenComponent,
    StesZasAbgleichenTableComponent,
    StesZasKeinAbgleichenComponent,
    StesZasListAbgleichenComponent,
    StesZasPersonAbgleichenComponent
} from './pages/details';

import { StesAnmeldungComponent, StesDetailsAnmeldungComponent, StesWizardAnmeldungComponent } from './pages/anmeldung';

import { DbTranslatePipe, GeschlechtPipe, LandAutosuggestDropdownComponent, WizardComponent, WizardStepComponent, WizardSubStepComponent } from '../../shared';

import { StesAbmeldungComponent } from './pages/abmeldung/stes-abmeldung.component';
import { StesRahmenfristenComponent } from './pages/rahmenfristen/stes-rahmenfristen.component';
import { StesZasAbgleichService } from './services/stes-zas-abgleich.service';
import { StesBerufsdatenBearbeitenComponent } from './pages/details/pages/stes-details-berufsdaten/stes-berufsdaten-bearbeiten/stes-berufsdaten-bearbeiten.component';
import { StesRahmenfristenDetailsComponent } from './pages/rahmenfristen/rahmenfristen-details/stes-rahmenfristen-details.component';
import { StesRahmenfristenAuszahlungenComponent } from './pages/rahmenfristen/stes-rahmenfristen-auszahlungen/stes-rahmenfristen-auszahlungen.component';
import { StesPersonenstammdatenSuchenComponent } from './pages/personenstammdaten-suchen/stes-personenstammdaten-suchen.component';
import { StesRahmenfristenZwischenverdienstComponent } from './pages/rahmenfristen/stes-rahmenfristen-zwischenverdienst/stes-rahmenfristen-zwischenverdienst.component';
import { StesInfotagBuchenService } from './services/stes-infotag-buchen.service';
import { DatenfreigabeBefragungResetComponent } from './pages/details/pages/datenfreigabe/datenfreigabe-befragung-reset/datenfreigabe-befragung-reset.component';
import {
    StesInfotagBeschreibungDurchfuehrungsortComponent,
    StesInfotagGrunddatenBuchungComponent,
    StesInfotagTeilnehmerlisteComponent,
    StesTerminComponent,
    StesTermineAnzeigenComponent
} from '@stes/pages/termine';
import {
    ZwischenverdienstBearbeitenComponent,
    ZwischenverdiensteComponent,
    ZwischenverdienstErfassenComponent,
    ZwischenverdiensteTableComponent
} from '@stes/pages/zwischenverdienste';
import { LeistungsexportBearbeitenComponent, LeistungsexporteComponent, LeistungsexportErfassenComponent, LeistungsexporteTableComponent } from '@stes/pages/leistungsexporte';
import { BenutzerstelleAnzeigenComponent } from './pages/details/pages/datenfreigabe/benutzerstelle-anzeigen/benutzerstelle-anzeigen.component';
import { StesRahmenfristenZaehlerstandComponent } from './pages/rahmenfristen/rahmenfristen-details/stes-rahmenfristen-zaehlerstand/stes-rahmenfristen-zaehlerstand.component';
import {
    AusgangslagenAnzeigenComponent,
    AusgangslageBearbeitenPageComponent,
    AusgangslageErfassenPageComponent,
    AusgangslageFormComponent,
    AusgangslagenTableComponent,
    WdgAktionenAnzeigenComponent,
    WdgAktionenBearbeitenComponent,
    WdgAktionenErfassenComponent,
    WdgaktionenTableComponent,
    WdgZielBearbeitenComponent,
    WdgZieleAnzeigenComponent,
    WdgZielErfassenComponent,
    WdgzieleTableComponent
} from './pages/wiedereingliederung/index';
import {
    ArbeitsvermittlungenAnzeigenComponent,
    ArbeitsvermittlungenTableComponent,
    SchnellzuweisungBearbeitenPageComponent,
    SchnellzuweisungErfassenComponent
} from '@stes/pages/arbeitsvermittlungen';
import {
    FachberatungBearbeitenComponent,
    FachberatungenAnzeigenComponent,
    FachberatungenTableComponent,
    FachberatungErfassenWizardComponent,
    FachberatungsangebotPruefenComponent,
    FachberatungsangebotSuchenComponent,
    FachberatungSuchenTableComponent,
    FachberatungVmtlFertigstellenComponent
} from '@stes/pages/fachberatung';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { OsteSuchenComponent } from './pages/arbeitsvermittlungen/zuweisung/pages/oste-suchen/oste-suchen.component';
import { StesVermittlungsfaehigkeitAnzeigenComponent } from './pages/vermittlungsfaehigkeit/anzeigen/stes-vermittlungsfaehigkeit-anzeigen.component';
import { StesSachverhaltComponent } from './pages/vermittlungsfaehigkeit/sachverhalt/stes-sachverhalt.component';
import { SachverhaltFormComponent } from './pages/vermittlungsfaehigkeit/sachverhalt-form/sachverhalt-form.component';
import { VermittlungBearbeitenComponent } from './pages/arbeitsvermittlungen/zuweisung/pages/vermittlung-bearbeiten/vermittlung-bearbeiten.component';
import { StesEntscheidComponent } from './pages/vermittlungsfaehigkeit/entscheid/stes-entscheid.component';
import { StesStellungnahmeComponent } from './pages/vermittlungsfaehigkeit/stellungnahme/stes-stellungnahme.component';
import { StesMatchingprofilComponent } from './pages/stes-matchingprofil/stes-matchingprofil.component';
import { MatchingtreffernSuchenComponent } from './pages/matchingtreffern-suchen/matchingtreffern-suchen.component';
import { StesSanktionenAnzeigenComponent } from './pages/sanktionen/anzeigen/stes-sanktionen-anzeigen.component';
import { SanktionErfassenArbeitsbemuehungenComponent } from './pages/sanktionen/sanktion-erfassen-arbeitsbemuehungen/sanktion-erfassen-arbeitsbemuehungen.component';
import { SanktionErfassenMassnahmenComponent } from './pages/sanktionen/sanktion-erfassen-massnahmen/sanktion-erfassen-massnahmen.component';
import { SanktionErfassenBeratungComponent } from './pages/sanktionen/sanktion-erfassen-beratung/sanktion-erfassen-beratung.component';
import { SanktionErfassenKontrollWeisungenComponent } from './pages/sanktionen/sanktion-erfassen-kontroll-weisungen/sanktion-erfassen-kontroll-weisungen.component';
import { SanktionErfassenVermittlungComponent } from './pages/sanktionen/sanktion-erfassen-vermittlung/sanktion-erfassen-vermittlung.component';
import { FallbearbeitungFormComponent } from './pages/sanktionen/fallbearbeitung-form/fallbearbeitung-form.component';
import { SanktionTreeTableComponent } from './pages/sanktionen/sanktion-tree-table/sanktion-tree-table.component';
import { StatusCodeService } from '@stes/pages/vermittlungsfaehigkeit/status-code.service';
import { SanktionStellungnahmeComponent } from '@stes/pages/sanktionen/stellungnahme/sanktion-stellungnahme.component';
import { StesGeschaefteComponent } from './pages/stes-geschaefte/stes-geschaefte.component';
import { StesMeldungenComponent } from './pages/stes-meldungen/stes-meldungen.component';
import { SanktionErfassenBearbeitenComponent } from '@stes/pages/sanktionen/sanktion-erfassen-bearbeiten/sanktion-erfassen-bearbeiten.component';
import { AmmModule } from './pages/amm/amm.module';
import { SanktionEntscheidComponent } from './pages/sanktionen/sanktion-entscheid/sanktion-entscheid.component';
import { KontrollperiodenAnzeigenComponent } from './pages/kontrollperioden/anzeigen/kontrollperioden-anzeigen.component';
import { KontrollperiodenErfassenBearbeitenComponent } from './pages/kontrollperioden/erfassen-bearbeiten/kontrollperioden-erfassen-bearbeiten.component';
import { KontrollperiodenStesSuchenComponent } from './pages/kontrollperioden/kontrollperioden-stes-suchen/kontrollperioden-stes-suchen.component';
import { StesMeldungenResultComponent } from './pages/stes-meldungen/stes-meldungen-result/stes-meldungen-result.component';
import { StesAufgabenErfassenComponent } from './pages/aufgaben/stes-aufgaben-erfassen/stes-aufgaben-erfassen.component';
import { StesAufgabenAnzeigenComponent } from './pages/aufgaben/stes-aufgaben-anzeigen/stes-aufgaben-anzeigen.component';
import { FehlenderKontrollperiodenStesSuchenComponent } from './pages/kontrollperioden/fehlender-kontrollperioden-stes-suchen/fehlender-kontrollperioden-stes-suchen.component';
import { CdkTableModule } from '@angular/cdk/table';
import { OsteSuchenTableComponent } from './pages/arbeitsvermittlungen/zuweisung/pages/oste-suchen/oste-suchen-table/oste-suchen-table.component';
import { MatchingtrefferTableComponent } from './pages/stes-matchingprofil/matchingtreffer-table/matchingtreffer-table.component';
import { KontrollperiodenAnzeigenTableComponent } from '@stes/pages/kontrollperioden/anzeigen/kontrollperioden-anzeigen-table/kontrollperioden-anzeigen-table.component';
import { BerufeTableComponent } from './pages/details/pages/stes-details-berufsdaten/stes-details-berufsdaten-anzeigen/berufe-table/berufe-table.component';
import { StesMatchingtrefferTableComponent } from './pages/matchingtreffern-suchen/stes-matchingtreffer-table/stes-matchingtreffer-table.component';
import { StesSearchTableComponent } from './components/stes-search-table/stes-search-table.component';
import { StesPersonenstammdatenTableComponent } from './pages/personenstammdaten-suchen/stes-personenstammdaten-table/stes-personenstammdaten-table.component';
import { StesTermineTableComponent } from './pages/termine/anzeigen/stes-termine-table/stes-termine-table.component';
import { StesRahmenfristenTableComponent } from './pages/rahmenfristen/stes-rahmenfristen-table/stes-rahmenfristen-table.component';
import { InfotagTeilnehmerlisteTableComponent } from './pages/termine/infotag-teilnehmerliste/infotag-teilnehmerliste-table/infotag-teilnehmerliste-table.component';
import { RahmenfristenAuszahlungenTableComponent, RahmenfristenZwischenverdienstTableComponent } from './pages';
import { MainContainerPageComponent } from '@stes/pages/unternehmen/main-container-page/main-container-page.component';
import { UnternehmenErfassenPageComponent } from '@stes/pages/unternehmen/unternehmen-erfassen-page/unternehmen-erfassen-page.component';
import { UnternehmenSuchenPageComponent } from '@stes/pages/unternehmen/unternehmen-suchen-page/unternehmen-suchen-page.component';
import { KontaktpersonSuchenPageComponent } from '@stes/pages/unternehmen/kontaktperson-suchen-page/kontaktperson-suchen-page.component';
import { AdressdatenPageComponent } from '@stes/pages/unternehmen/unternehmen-details/adressdaten-page/adressdaten-page.component';
import { KontaktpersonenPageComponent } from '@stes/pages/unternehmen/kontaktpflege/kontaktpersonen/kontaktpersonen-page.component';
import { KontaktPersonErfassenPageComponent } from '@stes/pages/unternehmen/kontaktpflege/kontaktpersonen/kontakt-person-erfassen-page/kontakt-person-erfassen-page.component';
import { KontaktePageComponent } from '@stes/pages/unternehmen/kontaktpflege/kontakte/kontakte-page.component';
import { KontaktErfassenPageComponent } from '@stes/pages/unternehmen/kontaktpflege/kontakte/kontakt-erfassen-page/kontakt-erfassen-page.component';
import { BurDatenAnzeigenPageComponent } from '@stes/pages/unternehmen/bur-bfs/bur-daten-anzeigen-page/bur-daten-anzeigen-page.component';
import { MutationsantraegeAnzeigenPageComponent } from '@stes/pages/unternehmen/bur-bfs/mutationsantraege-anzeigen-page/mutationsantraege-anzeigen-page.component';
import { KundenberaterPageComponent } from '@stes/pages/unternehmen/kontaktpflege/kundenberater/kundenberater-page.component';
import { MutationsantragSichtenPageComponent } from './pages/unternehmen/bur-bfs/mutationsantrag-sichten-page/mutationsantrag-sichten-page.component';
import { FachberatungsangeboteComponent } from './pages/unternehmen/unternehmen-details/fachberatungsangebote/anzeigen/fachberatungsangebote.component';
import { FachberatungsangeboteSuchenComponent } from './pages/unternehmen/unternehmen-details/fachberatungsangebote/suchen/fachberatungsangebote-suchen.component';
import { FachberatungsangebotErfassenComponent } from './pages/unternehmen/unternehmen-details/fachberatungsangebote/erfassen/fachberatungsangebot-erfassen.component';
import { MitteilungenAnzeigenPageComponent } from './pages/unternehmen/bur-bfs/mitteilung/mitteilungen-anzeigen-page/mitteilungen-anzeigen-page.component';
import { MitteilungAnzeigenPageComponent } from './pages/unternehmen/bur-bfs/mitteilung/mitteilung-anzeigen-page/mitteilung-anzeigen-page.component';
import { TeilnehmerFormComponent } from '@stes/pages/termine/teilnehmer-form/teilnehmer-form.component';
import { FachberatungsangeboteFormComponent } from './pages/unternehmen/unternehmen-details/fachberatungsangebote/suchen/form/fachberatungsangebote-form.component';
import { FachberatungsangeboteResultComponent } from './pages/unternehmen/unternehmen-details/fachberatungsangebote/suchen/result/fachberatungsangebote-result.component';
import { OsteVermittlungSuchenComponent } from './pages/oste-vermittlung-suchen/oste-vermittlung-suchen.component';
import { StesProfilVergleichPageComponent } from './pages/arbeitsvermittlungen/zuweisung/pages/stes-profil-vergleich-page/stes-profil-vergleich-page.component';
// prettier-ignore
import {
    StesVermittlungFertigstellenPageComponent
} from './pages/arbeitsvermittlungen/zuweisung/pages/stes-vermittlung-fertigstellen-page/stes-vermittlung-fertigstellen.component';
import { MatchingWizardComponent } from './pages/stes-matchingprofil/vermittlung-erfassen/matching-wizard/matching-wizard.component';
import { MatchingProfilvergleichPageComponent } from './pages/stes-matchingprofil/vermittlung-erfassen/pages/matching-profilvergleich-page/matching-profilvergleich-page.component';
import { MatchingFertigstellenPageComponent } from './pages/stes-matchingprofil/vermittlung-erfassen/pages/matching-fertigstellen-page/matching-fertigstellen-page.component';
import { MeldungenPageComponent } from '@stes/pages/unternehmen/geschaeftskontrolle/meldungen/meldungen-page.component';
import { FachberatungsstelleAufgabenAnzeigenPageComponent } from '@stes/pages/unternehmen/geschaeftskontrolle/aufgaben/fachberatungsstelle-aufgaben-anzeigen-page.component';
import { AufgabenErfassenPageComponent } from './pages/unternehmen/geschaeftskontrolle/aufgaben-erfassen/aufgaben-erfassen-page.component';

@NgModule({
    declarations: [
        StesSearchHomeComponent,
        StesSearchComponent,
        StesSearchResultComponent,
        StesDetailsHomeComponent,
        StesDetailsContentComponent,
        StesDetailsPersonalienComponent,
        StesDetailsZusatzadresseComponent,
        StesDetailsGrunddatenComponent,
        StesDetailsStellensucheComponent,
        StesErwerbssituationComponent,
        StesAnmeldungComponent,
        StesAbmeldungComponent,
        StesDetailsAnmeldungComponent,
        StesWizardAnmeldungComponent,
        WizardStepComponent,
        WizardComponent,
        StesDetailsInfoleisteModalComponent,
        StesTermineAnzeigenComponent,
        StesDetailsSprachkenntnisseComponent,
        StesZasListAbgleichenComponent,
        StesZasAbgleichenComponent,
        StesZasListAbgleichenComponent,
        StesZasPersonAbgleichenComponent,
        StesZasKeinAbgleichenComponent,
        StesRahmenfristenComponent,
        ZwischenverdiensteComponent,
        StesDetailsBerufsdatenAnzeigenComponent,
        StesBerufsdatenBearbeitenComponent,
        StesDetailsPersonenstammdatenComponent,
        WizardSubStepComponent,
        StesRahmenfristenDetailsComponent,
        StesRahmenfristenAuszahlungenComponent,
        StesPersonenstammdatenSuchenComponent,
        StesRahmenfristenZwischenverdienstComponent,
        StesInfotagModalComponent,
        StesDatenfreigabeComponent,
        StesTerminComponent,
        DatenfreigabeBefragungResetComponent,
        StesInfotagGrunddatenBuchungComponent,
        ZwischenverdienstErfassenComponent,
        LeistungsexporteComponent,
        LeistungsexportErfassenComponent,
        BenutzerstelleAnzeigenComponent,
        ZwischenverdienstBearbeitenComponent,
        StesRahmenfristenZaehlerstandComponent,
        LeistungsexportBearbeitenComponent,
        ZwischenverdienstBearbeitenComponent,
        StesInfotagBeschreibungDurchfuehrungsortComponent,
        StesInfotagTeilnehmerlisteComponent,
        LandAutosuggestDropdownComponent,
        StesInfotagTeilnehmerlisteComponent,
        AusgangslagenAnzeigenComponent,
        StesInfotagDetailsModalComponent,
        WdgZieleAnzeigenComponent,
        WdgZielErfassenComponent,
        WdgAktionenAnzeigenComponent,
        WdgAktionenErfassenComponent,
        WdgAktionenBearbeitenComponent,
        WdgZielBearbeitenComponent,
        ArbeitsvermittlungenAnzeigenComponent,
        FachberatungenAnzeigenComponent,
        SchnellzuweisungErfassenComponent,
        FachberatungsangebotSuchenComponent,
        FachberatungErfassenWizardComponent,
        FachberatungBearbeitenComponent,
        OsteSuchenComponent,
        FachberatungsangebotPruefenComponent,
        FachberatungVmtlFertigstellenComponent,
        SchnellzuweisungBearbeitenPageComponent,
        StesVermittlungsfaehigkeitAnzeigenComponent,
        StesSachverhaltComponent,
        SachverhaltFormComponent,
        VermittlungBearbeitenComponent,
        StesEntscheidComponent,
        StesStellungnahmeComponent,
        StesMatchingprofilComponent,
        MatchingtreffernSuchenComponent,
        StesSanktionenAnzeigenComponent,
        SanktionErfassenArbeitsbemuehungenComponent,
        SanktionErfassenMassnahmenComponent,
        SanktionErfassenBeratungComponent,
        SanktionErfassenKontrollWeisungenComponent,
        SanktionErfassenVermittlungComponent,
        FallbearbeitungFormComponent,
        SanktionTreeTableComponent,
        SanktionErfassenBearbeitenComponent,
        SanktionStellungnahmeComponent,
        StesGeschaefteComponent,
        StesMeldungenComponent,
        SanktionEntscheidComponent,
        StesMeldungenComponent,
        KontrollperiodenAnzeigenComponent,
        KontrollperiodenErfassenBearbeitenComponent,
        KontrollperiodenAnzeigenTableComponent,
        KontrollperiodenStesSuchenComponent,
        StesMeldungenResultComponent,
        StesAufgabenErfassenComponent,
        StesAufgabenAnzeigenComponent,
        FehlenderKontrollperiodenStesSuchenComponent,
        LeistungsexporteTableComponent,
        FachberatungenTableComponent,
        ArbeitsvermittlungenTableComponent,
        OsteSuchenTableComponent,
        MatchingtrefferTableComponent,
        BerufeTableComponent,
        StesMatchingtrefferTableComponent,
        AusgangslagenTableComponent,
        FachberatungSuchenTableComponent,
        StesSearchTableComponent,
        ZwischenverdiensteTableComponent,
        WdgaktionenTableComponent,
        AusgangslagenTableComponent,
        StesTermineTableComponent,
        StesRahmenfristenTableComponent,
        StesZasAbgleichenTableComponent,
        StesPersonenstammdatenTableComponent,
        StesTermineTableComponent,
        RahmenfristenZwischenverdienstTableComponent,
        WdgzieleTableComponent,
        InfotagTeilnehmerlisteTableComponent,
        RahmenfristenAuszahlungenTableComponent,
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
        FachberatungsangeboteComponent,
        FachberatungsangebotErfassenComponent,
        MitteilungenAnzeigenPageComponent,
        MitteilungAnzeigenPageComponent,
        FachberatungsangeboteSuchenComponent,
        TeilnehmerFormComponent,
        FachberatungsangeboteFormComponent,
        FachberatungsangeboteResultComponent,
        OsteVermittlungSuchenComponent,
        StesProfilVergleichPageComponent,
        StesVermittlungFertigstellenPageComponent,
        MatchingWizardComponent,
        MatchingProfilvergleichPageComponent,
        MatchingFertigstellenPageComponent,
        AusgangslageErfassenPageComponent,
        AusgangslageBearbeitenPageComponent,
        AusgangslageFormComponent,
        FachberatungsstelleAufgabenAnzeigenPageComponent,
        MeldungenPageComponent,
        AufgabenErfassenPageComponent
    ],
    entryComponents: [StesZasAbgleichenComponent, StesInfotagModalComponent, StesErwerbssituationComponent, StesInfotagDetailsModalComponent],
    exports: [StesSearchTableComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NgbModule, // Keep this order!
        ObliqueModule.forRoot(), // It has only forRoot method
        TranslateModule.forChild(),
        StesRoutingModule,
        SharedModule,
        AmmModule,
        CdkTableModule
    ],
    providers: [DatePipe, StesZasAbgleichService, DbTranslatePipe, StesInfotagBuchenService, GeschlechtPipe, ObliqueHelperService, StatusCodeService]
})
export class StesModule {
    constructor() {
        /**/
    }
}
