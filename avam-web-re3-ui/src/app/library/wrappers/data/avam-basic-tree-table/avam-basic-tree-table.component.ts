import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Subject, Subscription, BehaviorSubject } from 'rxjs';
import { AvamGenericTreeTableNavigatorService } from '../avam-generic-tree-table/avam-generic-tree-table-navigator.service';
import { AvamGenericTreeTableService } from '../avam-generic-tree-table/avam-generic-tree-table.service';
import { TreeOptionInterface } from '../avam-generic-tree-table/tree-option.interface';

@Component({
    selector: 'avam-basic-tree-table',
    templateUrl: './avam-basic-tree-table.component.html',
    styleUrls: ['./avam-basic-tree-table.component.scss'],
    providers: [AvamGenericTreeTableNavigatorService, AvamGenericTreeTableService],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvamBasicTreeTable implements OnInit, OnDestroy {
    /**
     * Input property which emits event when data is loaded.
     *
     * @memberof CoreTreeTableComponent
     */
    @Input() set tree(data) {
        if (data) {
            this.tree$.next(data);
        }
    }
    /**
     * A Subject that requires an initial value and emits its current value to new subscribers.
     *
     * @memberof CoreTreeTableComponent
     */
    tree$ = new BehaviorSubject<any>(null);

    /**
     * Input property which supplies options for Tree Table.
     *
     * @memberof CoreTreeTableComponent
     */
    @Input() options: TreeOptionInterface;

    /**
     * Remove focus from table.
     *
     * @memberof CoreTreeTableComponent
     */
    @Input() removeFocus: boolean;

    /**
     * Output property which is triggered when row is double clicked.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreTreeTableComponent
     */
    @Output() onDoubleClick: EventEmitter<any> = new EventEmitter();

    /**
     * Output property which is triggered when row is keypressed with enter.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreTreeTableComponent
     */
    @Output() onEnter: EventEmitter<any> = new EventEmitter();

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

    /**
     * Output property which is triggered when row is selected.
     *
     * @type {EventEmitter<any>}
     * @memberof CoreTreeTableComponent
     */
    @Output() onRowSelection: EventEmitter<any> = new EventEmitter();

    /**
     * Tree Table Columns.
     *
     * @type {string[]}
     * @memberof CoreTreeTableComponent.
     */
    displayedColumns: string[] = [];

    treeNavigatorSubscriptions: any[];

    /**
     *Creates an instance of CoreTreeTableComponent.
     * @memberof CoreTreeTableComponent
     */
    constructor(public table: AvamGenericTreeTableService, private navigator: AvamGenericTreeTableNavigatorService) {}

    trackByFn(index) {
        return index;
    }

    ngOnInit() {
        this.treeNavigatorSubscribe();
        this.displayedColumns = this.options.columnOrder;
        let loaded = false;
        this.tree$.subscribe(tree => {
            if (tree) {
                this.table.setup(tree, this.options);
                if (!this.removeFocus) {
                    this.navigator.selectRow(this.table.flatTree);
                }

                if (!loaded && this.options.actions) {
                    this.displayedColumns.push('action');
                    loaded = true;
                }
            }
        });
    }

    treeNavigatorSubscribe() {
        const selectedRowSubscription = this.navigator.selectedRow$.subscribe(value => {
            this.onRowSelection.emit(value);
        });

        const collapseSubscription = this.table.collapse$.subscribe((value: any) => {
            this.onCollapse.emit(value);
        });

        const expandedSubscription = this.table.expand$.subscribe((value: any) => {
            this.onExpand.emit(value);
        });

        this.treeNavigatorSubscriptions = [collapseSubscription, expandedSubscription, selectedRowSubscription];
    }

    onClick(node) {
        this.table.onRowClick(node);
    }

    doubleClick(event) {
        this.onDoubleClick.emit(event);
    }

    enter(event) {
        this.onEnter.emit(event);
    }

    formatIndentation(node, step = 5): string {
        return '&nbsp;'.repeat(node.getPath().length * step);
    }

    ngOnDestroy(): void {
        this.treeNavigatorSubscriptions.forEach((subscribe: Subscription) => {
            subscribe.unsubscribe();
        });
    }
}
