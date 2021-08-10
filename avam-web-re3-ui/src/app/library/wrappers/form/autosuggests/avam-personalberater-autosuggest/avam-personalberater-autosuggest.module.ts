import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { ObliqueModule } from 'oblique-reactive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AlignPopupTemplateAndInputModule } from '../directives/align-popup-template-and-input/align-popup-template-and-input.module';
import { ArrowScrollingModule } from '../directives/arrow-scrolling/arrow-scrolling.module';
import { AvamPersonalberaterAutosuggestComponent } from './avam-personalberater-autosuggest.component';
import { BenutzerInfoTemplateComponent } from '@app/shared/components/benutzer-info-template/benutzer-info-template.component';

@NgModule({
    declarations: [AvamPersonalberaterAutosuggestComponent, BenutzerInfoTemplateComponent],
    exports: [AvamPersonalberaterAutosuggestComponent, BenutzerInfoTemplateComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        TranslateModule,
        CoreComponentsModule,
        ObliqueModule,
        NgbModule,
        AlignPopupTemplateAndInputModule,
        ArrowScrollingModule
    ],
    providers: []
})
export class AvamPersonalberaterAutosuggestModule {
    constructor() {}
}
