import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StesDetailsInfoIconComponent } from '@app/modules/stes/components';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CoreInfoBarComponent } from './core-info-bar/core-info-bar.component';
import { CoreInfoBarPanelComponent } from './core-info-bar-panel/core-info-bar-panel.component';
import { ResultCountComponent } from '@app/shared';
import { ToolboxModule } from '@app/shared/components/toolbox/toolbox.module';

@NgModule({
    declarations: [CoreInfoBarComponent, CoreInfoBarPanelComponent, ResultCountComponent, StesDetailsInfoIconComponent],
    exports: [CoreInfoBarComponent, CoreInfoBarPanelComponent, ResultCountComponent, StesDetailsInfoIconComponent, ToolboxModule],
    imports: [CommonModule, TranslateModule, NgbModule, ToolboxModule],
    providers: []
})
export class InfoBarModule {
    constructor() {}
}
