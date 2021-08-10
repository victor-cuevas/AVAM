import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ObliqueModule } from 'oblique-reactive';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { AvamLabelPercentageInputComponent } from './avam-label-percentage-input.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    declarations: [AvamLabelPercentageInputComponent],
    exports: [AvamLabelPercentageInputComponent],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, CoreComponentsModule, ObliqueModule, NgbModule],
    providers: []
})
export class AvamLabelPercentageInputModule {
    constructor() {}
}
