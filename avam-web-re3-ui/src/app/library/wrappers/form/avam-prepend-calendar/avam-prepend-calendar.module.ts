import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ObliqueModule } from 'oblique-reactive';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { AvamPrependCalendarComponent } from './avam-prepend-calendar.component';

@NgModule({
    declarations: [AvamPrependCalendarComponent],
    exports: [AvamPrependCalendarComponent],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, CoreComponentsModule, ObliqueModule],
    providers: []
})
export class AvamPrependCalendarModule {
    constructor() {}
}
