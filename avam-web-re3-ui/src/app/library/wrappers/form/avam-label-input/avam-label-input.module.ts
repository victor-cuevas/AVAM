import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ObliqueModule } from 'oblique-reactive';
import { AvamLabelInputComponent } from './avam-label-input.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CoreComponentsModule } from '@app/library/core/core-components.module';

@NgModule({
    declarations: [AvamLabelInputComponent],
    exports: [AvamLabelInputComponent],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, CoreComponentsModule, ObliqueModule, NgbModule],
    providers: []
})
export class AvamLabelInputModule {
    constructor() {}
}
