import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { ArbeitgeberPaths, UnternehmenPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { UnternehmenTitles, UnternehmenTypes } from '@app/shared/enums/unternehmen.enum';
import { Permissions } from '@shared/enums/permissions.enum';
import { StellenmeldepflichtPruefenComponent } from '@modules/arbeitgeber/stellenangebot/pages/stellenmeldepflicht-pruefen/stellenmeldepflicht-pruefen.component';
import { StellenmeldepflichtBerufePageComponent } from '@modules/arbeitgeber/stellenangebot/pages/stellenmeldepflicht-berufe-page/stellenmeldepflicht-berufe-page.component';
import { StellenSuchenComponent } from '@modules/arbeitgeber/stellenangebot/pages/stellen-suchen/stellen-suchen.component';
import { JobroomMeldungenSuchenComponent } from '@modules/arbeitgeber/stellenangebot/pages/jobroom-meldungen-suchen/jobroom-meldungen-suchen.component';
import { JobroomMeldungVerifizierenComponent } from '@modules/arbeitgeber/stellenangebot/pages/jobroom-meldung-verifizieren/jobroom-meldung-verifizieren.component';
import { PermissionGuard } from '@core/guards/permission.guard';
import { StelleVerifizierenComponent } from '@modules/arbeitgeber/stellenangebot/components/stelle-verifizieren/stelle-verifizieren.component';
import { JobroomArbeitgeberZuordnenComponent } from '@modules/arbeitgeber/stellenangebot/components/jobroom-arbeitgeber-zuordnen/jobroom-arbeitgeber-zuordnen.component';
import { StelleUebernehmenComponent } from '@modules/arbeitgeber/stellenangebot/components/stelle-uebernehmen/stelle-uebernehmen.component';
import { Step1JobroomErfassenComponent } from '@modules/arbeitgeber/stellenangebot/components/stelle-uebernehmen/step1-jobroom-erfassen/step1-jobroom-erfassen.component';
import { Step2JobroomErfassenComponent } from '@modules/arbeitgeber/stellenangebot/components/stelle-uebernehmen/step2-jobroom-erfassen/step2-jobroom-erfassen.component';
import { Step3JobroomErfassenComponent } from '@modules/arbeitgeber/stellenangebot/components/stelle-uebernehmen/step3-jobroom-erfassen/step3-jobroom-erfassen.component';
import { Step4JobroomErfassenComponent } from '@modules/arbeitgeber/stellenangebot/components/stelle-uebernehmen/step4-jobroom-erfassen/step4-jobroom-erfassen.component';

const arbeitgeberStellenangebotRoutes: Routes = [
    {
        path: ArbeitgeberPaths.STELLENANGEBOT_STELLENMELDEPFLICHT_PRUEFEN,
        component: StellenmeldepflichtPruefenComponent,
        data: {
            title: UnternehmenTitles.ARBEITGEBER_STELLENMELDEPFLICHT_PRUEFEN,
            formNumber: StesFormNumberEnum.ARBEITGEBER_STELLENMEDEPFLICHT_PRUEFEN,
            permissions: [Permissions.FEATURE_33]
        }
    },
    {
        path: UnternehmenPaths.STELLEN_MELDEPLICHT_BERUFE_LISTE,
        component: StellenmeldepflichtBerufePageComponent,
        data: {
            title: UnternehmenTitles.MELDEPFLICHT_LISTE,
            formNumber: StesFormNumberEnum.MELDEPFLICHT_LISTE,
            permissions: [Permissions.FEATURE_33],
            type: UnternehmenTypes.ANBIETER
        }
    },
    {
        path: UnternehmenPaths.STELLEN_SUCHEN,
        component: StellenSuchenComponent,
        data: {
            title: UnternehmenTitles.STELLENANGEBOTE,
            formNumber: StesFormNumberEnum.STELLE_SUCHEN,
            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_SUCHEN]
        }
    },
    {
        path: UnternehmenPaths.JOBROOM_MELDUNGEN_SUCHEN,
        component: JobroomMeldungenSuchenComponent,
        data: {
            title: UnternehmenTitles.JOBROOM_MELDUNGEN_SUCHEN,
            formNumber: StesFormNumberEnum.JOBROOM_MELDUNGEN_SUCHEN,
            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_JOBROOM_SUCHEN]
        }
    },
    {
        path: UnternehmenPaths.JOBROOM_MELDUNG_VERFIZIEREN,
        component: JobroomMeldungVerifizierenComponent,
        data: {
            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_BEARBEITEN]
        },
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: StelleVerifizierenComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: UnternehmenTitles.STELLE_VERIFIZIEREN,
                    permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_BEARBEITEN],
                    formNumber: StesFormNumberEnum.JOBROOM_MELDUNG_VERFIZIEREN
                }
            },
            {
                path: UnternehmenPaths.JOBROOM_MELDUNG_ZUORDNEN,
                component: JobroomArbeitgeberZuordnenComponent,
                data: {
                    title: UnternehmenTitles.ARBEITGEBER_ZUORDNEN,
                    formNumber: StesFormNumberEnum.JOBROOM_MELDUNG_ZUORDNEN,
                    permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_BEARBEITEN]
                }
            },
            {
                path: UnternehmenPaths.JOBROOM_MELDUNG_UEBERNEHMEN,
                component: StelleUebernehmenComponent,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        component: Step1JobroomErfassenComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: UnternehmenTitles.BASISANGABEN,
                            formNumber: StesFormNumberEnum.JOBROOM_MELDUNG_BASISANGABEN,
                            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_BEARBEITEN]
                        }
                    },
                    {
                        path: 'step2',
                        component: Step2JobroomErfassenComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: UnternehmenTitles.ANFORDERUNGEN,
                            formNumber: StesFormNumberEnum.JOBROOM_MELDUNG_ANFORDERUNGEN,
                            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_BEARBEITEN]
                        }
                    },
                    {
                        path: 'step3',
                        component: Step3JobroomErfassenComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: UnternehmenTitles.BEWERBUNG,
                            formNumber: StesFormNumberEnum.JOBROOM_MELDUNG_BEWERBUNG,
                            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_BEARBEITEN]
                        }
                    },
                    {
                        path: 'step4',
                        component: Step4JobroomErfassenComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            title: UnternehmenTitles.BEWIRTSCHAFTUNG,
                            formNumber: StesFormNumberEnum.JOBROOM_MELDUNG_BEWIRTSCHAFTUNG,
                            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_BEARBEITEN]
                        }
                    }
                ]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(arbeitgeberStellenangebotRoutes)],
    exports: [RouterModule]
})
export class ArbeitgeberStellenangebotRoutingModule {}
