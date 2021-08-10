import { RowSearchDirectionEnum } from '@shared/enums/avam-generic-table.enum';
import { Subscription } from 'rxjs';
import { AvamGenericTableService } from './avam-generic-table.service';
import { Directive, ElementRef, Input, HostListener, AfterViewInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { PRIMARY_ACTION_ATTRIBUTE_NAME } from './primary-button-directive.directive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Directive({
    selector: '[avamNavigationDirective]'
})
export class NavigationDirective implements AfterViewInit, OnDestroy {
    @Input() set avamNavigationDirective(data) {
        this.initialRowIndex = data;
    }
    @Input() set shouldFocusInitialRow(value: boolean) {
        this.focusInitialRow = value;
    }

    @Output() onSelect: EventEmitter<any> = new EventEmitter();

    initialRowIndex: number;

    focusInitialRow = true;

    rowSearchDirection: string = null;
    selectedRowIndex = 0;
    focusTabIndex = 0;
    rowsCount: number;
    tableRows: HTMLTableRowElement[];
    rowFocusableElements: HTMLElement[][] = [];
    rowPrimaryButtons: HTMLButtonElement[] = [];
    rowHidableElements: HTMLElement[][] = [];
    selectedRow: HTMLTableRowElement;
    rowClickEventListeners = [];
    rowDblClickEventListeners = [];
    rowEnterEventListeners = [];
    rowMouseoverEventListeners = [];
    rowMouseoutEventListeners = [];
    documentClickEventListener;
    SELECTED_ATTR = 'selected-row';
    ACTIVATED_INSTANCE_ATTR = 'activated_instance';

    initialTab = false;
    immediateAfterUserInteraction = false;
    immediateAfterClickOrArrow = false;
    immediateAfterTab = false;
    nextRowOnTab = false;
    buttonsStart = false;

    hasOpenedModal = false;

    dataSourceArray = [];

    sourceSubscriber: Subscription;
    dataSubscriber: Subscription;

    constructor(private hostElement: ElementRef, private genericTableService: AvamGenericTableService, private modalService: NgbModal) {}

    @HostListener('keydown', ['$event'])
    onKeydownTab(event: KeyboardEvent) {
        if (event.key !== 'Tab') {
            return;
        }

        this.assignActivatedInstance();

        if (!this.hostElement.nativeElement.hasAttribute(this.ACTIVATED_INSTANCE_ATTR) && !this.hostElement.nativeElement.contains(document.activeElement)) {
            return;
        }

        if (!this.selectedRow && this.noLastRowOrShiftKey(event)) {
            this.focusDefaultRow();
            return;
        }

        if (this.selectedRow && this.noLastRowOrShiftKey(event) && this.selectedRowIndex === null) {
            this.selectRow(0);
            this.initialTab = true;
            return;
        }

        event.shiftKey ? this.tabDownWalkUp() : this.tabDownWalkDown();
    }

    @HostListener('keyup', ['$event'])
    onKeyupTab(event: KeyboardEvent) {
        if (event.key !== 'Tab' || this.shouldStopOnTab()) {
            return;
        }

        if (!this.selectedRow && this.noLastRowOrShiftKey(event)) {
            this.focusDefaultRow();
            return;
        }

        if (this.initialTab) {
            this.initialTab = false;
            return;
        }

        event.shiftKey ? this.tabUpWalkUp() : this.tabUpWalkDown();
    }

    @HostListener('document:keydown.arrowup')
    onArrowUp() {
        const shouldStop: boolean = !this.hostElement.nativeElement.hasAttribute(this.ACTIVATED_INSTANCE_ATTR) && !this.hostElement.nativeElement.contains(document.activeElement);

        if (shouldStop) {
            return;
        }

        this.reassignActivatedInstance();

        this.immediateAfterUserInteraction = true;
        this.immediateAfterClickOrArrow = true;
        this.immediateAfterTab = false;
        this.nextRowOnTab = false;
        this.focusTabIndex = null;

        this.rowSearchDirection = RowSearchDirectionEnum.UP;
        const prevIndex: number = this.selectedRowIndex;
        this.selectedRowIndex -= 1;

        if (this.selectedRowIndex < 0) {
            this.selectedRowIndex = this.rowsCount - 1;
        }

        this.selectRow(this.selectedRowIndex, prevIndex);
    }

    @HostListener('document:keydown.arrowdown')
    onArrowDown() {
        const shouldStop: boolean = !this.hostElement.nativeElement.hasAttribute(this.ACTIVATED_INSTANCE_ATTR) && !this.hostElement.nativeElement.contains(document.activeElement);

        if (shouldStop) {
            return;
        }

        this.reassignActivatedInstance();

        this.immediateAfterUserInteraction = true;
        this.immediateAfterClickOrArrow = true;
        this.immediateAfterTab = false;
        this.nextRowOnTab = false;
        this.focusTabIndex = null;

        this.rowSearchDirection = RowSearchDirectionEnum.DOWN;
        const prevIndex: number = this.selectedRowIndex;
        this.selectedRowIndex += 1;

        if (this.selectedRowIndex >= this.rowsCount) {
            this.selectedRowIndex = 0;
        }

        this.selectRow(this.selectedRowIndex, prevIndex);
    }

    ngAfterViewInit() {
        let initialSort = true;

        const instance = document.querySelector(`[${this.ACTIVATED_INSTANCE_ATTR}]`);

        if (!instance) {
            this.hostElement.nativeElement.setAttribute(this.ACTIVATED_INSTANCE_ATTR, 'true');
        }

        this.sourceSubscriber = this.genericTableService.sortSource$.subscribe((data) => {
            this.dataSourceArray = data;

            setTimeout(() => {
                this.reassignActivatedInstance(initialSort);
                this.onSubscribe(initialSort ? undefined : 0);

                if (data && data.length) {
                    initialSort = false;
                }
            }, 0);
        });

        this.dataSubscriber = this.genericTableService.data$.subscribe((data) => {
            this.dataSourceArray = data;

            setTimeout(() => {
                this.reassignActivatedInstance(initialSort);
                this.onSubscribe();
            }, 0);
        });
    }

    ngOnDestroy() {
        this.detachEventListeners();

        this.sourceSubscriber.unsubscribe();
        this.dataSubscriber.unsubscribe();
    }

    onSubscribe(inputRowIndex?: number) {
        this.arrangeRowAttributes();

        this.selectedRowIndex = !isNaN(this.initialRowIndex) ? this.initialRowIndex : !isNaN(inputRowIndex) ? inputRowIndex : 0;

        this.selectRow(this.selectedRowIndex, undefined, this.focusInitialRow);
    }

    arrangeRowAttributes() {
        this.detachEventListeners();

        this.documentClickEventListener = this.clickDocument.bind(this);

        document.addEventListener('click', this.documentClickEventListener);

        this.tableRows = Array.from(this.hostElement.nativeElement.querySelectorAll('tr[cdk-row]'));

        this.tableRows.forEach((tableRow: HTMLTableRowElement, index: number) => {
            this.rowDblClickEventListeners[index] = this.dblClickRow.bind(this, index);
            this.rowEnterEventListeners[index] = this.enterRow.bind(this, index);
            this.rowClickEventListeners[index] = (event) => {
                this.clickRow(index, event);
            };
            this.rowMouseoverEventListeners[index] = this.mouseoverRow.bind(this, index);
            this.rowMouseoutEventListeners[index] = this.mouseoutRow.bind(this, index);

            const actionColumn: HTMLTableCellElement = tableRow.querySelector('[class*=cdk-column-action]');

            this.rowHidableElements[index] = [];

            this.rowFocusableElements[index] = (Array.from(tableRow.querySelectorAll('td button, td select, td input')) as HTMLElement[]).filter((element: HTMLElement) => {
                const clientRect = element.getBoundingClientRect();

                if (actionColumn && actionColumn.contains(element)) {
                    this.rowHidableElements[index].push(element);
                }

                return (
                    clientRect.height && clientRect.width && !element.hasAttribute('hidden') && (!element.hasAttribute('tabindex') || Number(element.getAttribute('tabindex')) >= 0)
                );
            });

            this.hideElements(index);

            tableRow.setAttribute('tabindex', '0');
            tableRow.addEventListener('dblclick', this.rowDblClickEventListeners[index]);
            tableRow.addEventListener('keyup', this.rowEnterEventListeners[index]);
            tableRow.addEventListener('click', this.rowClickEventListeners[index]);
            tableRow.addEventListener('mouseover', this.rowMouseoverEventListeners[index]);
            tableRow.addEventListener('mouseout', this.rowMouseoutEventListeners[index]);
        });

        this.rowsCount = this.tableRows.length;
    }

    detachEventListeners() {
        document.removeEventListener('click', this.documentClickEventListener);

        if (this.tableRows && this.tableRows.length) {
            this.tableRows.forEach((tableRow: HTMLTableRowElement, index: number) => {
                tableRow.removeEventListener('dblclick', this.rowDblClickEventListeners[index]);
                tableRow.removeEventListener('keyup', this.rowEnterEventListeners[index]);
                tableRow.removeEventListener('click', this.rowClickEventListeners[index]);
                tableRow.removeEventListener('mouseover', this.rowMouseoverEventListeners[index]);
                tableRow.removeEventListener('mouseout', this.rowMouseoutEventListeners[index]);

                this.tableRows[index] = undefined;
                this.rowDblClickEventListeners[index] = undefined;
                this.rowEnterEventListeners[index] = undefined;
                this.rowClickEventListeners[index] = undefined;
                this.rowMouseoverEventListeners[index] = undefined;
                this.rowMouseoutEventListeners[index] = undefined;
                this.rowFocusableElements[index] = this.rowFocusableElements[index].map(() => undefined);
                this.rowHidableElements[index] = this.rowHidableElements[index].map(() => undefined);
            });

            this.rowDblClickEventListeners = [];
            this.rowEnterEventListeners = [];
            this.rowClickEventListeners = [];
            this.rowMouseoverEventListeners = [];
            this.rowMouseoutEventListeners = [];
            this.rowFocusableElements = [];
            this.rowHidableElements = [];
            this.tableRows = [];
        }
    }

    tabDownWalkUp() {
        this.rowSearchDirection = RowSearchDirectionEnum.UP;

        if (this.getRowFocusableElements()[this.focusTabIndex] === document.activeElement) {
            this.focusTabIndex -= 1;
        }

        if (this.selectedRowIndex !== null && this.focusTabIndex !== null && this.selectedRowIndex <= 0 && this.focusTabIndex <= 0 && document.activeElement === this.selectedRow) {
            this.exitCurrentTable();
        }
    }

    tabDownWalkDown() {
        this.rowSearchDirection = RowSearchDirectionEnum.DOWN;
        this.immediateAfterUserInteraction = true;

        if (this.immediateAfterClickOrArrow || (this.focusTabIndex < 0 && this.getRowFocusableElements().length)) {
            this.focusTabIndex = 0;
            this.immediateAfterClickOrArrow = false;
        }

        if (this.getRowFocusableElements()[this.focusTabIndex] === document.activeElement) {
            this.focusTabIndex += 1;
        }

        if (this.selectedRowIndex >= this.tableRows.length - 1 && this.focusTabIndex >= this.getRowFocusableElements().length) {
            this.exitCurrentTable();
        }
    }

    tabUpWalkUp() {
        if (this.selectedRowIndex <= 0 && this.focusTabIndex <= 0 && this.selectedRowIndex !== null && this.focusTabIndex !== null) {
            return;
        }

        this.rowSearchDirection = RowSearchDirectionEnum.UP;

        this.initializeOnShiftTab();

        if (this.immediateAfterUserInteraction && this.focusTabIndex === -1 && this.selectedRowIndex > 0) {
            this.immediateAfterUserInteraction = false;
            this.buttonsStart = true;
            this.immediateAfterTab = false;
            this.nextRowOnTab = false;

            return;
        }

        this.resetFocusTabIndex();

        this.walkAboveTheRows();
    }

    tabUpWalkDown() {
        this.rowSearchDirection = RowSearchDirectionEnum.DOWN;
        this.immediateAfterTab = true;
        if (!this.getRowFocusableElements() || !this.getRowFocusableElements().length || this.focusTabIndex >= this.getRowFocusableElements().length) {
            if (this.selectedRowIndex === null) {
                this.selectedRowIndex = -1;
            }

            this.nextRowOnTab = true;

            this.selectRow(this.selectedRowIndex + 1, this.selectedRowIndex);
            return;
        }

        this.nextRowOnTab = false;

        if (this.getRowFocusableElements().length && this.getRowFocusableElements()[this.focusTabIndex]) {
            this.getRowFocusableElements()[this.focusTabIndex].focus();
        }
    }

    initializeOnShiftTab() {
        if (this.selectedRowIndex === null) {
            this.selectedRowIndex = this.rowsCount;
            this.initialTab = true;
        }
    }

    walkAboveTheRows() {
        if (this.shouldSelectRow()) {
            this.selectRow(this.selectedRowIndex - 1, this.selectedRowIndex, false);
            this.focusTabIndex = this.getRowFocusableElements().length - 1;
            this.buttonsStart = false;

            this.immediateAfterUserInteraction = false;
        }

        this.nextRowOnTab = false;

        this.immediateAfterTab = false;
        this.immediateAfterClickOrArrow = false;

        this.buttonsStart = this.focusTabIndex === -1;

        if (this.getRowFocusableElements().length && this.getRowFocusableElements()[this.focusTabIndex] && !this.buttonsStart) {
            this.getRowFocusableElements()[this.focusTabIndex].focus();
        }
    }

    noLastRowOrShiftKey(event) {
        return !event.shiftKey && document.activeElement !== this.tableRows[this.rowsCount - 1];
    }

    resetFocusTabIndex() {
        if (this.focusTabIndex === null || this.immediateAfterClickOrArrow || (this.immediateAfterTab && this.focusTabIndex < 0)) {
            this.focusTabIndex = this.getRowFocusableElements().length - 1;
            this.immediateAfterTab = false;
        }
    }

    shouldSelectRow() {
        const enterFromBelow: boolean = this.selectedRowIndex === this.rowsCount - 1 && this.focusTabIndex === -1 && this.getRowFocusableElements().length === 1;

        return (
            ((!this.getRowFocusableElements() || !this.getRowFocusableElements().length || this.buttonsStart || this.immediateAfterUserInteraction) &&
                (this.focusTabIndex < 0 || this.immediateAfterClickOrArrow)) ||
            this.nextRowOnTab ||
            enterFromBelow
        );
    }

    shouldStopOnTab() {
        return (
            (!this.hostElement.nativeElement.hasAttribute(this.ACTIVATED_INSTANCE_ATTR) && !this.hostElement.nativeElement.contains(document.activeElement)) ||
            (!this.tableRows[0].contains(document.activeElement) &&
                !this.tableRows[this.rowsCount - 1].contains(document.activeElement) &&
                this.focusTabIndex === null &&
                this.selectedRowIndex === null)
        );
    }

    getRowFocusableElements() {
        return this.rowFocusableElements[this.selectedRowIndex] || [];
    }

    clickDocument(event: MouseEvent) {
        if (!this.hasOpenedModal && this.modalService.hasOpenModals()) {
            this.hasOpenedModal = this.modalService.hasOpenModals();
        }

        if (this.hasOpenedModal && !this.modalService.hasOpenModals()) {
            this.hasOpenedModal = this.modalService.hasOpenModals();
            return;
        }

        if (this.hostElement.nativeElement.contains(event.target)) {
            this.reassignActivatedInstance();
            this.showElements(this.selectedRowIndex);
        } else {
            this.exitCurrentTable();
        }
    }

    exitCurrentTable() {
        this.hideElements(this.selectedRowIndex);
        this.hostElement.nativeElement.removeAttribute(this.ACTIVATED_INSTANCE_ATTR);

        this.selectedRowIndex = null;
        this.focusTabIndex = null;
        this.immediateAfterTab = false;
        this.initialTab = false;
    }

    assignActivatedInstance() {
        const activatedInstance = document.querySelector(`[${this.ACTIVATED_INSTANCE_ATTR}]`);

        if (!activatedInstance) {
            this.hostElement.nativeElement.setAttribute(this.ACTIVATED_INSTANCE_ATTR, 'true');
        }
    }

    reassignActivatedInstance(onInit?: boolean) {
        if (this.hostElement.nativeElement.hasAttribute(this.ACTIVATED_INSTANCE_ATTR)) {
            return;
        }

        const activatedInstance = document.querySelector(`[${this.ACTIVATED_INSTANCE_ATTR}]`);

        if (onInit && activatedInstance) {
            return;
        }

        if (activatedInstance) {
            activatedInstance.removeAttribute(this.ACTIVATED_INSTANCE_ATTR);
        }

        this.hostElement.nativeElement.setAttribute(this.ACTIVATED_INSTANCE_ATTR, 'true');
    }

    mouseoverRow(rowIndex: number) {
        if (rowIndex !== this.selectedRowIndex) {
            this.showElements(rowIndex);
        }
    }

    mouseoutRow(rowIndex: number) {
        if (rowIndex !== this.selectedRowIndex) {
            this.hideElements(rowIndex);
        }
    }

    clickRow(rowIndex: number, event?: any) {
        this.immediateAfterUserInteraction = true;
        this.immediateAfterClickOrArrow = true;
        this.nextRowOnTab = false;
        this.immediateAfterTab = false;

        this.reassignActivatedInstance();

        this.rowSearchDirection = RowSearchDirectionEnum.DOWN;

        this.selectRow(rowIndex, this.selectedRowIndex, this.shouldFocusTheRow(rowIndex, event));
    }

    shouldFocusTheRow(index, event): boolean {
        if (!event || !event.target) {
            return true;
        }

        const focusedIndex: number = this.rowFocusableElements[index].indexOf(event.target);

        if (focusedIndex === -1) {
            return true;
        }

        this.focusTabIndex = focusedIndex;
        this.immediateAfterClickOrArrow = false;

        return false;
    }

    enterRow(rowIndex: number, event) {
        if (event.key === 'Enter') {
            this.dblClickRow(rowIndex);
        }
    }

    dblClickRow(rowIndex: number) {
        this.clickRow(rowIndex);
        this.focusTabIndex = this.computeFocusTabIndex(rowIndex);

        if (this.selectedRow) {
            this.selectedRowIndex = rowIndex;
            this.clickButton();
        }
    }

    selectRow(newIndex: number, prevIndex?: number, shouldFocusRow = true) {
        this.emitRowState(newIndex);

        if (newIndex === prevIndex) {
            this.selectedRowIndex = prevIndex;
            if (shouldFocusRow) {
                this.focusDefaultRow();
            }

            return;
        }

        this.focusTabIndex = this.computeFocusTabIndex(newIndex);

        this.arrangeAttributesAfterSelect(newIndex, prevIndex, shouldFocusRow);
    }

    computeFocusTabIndex(rowIndex: number) {
        let counter = 0;

        (this.rowFocusableElements[rowIndex] || []).forEach((element: HTMLButtonElement) => {
            if (!element) {
                return;
            }

            if (element.disabled) {
                counter += 1;
            }
        });

        return counter;
    }

    arrangeAttributesAfterSelect(newIndex: number, prevIndex?: number, shouldFocusRow = true) {
        if (!isNaN(prevIndex)) {
            if (this.tableRows[prevIndex]) {
                this.tableRows[prevIndex].removeAttribute(this.SELECTED_ATTR);
            }

            this.hideElements(prevIndex);
        }

        this.showElements(newIndex);

        if (this.dataSourceArray && this.dataSourceArray.length && this.dataSourceArray[newIndex]) {
            this.dataSourceArray[newIndex].skipRow ? this.recursiveSearchRow(newIndex, prevIndex) : this.focusRow(newIndex, shouldFocusRow);
        }
    }

    hideElements(index: number) {
        if (this.rowHidableElements[index]) {
            this.rowHidableElements[index].forEach(this.hideElement);
        }
    }

    showElements(index: number) {
        if (this.rowHidableElements[index]) {
            this.rowHidableElements[index].forEach(this.showElement);
        }
    }

    hideElement(element: HTMLElement) {
        element.style.visibility = 'hidden';
    }

    showElement(element: HTMLElement) {
        element.style.visibility = 'visible';
    }

    recursiveSearchRow(newIndex: number, prevIndex: number) {
        const previousIndex: number = !isNaN(prevIndex) ? prevIndex : this.selectedRowIndex;
        let updatedIndex: number = newIndex;

        if (!this.rowSearchDirection) {
            this.rowSearchDirection =
                (previousIndex === 0 && updatedIndex === this.rowsCount - 1) || updatedIndex < previousIndex ? RowSearchDirectionEnum.UP : RowSearchDirectionEnum.DOWN;
        }

        if (this.rowSearchDirection === RowSearchDirectionEnum.UP) {
            updatedIndex -= 1;
        } else {
            updatedIndex += 1;
        }

        if (updatedIndex >= this.rowsCount) {
            updatedIndex = 0;
        }

        if (updatedIndex < 0) {
            updatedIndex = this.rowsCount - 1;
        }

        this.selectRow(updatedIndex, previousIndex);
    }

    focusRow(newIndex: number, shouldFocusRow = true) {
        this.rowSearchDirection = null;
        this.selectedRowIndex = newIndex;
        this.selectedRow = this.tableRows[newIndex];

        if (this.selectedRow) {
            this.selectedRow.setAttribute(this.SELECTED_ATTR, '');
        }

        if (shouldFocusRow) {
            this.focusDefaultRow(newIndex);
        }
    }

    focusDefaultRow(inputIndex?: number) {
        const index: number = !isNaN(inputIndex) ? inputIndex : this.selectedRowIndex;

        setTimeout(() => {
            if (this.tableRows[index] && this.hostElement.nativeElement.hasAttribute(this.ACTIVATED_INSTANCE_ATTR)) {
                this.tableRows[index].focus();
            }
        }, 0);

        this.emitRowState(index);
    }

    emitRowState(index: number) {
        const dataSourceRow = { index };
        this.genericTableService.onSelectedSource(dataSourceRow);
        this.onSelect.emit(dataSourceRow);
    }

    clickButton() {
        const rowFocusableElements: HTMLElement[] = this.getRowFocusableElements();

        if (!rowFocusableElements.length) {
            return;
        }

        if (rowFocusableElements[this.focusTabIndex] && document.activeElement === rowFocusableElements[this.focusTabIndex]) {
            return;
        }

        this.rowPrimaryButtons[this.selectedRowIndex] =
            this.rowPrimaryButtons[this.selectedRowIndex] ||
            (rowFocusableElements as HTMLButtonElement[]).find((button: HTMLButtonElement) => button.hasAttribute(PRIMARY_ACTION_ATTRIBUTE_NAME));

        if (this.rowPrimaryButtons[this.selectedRowIndex]) {
            this.rowPrimaryButtons[this.selectedRowIndex].click();
        }
    }
}
