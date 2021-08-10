import { CommonModule } from '@angular/common';
import { CustomPopoverDirective } from '@app/shared/directives/custom-popover.directive';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [CustomPopoverDirective],
    exports: [CustomPopoverDirective],
    imports: [CommonModule]
})
export class CustomPopoverModule {
    constructor() {}
}
