import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArrowScrollingDirective } from './arrow-scrolling.directive';

@NgModule({
    declarations: [ArrowScrollingDirective],
    exports: [ArrowScrollingDirective],
    imports: [CommonModule],
    providers: []
})
export class ArrowScrollingModule {
    constructor() {}
}
