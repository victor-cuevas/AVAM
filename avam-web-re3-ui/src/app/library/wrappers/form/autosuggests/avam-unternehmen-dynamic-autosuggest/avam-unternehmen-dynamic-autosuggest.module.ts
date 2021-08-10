import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { ObliqueModule } from 'oblique-reactive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AlignPopupTemplateAndInputModule } from '../directives/align-popup-template-and-input/align-popup-template-and-input.module';
import { ArrowScrollingModule } from '../directives/arrow-scrolling/arrow-scrolling.module';
import { AvamUnternehmenDynamicAutosuggestComponent } from './avam-unternehmen-dynamic-autosuggest.component';
import { AvamUnternehmenAutosuggestComponentModule } from '../avam-unternehmen-autosuggest/avam-unternehmen-autosuggest.module';

@NgModule({
    declarations: [AvamUnternehmenDynamicAutosuggestComponent],
    exports: [AvamUnternehmenDynamicAutosuggestComponent],
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
        AvamUnternehmenAutosuggestComponentModule
    ],
    providers: []
})
export class AvamUnternehmenDynamicAutosuggestModule {
    constructor() {}
}
