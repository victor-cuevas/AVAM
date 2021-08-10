import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { ObliqueModule } from 'oblique-reactive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AlignPopupTemplateAndInputModule } from '../directives/align-popup-template-and-input/align-popup-template-and-input.module';
import { ArrowScrollingModule } from '../directives/arrow-scrolling/arrow-scrolling.module';
import { AvamUnternehmenAutosuggestComponent } from './avam-unternehmen-autosuggest.component';
import { AvamUnternehmenSucheComponent } from './avam-unternehmen-suche/avam-unternehmen-suche.component';
import { AvamUnternehmenSucheResultTableComponent } from './avam-unternehmen-suche/avam-unternehmen-suche-result-table/avam-unternehmen-suche-result-table.component';
import { UnternehmenInfoPopoverComponent } from './unternehmen-info-popover/unternehmen-info-popover.component';
import { AlertModule } from '@app/shared/components/alert/alert.module';
import { AvamPrependDropdownModule } from '../../avam-prepend-dropdown/avam-prepend-dropdown.module';
import { AvamLabelInputModule } from '../../avam-label-input/avam-label-input.module';
import { AvamLabelCheckboxModule } from '../../avam-label-checkbox/avam-label-checkbox.module';
import { AvamPlzAutosuggestModule } from '../avam-plz-autosuggest/avam-plz-autosuggest.module';
import { AvamLandAutosuggestModule } from '../avam-land-autosuggest/avam-land-autosuggest.module';
import { AvamPersonalberaterAutosuggestModule } from '../avam-personalberater-autosuggest/avam-personalberater-autosuggest.module';
import { AvamButtonGroupComponentModule } from '../../avam-button-group/avam-button-group.module';
import { AvamGenericTableModule } from '@app/library/wrappers/data/avam-generic-table/avam-generic-table.module';
import { CdkTableModule } from '@angular/cdk/table';

@NgModule({
    declarations: [AvamUnternehmenAutosuggestComponent, AvamUnternehmenSucheComponent, AvamUnternehmenSucheResultTableComponent, UnternehmenInfoPopoverComponent],
    exports: [AvamUnternehmenAutosuggestComponent, AvamUnternehmenSucheComponent, AvamUnternehmenSucheResultTableComponent, UnternehmenInfoPopoverComponent],
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
        AlertModule,
        AvamPrependDropdownModule,
        AvamLabelInputModule,
        AvamLabelCheckboxModule,
        AvamPlzAutosuggestModule,
        AvamLandAutosuggestModule,
        AvamPersonalberaterAutosuggestModule,
        AvamButtonGroupComponentModule,
        AvamGenericTableModule,
        CdkTableModule
    ],
    providers: [],
    entryComponents: [AvamUnternehmenSucheComponent]
})
export class AvamUnternehmenAutosuggestComponentModule {
    constructor() {}
}
