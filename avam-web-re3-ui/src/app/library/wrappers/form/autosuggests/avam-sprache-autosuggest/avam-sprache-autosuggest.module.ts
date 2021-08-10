import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ObliqueModule } from 'oblique-reactive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AvamSpracheAutosuggestComponent } from './avam-sprache-autosuggest.component';
import { SpracheTableComponent } from './sprache-table/sprache-table.component';
import { SpracheModalComponent } from './sprache-modal/sprache-modal.component';
import { AvamGenericTableModule } from '@app/library/wrappers/data/avam-generic-table/avam-generic-table.module';
import { CdkColumnDef, CdkTableModule } from '@angular/cdk/table';
import { AlertModule } from '@app/shared/components/alert/alert.module';
import { CoreComponentsModule } from '@app/library/core/core-components.module';

@NgModule({
    declarations: [AvamSpracheAutosuggestComponent, SpracheTableComponent, SpracheModalComponent],
    exports: [AvamSpracheAutosuggestComponent, SpracheTableComponent, SpracheModalComponent, AvamGenericTableModule, AlertModule],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, CoreComponentsModule, ObliqueModule, NgbModule, AvamGenericTableModule, CdkTableModule, AlertModule],
    providers: []
})
export class AvamSpracheAutosuggestModule {
    constructor() {}
}
