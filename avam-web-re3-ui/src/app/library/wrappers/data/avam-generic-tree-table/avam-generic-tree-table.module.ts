import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CdkTableModule } from '@angular/cdk/table';
import { TranslateModule } from '@ngx-translate/core';
import { AvamGenericTreeTableComponent } from './avam-generic-tree-table.component';
import { AvamGenericTreeTableTogglerComponent } from './avam-generic-tree-table-toggler/avam-generic-tree-table-toggler.component';
import { ResizableHandleDirective } from './resize-handle.directive';
import { AvamConnectingLinesDirectiveModule } from './avam-connecting-lines-directive.module';
@NgModule({
    declarations: [AvamGenericTreeTableComponent, AvamGenericTreeTableTogglerComponent, ResizableHandleDirective],
    exports: [AvamGenericTreeTableComponent, AvamGenericTreeTableTogglerComponent, AvamConnectingLinesDirectiveModule],
    imports: [CommonModule, NgbModule, CdkTableModule, TranslateModule, AvamConnectingLinesDirectiveModule],
    providers: [ResizableHandleDirective]
})
export class AvamGenericTreeTableModule {
    constructor() {}
}
