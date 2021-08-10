import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ObliqueModule } from 'oblique-reactive';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { AvamLabelCheckboxComponent } from './avam-label-checkbox.component';

@NgModule({
    declarations: [AvamLabelCheckboxComponent],
    exports: [AvamLabelCheckboxComponent],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, CoreComponentsModule, ObliqueModule],
    providers: []
})
export class AvamLabelCheckboxModule {
    constructor() {}
}
