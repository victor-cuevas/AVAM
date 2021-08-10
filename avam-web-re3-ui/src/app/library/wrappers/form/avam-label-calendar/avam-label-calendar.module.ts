import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AvamLabelCalendarComponent } from './avam-label-calendar.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ObliqueModule } from 'oblique-reactive';
import { CoreComponentsModule } from '@app/library/core/core-components.module';

@NgModule({
    declarations: [AvamLabelCalendarComponent],
    exports: [AvamLabelCalendarComponent],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, CoreComponentsModule, ObliqueModule],
    providers: []
})
export class AvamLabelCalendarModule {
    constructor() {}
}
