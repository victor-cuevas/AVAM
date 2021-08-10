import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { ObliqueModule } from 'oblique-reactive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AlignPopupTemplateAndInputModule } from '../directives/align-popup-template-and-input/align-popup-template-and-input.module';
import { ArrowScrollingModule } from '../directives/arrow-scrolling/arrow-scrolling.module';
import { BenutzerInfoTemplateComponent } from '@app/shared/components/benutzer-info-template/benutzer-info-template.component';
import { AvamLandAutosuggestComponent } from './avam-land-autosuggest.component';

@NgModule({
    declarations: [AvamLandAutosuggestComponent],
    exports: [AvamLandAutosuggestComponent],
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
export class AvamLandAutosuggestModule {
    constructor() {}
}
