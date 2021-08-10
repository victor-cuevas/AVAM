import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ObliqueModule } from 'oblique-reactive';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AvamRangeValuedWrapperComponent } from './avam-range-valued-wrapper.component';

@NgModule({
    declarations: [AvamRangeValuedWrapperComponent],
    exports: [AvamRangeValuedWrapperComponent],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, CoreComponentsModule, ObliqueModule, NgbModule],
    providers: []
})
export class AvamRangeValuedWrapperInputModule {
    constructor() {}
}
