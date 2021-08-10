import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CdkTableModule } from '@angular/cdk/table';
import { AvamBasicTreeTable } from './avam-basic-tree-table.component';
import { CoreTreeTablePrimaryActionDirective } from './core-tree-table-primary-action.directive';
import { CoreTreeTablePrimaryActionNavigationDirective } from './core-tree-table-primary-action-navigation.directive';
import { TranslateModule } from '@ngx-translate/core';
import { AvamGenericTreeTableResizeDirective } from '../avam-generic-tree-table/avam-generic-tree-table-resize.directive';
import { AvamGenericTreeTableTooltipDirective } from '../avam-generic-tree-table/avam-generic-tree-table-tooltip.directive';
import { AvamConnectingLinesDirectiveModule } from '../avam-generic-tree-table/avam-connecting-lines-directive.module';

@NgModule({
    declarations: [
        AvamBasicTreeTable,
        AvamGenericTreeTableResizeDirective,
        CoreTreeTablePrimaryActionDirective,
        CoreTreeTablePrimaryActionNavigationDirective,
        AvamGenericTreeTableTooltipDirective
    ],
    exports: [
        AvamBasicTreeTable,
        AvamGenericTreeTableResizeDirective,
        CoreTreeTablePrimaryActionDirective,
        CoreTreeTablePrimaryActionNavigationDirective,
        AvamGenericTreeTableTooltipDirective,
        AvamConnectingLinesDirectiveModule
    ],
    imports: [CommonModule, NgbModule, CdkTableModule, TranslateModule, AvamConnectingLinesDirectiveModule],
    providers: []
})
export class CoreTreeTableModule {
    constructor() {}
}
