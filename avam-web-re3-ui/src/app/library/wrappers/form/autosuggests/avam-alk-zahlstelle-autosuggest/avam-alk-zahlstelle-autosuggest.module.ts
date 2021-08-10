import { ZahlstelleSuchenModule } from './../../../../../shared/components/zahlstelle-suchen/zahlstelle-suchen.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { ObliqueModule } from 'oblique-reactive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AlignPopupTemplateAndInputModule } from '../directives/align-popup-template-and-input/align-popup-template-and-input.module';
import { ArrowScrollingModule } from '../directives/arrow-scrolling/arrow-scrolling.module';
import { AvamAlkZahlstelleAutosuggestComponent } from './avam-alk-zahlstelle-autosuggest.component';

@NgModule({
    declarations: [AvamAlkZahlstelleAutosuggestComponent],
    exports: [AvamAlkZahlstelleAutosuggestComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        TranslateModule,
        CoreComponentsModule,
        ObliqueModule,
        NgbModule,
        AlignPopupTemplateAndInputModule,
        ArrowScrollingModule,
        ZahlstelleSuchenModule
    ],
    providers: []
})
export class AvamAlkZahlstelleAutosuggestModule {
    constructor() {}
}
