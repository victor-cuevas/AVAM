import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { GekoRoutingModule } from '@modules/geko/geko-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ObliqueModule } from 'oblique-reactive';
import { TranslateModule } from '@ngx-translate/core';
import { StesSearchComponent } from './pages/stes-search/stes-search.component';
import { GekoMeldungenSearchComponent } from './pages/geko-meldungen-search/geko-meldungen-search.component';
import { GekoMeldungenSearchFormComponent } from './components/geko-meldungen-search-form/geko-meldungen-search-form.component';
import { GekoMeldungenSearchResultComponent } from '@modules/geko/components/geko-meldungen-search-result/geko-meldungen-search-result.component';
import { StesSearchFormComponent } from './components/stes-search-form/stes-search-form.component';
import { StesSearchResultComponent } from './components/stes-search-result/stes-search-result.component';
import { AufgabenSearchComponent } from './pages/aufgaben-search/aufgaben-search.component';
import { AufgabenSearchFormComponent } from '@modules/geko/components/aufgaben-search-form/aufgaben-search-form.component';
import { AufgabenSearchResultComponent } from './components/aufgaben-search-result/aufgaben-search-result.component';
import { GekoSearchHelper } from '@modules/geko/utils/geko-search.helper';
import { GekoAbzumeldendeSearchComponent } from './pages/geko-abzumeldende-search/geko-abzumeldende-search.component';
import { CdkTableModule } from '@angular/cdk/table';
import { AvamGenericTableModule } from '@app/library/wrappers/data/avam-generic-table/avam-generic-table.module';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { AvamFooterModule } from '@app/shared';
import { RouterModule } from '@angular/router';
import { ToolboxModule } from '@shared/components/toolbox/toolbox.module';
import { CustomPopoverModule } from '@shared/directives/custom-popover.module';
import { ArbeitgeberSearchPageComponent } from './pages/arbeitgeber-search-page/arbeitgeber-search-page.component';
import { ArbeitgeberSearchFormComponent } from './components/arbeitgeber-search-form/arbeitgeber-search-form.component';
import { ArbeitgeberSearchComponent } from './components/arbeitgeber-search/arbeitgeber-search.component';
import { AnbieterSearchPageComponent } from './pages/anbieter-search-page/anbieter-search-page.component';
import { GeschaeftsregelnMainContainerComponent } from './components/geschaeftsregeln-main-container/geschaeftsregeln-main-container.component';
import { GeschaeftsregelnComponent } from './pages/geschaeftsregeln/geschaeftsregeln.component';
import { GeschaeftsregelnTableComponent } from './components/geschaeftsregeln-table/geschaeftsregeln-table.component';
import { GeschaeftsregelErfassenComponent } from '@modules/geko/components/geschaeftsregel-erfassen/geschaeftsregel-erfassen.component';
import { GeschaeftsregelFormComponent } from '@modules/geko/components/geschaeftsregel-form/geschaeftsregel-form.component';
import { GeschaeftsregelBearbeitenComponent } from '@modules/geko/components/geschaeftsregel-bearbeiten/geschaeftsregel-bearbeiten.component';

@NgModule({
    declarations: [
        StesSearchComponent,
        GekoMeldungenSearchComponent,
        StesSearchFormComponent,
        GekoMeldungenSearchFormComponent,
        StesSearchResultComponent,
        GekoMeldungenSearchResultComponent,
        AufgabenSearchComponent,
        AufgabenSearchFormComponent,
        AufgabenSearchResultComponent,
        GekoAbzumeldendeSearchComponent,
        ArbeitgeberSearchPageComponent,
        ArbeitgeberSearchFormComponent,
        ArbeitgeberSearchComponent,
        AnbieterSearchPageComponent,
        GeschaeftsregelnMainContainerComponent,
        GeschaeftsregelnComponent,
        GeschaeftsregelErfassenComponent,
        GeschaeftsregelBearbeitenComponent,
        GeschaeftsregelnTableComponent,
        GeschaeftsregelFormComponent
    ],
    providers: [GekoSearchHelper],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NgbModule,
        ObliqueModule.forRoot(),
        TranslateModule.forChild(),
        BsDatepickerModule.forRoot(),
        CoreComponentsModule,
        RouterModule,
        GekoRoutingModule,
        AvamFooterModule,
        ToolboxModule,
        CustomPopoverModule,
        CdkTableModule,
        AvamGenericTableModule,
        SharedModule
    ]
})
export class GekoModule {
    constructor() {}
}
