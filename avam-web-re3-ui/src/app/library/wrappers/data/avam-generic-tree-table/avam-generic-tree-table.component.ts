import { Component, OnInit, ContentChildren, ViewChild, QueryList, AfterContentInit, Input, Output, EventEmitter, ViewEncapsulation, OnDestroy, ElementRef } from '@angular/core';
import { CdkColumnDef, CdkTable } from '@angular/cdk/table';
import { AvamGenericTreeTableService } from './avam-generic-tree-table.service';
import { AvamGenericTreeTableNavigatorService } from './avam-generic-tree-table-navigator.service';
import { Subscription } from 'rxjs';
import { TreeOptionInterface } from './tree-option.interface';

@Component({
    selector: 'avam-generic-tree-table',
    templateUrl: './avam-generic-tree-table.component.html',
    styleUrls: ['./avam-generic-tree-table.component.scss'],
    providers: [AvamGenericTreeTableNavigatorService, AvamGenericTreeTableService],
    encapsulation: ViewEncapsulation.None
})
export class AvamGenericTreeTableComponent implements OnInit, AfterContentInit, OnDestroy {
    @Input() headers: any;

    /**
     * Input property which supplies options for Tree Table.
     *
     * @memberof AvamGenericTreeTableComponent
     */
    @Input() options: TreeOptionInterface;

    @Input() set dataSource(data) {
        if (data) {
            this.treeTableService.setup(data, this.options);
            this.navigatorService.selectRow(this.treeTableService.flatTree);
        }
    }

    @Output() doubleClick = new EventEmitter();
    @Output() pressEnter = new EventEmitter();

    /**
     * Output property which is triggered when node is collapsed.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreTreeTableComponent
     */
    @Output() onCollapse: EventEmitter<any> = new EventEmitter();

    /**
     * Output property which is triggered when node is expanded.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreTreeTableComponent
     */
    @Output() onExpand: EventEmitter<any> = new EventEmitter();

    @ViewChild('cdkTable') cdkTable: CdkTable<any>;
    @ViewChild('genericTreeTable') genericTreeTable: ElementRef;
    @ContentChildren(CdkColumnDef) columnDefs: QueryList<CdkColumnDef>;

    treeNavigatorSubscriptions: Subscription[];

    constructor(public treeTableService: AvamGenericTreeTableService, private navigatorService: AvamGenericTreeTableNavigatorService) {}

    ngOnInit() {
        const collapseSubscription = this.treeTableService.collapse$.subscribe((value: any) => {
            this.onCollapse.emit(value);
        });

        const expandedSubscription = this.treeTableService.expand$.subscribe((value: any) => {
            this.onExpand.emit(value);
        });

        this.treeNavigatorSubscriptions = [collapseSubscription, expandedSubscription];
    }

    ngAfterContentInit() {
        this.columnDefs.forEach(columnDef => this.cdkTable.addColumnDef(columnDef));
    }

    ngOnDestroy(): void {
        this.treeNavigatorSubscriptions.forEach((subscribe: Subscription) => {
            subscribe.unsubscribe();
        });
    }

    onDoubleClick(row) {
        this.doubleClick.emit(row);
    }

    onPressEnter(row) {
        this.pressEnter.emit(row);
    }
}
