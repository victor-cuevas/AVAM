import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { BeurteilungskriteriumAuswaehlenModalComponent } from './beurteilungskriterium-auswaehlen-modal.component';
import { ObliqueModule } from 'oblique-reactive';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AvamGenericTableModule } from '@app/library/wrappers/data/avam-generic-table/avam-generic-table.module';
import { CdkTableModule } from '@angular/cdk/table';

@NgModule({
    declarations: [BeurteilungskriteriumAuswaehlenModalComponent],
    exports: [BeurteilungskriteriumAuswaehlenModalComponent, AvamGenericTableModule, CdkTableModule, NgbModule],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, CoreComponentsModule, ObliqueModule, AvamGenericTableModule, CdkTableModule, NgbModule],
    providers: [],
    entryComponents: [BeurteilungskriteriumAuswaehlenModalComponent]
})
export class BeurteilungskriteriumAuswaehlenModalModule {
    constructor() {}
}
