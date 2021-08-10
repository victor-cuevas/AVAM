import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { CdkTableModule } from '@angular/cdk/table';
import { GeschlechtPipe } from '@app/shared';
// prettier-ignore
import {
    StellenmeldepflichtBerufePageComponent
} from '@modules/arbeitgeber/stellenangebot/pages/stellenmeldepflicht-berufe-page/stellenmeldepflicht-berufe-page.component';
import { StellenmeldepflichtPruefenComponent } from '@modules/arbeitgeber/stellenangebot/pages/stellenmeldepflicht-pruefen/stellenmeldepflicht-pruefen.component';
import { ArbeitgeberStellenangebotRoutingModule } from '@modules/arbeitgeber/stellenangebot/arbeitgeber-stellenangebot-routing.module';
import { StellenSuchenComponent } from './pages/stellen-suchen/stellen-suchen.component';
import { JobroomMeldungenSuchenComponent } from './pages/jobroom-meldungen-suchen/jobroom-meldungen-suchen.component';
import { StellenSuchenTableComponent } from './pages/stellen-suchen/stellen-suchen-table/stellen-suchen-table.component';
import { JobroomMeldungenSearchFormComponent } from './components/jobroom-meldungen-search-form/jobroom-meldungen-search-form.component';
import { JobroomMeldungenSearchTableComponent } from './components/jobroom-meldungen-search-table/jobroom-meldungen-search-table.component';
import { JobroomMeldungVerifizierenComponent } from './pages/jobroom-meldung-verifizieren/jobroom-meldung-verifizieren.component';
import { MeldungAblehnenModalComponent } from './pages/jobroom-meldung-verifizieren/meldung-ablehnen-modal/meldung-ablehnen-modal.component';
import { StelleVerifizierenComponent } from './components/stelle-verifizieren/stelle-verifizieren.component';
import { JobroomArbeitgeberZuordnenComponent } from './components/jobroom-arbeitgeber-zuordnen/jobroom-arbeitgeber-zuordnen.component';
import { MeldungWeiterleitenModalComponent } from './pages/jobroom-meldung-verifizieren/meldung-weiterleiten-modal/meldung-weiterleiten-modal.component';
import { StelleUebernehmenComponent } from './components/stelle-uebernehmen/stelle-uebernehmen.component';
import { Step1JobroomErfassenComponent } from './components/stelle-uebernehmen/step1-jobroom-erfassen/step1-jobroom-erfassen.component';
import { Step2JobroomErfassenComponent } from './components/stelle-uebernehmen/step2-jobroom-erfassen/step2-jobroom-erfassen.component';
import { Step3JobroomErfassenComponent } from './components/stelle-uebernehmen/step3-jobroom-erfassen/step3-jobroom-erfassen.component';
import { Step4JobroomErfassenComponent } from './components/stelle-uebernehmen/step4-jobroom-erfassen/step4-jobroom-erfassen.component';
import { JobroomArbeitgeberErfassenComponent } from './components/jobroom-arbeitgeber-erfassen/jobroom-arbeitgeber-erfassen.component';

@NgModule({
    declarations: [
        StellenmeldepflichtBerufePageComponent,
        StellenmeldepflichtPruefenComponent,
        StellenSuchenComponent,
        JobroomMeldungenSuchenComponent,
        JobroomMeldungenSearchFormComponent,
        StellenSuchenTableComponent,
        JobroomMeldungenSearchTableComponent,
        JobroomMeldungVerifizierenComponent,
        MeldungAblehnenModalComponent,
        StelleVerifizierenComponent,
        JobroomArbeitgeberZuordnenComponent,
        MeldungWeiterleitenModalComponent,
        StelleUebernehmenComponent,
        Step1JobroomErfassenComponent,
        Step2JobroomErfassenComponent,
        Step3JobroomErfassenComponent,
        Step4JobroomErfassenComponent,
        JobroomArbeitgeberErfassenComponent
    ],
    imports: [CommonModule, ReactiveFormsModule, ArbeitgeberStellenangebotRoutingModule, FormsModule, SharedModule, CdkTableModule],
    providers: [GeschlechtPipe]
})
export class ArbeitgeberStellenangebotModule {}
