import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CdkTableModule } from '@angular/cdk/table';
import { TranslateModule } from '@ngx-translate/core';
import { AvamGenericTableComponent } from './avam-generic-table.component';
import { ResizableHandleDirective } from './resize-handle.directive';
import { SortableColumnDirective } from './sortable-column.directive';
import { SortIconComponent } from './sort-icon.component';
import { NavigationDirective } from './navigation.directive';
import { TableTooltipDirective } from './table-tooltip.directive';
import { AvamGenericTableHeaderCellComponent } from '@app/library/wrappers/data/avam-generic-table/avam-generic-table-header-cell.component';
import { AvamGenericTableCellComponent } from '@app/library/wrappers/data/avam-generic-table/avam-generic-table-cell.component';
import { PrimaryButtonDirective } from './primary-button-directive.directive';

@NgModule({
    declarations: [
        PrimaryButtonDirective,
        AvamGenericTableComponent,
        AvamGenericTableHeaderCellComponent,
        AvamGenericTableCellComponent,
        ResizableHandleDirective,
        SortableColumnDirective,
        SortIconComponent,
        NavigationDirective,
        TableTooltipDirective
    ],
    exports: [
        PrimaryButtonDirective,
        AvamGenericTableComponent,
        AvamGenericTableHeaderCellComponent,
        AvamGenericTableCellComponent,
        ResizableHandleDirective,
        SortableColumnDirective,
        SortIconComponent,
        TableTooltipDirective
    ],
    imports: [CommonModule, NgbModule, CdkTableModule, TranslateModule],
    providers: []
})
export class AvamGenericTableModule {
    constructor() {}
}
