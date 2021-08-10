import { CdkTableModule } from '@angular/cdk/table';
import { AvamGenericTableModule } from './../../../../library/wrappers/data/avam-generic-table/avam-generic-table.module';
import { ZahlstelleSuchenTableComponent } from './zahlstelle-suchen-table.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { ObliqueModule } from 'oblique-reactive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    declarations: [ZahlstelleSuchenTableComponent],
    exports: [ZahlstelleSuchenTableComponent, AvamGenericTableModule, CdkTableModule],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, CoreComponentsModule, ObliqueModule, NgbModule, AvamGenericTableModule, CdkTableModule],
    providers: []
})
export class ZahlstelleSuchenTableModule {
    constructor() {}
}
