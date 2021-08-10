import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { SharedModule } from '@app/shared/shared.module';
import * as components from './components/index';
import { InfotagRoutingModule } from './infotag-routing.module';
import * as pages from './pages/index';
import { AmmInfotagRestService } from './services/amm-infotag-rest.service';
import { AmmInfotagStorageService } from './services/amm-infotag-storage.service';

@NgModule({
    declarations: [
        components.InfotagMassnahmeSuchenFormComponent,
        components.InfotagMassnahmeGrunddatenFormComponent,
        components.InfotagMassnahmeBeschreibungFormComponent,
        components.InfotagMassnahmeSuchenTableComponent,
        components.InfotagBewirtschaftungSuchenFormComponent,
        components.InfotagBewirtschaftungGrunddatenFormComponent,
        components.InfotagBewirtschaftungSuchenTableComponent,
        components.InfotageUebersichtTableComponent,
        components.AmmInfotagTeilnehmerlisteTableComponent,
        pages.InfotagMassnahmeSuchenComponent,
        pages.InfotagMassnahmeErfassenWizardComponent,
        pages.InfotagMassnahmeGrunddatenErfassenComponent,
        pages.InfotagMassnahmeBeschreibungErfassenComponent,
        pages.InfotagMassnahmeHomeComponent,
        pages.InfotagMassnahmeGrunddatenBearbeitenComponent,
        pages.InfotagMassnahmeBeschreibungBearbeitenComponent,
        pages.InfotagBewirtschaftungSuchenComponent,
        pages.InfotagBewirtschaftungBeschreibungErfassenComponent,
        pages.InfotagBewirtschaftungGrunddatenErfassenComponent,
        pages.InfotageUebersichtComponent,
        pages.InfotagHomeComponent,
        pages.InfotagGrunddatenBearbeitenComponent,
        pages.InfotagTeilnehmerlisteBearbeitenComponent,
        pages.InfotagBeschreibungBearbeitenComponent
    ],
    imports: [CommonModule, InfotagRoutingModule, SharedModule, CdkTableModule],
    providers: [AmmInfotagRestService, SearchSessionStorageService, AmmInfotagStorageService]
})
export class InfotagModule {}
