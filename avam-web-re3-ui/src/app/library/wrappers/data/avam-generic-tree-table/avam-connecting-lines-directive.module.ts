import { NgModule } from '@angular/core';
import { ConnectingLinesDirective } from './connecting-lines.directive';

@NgModule({
    declarations: [ConnectingLinesDirective],
    exports: [ConnectingLinesDirective]
})
export class AvamConnectingLinesDirectiveModule {
    constructor() {}
}
