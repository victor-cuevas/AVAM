import { ToolboxService } from '@app/shared';
import { AmmRestService } from './http/amm-rest.service';
import { NgModule } from '@angular/core';
import { StesDataRestService } from './http/stes-data-rest.service';
import { StesSearchRestService } from './http/stes-search-rest.service';
import { StesTerminRestService } from './http/stes-termin-rest.service';
import { DocumentMetaService, MasterLayoutService, NotificationService, ObliqueHttpInterceptor } from 'oblique-reactive';
import { HeaderControlsComponent } from './components/header-controls/header.controls.component';
import { SharedModule } from '@shared/shared.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { AuthGuard } from './guards/auth.guard';
import { AuthenticationService } from './services/authentication.service';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { CoreRoutingModule } from './core-routing.module';
import { AuthenticationRestService } from './http/authentication-rest.service';
import { ArbeitsvermittlungRestService } from './http/arbeitsvermittlung-rest.service';
import { UnternehmenRestService } from './http/unternehmen-rest.service';
import { PermissionGuard } from './guards/permission.guard';
import { OsteDataRestService } from './http/oste-data-rest.service';
import { StesZasRestService } from './http/stes-zas-rest.service';
import { PermissionPipe } from './pipes/permission.pipe';
import { EnvironmentRestService } from './http/environment-rest.service';
import { FooterInfosComponent } from './components/footer-infos/footer-infos.component';
import { BenutzerstelleAendernRestService } from './http/benutzerstelle-aendern-rest.service';
import { SchnellsucheComponent } from './components/header-controls/schnellsuche/schnellsuche.component';
import { SchnellsucheRestService } from './http/schnellsuche-rest.service';
import { InfotagRestService } from './http/infotag-rest.service';
import { UrlRestService } from '@core/http/url-rest.service';
import { InfoMessageRestService } from '@core/http/info-message-rest.service';
import { DmsMetadatenCopyRestService } from '@core/http/dms-metadaten-copy-rest.service';
import { DokumentVorlagenRestService } from '@core/http/dokument-vorlagen-rest.service';
import { GuidedTourConfigRestService } from '@core/http/guided-tour-config-rest.service';
import { DmsRestService } from '@core/http/dms-rest.service';
import { TopNavigationComponent } from './components/top-navigation/top-navigation.component';
import { GekoMeldungRestService } from '@core/http/geko-meldung-rest.service';
import { GekoStesRestService } from '@core/http/geko-stes-rest.service';
import { GekoAufgabenRestService } from '@core/http/geko-aufgaben-rest.service';
import { KontaktpersonRestService } from '@core/http/kontaktperson-rest.service';
import { BewirtschaftungRestService } from './http/bewirtschaftung-rest.service';
import { TeilzahlungenRestService } from './http/teilzahlungen-rest.service';
import { AbrechnungenRestService } from '@core/http/abrechnungen-rest.service';
import { KontaktRestService } from '@core/http/kontakt-rest.service';
import { KundenberaterRestService } from '@core/http/kundenberater-rest.service';
import { UnternehmenTerminRestService } from '@core/http/unternehmen-termin-rest.service';
import { SchlagworteRestService } from '@core/http/schlagworte-rest.service';
import { FachberatungsangeboteRestService } from '@core/http/fachberatungsangebot-rest.service';
import { VoranmeldungKaeRestService } from '@core/http/voranmeldung-kae-rest.service';
import { SweMeldungRestService } from '@core/http/swe-meldung-rest.service';
import { LanguageInterceptor } from '@core/interceptors/language.interceptor';
import { AnbieterRestService } from './http/anbieter-rest.service';
import { RahmenfristKaeSweRestService } from '@core/http/rahmenfrist-kae-swe-rest.service';
import { VertraegeRestService } from './http/vertraege-rest.service';
import { GekoArbeitgeberRestService } from '@core/http/geko-arbeitgeber-rest.service';
import { AmmAdministrationRestService } from '@app/modules/amm/administration/services/amm-administration-rest.service';
import { GekoRegelRestService } from '@core/http/geko-regel-rest.service';
import { BenutzerstelleRestService } from '@core/http/benutzerstelle-rest.service';
import { RolleRestService } from '@core/http/rolle-rest.service';
import { BenutzermeldungRestService } from '@core/http/benutzermeldung-rest.service';

@NgModule({
    declarations: [HeaderControlsComponent, PermissionPipe, FooterInfosComponent, SchnellsucheComponent, TopNavigationComponent],
    exports: [HeaderControlsComponent, PermissionPipe, FooterInfosComponent, TopNavigationComponent],
    imports: [HttpClientModule, CoreRoutingModule, SharedModule],
    providers: [
        ArbeitsvermittlungRestService,
        AnbieterRestService,
        DmsMetadatenCopyRestService,
        InfotagRestService,
        DokumentVorlagenRestService,
        GuidedTourConfigRestService,
        GekoAufgabenRestService,
        GekoStesRestService,
        GekoMeldungRestService,
        GekoArbeitgeberRestService,
        GekoRegelRestService,
        BenutzerstelleRestService,
        RolleRestService,
        BenutzermeldungRestService,
        KontaktRestService,
        KontaktpersonRestService,
        KundenberaterRestService,
        InfoMessageRestService,
        UnternehmenRestService,
        UnternehmenTerminRestService,
        SweMeldungRestService,
        VoranmeldungKaeRestService,
        RahmenfristKaeSweRestService,
        SchlagworteRestService,
        StesDataRestService,
        StesSearchRestService,
        StesTerminRestService,
        UrlRestService,
        StesZasRestService,
        EnvironmentRestService,
        DocumentMetaService,
        MasterLayoutService,
        NotificationService,
        AuthGuard,
        PermissionGuard,
        AuthenticationService,
        OsteDataRestService,
        AuthenticationRestService,
        BenutzerstelleAendernRestService,
        SchnellsucheRestService,
        DmsRestService,
        AmmRestService,
        ToolboxService,
        BewirtschaftungRestService,
        AbrechnungenRestService,
        FachberatungsangeboteRestService,
        VertraegeRestService,
        TeilzahlungenRestService,
        AmmAdministrationRestService,
        { provide: HTTP_INTERCEPTORS, useClass: ObliqueHttpInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: LanguageInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    ]
})
export class CoreModule {
    constructor() {}
}
