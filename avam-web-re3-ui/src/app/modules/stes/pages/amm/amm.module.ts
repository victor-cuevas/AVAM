import { CommonModule, registerLocaleData } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ObliqueModule } from 'oblique-reactive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AmmRoutingModule } from './amm-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { UebersichtComponent } from './pages/uebersicht/uebersicht.component';
import { AuszugComponent } from './pages/auszug/auszug.component';
import { AmmnutzungWizardComponent } from './pages/uebersicht/individuelle-amm/ammnutzung-wizard.component';
import { BuchungComponent } from './pages/uebersicht/individuelle-amm/buchung/buchung.component';
import { GesuchComponent } from './pages/uebersicht/spezielle-amm/ausbildungszuschuss/gesuch/gesuch.component';
import { DurchfuehrungsortComponent } from './pages/uebersicht/individuelle-amm/durchfuehrungsort/durchfuehrungsort.component';
import { BeschreibungComponent } from './pages/uebersicht/beschreibung/beschreibung.component';
import { AzKostenComponent } from './pages/uebersicht/spezielle-amm/ausbildungszuschuss/az-kosten/az-kosten.component';
import { FseGesuchComponent } from './pages/uebersicht/spezielle-amm/fse/fse-gesuch/fse-gesuch.component';
import { FseKostenComponent } from './pages/uebersicht/spezielle-amm/fse/fse-kosten/fse-kosten.component';
import { PewoKostenComponent } from './pages/uebersicht/spezielle-amm/pewo/pewo-kosten/pewo-kosten.component';
import { MassnahmeBuchenWizardComponent } from './pages/uebersicht/kollektive-amm/wizard/massnahme-buchen-wizard.component';
import { BuchungErfassenComponent } from './pages/uebersicht/kollektive-amm/wizard/pages/buchung-erfassen/buchung-erfassen.component';
import { EazKostenComponent } from './pages/uebersicht/spezielle-amm/einarbeitungszuschuss/eaz-kosten/eaz-kosten.component';
import { AngebotSuchenComponent } from './pages/uebersicht/kollektive-amm/wizard/pages/angebot-suchen/angebot-suchen.component';
import { AmmBimBemEntscheidComponent } from './pages/uebersicht/amm-bim-bem-entscheid/amm-bim-bem-entscheid.component';
import { KursKollektivBearbeitenComponent } from './pages/uebersicht/kollektive-amm/kurs-kollektiv-bearbeiten/kurs-kollektiv-bearbeiten.component';
import { MassnahmeBuchenComponent } from './pages/uebersicht/kollektive-amm/wizard/pages/massnahme-buchen/massnahme-buchen.component';
import { AmmSpeziellEntscheidComponent } from './pages/uebersicht/amm-speziell-entscheid/amm-speziell-entscheid.component';
import { IndividuelleKostenComponent } from './pages/uebersicht/individuelle-amm/individuelle-kosten/individuelle-kosten.component';
import { EazGesuchComponent } from './pages/uebersicht/spezielle-amm/einarbeitungszuschuss/eaz-gesuch/eaz-gesuch.component';
import { PewoGesuchComponent } from './pages/uebersicht/spezielle-amm/pewo/pewo-gesuch/pewo-gesuch.component';
import { BPKostenComponent } from './pages/uebersicht/bp-kosten/bp-kosten.component';
import { SpesenComponent } from './pages/uebersicht/spesen/spesen.component';
import { DurchfuehrungsortAngebotComponent } from './pages/uebersicht/kollektive-amm/kurs-individuell-angebot/durchfuehrungsort-angebot/durchfuehrungsort-angebot.component';
import { TeilnehmerWartelisteComponent } from './pages/uebersicht/kollektive-amm/teilnehmer/teilnehmer-warteliste.component';
import { TeilnehmerplaetzeComponent } from './pages/uebersicht/teilnehmerplaetze/teilnehmerplaetze.component';
import { BuchungAngebotComponent } from './pages/uebersicht/kollektive-amm/kurs-individuell-angebot/buchung-angebot/buchung-angebot.component';
import { AmmControllerComponent } from './amm-controller.component';
import { BeschreibungAngebotComponent } from './pages/uebersicht/kollektive-amm/kurs-individuell-angebot/beschreibung-angebot/beschreibung-angebot.component';
import { PsakBearbeitenComponent } from './pages/uebersicht/kollektive-amm/psak-bearbeiten/psak-bearbeiten.component';
import { AmmGeschaeftSuchenComponent } from './pages/amm-geschaeft-suchen/amm-geschaeft-suchen.component';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import {
    AngebotsdatenSichtenComponent,
    AngebotsdatenGrunddatenComponent,
    AngebotsdatenBeschreibungComponent,
    AngebotsdatenDurchfuehrungsortComponent
} from './pages/uebersicht/kollektive-amm/wizard/components/index';
import { AngebotSuchenTableComponent } from './pages/uebersicht/kollektive-amm/wizard/components/angebot-suchen-table/angebot-suchen-table.component';
import { CdkTableModule } from '@angular/cdk/table';

import localeCh from '@angular/common/locales/de-CH';
import { LocaleEnum } from '@app/shared/enums/locale.enum';

registerLocaleData(localeCh, LocaleEnum.SWITZERLAND);

@NgModule({
    declarations: [
        UebersichtComponent,
        AuszugComponent,
        AmmnutzungWizardComponent,
        BuchungComponent,
        GesuchComponent,
        DurchfuehrungsortComponent,
        BeschreibungComponent,
        AzKostenComponent,
        FseGesuchComponent,
        FseKostenComponent,
        PewoKostenComponent,
        MassnahmeBuchenWizardComponent,
        BuchungErfassenComponent,
        EazKostenComponent,
        AngebotSuchenComponent,
        AmmBimBemEntscheidComponent,
        KursKollektivBearbeitenComponent,
        MassnahmeBuchenComponent,
        AmmSpeziellEntscheidComponent,
        EazGesuchComponent,
        PewoGesuchComponent,
        BPKostenComponent,
        IndividuelleKostenComponent,
        SpesenComponent,
        DurchfuehrungsortAngebotComponent,
        TeilnehmerWartelisteComponent,
        TeilnehmerplaetzeComponent,
        BuchungAngebotComponent,
        AmmControllerComponent,
        BeschreibungAngebotComponent,
        PsakBearbeitenComponent,
        AngebotsdatenSichtenComponent,
        AngebotsdatenGrunddatenComponent,
        AngebotsdatenBeschreibungComponent,
        AngebotsdatenDurchfuehrungsortComponent,
        AmmGeschaeftSuchenComponent,
        AngebotSuchenTableComponent
    ],
    entryComponents: [AngebotsdatenSichtenComponent],
    exports: [],
    imports: [CommonModule, AmmRoutingModule, SharedModule, CdkTableModule],
    providers: [ObliqueHelperService]
})
export class AmmModule {
    constructor() {}
}
