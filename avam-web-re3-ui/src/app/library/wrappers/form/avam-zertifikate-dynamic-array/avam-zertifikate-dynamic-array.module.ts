import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ObliqueModule } from 'oblique-reactive';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AvamZertifikateDynamicArrayComponent } from './avam-zertifikate-dynamic-array.component';
import { AvamLabelDropdownModule } from '../avam-label-dropdown/avam-label-dropdown.module';
import { AvamLabelCalendarModule } from '../avam-label-calendar/avam-label-calendar.module';

@NgModule({
    declarations: [AvamZertifikateDynamicArrayComponent],
    exports: [AvamZertifikateDynamicArrayComponent],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, CoreComponentsModule, ObliqueModule, NgbModule, AvamLabelDropdownModule, AvamLabelCalendarModule],
    providers: []
})
export class AvamZertifikateDynamicArrayModule {
    constructor() {}
}
