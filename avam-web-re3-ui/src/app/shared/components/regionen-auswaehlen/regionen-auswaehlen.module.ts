import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { ObliqueModule } from 'oblique-reactive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RegionenAuswaehlenComponent } from './regionen-auswaehlen.component';
import { RegionenAuswaehlenTableComponent } from './regionen-auswaehlen-table/regionen-auswaehlen-table.component';
import { AvamGenericTableModule } from '../../../library/wrappers/data/avam-generic-table/avam-generic-table.module';
import { CdkTableModule } from '@angular/cdk/table';

@NgModule({
    declarations: [RegionenAuswaehlenComponent, RegionenAuswaehlenTableComponent],
    exports: [RegionenAuswaehlenComponent, RegionenAuswaehlenTableComponent],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, CoreComponentsModule, ObliqueModule, NgbModule, AvamGenericTableModule, CdkTableModule],
    providers: []
})
export class RegionenAuswaehlenComponentModule {
    constructor() {}
}
