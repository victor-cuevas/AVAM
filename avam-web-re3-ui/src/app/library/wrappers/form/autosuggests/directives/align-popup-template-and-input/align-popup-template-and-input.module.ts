import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AlignPopupTemplateAndInputDirective } from './align-popup-template-and-input.directive';

@NgModule({
    declarations: [AlignPopupTemplateAndInputDirective],
    exports: [AlignPopupTemplateAndInputDirective],
    imports: [CommonModule],
    providers: []
})
export class AlignPopupTemplateAndInputModule {
    constructor() {}
}
