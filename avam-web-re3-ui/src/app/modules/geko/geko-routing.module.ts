import { Data, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { StesSearchComponent } from '@modules/geko/pages/stes-search/stes-search.component';
import { GekoMeldungenSearchComponent } from '@modules/geko/pages/geko-meldungen-search/geko-meldungen-search.component';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { AufgabenSearchComponent } from '@modules/geko/pages/aufgaben-search/aufgaben-search.component';
import { GekoAbzumeldendeSearchComponent } from '@modules/geko/pages/geko-abzumeldende-search/geko-abzumeldende-search.component';
import { ArbeitgeberSearchPageComponent } from '@modules/geko/pages/arbeitgeber-search-page/arbeitgeber-search-page.component';
import { AnbieterSearchPageComponent } from '@modules/geko/pages/anbieter-search-page/anbieter-search-page.component';
import { GeschaeftsregelnMainContainerComponent } from '@modules/geko/components/geschaeftsregeln-main-container/geschaeftsregeln-main-container.component';
import { Permissions } from '@shared/enums/permissions.enum';
import { GeschaeftsregelnComponent } from '@modules/geko/pages/geschaeftsregeln/geschaeftsregeln.component';
import { GeschaeftsregelErfassenComponent } from '@modules/geko/components/geschaeftsregel-erfassen/geschaeftsregel-erfassen.component';
import { CanDeactivateGuard } from '@shared/services/can-deactive-guard.service';
import { GeschaeftsregelBearbeitenComponent } from '@modules/geko/components/geschaeftsregel-bearbeiten/geschaeftsregel-bearbeiten.component';

const geschaefteSuchenStesData: Data = { title: 'geko.topmenuitem.geschaefteSuchenStes', formNumber: StesFormNumberEnum.GEKO_STES_SUCHEN };
const arbeitgeberSuchenData: Data = { title: 'geko.topmenuitem.geschaefteSuchenAG', formNumber: StesFormNumberEnum.GEKO_ARBEITGEBER_SUCHEN };
const anbieterSuchenData: Data = { title: 'geko.topmenuitem.geschaefteSuchenAMM', formNumber: StesFormNumberEnum.GEKO_ANBIETER_SUCHEN };
const meldungenSuchenData: Data = { title: 'geko.topmenuitem.meldungenSuchen', formNumber: StesFormNumberEnum.GEKO_MELDUNGEN };
const auswertungenSuchenData: Data = { title: 'geko.topmenuitem.abzumeldendeStesSuchen', formNumber: StesFormNumberEnum.GEKO_ABZUMELDENDE_SUCHEN };
const aufgabeSuchenData: Data = { title: 'geko.topmenuitem.aufgabenSuchen', formNumber: StesFormNumberEnum.GEKO_AUFGABEN_SUCHEN };
const gekoRoutes: Routes = [
    {
        path: 'stes/search',
        component: StesSearchComponent,
        data: geschaefteSuchenStesData
    },
    {
        path: 'arbeitgeber/search',
        component: ArbeitgeberSearchPageComponent,
        data: arbeitgeberSuchenData
    },
    {
        path: 'anbieter/search',
        component: AnbieterSearchPageComponent,
        data: anbieterSuchenData
    },
    {
        path: 'meldung/search',
        component: GekoMeldungenSearchComponent,
        data: meldungenSuchenData
    },
    {
        path: 'auswertungen/search',
        component: GekoAbzumeldendeSearchComponent,
        data: auswertungenSuchenData
    },
    {
        path: 'aufgaben/search',
        component: AufgabenSearchComponent,
        data: aufgabeSuchenData
    },
    {
        path: 'geschaeftsregeln',
        component: GeschaeftsregelnMainContainerComponent,
        children: [
            {
                path: '',
                component: GeschaeftsregelnComponent,
                pathMatch: 'full',
                data: {
                    title: 'geko.subnavmenuitem.geschaeftsregeln',
                    formNumber: StesFormNumberEnum.GESCHAEFTSREGELN,
                    permissions: [Permissions.FEATURE_35, Permissions.GEKO_REGELN_SUCHEN]
                }
            },
            {
                path: 'erfassen',
                component: GeschaeftsregelErfassenComponent,
                canDeactivate: [CanDeactivateGuard],
                data: {
                    title: 'geko.subnavmenuitem.geschaeftsregel.erfassen',
                    formNumber: StesFormNumberEnum.GESCHAEFTSREGEL_ERFASSEN,
                    permissions: [Permissions.FEATURE_35, Permissions.GEKO_REGELN_ERFASSEN]
                }
            },
            {
                path: 'bearbeiten',
                component: GeschaeftsregelBearbeitenComponent,
                canDeactivate: [CanDeactivateGuard],
                data: {
                    title: 'geko.subnavmenuitem.geschaeftsregel.bearbeiten',
                    formNumber: StesFormNumberEnum.GESCHAEFTSREGEL_BEARBEITEN,
                    permissions: [Permissions.FEATURE_35, Permissions.GEKO_REGELN_BEARBEITEN, Permissions.GEKO_REGELN_LOESCHEN]
                }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(gekoRoutes)],
    exports: [RouterModule]
})
export class GekoRoutingModule {}
