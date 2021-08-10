import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ObliqueModule } from 'oblique-reactive';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { AvamDynamicInputComponent } from './avam-dynamic-input.component';

@NgModule({
    declarations: [AvamDynamicInputComponent],
    exports: [AvamDynamicInputComponent],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, CoreComponentsModule, ObliqueModule],
    providers: []
})
export class AvamDynamicInputModule {
    constructor() {}
}
