import { NgModule } from '@angular/core';
import { AlertComponent } from './alert.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [AlertComponent],
    exports: [AlertComponent, NgbModule, CommonModule],
    imports: [NgbModule, CommonModule],
    providers: []
})
export class AlertModule {
    constructor() {}
}
