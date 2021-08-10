import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ObliqueModule } from 'oblique-reactive';
import { AvamLabelDropdownComponent } from './avam-label-dropdown.component';
import { CoreComponentsModule } from '@app/library/core/core-components.module';

@NgModule({
    declarations: [AvamLabelDropdownComponent],
    exports: [AvamLabelDropdownComponent],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, CoreComponentsModule, ObliqueModule],
    providers: []
})
export class AvamLabelDropdownModule {
    constructor() {}
}
