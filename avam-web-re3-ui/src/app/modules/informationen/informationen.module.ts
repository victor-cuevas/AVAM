import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InformationenRoutingModule } from './informationen-routing.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { BenutzerstelleErfassenWizardComponent } from '@modules/informationen/pages/benutzerstelle-erfassen/benutzerstelle-erfassen-wizard.component';
import { BenutzerstellenSuchenPageComponent } from './pages/benutzerstellen-suchen/benutzerstellen-suchen-page.component';
import { BenutzerstellenSuchenFormComponent } from './components/benutzerstellen-suchen-form/benutzerstellen-suchen-form.component';
import { BenutzerstelleHomePageComponent } from './pages/benutzerstelle-home/benutzerstelle-home-page.component';
import { BenutzerstelleErweiterteDatenBearbeitenPageComponent } from './pages/benutzerstelle-erweiterte-daten-bearbeiten/benutzerstelle-erweiterte-daten-bearbeiten-page.component';
// prettier-ignore
import { BenutzerstelleErfassenGrunddatenPageComponent } from
        '@modules/informationen/pages/benutzerstelle-erfassen/pages/grunddaten/benutzerstelle-erfassen-grunddaten-page.component';
// prettier-ignore
import { BenutzerstelleErfassenErwDatenPageComponent } from
        '@modules/informationen/pages/benutzerstelle-erfassen/pages/erw-daten/benutzerstelle-erfassen-erw-daten-page.component';
import { BenutzerstelleGrunddatenFormComponent } from '@modules/informationen/components/benutzerstelle-grunddaten-form/benutzerstelle-grunddaten-form.component';
// prettier-ignore
import { BenutzerstelleErweiterteDatenBearbeitenFormComponent }
    from './components/benutzerstelle-erweiterte-daten-bearbeiten-form/benutzerstelle-erweiterte-daten-bearbeiten-form.component';
import { BenutzerstellenSuchenResultComponent } from './components/benutzerstellen-suchen-result/benutzerstellen-suchen-result.component';
import { ZahlstellenSuchenPageComponent } from './pages/zahlstellen-suchen-page/zahlstellen-suchen-page.component';
import { ZahlstellenSuchenFormComponent } from './pages/zahlstellen-suchen-page/zahlstellen-suchen-form/zahlstellen-suchen-form.component';
import { VollzugsregionenComponent } from './components/benutzerstelle-erweiterte-daten-bearbeiten-form/vollzugsregionen/vollzugsregionen.component';
import { ZahlstellenErfassenBearbeitenComponent } from './pages/zahlstellen-erfassen-bearbeiten/zahlstellen-erfassen-bearbeiten.component';
import { ZahlstellenFormComponent } from './components/zahlstellen-form/zahlstellen-form.component';
import { InformationsmeldungenSuchenComponent } from './pages/informationsmeldungen-suchen/informationsmeldungen-suchen.component';
// prettier-ignore
import { BenutzerstelleGrundDatenBearbeitenPageComponent }
    from '@modules/informationen/pages/benutzerstelle-grunddaten-bearbeiten/benutzerstelle-grunddaten-bearbeiten-page.component';
import { InformationsmeldungErfassenBearbeitenComponent } from './pages/informationsmeldung-erfassen-bearbeiten/informationsmeldung-erfassen-bearbeiten.component';
import { VollzugsregionSuchenComponent } from './pages/vollzugsregion-suchen/vollzugsregion-suchen.component';
import { RollenSuchenPageComponent } from './pages/rollen-suchen-page/rollen-suchen-page.component';
import { CodeDomaeneAuswaehlenComponent } from './components/code-domaene/code-domaene-auswaehlen/code-domaene-auswaehlen/code-domaene-auswaehlen.component';
import { CodeDomaeneAutosuggestComponent } from './components/code-domaene/code-domaene-auswaehlen/code-domaene-autosuggest/code-domaene-autosuggest.component';
import { RollenSuchenFormComponent } from './components/rollen-suchen-form/rollen-suchen-form.component';
import { RollenGrunddatenBearbeitenPageComponent } from '@modules/informationen/pages/rollen-grunddaten-bearbeiten-page/rollen-grunddaten-bearbeiten-page.component';
import { RollenBearbeitenHomePageComponent } from '@modules/informationen/pages/rollen-bearbeiten-home/rollen-bearbeiten-home-page.component';
import { RollenGrunddatenFormComponent } from '@modules/informationen/components/rollen-grunddaten-form/rollen-grunddaten-form.component';
import { RollenSuchenResultComponent } from './components/rollen-suchen-result/rollen-suchen-result.component';
import { RollenTableComponent } from './components/rollen-table/rollen-table.component';
import { RolleErfassenWizardComponent } from '@modules/informationen/pages/rolle-erfassen/rolle-erfassen-wizard.component';
import { RolleErfassenGrunddatenPageComponent } from '@modules/informationen/pages/rolle-erfassen/pages/grunddaten/rolle-erfassen-grunddaten-page.component';
import { RolleErfassenBerechtigungenPageComponent } from '@modules/informationen/pages/rolle-erfassen/pages/berechtigungen/rolle-erfassen-berechtigungen-page.component';
import { VollzugsregionErfassenBearbeitenComponent } from './pages/vollzugsregion-erfassen-bearbeiten/vollzugsregion-erfassen-bearbeiten.component';
import { CodeDataRestService } from '@app/core/http/code-data-rest.service';
import { CodeDomaeneTableComponent } from './components/code-domaene/code-domaene-auswaehlen/code-domaene-table/code-domaene-table.component';
import { VollzugsregionSuchenFormComponent } from '@modules/informationen/pages/vollzugsregion-suchen/vollzugsregion-suchen-form/vollzugsregion-suchen-form.component';
import { RollenBerechtigungenBearbeitenPageComponent } from './pages/rollen-berechtigungen-bearbeiten-page/rollen-berechtigungen-bearbeiten-page.component';
import { VollzugsregionSuchenTableComponent } from '@modules/informationen/components/vollzugsregion-suchen-table/vollzugsregion-suchen-table.component';
import { CodesSuchenComponent } from './pages/codes-suchen/codes-suchen.component';
import { CodesSuchenFormComponent } from './components/code-domaene/codes-suchen-form/codes-suchen-form.component';
import { CodesSuchenTableComponent } from './components/code-domaene/codes-suchen-table/codes-suchen-table.component';
import { BerufSuchenComponent } from './pages/beruf-suchen/beruf-suchen.component';
import { RollenBerechtigungenTableComponent } from '@modules/informationen/components/rollen-berechtigungen-table/rollen-berechtigungen-table.component';
import { BerufErfassenBearbeitenComponent } from './pages/beruf-erfassen-bearbeiten/beruf-erfassen-bearbeiten.component';
import { BenutzermeldungenSuchenPageComponent } from './pages/benutzermeldungen-suchen-page/benutzermeldungen-suchen-page.component';
import { BerufSuchenFormComponent } from './pages/beruf-suchen/beruf-suchen-form/beruf-suchen-form.component';
import { BenutzermeldungenTableComponent } from './components/benutzermeldungen-table/benutzermeldungen-table.component';
import { BenutzermeldungenSuchenResultComponent } from './components/benutzermeldungen-suchen-result/benutzermeldungen-suchen-result.component';
import { SchlagwortSuchenComponent } from './pages/schlagwort-suchen/schlagwort-suchen.component';
import { SchlagwortSuchenFormComponent } from './components/schlagwort-suchen-form/schlagwort-suchen-form.component';
import { SchlagwortSuchenTableComponent } from './components/schlagwort-suchen-table/schlagwort-suchen-table.component';
import { CodeBearbeitenComponent } from './pages/code-bearbeiten/code-bearbeiten.component';
import { CodeFormComponent } from './components/code-domaene/code-domaene-auswaehlen/code-form/code-form.component';
import { BerufSuchenTableComponent } from './components/beruf-suchen-table/beruf-suchen-table.component';
import { BenutzerSuchenPageComponent } from './pages/benutzer-suchen-page/benutzer-suchen-page.component';
import { BenutzermeldungenSuchenFormComponent } from './components/benutzermeldungen-suchen-form/benutzermeldungen-suchen-form.component';

import { AehnlicheBerufeSuchenModalComponent } from './components/aehnliche-berufe-suchen-modal/aehnliche-berufe-suchen-modal.component';
@NgModule({
    declarations: [
        BenutzerstellenSuchenPageComponent,
        BenutzerstellenSuchenFormComponent,
        BenutzerstelleHomePageComponent,
        BenutzerstelleGrunddatenFormComponent,
        BenutzerstelleErfassenWizardComponent,
        BenutzerstelleErfassenErwDatenPageComponent,
        BenutzerstelleErfassenGrunddatenPageComponent,
        BenutzerstelleErweiterteDatenBearbeitenPageComponent,
        BenutzerstelleErweiterteDatenBearbeitenFormComponent,
        BenutzerstelleGrundDatenBearbeitenPageComponent,
        BenutzerstellenSuchenResultComponent,
        ZahlstellenSuchenPageComponent,
        ZahlstellenSuchenFormComponent,
        VollzugsregionenComponent,
        ZahlstellenErfassenBearbeitenComponent,
        ZahlstellenFormComponent,
        InformationsmeldungenSuchenComponent,
        InformationsmeldungErfassenBearbeitenComponent,
        VollzugsregionSuchenComponent,
        RollenSuchenPageComponent,
        CodeDomaeneAuswaehlenComponent,
        CodeDomaeneAutosuggestComponent,
        RollenSuchenFormComponent,
        RollenSuchenResultComponent,
        RollenTableComponent,
        RollenBearbeitenHomePageComponent,
        RolleErfassenWizardComponent,
        RolleErfassenGrunddatenPageComponent,
        RolleErfassenBerechtigungenPageComponent,
        CodeDomaeneTableComponent,
        RollenGrunddatenBearbeitenPageComponent,
        RollenGrunddatenFormComponent,
        VollzugsregionErfassenBearbeitenComponent,
        VollzugsregionSuchenFormComponent,
        CodesSuchenComponent,
        CodesSuchenFormComponent,
        CodesSuchenTableComponent,
        RollenBerechtigungenBearbeitenPageComponent,
        RollenBerechtigungenTableComponent,
        BerufSuchenComponent,
        BerufSuchenFormComponent,
        BenutzermeldungenSuchenPageComponent,
        VollzugsregionSuchenTableComponent,
        BerufErfassenBearbeitenComponent,
        BenutzermeldungenTableComponent,
        BenutzermeldungenSuchenResultComponent,
        SchlagwortSuchenComponent,
        SchlagwortSuchenFormComponent,
        SchlagwortSuchenTableComponent,
        CodeBearbeitenComponent,
        CodeFormComponent,
        BerufSuchenTableComponent,
        BenutzerSuchenPageComponent,
        BenutzermeldungenSuchenFormComponent,
        BerufSuchenTableComponent,
        AehnlicheBerufeSuchenModalComponent
    ],
    imports: [CommonModule, InformationenRoutingModule, RouterModule, SharedModule],
    providers: [CodeDataRestService]
})
export class InformationenModule {}
