import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ObliqueModule } from 'oblique-reactive';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DateRangePickerComponent } from './date-range-picker.component';

@NgModule({
    declarations: [DateRangePickerComponent],
    exports: [DateRangePickerComponent],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, CoreComponentsModule, ObliqueModule, NgbModule],
    providers: []
})
export class DateRangePickerModule {
    constructor() {}
}
