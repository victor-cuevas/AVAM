import {
    Component,
    OnInit,
    Input,
    ViewChild,
    ContentChildren,
    QueryList,
    AfterContentInit,
    ElementRef,
    AfterViewInit,
    ViewEncapsulation,
    Output,
    EventEmitter,
    OnChanges,
    SimpleChanges,
    NgZone,
    OnDestroy,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';
import { CdkTable, CdkColumnDef } from '@angular/cdk/table';
import { AvamGenericTableService } from './avam-generic-table.service';
import { Subscription } from 'rxjs';
import DomHandler from '@app/library/core/utils/domhandler';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { FormUtilsService } from '@app/shared';

@Component({
    selector: 'avam-generic-table',
    templateUrl: './avam-generic-table.component.html',
    styleUrls: ['./avam-generic-table.component.scss'],
    providers: [AvamGenericTableService],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvamGenericTableComponent implements OnInit, AfterContentInit, AfterViewInit, OnChanges, OnDestroy {
    @Input('footer') footer: any;
    @Input('footer2') footer2: any;

    @Input('headers') headers: any;
    @Input('footers') footers: any;

    @Input('scrollable') scrollable: boolean;

    @Input() stateKey: string;

    @Input() customSort: boolean;

    @Input() initialSort = true;

    @Output() sortFunction: EventEmitter<any> = new EventEmitter();

    @Input() selection;

    @Input() customTrackByFn: Function;

    @Input() get dataSource(): any {
        return this._dataSource;
    }

    set dataSource(data) {
        this._dataSource = data;
    }

    @Input() get sortField(): string {
        return this._sortField;
    }

    set sortField(val: string) {
        this._sortField = val;
    }

    @Input() get sortOrder(): number {
        return this._sortOrder;
    }

    set sortOrder(val: number) {
        this._sortOrder = val;
    }

    _dataSource: any;

    _sortField: string;

    _sortOrder: number;

    defaultSortOrder = 1;

    stateRestored = false;

    @ViewChild('cdkTableHeaders') cdkTableHeaders: CdkTable<any>;

    @ViewChild('cdkTable') cdkTable: CdkTable<any>;

    @ViewChild('scrollableTable') scrollableTable: ElementRef;

    @ViewChild('genericTable') genericTable: ElementRef;

    @ContentChildren(CdkColumnDef) columnDefs: QueryList<CdkColumnDef>;

    bodyScrollListener: () => {};

    columnWidthsState: number[];

    selectedSourceSubscription: Subscription;

    resizedSourceSubscription: Subscription;

    resizeEventListener: any;

    @Input('computeHeightByElement') computeHeightByElement = false;

    @Input('maxHeightSelector') maxHeightSelector = 'avam-action-footer .sticky-footer';

    @Input('maxHeight') maxHeight = 500;

    @Input('minHeight') minHeight = 0;

    @Input('marginTop') marginTop: string;

    @Input('recalculateMaxHeight') recalculateMaxHeight = true;

    shouldFocusFirstRow = true;

    @Input('shouldFocusInitialRow') set shouldFocusFirstRowOnInit(value: boolean) {
        this.shouldFocusFirstRow = value;
    }

    constructor(
        private cd: ChangeDetectorRef,
        private elementRef: ElementRef,
        private avamGenericTableService: AvamGenericTableService,
        private formUtils: FormUtilsService,
        private ngZone: NgZone,
        private searchSessionStore: SearchSessionStorageService
    ) {}

    ngOnInit() {
        this.minMaxHeightProportion();
    }

    ngAfterViewInit(): void {
        this.bindEvents();

        this.selectedSourceSubscription = this.avamGenericTableService.selectedSource$.subscribe(res => {
            this.selection = res.index;
            if (this.isStateful()) {
                this.saveState();
            }
        });

        this.resizedSourceSubscription = this.avamGenericTableService.resizeSource$.subscribe(res => {
            this.columnWidthsState = this.getColumnWidths(res);
            if (this.isStateful()) {
                this.saveState();
            }
        });

        this.recalculateTableHeight();
    }

    ngAfterContentInit() {
        this.columnDefs.forEach(columnDef => this.cdkTableHeaders.addColumnDef(columnDef));
        this.columnDefs.forEach(columnDef => this.cdkTable.addColumnDef(columnDef));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.dataSource) {
            this._dataSource = changes.dataSource.currentValue;

            this.setMaxHeight();
            this.calculateScrollVisibility();

            if (this.isStateful()) {
                this.stateRestored = true;
                this.restoreState();
            }

            if (this.sortField) {
                this.triggerInitialSort();
            }

            this.avamGenericTableService.onDataChange(changes.dataSource.currentValue);
        }

        if (changes.sortField && !this.stateRestored) {
            this._sortField = changes.sortField.currentValue;
            this.avamGenericTableService.onSortChange(changes.sortField.currentValue);
            this.triggerInitialSort();
        }

        if (changes.sortOrder && !this.stateRestored) {
            this._sortOrder = changes.sortOrder.currentValue;
            this.avamGenericTableService.onSortChange(changes.sortField.currentValue);
            this.triggerInitialSort();
        }
    }

    triggerInitialSort() {
        if (this.initialSort) {
            this.sortSingle();
        }
    }

    recalculateTableHeight() {
        this.setMaxHeight();
        this.calculateScrollVisibility();
        this.cd.detectChanges();
    }

    private setMaxHeight() {
        if (this.recalculateMaxHeight === true) {
            let containerElement = DomHandler.findContainerElement(this.elementRef.nativeElement);
            if (containerElement) {
                this.maxHeight = containerElement.clientHeight - this.genericTable.nativeElement.getBoundingClientRect().top + containerElement.getBoundingClientRect().top;
                this.minMaxHeightProportion();
            }
        }

        if (this.computeHeightByElement) {
            this.computeHeightBySelectedElement();
        }
    }

    private computeHeightBySelectedElement() {
        const maxHeightElement: HTMLElement = document.querySelector(this.maxHeightSelector);

        if (!maxHeightElement) {
            return;
        }

        const elementBoundingRect: DOMRect | ClientRect = maxHeightElement.getBoundingClientRect();
        const headElement: HTMLElement = this.scrollableTable.nativeElement.querySelector('thead');

        if (!headElement) {
            return;
        }

        const headBoundingRect: DOMRect | ClientRect = headElement.getBoundingClientRect();

        this.maxHeight = elementBoundingRect.top - headBoundingRect.top - headBoundingRect.height;
    }

    private minMaxHeightProportion() {
        if (this.maxHeight > 0 && this.minHeight > this.maxHeight) {
            this.maxHeight = this.minHeight;
        }
    }

    trackByFn(index) {
        return index;
    }

    calculateScrollVisibility() {
        DomHandler.hideElement(this.genericTable.nativeElement);
        setTimeout(() => {
            const tolerance = 2;
            const bodyScrollHeight = this.genericTable.nativeElement.scrollHeight;
            const bodyHeight = this.genericTable.nativeElement.clientHeight + tolerance;
            this.scrollableTable.nativeElement.style.marginRight = bodyScrollHeight > bodyHeight ? '17px' : '0px';
            DomHandler.showElement(this.genericTable.nativeElement);
        }, 0);
    }

    sortSingle() {
        if (this.sortField && this.sortOrder && this._dataSource) {
            if (this.customSort) {
                this.sortFunction.emit({
                    data: this.dataSource,
                    field: this.sortField,
                    order: this.sortOrder
                });
                this._dataSource = [...this.dataSource];
            } else {
                const sort = this._dataSource.sort((data1, data2) => {
                    const value1 = data1[this._sortField];
                    const value2 = data2[this._sortField];
                    let result = null;

                    if (typeof value1 === 'string' && typeof value2 === 'string') {
                        const date1 = this.formUtils.parseMomentDate(value1);
                        const date2 = this.formUtils.parseMomentDate(value2);

                        if (date1.isValid() && date2.isValid()) {
                            result = date1.isBefore(date2) ? -1 : date1.isAfter(date2) ? 1 : 0;
                        } else {
                            result = new Intl.Collator(['de', 'fr', 'it', 'en'], { numeric: true, sensitivity: 'base' }).compare(value1, value2);
                        }
                    } else {
                        result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
                    }

                    return this.sortOrder * result;
                });

                this._dataSource = [...sort];
            }

            if (this.isStateful()) {
                this.saveState();
            }

            this.avamGenericTableService.onSortChange(this._dataSource);
        }
    }

    sort(event) {
        this._sortOrder = this.sortField === event.field ? this.sortOrder * -1 : this.defaultSortOrder;
        this._sortField = event.field;
        this.initialSort = true;
        this.sortSingle();
    }

    isSorted(column) {
        return this.sortField && this.sortField === column;
    }

    bindEvents() {
        this.ngZone.runOutsideAngular(() => {
            this.bodyScrollListener = this.onBodyScroll.bind(this);
            this.genericTable.nativeElement.addEventListener('scroll', this.bodyScrollListener);

            this.resizeEventListener = this.recalculateTableHeight.bind(this);
            window.addEventListener('resize', this.resizeEventListener);
        });
    }

    unBindEvents() {
        document.removeEventListener('scroll', this.bodyScrollListener);
        window.removeEventListener('resize', this.resizeEventListener);
    }

    onBodyScroll() {
        this.scrollableTable.nativeElement.style.marginLeft = -1 * this.genericTable.nativeElement.scrollLeft + 'px';
    }

    saveState() {
        const state: any = {};

        if (this.sortField || this.sortOrder) {
            state.sortField = this.sortField;
            state.sortOrder = this.sortOrder;
        }

        if (!isNaN(this.selection)) {
            state.selection = this.selection;
        }

        if (this.columnWidthsState) {
            state.columnWidths = this.columnWidthsState;
        }

        this.setDefaultValues(state);

        this.searchSessionStore.storeStateByKey(this.stateKey, state);

        this.avamGenericTableService.onStateSource(state);
    }

    private setDefaultValues(state: any) {
        let oldState: any = this.searchSessionStore.restoreStateByKey(this.stateKey) || {};

        if (oldState.defaultSortField) {
            state.defaultSortField = oldState.defaultSortField;
        } else if (state.sortField) {
            state.defaultSortField = state.sortField;
        }
        if (oldState.defaultSortOrder) {
            state.defaultSortOrder = oldState.defaultSortOrder;
        } else if (state.sortOrder) {
            state.defaultSortOrder = state.sortOrder;
        }
        if (!isNaN(oldState.defaultSelection)) {
            state.defaultSelection = oldState.defaultSelection;
        } else if (!isNaN(state.selection)) {
            state.defaultSelection = state.selection;
        }
    }

    clearState() {
        this.searchSessionStore.clearStorageByKey(this.stateKey);
    }

    restoreState() {
        const state: any = this.searchSessionStore.restoreStateByKey(this.stateKey);
        if (state) {
            if (state.sortField) {
                this._sortField = state.sortField;
                this._sortOrder = state.sortOrder;
            }

            if (!isNaN(state.selection)) {
                this.selection = state.selection;
            }

            if (state.columnWidths) {
                this.columnWidthsState = state.columnWidths;
                setTimeout(() => {
                    this.saveColumnWidths();
                }, 0);
            }
        }
    }

    isStateful() {
        return this.stateKey != null;
    }

    saveColumnWidths() {
        const scrollableTable = this.scrollableTable.nativeElement.querySelectorAll('th') as HTMLElement[];
        const genericTable = this.genericTable.nativeElement.querySelectorAll('th') as HTMLElement[];

        for (let index = 0; index < scrollableTable.length; index++) {
            const cell = scrollableTable[index];
            cell.style.width = this.columnWidthsState[index] + 'px';
            genericTable[index].style.width = this.columnWidthsState[index] + 'px';
        }
    }

    getColumnWidths(tableHeaders: HTMLElement[]) {
        const widths = [];
        const headers = tableHeaders;
        for (const header of headers) {
            widths.push(header.clientWidth);
        }
        return widths;
    }

    ngOnDestroy(): void {
        this.unBindEvents();
        this.selectedSourceSubscription.unsubscribe();
        this.resizedSourceSubscription.unsubscribe();
    }
}
