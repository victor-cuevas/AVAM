import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { AnbieterRoutingModule } from './anbieter-routing.module';
import { MainContainerPageComponent } from './pages/main-container-page/main-container-page.component';
import { UnternehmenErfassenPageComponent } from './pages/unternehmen-erfassen-page/unternehmen-erfassen-page.component';
import { UnternehmenSuchenPageComponent } from './pages/unternehmen-suchen-page/unternehmen-suchen-page.component';
import { KontaktpersonSuchenPageComponent } from './pages/kontaktperson-suchen-page/kontaktperson-suchen-page.component';
import { AdressdatenPageComponent } from './pages/unternehmen-details/adressdaten-page/adressdaten-page.component';
import { KontaktpersonenPageComponent } from './pages/kontaktpflege/kontaktpersonen/kontaktpersonen-page.component';
import { KontaktPersonErfassenPageComponent } from './pages/kontaktpflege/kontaktpersonen/kontakt-person-erfassen-page/kontakt-person-erfassen-page.component';
import { KontaktePageComponent } from './pages/kontaktpflege/kontakte/kontakte-page.component';
import { KontaktErfassenPageComponent } from './pages/kontaktpflege/kontakte/kontakt-erfassen-page/kontakt-erfassen-page.component';
import { BurDatenAnzeigenPageComponent } from './pages/bur-bfs/bur-daten-anzeigen-page/bur-daten-anzeigen-page.component';
import { MutationsantraegeAnzeigenPageComponent } from './pages/bur-bfs/mutationsantraege-anzeigen-page/mutationsantraege-anzeigen-page.component';
import { KundenberaterPageComponent } from '@modules/amm/anbieter/pages/kontaktpflege/kundenberater/kundenberater-page.component';
import { AnbieterZertifikateComponent } from './pages/unternehmen-details/anbieter-zertifikate/anbieter-zertifikate.component';
import { AnbieterZertifikateFormComponent } from './components/anbieter-zertifikate-form/anbieter-zertifikate-form.component';
import { MutationsantragSichtenPageComponent } from './pages/bur-bfs/mutationsantrag-sichten-page/mutationsantrag-sichten-page.component';
import { MitteilungenAnzeigenPageComponent } from './pages/bur-bfs/mitteilung/mitteilungen-anzeigen-page/mitteilungen-anzeigen-page.component';
import { MitteilungAnzeigenPageComponent } from './pages/bur-bfs/mitteilung/mitteilung-anzeigen-page/mitteilung-anzeigen-page.component';
import { AbrechnungenAnzeigenComponent } from './pages/unternehmen-details/abrechnungen-anzeigen/abrechnungen-anzeigen.component';
import { AbrechnungErfassenComponent } from './pages/unternehmen-details/abrechnung-erfassen/abrechnung-erfassen.component';
import { AnbieterAbrechnungFormComponent } from './components/anbieter-abrechnung-form/anbieter-abrechnung-form.component';
import { CdkTableModule } from '@angular/cdk/table';
import { FieldEnablePipe } from './pipes/field-enable.pipe';
import { TeilzahlungenUebersichtComponent } from './pages/unternehmen-details/teilzahlungen-uebersicht/teilzahlungen-uebersicht.component';
import { AbrechnungBearbeitenComponent } from './pages/unternehmen-details/abrechnung-bearbeiten/abrechnung-bearbeiten.component';
import { TeilzahlungenUebersichtTableComponent } from './components/teilzahlungen-uebersicht-table/teilzahlungen-uebersicht-table.component';
import { TeilzahlungErfassenPageComponent } from './pages/unternehmen-details/teilzahlung-erfassen-page/teilzahlung-erfassen-page.component';
import { TeilzahlungFormComponent } from './components/teilzahlung-form/teilzahlung-form.component';
import { AnbieterTeilzahlungswerteTableComponent } from './components/teilzahlung-form/anbieter-teilzahlungswerte-table/anbieter-teilzahlungswerte-table.component';
import { AbrechnungswerteZuordnenModalComponent } from './components/abrechnungswerte-zuordnen-modal/abrechnungswerte-zuordnen-modal.component';
import { TeilzahlungBearbeitenPageComponent } from './pages/unternehmen-details/teilzahlung-bearbeiten-page/teilzahlung-bearbeiten-page.component';
import { VertragswerteTableComponent } from './components/leistungsvereinbarung-form/vertragswerte-table/vertragswerte-table.component';
import { LeistungsvereinbarungErfassenPageComponent } from './pages/unternehmen-details/leistungsvereinbarung-erfassen-page/leistungsvereinbarung-erfassen-page.component';
import { LeistungsvereinbarungFormComponent } from './components/leistungsvereinbarung-form/leistungsvereinbarung-form.component';
import { AuszahlungenZurAbrechnungModalComponent } from './components/auszahlungen-zur-abrechnung-modal/auszahlungen-zur-abrechnung-modal.component';
import { AuszahlungenZurAbrechnungTableComponent } from './components/auszahlungen-zur-abrechnung-table/auszahlungen-zur-abrechnung-table.component';
import { RahmenvertraegeUebersichtComponent } from './pages/unternehmen-details/rahmenvertraege-uebersicht/rahmenvertraege-uebersicht.component';
import { LeistungsvereinbarungBearbeitenPageComponent } from './pages/unternehmen-details/leistungsvereinbarung-bearbeiten-page/leistungsvereinbarung-bearbeiten-page.component';
import { AbrechnungswertHomeComponent } from './pages/unternehmen-details/abrechnungswert-home/abrechnungswert-home.component';
import { LeistungsvereinbarungenUebersichtComponent } from './pages/leistungsvereinbarungen-uebersicht/leistungsvereinbarungen-uebersicht.component';
import { RahmenvertragErfassenComponent } from './pages/unternehmen-details/rahmenvertrag-erfassen/rahmenvertrag-erfassen.component';
import { RahmenvertragFormComponent } from './components/rahmenvertrag-form/rahmenvertrag-form.component';
import { LeistungsvereinbarungenTableComponent } from './components/leistungsvereinbarungen-table/leistungsvereinbarungen-table.component';
import { TeilzahlungswerteZuordnenModalComponent } from './components/teilzahlungswerte-zuordnen-modal/teilzahlungswerte-zuordnen-modal.component';
import { VertragswertControllingwerteComponent } from './pages/vertragswert-controllingwerte/vertragswert-controllingwerte.component';
import { AbrechnungswertSuchenComponent } from './pages/abrechnungswert-suchen/abrechnungswert-suchen.component';
import { AbrechnungswertSuchenFormComponent } from './components/abrechnungswert-suchen-form/abrechnungswert-suchen-form.component';
import { AbrechnungenSuchenComponent } from './pages/abrechnungen-suchen/abrechnungen-suchen.component';
import { AbrechnungenSuchenFormComponent } from './components/abrechnungen-suchen-form/abrechnungen-suchen-form.component';
import { DurchfuehrungseinheitenModalComponent } from './components/durchfuehrungseinheiten-modal/durchfuehrungseinheiten-modal.component';
import { DurchfuehrungseinheitenTableComponent } from './components/durchfuehrungseinheiten-modal/durchfuehrungseinheiten-table/durchfuehrungseinheiten-table.component';
import { AnbieterAbrechnungswertTableComponent } from './components/anbieter-abrechnungswert-table/anbieter-abrechnungswert-table.component';
import { AbrechnungenSuchenTableComponent } from './components/abrechnungen-suchen-table/abrechnungen-suchen-table.component';
import { AbrechnungswertService } from './services/abrechnungswert.service';
import { RahmenvertragBearbeitenComponent } from './pages/unternehmen-details/rahmenvertrag-bearbeiten/rahmenvertrag-bearbeiten.component';
import { RahmenvertragZuordnenModalComponent } from './components/rahmenvertrag-zuordnen-modal/rahmenvertrag-zuordnen-modal.component';
import { RahmenvertragZuordnenTableComponent } from './components/rahmenvertrag-zuordnen-table/rahmenvertrag-zuordnen-table.component';
import { AuszahlungenZurTeilzahlungModalComponent } from './components/auszahlungen-zur-teilzahlung-modal/auszahlungen-zur-teilzahlung-modal.component';
// prettier-ignore
import { AuszahlungenZurLeistungsvereinbarungModalComponent }
from './components/auszahlungen-zur-leistungsvereinbarung-modal/auszahlungen-zur-leistungsvereinbarung-modal.component';
// prettier-ignore
import { AuszahlungenZurLeistungsvereinbarungTableComponent }
from './components/auszahlungen-zur-leistungsvereinbarung-table/auszahlungen-zur-leistungsvereinbarung-table.component';
import { RahmenvertragService } from './services/rahmenvertrag.service';
import { VertragswertErfassenWizardComponent } from './pages/unternehmen-details/vertragswert-erfassen-wizard/vertragswert-erfassen-wizard.component';
import { ObjektAuswaehlenComponent } from './pages/unternehmen-details/vertragswert-erfassen-wizard/pages/objekt-auswaehlen/objekt-auswaehlen.component';
import { PlanwertAuswaehlenErfassenComponent } from './pages/unternehmen-details/vertragswert-erfassen-wizard/pages/planwert-auswaehlen/planwert-auswaehlen.component';
import { VertragswertDetailErfassenComponent } from './pages/unternehmen-details/vertragswert-erfassen-wizard/pages/vertragswert-detail/vertragswert-detail.component';
import { VertragswertDetailFormComponent } from './components/vertragswert-detail-form/vertragswert-detail-form.component';
import { VertragswertPlanwertTableComponent } from './components/vertragswert-planwert-table/vertragswert-planwert-table.component';
import { VertragswertAsalDatenComponent } from './pages/vertragswert-asal-daten/vertragswert-asal-daten.component';
import { AuszahlungsdatenTableComponent } from './components/auszahlungsdaten-table/auszahlungsdaten-table.component';
import { TeilzahlungswerteUebersichtComponent } from './pages/teilzahlungswerte-uebersicht/teilzahlungswerte-uebersicht.component';
// prettier-ignore
import { VertragswertErfassenTreeTableComponent }
from './pages/unternehmen-details/vertragswert-erfassen-wizard/components/vertragswert-erfassen-tree-table/vertragswert-erfassen-tree-table.component';
import { TeilzahlungswertSuchenComponent } from './pages/teilzahlungswert-suchen/teilzahlungswert-suchen.component';
import { TeilzahlungswertSuchenFormComponent } from './components/teilzahlungswert-suchen-form/teilzahlungswert-suchen-form.component';
import { VertragswertTeilzahlungswerteTableComponent } from './components/vertragswert-teilzahlungswerte-table/vertragswert-teilzahlungswerte-table.component';
import { TeilzahlungswertFormComponent } from './components/teilzahlungswert-form/teilzahlungswert-form.component';
import { TeilzahlungswertErfassenPageComponent } from './pages/teilzahlungswert-erfassen-page/teilzahlungswert-erfassen-page.component';
import { AbrechnungswertGrunddatenComponent } from './pages/abrechnungswert-grunddaten/abrechnungswert-grunddaten.component';
import { AbrechnungswertGrunddatenFormComponent } from './components/abrechnungswert-grunddaten-form/abrechnungswert-grunddaten-form.component';
import { TeilzahlungswertVertragswertTableComponent } from './components/teilzahlungswert-form/teilzahlungswert-vertragswert-table/teilzahlungswert-vertragswert-table.component';
import { AbrechnungswertErfassenWizardComponent } from './pages/unternehmen-details/abrechnungswert-erfassen-wizard/abrechnungswert-erfassen-wizard.component';
// prettier-ignore
import { AbrechnungswertGrunddatenErfassenComponent }
from './pages/unternehmen-details/abrechnungswert-erfassen-wizard/pages/abrechnungswert-grunddaten-erfassen/abrechnungswert-grunddaten-erfassen.component';
// prettier-ignore
import { AbrechnungswertKostenErfassenComponent }
from './pages/unternehmen-details/abrechnungswert-erfassen-wizard/pages/abrechnungswert-kosten-erfassen/abrechnungswert-kosten-erfassen.component';
import { TeilzahlungswertBearbeitenComponent } from './pages/teilzahlungswert-bearbeiten/teilzahlungswert-bearbeiten.component';
import { AnbieterAufgabenAnzeigenPageComponent } from '@modules/amm/anbieter/pages/aufgaben-anzeigen/anbieter-aufgaben-anzeigen-page.component';
import { MeldungenPageComponent } from '@modules/amm/anbieter/pages/geschaeftskontrolle/meldungen/meldungen-page.component';
import { TeilzahlungZuordnenModalComponent } from './components/teilzahlung-zuordnen-modal/teilzahlung-zuordnen-modal.component';
import { GeschaeftePageComponent } from '@modules/amm/anbieter/pages/geschaeftskontrolle/geschaefte/geschaefte-page.component';
import { AbrechnungZuordnenModalComponent } from './components/abrechnung-zuordnen-modal/abrechnung-zuordnen-modal.component';
import { AbrechnungswertKostenFormComponent } from './components/abrechnungswert-kosten-form/abrechnungswert-kosten-form.component';
import { VertragswertBearbeitenPageComponent } from './pages/unternehmen-details/vertragswert-bearbeiten-page/vertragswert-bearbeiten-page.component';
import { AufgabenErfassenPageComponent } from './pages/geschaeftskontrolle/aufgaben-erfassen-page/aufgaben-erfassen-page.component';
import { AbrechnungswertKostenaufteilungComponent } from './pages/unternehmen-details/abrechnungswert-kostenaufteilung/abrechnungswert-kostenaufteilung.component';
import { AbrechnungswertKostenComponent } from './pages/unternehmen-details/abrechnungswert-kosten/abrechnungswert-kosten.component';
import { TeilzahlungswerteAnzeigenModalComponent } from './components/teilzahlungswerte-anzeigen-modal/teilzahlungswerte-anzeigen-modal.component';
import { LeistungsvereinbarungenHomeComponent } from './pages/unternehmen-details/leistungsvereinbarungen-home/leistungsvereinbarungen-home.component';
import { LeistungsvereinbarungHomeComponent } from './pages/unternehmen-details/leistungsvereinbarung-home/leistungsvereinbarung-home.component';
import { VertragswertHomeComponent } from './pages/unternehmen-details/vertragswert-home/vertragswert-home.component';
import { LeistungsvereinbarungenNavigationService } from './services/leistungsvereinbarungen-navigation.service';
import { TeilzahlungswertHomeComponent } from './pages/unternehmen-details/teilzahlungswert-home/teilzahlungswert-home.component';
import { TeilzahlungswerteAnzeigenTableComponent } from './components/teilzahlungswerte-anzeigen-table/teilzahlungswerte-anzeigen-table.component';

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
        AnbieterZertifikateComponent,
        AnbieterZertifikateFormComponent,
        MutationsantragSichtenPageComponent,
        MitteilungenAnzeigenPageComponent,
        MitteilungAnzeigenPageComponent,
        AnbieterAufgabenAnzeigenPageComponent,
        AbrechnungenAnzeigenComponent,
        AbrechnungErfassenComponent,
        AnbieterAbrechnungFormComponent,
        FieldEnablePipe,
        TeilzahlungenUebersichtComponent,
        TeilzahlungenUebersichtTableComponent,
        AbrechnungBearbeitenComponent,
        TeilzahlungFormComponent,
        TeilzahlungErfassenPageComponent,
        AnbieterTeilzahlungswerteTableComponent,
        AbrechnungswerteZuordnenModalComponent,
        TeilzahlungBearbeitenPageComponent,
        LeistungsvereinbarungErfassenPageComponent,
        LeistungsvereinbarungFormComponent,
        VertragswerteTableComponent,
        AbrechnungswerteZuordnenModalComponent,
        AuszahlungenZurAbrechnungModalComponent,
        AuszahlungenZurAbrechnungTableComponent,
        RahmenvertraegeUebersichtComponent,
        LeistungsvereinbarungBearbeitenPageComponent,
        VertragswertHomeComponent,
        AbrechnungswertHomeComponent,
        TeilzahlungswertHomeComponent,
        LeistungsvereinbarungHomeComponent,
        LeistungsvereinbarungenHomeComponent,
        LeistungsvereinbarungenUebersichtComponent,
        RahmenvertragErfassenComponent,
        RahmenvertragFormComponent,
        LeistungsvereinbarungenTableComponent,
        TeilzahlungswerteZuordnenModalComponent,
        VertragswertControllingwerteComponent,
        LeistungsvereinbarungenTableComponent,
        AbrechnungswertSuchenComponent,
        AbrechnungswertSuchenFormComponent,
        AbrechnungenSuchenComponent,
        AbrechnungenSuchenFormComponent,
        DurchfuehrungseinheitenModalComponent,
        DurchfuehrungseinheitenTableComponent,
        AbrechnungenSuchenTableComponent,
        AnbieterAbrechnungswertTableComponent,
        RahmenvertragBearbeitenComponent,
        RahmenvertragZuordnenModalComponent,
        RahmenvertragZuordnenTableComponent,
        AuszahlungenZurTeilzahlungModalComponent,
        AuszahlungenZurLeistungsvereinbarungModalComponent,
        AuszahlungenZurLeistungsvereinbarungTableComponent,
        VertragswertErfassenWizardComponent,
        ObjektAuswaehlenComponent,
        PlanwertAuswaehlenErfassenComponent,
        VertragswertDetailErfassenComponent,
        VertragswertDetailFormComponent,
        AuszahlungsdatenTableComponent,
        VertragswertPlanwertTableComponent,
        VertragswertAsalDatenComponent,
        TeilzahlungswerteUebersichtComponent,
        VertragswertErfassenTreeTableComponent,
        TeilzahlungswertSuchenComponent,
        TeilzahlungswertSuchenFormComponent,
        VertragswertTeilzahlungswerteTableComponent,
        TeilzahlungswertFormComponent,
        TeilzahlungswertErfassenPageComponent,
        AbrechnungswertGrunddatenComponent,
        AbrechnungswertGrunddatenFormComponent,
        TeilzahlungswertVertragswertTableComponent,
        AbrechnungswertErfassenWizardComponent,
        AbrechnungswertGrunddatenErfassenComponent,
        AbrechnungswertKostenErfassenComponent,
        TeilzahlungswertBearbeitenComponent,
        MeldungenPageComponent,
        TeilzahlungZuordnenModalComponent,
        GeschaeftePageComponent,
        AbrechnungZuordnenModalComponent,
        AbrechnungswertKostenFormComponent,
        VertragswertBearbeitenPageComponent,
        AufgabenErfassenPageComponent,
        AbrechnungswertKostenaufteilungComponent,
        AbrechnungswertKostenComponent,
        TeilzahlungswerteAnzeigenModalComponent,
        TeilzahlungswerteAnzeigenTableComponent
    ],
    imports: [CommonModule, AnbieterRoutingModule, ReactiveFormsModule, FormsModule, SharedModule, CdkTableModule],
    exports: [FieldEnablePipe],
    providers: [AbrechnungswertService, RahmenvertragService, LeistungsvereinbarungenNavigationService]
})
export class AnbieterModule {}
