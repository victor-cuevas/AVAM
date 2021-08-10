import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ObliqueModule } from 'oblique-reactive';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { AvamDropdownDatepickerComponent } from '@app/library/wrappers/form/avam-dropdown-datepicker/avam-dropdown-datepicker.component';
import { AvamLabelDropdownModule } from '@app/library/wrappers/form/avam-label-dropdown/avam-label-dropdown.module';
import { DateRangePickerModule } from '@app/library/wrappers/form/date-range-picker/date-range-picker.module';

@NgModule({
    declarations: [AvamDropdownDatepickerComponent],
    exports: [AvamDropdownDatepickerComponent],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, CoreComponentsModule, ObliqueModule, AvamLabelDropdownModule, DateRangePickerModule],
    providers: []
})
export class AvamDropdownDatepickerComponenttModule {
    constructor() {}
}
