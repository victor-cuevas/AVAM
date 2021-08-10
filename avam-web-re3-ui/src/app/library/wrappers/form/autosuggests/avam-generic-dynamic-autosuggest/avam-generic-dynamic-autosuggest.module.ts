import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { ObliqueModule } from 'oblique-reactive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AlignPopupTemplateAndInputModule } from '../directives/align-popup-template-and-input/align-popup-template-and-input.module';
import { ArrowScrollingModule } from '../directives/arrow-scrolling/arrow-scrolling.module';
import { AvamGenericDynamicAutosuggestComponent } from './avam-generic-dynamic-autosuggest.component';
import { AvamBrancheAutosuggestModule } from '../avam-branche-autosuggest/avam-branche-autosuggest.module';
import { AvamBerufsgruppeAutosuggestModule } from '../avam-berufsgruppe-autosuggest/avam-berufsgruppe-autosuggest.module';
import { AvamPersonalberaterAutosuggestModule } from '../avam-personalberater-autosuggest/avam-personalberater-autosuggest.module';
import { AvamUnternehmenAutosuggestComponentModule } from '../avam-unternehmen-autosuggest/avam-unternehmen-autosuggest.module';

@NgModule({
    declarations: [AvamGenericDynamicAutosuggestComponent],
    exports: [AvamGenericDynamicAutosuggestComponent],
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
        AvamBrancheAutosuggestModule,
        AvamBerufsgruppeAutosuggestModule,
        AvamPersonalberaterAutosuggestModule,
        AvamUnternehmenAutosuggestComponentModule
    ],
    providers: []
})
export class AvamGenericDynamicAutosuggestModule {
    constructor() {}
}
