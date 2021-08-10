import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { AvamLabelCalendarModule } from '../avam-label-calendar/avam-label-calendar.module';
import { AvamLabelInputModule } from '../avam-label-input/avam-label-input.module';
import { AvamLabelDropdownModule } from '../avam-label-dropdown/avam-label-dropdown.module';
import { TranslateModule } from '@ngx-translate/core';
import { AvamSpracheAutosuggestModule } from '../autosuggests/avam-sprache-autosuggest/avam-sprache-autosuggest.module';
import { AvamComponentsTableContainerComponent } from './avam-components-table-container.component';
import { AvamComponentsTableCalendarComponent } from './components/avam-components-table-calendar.component';
import { AvamComponentsTableInputComponent } from './components/avam-components-table-input.component';
import { AvamComponentsTableDropwdownComponent } from './components/avam-components-table-dropdown.component';
import { AvamComponentsTableSpracheautosuggestComponent } from './components/avam-components-table-spracheautosuggest.component';
import { AvamComponentsTableComponent } from './avam-components-table.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ObliqueModule } from 'oblique-reactive';
import { CdkTableModule } from '@angular/cdk/table';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AvamComponentsTableBaseComponent } from './avam-components-table-base';

@NgModule({
    declarations: [
        AvamComponentsTableBaseComponent,
        AvamComponentsTableContainerComponent,
        AvamComponentsTableCalendarComponent,
        AvamComponentsTableInputComponent,
        AvamComponentsTableDropwdownComponent,
        AvamComponentsTableSpracheautosuggestComponent,
        AvamComponentsTableComponent
    ],
    exports: [
        AvamComponentsTableBaseComponent,
        AvamComponentsTableContainerComponent,
        AvamComponentsTableCalendarComponent,
        AvamComponentsTableInputComponent,
        AvamComponentsTableDropwdownComponent,
        AvamComponentsTableSpracheautosuggestComponent,
        AvamComponentsTableComponent
    ],
    imports: [
        CommonModule,
        CoreComponentsModule,
        AvamLabelCalendarModule,
        AvamLabelInputModule,
        AvamLabelDropdownModule,
        AvamSpracheAutosuggestModule,
        TranslateModule,
        ReactiveFormsModule,
        FormsModule,
        ObliqueModule,
        CdkTableModule,
        NgbModule
    ],
    providers: []
})
export class AvamComponentsTableModule {
    constructor() {}
}
