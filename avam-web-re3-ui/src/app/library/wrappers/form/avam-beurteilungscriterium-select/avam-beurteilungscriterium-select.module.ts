import { NgModule } from '@angular/core';
import { AvamBeurteilungscriteriumSelectComponent } from './avam-beurteilungscriterium-select.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { ObliqueModule } from 'oblique-reactive';
import { BeurteilungskriteriumAuswaehlenModalModule } from '@app/shared/components/beurteilungskriterium-auswaehlen-modal/beurteilungskriterium-auswaehlen-modal.module';

@NgModule({
    declarations: [AvamBeurteilungscriteriumSelectComponent],
    exports: [AvamBeurteilungscriteriumSelectComponent, BeurteilungskriteriumAuswaehlenModalModule],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, CoreComponentsModule, ObliqueModule, BeurteilungskriteriumAuswaehlenModalModule],
    providers: []
})
export class AvamBeurteilungscriteriumSelectModule {
    constructor() {}
}
