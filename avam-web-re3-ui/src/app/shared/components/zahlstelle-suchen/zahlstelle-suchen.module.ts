import { ZahlstelleSuchenComponent } from './zahlstelle-suchen.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { ObliqueModule } from 'oblique-reactive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ZahlstelleSuchenTableModule } from './zahlstelle-suchen-table/zahlstelle-suchen-table.module';

@NgModule({
    declarations: [ZahlstelleSuchenComponent],
    exports: [ZahlstelleSuchenComponent, ZahlstelleSuchenTableModule],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, CoreComponentsModule, ObliqueModule, NgbModule, ZahlstelleSuchenTableModule],
    providers: []
})
export class ZahlstelleSuchenModule {
    constructor() {}
}
