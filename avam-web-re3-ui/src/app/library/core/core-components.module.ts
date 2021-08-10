import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DynamicControlNameDirective } from './directives/dynamic-control-name.directive';
import { DisableControlDirective } from './directives/disable-control.directive';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ObliqueModule } from 'oblique-reactive';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CoreInputComponent } from './core-input/core-input.component';
import { CoreCalendarComponent } from './core-calendar/core-calendar.component';
import { CoreSliderComponent } from './core-slider/core-slider.component';
import { CoreDropdownComponent } from './core-dropdown/core-dropdown.component';
import { DbTranslatePipe } from '@app/shared/pipes/db-translate.pipe';
import { CoreAutosuggestComponent } from './core-autosuggest/core-autosuggest.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ObliqueHelperService } from './services/oblique.helper.service';
import { CoreCheckboxComponent } from './core-checkbox/core-checkbox.component';
import { AvamInfoIconBtnComponent } from '@app/shared/components/avam-info-icon-btn/avam-info-icon-btn.component';
import { ExtendWithWarningsDirective } from './directives/extend-with-warnings.directive';
import { CdkTableModule } from '@angular/cdk/table';
import { CoreRangeSliderComponent } from './core-range-slider/core-range-slider.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreMultiselectComponent } from './core-multiselect/core-multiselect.component';
import { CoreButtonGroupComponent } from './core-button-group/core-button-group.component';
import { AvamMultiselectTreeOrExtensionDirective } from '@app/library/wrappers/form/avam-multiselect-tree/avam-multiselect-tree-or-extension.directive';
import { OrColumnLayoutExtensionDirective } from './directives/or-column-layout-extension.directive';
import { InfoBarModule } from './core-info-bar/info-bar.module';
import { CoreTreeTableModule } from '../wrappers/data/avam-basic-tree-table/avam-basic-tree-table.module';
import { CorefocusDirective } from './directives/core-auto-focus.directive';

@NgModule({
    declarations: [
        CoreCalendarComponent,
        CoreSliderComponent,
        CoreInputComponent,
        DynamicControlNameDirective,
        DisableControlDirective,
        CoreDropdownComponent,
        DbTranslatePipe,
        CoreAutosuggestComponent,
        CoreCheckboxComponent,
        AvamInfoIconBtnComponent,
        ExtendWithWarningsDirective,
        CoreMultiselectComponent,
        CoreButtonGroupComponent,
        CoreRangeSliderComponent,
        AvamMultiselectTreeOrExtensionDirective,
        OrColumnLayoutExtensionDirective,
        CorefocusDirective
    ],
    exports: [
        CoreCalendarComponent,
        CoreSliderComponent,
        CoreInputComponent,
        DynamicControlNameDirective,
        DisableControlDirective,
        CoreDropdownComponent,
        DbTranslatePipe,
        CoreAutosuggestComponent,
        CoreCheckboxComponent,
        AvamInfoIconBtnComponent,
        ExtendWithWarningsDirective,
        CoreRangeSliderComponent,
        CoreMultiselectComponent,
        CoreButtonGroupComponent,
        CoreRangeSliderComponent,
        AvamMultiselectTreeOrExtensionDirective,
        OrColumnLayoutExtensionDirective,
        InfoBarModule,
        CoreTreeTableModule,
        CorefocusDirective
    ],
    imports: [CommonModule, BsDatepickerModule, ObliqueModule, ReactiveFormsModule, FormsModule, NgbModule, CdkTableModule, TranslateModule, InfoBarModule, CoreTreeTableModule],
    providers: [ObliqueHelperService]
})
export class CoreComponentsModule {
    constructor() {}
}
