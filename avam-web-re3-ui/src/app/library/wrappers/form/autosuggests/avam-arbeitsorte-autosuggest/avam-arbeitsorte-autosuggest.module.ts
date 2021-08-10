import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { ObliqueModule } from 'oblique-reactive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AvamArbeitsorteAutosuggestComponent } from './avam-arbeitsorte-autosuggest.component';
import { AlignPopupTemplateAndInputModule } from '../directives/align-popup-template-and-input/align-popup-template-and-input.module';
import { ArrowScrollingModule } from '../directives/arrow-scrolling/arrow-scrolling.module';
import { RegionenAuswaehlenComponentModule } from '@app/shared/components/regionen-auswaehlen/regionen-auswaehlen.module';

@NgModule({
    declarations: [AvamArbeitsorteAutosuggestComponent],
    exports: [AvamArbeitsorteAutosuggestComponent],
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
        RegionenAuswaehlenComponentModule
    ],
    providers: []
})
export class AvamArbeitsorteAutosuggestModule {
    constructor() {}
}
