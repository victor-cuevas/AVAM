import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ObliqueModule } from 'oblique-reactive';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { AvamPrependDropdownComponent } from './avam-prepend-dropdown.component';

@NgModule({
    declarations: [AvamPrependDropdownComponent],
    exports: [AvamPrependDropdownComponent],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, CoreComponentsModule, ObliqueModule],
    providers: []
})
export class AvamPrependDropdownModule {
    constructor() {}
}
