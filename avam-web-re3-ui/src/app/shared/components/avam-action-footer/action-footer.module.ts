import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AvamActionFooterComponent } from './avam-action-footer.component';
import { DisableOnSpinnerDirective } from '@app/shared/directives/disable-on-spinner.directive';
import { NavCollapsedCheckDirective } from './nav-collapsed-check.directive';
import { AvamActionService } from './avam-action.service';

@NgModule({
    declarations: [AvamActionFooterComponent, NavCollapsedCheckDirective],
    exports: [AvamActionFooterComponent, NavCollapsedCheckDirective],
    imports: [CommonModule],
    providers: [AvamActionService]
})
export class AvamFooterModule {
    constructor() {}
}
