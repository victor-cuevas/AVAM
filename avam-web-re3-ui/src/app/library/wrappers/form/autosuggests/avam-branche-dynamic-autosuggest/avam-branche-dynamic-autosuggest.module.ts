import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { ObliqueModule } from 'oblique-reactive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AvamBrancheDynamicAutosuggestComponent } from './avam-branche-dynamic-autosuggest.component';
import { AvamBrancheAutosuggestModule } from '../avam-branche-autosuggest/avam-branche-autosuggest.module';
import { AlignPopupTemplateAndInputModule } from '../directives/align-popup-template-and-input/align-popup-template-and-input.module';
import { ArrowScrollingModule } from '../directives/arrow-scrolling/arrow-scrolling.module';

@NgModule({
    declarations: [AvamBrancheDynamicAutosuggestComponent],
    exports: [AvamBrancheDynamicAutosuggestComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        TranslateModule,
        CoreComponentsModule,
        ObliqueModule,
        NgbModule,
        AvamBrancheAutosuggestModule,
        AlignPopupTemplateAndInputModule,
        ArrowScrollingModule
    ],
    providers: []
})
export class AvamBrancheDynamicAutosuggestModule {
    constructor() {}
}
