import { ToolboxComponent } from './toolbox.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomPopoverModule } from '@app/shared/directives/custom-popover.module';

@NgModule({
    declarations: [ToolboxComponent],
    exports: [ToolboxComponent],
    imports: [CommonModule, TranslateModule, NgbModule, CustomPopoverModule]
})
export class ToolboxModule {
    constructor() { }
}
