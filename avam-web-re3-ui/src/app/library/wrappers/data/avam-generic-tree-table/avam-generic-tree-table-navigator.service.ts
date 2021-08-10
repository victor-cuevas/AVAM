import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { AvamGenericTreeTableService } from './avam-generic-tree-table.service';

@Injectable()
export class AvamGenericTreeTableNavigatorService {
    selectedRow$: Subject<any> = new Subject();
    currentSelection: number;
    currentSelectedButton = 0;
    buttonEnd: boolean;
    buttonStart = true;
    afterTab = false;
    flatTree: [];
    constructor(private table: AvamGenericTreeTableService, private ngZone: NgZone) {}

    selectRow(flatTree) {
        let customSelectedRow = false;
        this.flatTree = flatTree;
        flatTree.forEach(row => {
            if (row.model.selectedRow) {
                customSelectedRow = true;
                this.expandParent(row);
                setTimeout(() => {
                    this.onClick(row);
                }, 0);
            }
        });

        if (!customSelectedRow) {
            if (flatTree[0]) {
                setTimeout(() => {
                    this.onClick(flatTree[0]);
                }, 0);
            }
        }
    }

    expandParent(row) {
        if (row.parent) {
            this.table.expand(row.parent);
            this.expandParent(row.parent);
        }
    }

    onKeydown(event, currentRow) {
        const currentIndex = this.table.dataSource.findIndex(row => row === currentRow);
        this.currentSelection = currentIndex;
        this.ngZone.runOutsideAngular(() => {
            switch (true) {
                case event.key === 'ArrowRight' || event.key === 'Right':
                    this.table.expand(currentRow);
                    break;
                case event.key === 'ArrowLeft' || event.key === 'Left':
                    this.table.collapse(currentRow);
                    break;
                case event.key === 'Tab':
                    this.switchTabEvents(event);
                    break;
                case event.key === 'ArrowDown' || event.key === 'Down':
                    this.onArrowDown();
                    break;
                case event.key === 'ArrowUp' || event.key === 'Up':
                    this.onArrowUp();
                    break;
                default:
                    break;
            }
        });
    }

    resetNavigationState() {
        const currentRow = this.collectRows()[this.currentSelection].elements.row;
        currentRow.classList.remove('hover');
        this.buttonEnd = false;
        this.buttonStart = true;
        this.currentSelectedButton = 0;
    }

    onClick(currentRow) {
        const currentIndex = this.table.dataSource.findIndex(row => row === currentRow);
        const rows = Array.from(document.querySelectorAll('table .cdk-row'));
        this.currentSelection = currentIndex;
        if ((document.activeElement.tagName === 'TR' || document.activeElement.tagName === 'BODY') && this.collectRows()[this.currentSelection]) {
            this.collectRows()[this.currentSelection].elements.row.focus();
        }

        this.afterTab = false;

        rows.forEach(row => {
            if (row.classList.contains('hover')) {
                row.classList.remove('hover');
            }
        });

        this.buttonStart = true;
        this.buttonEnd = false;
        this.currentSelectedButton = 0;
        this.selectedRow$.next(currentRow);
    }

    onArrowUp() {
        const collectedRows = this.collectRows()[this.currentSelection - 1];
        if (collectedRows) {
            const prevRow = collectedRows.elements.row;
            this.resetNavigationState();
            prevRow.focus();
            this.selectedRow$.next(this.flatTree[this.currentSelection - 1]);
        }
    }

    onArrowDown() {
        const collectedRows = this.collectRows()[this.currentSelection + 1];
        if (collectedRows) {
            const nextRow = collectedRows.elements.row;
            this.resetNavigationState();
            nextRow.focus();
            this.selectedRow$.next(this.flatTree[this.currentSelection + 1]);
        }
    }

    switchTabEvents(event) {
        event.shiftKey ? this.onShiftTab(event) : this.onTab(event);
    }

    onTab(event) {
        const buttons = this.collectRows()[this.currentSelection].elements.buttons;
        const currentRow = this.collectRows()[this.currentSelection].elements.row;
        const collectedRows = this.collectRows()[this.currentSelection + 1];

        this.afterTab = true;

        if (buttons.length > 0 && !this.buttonEnd) {
            event.preventDefault();
            if (document.activeElement === currentRow) {
                this.currentSelectedButton = 0;
            }

            currentRow.classList.add('hover');

            if (document.activeElement === buttons[this.currentSelectedButton] && this.currentSelectedButton === buttons.length - 1) {
                this.buttonEnd = false;
                currentRow.classList.remove('hover');
                event.preventDefault();

                if (!collectedRows) {
                    return;
                }

                const nextRow = collectedRows.elements.row;
                nextRow.focus();
                this.selectedRow$.next(this.flatTree[this.currentSelection + 1]);
                return;
            }

            if (document.activeElement === buttons[this.currentSelectedButton]) {
                this.currentSelectedButton = this.currentSelectedButton + 1;
            }

            buttons[this.currentSelectedButton].visibility = 'visible';
            buttons[this.currentSelectedButton].focus();

            if (buttons.length - 1 === this.currentSelectedButton) {
                this.buttonEnd = true;
                this.currentSelectedButton = 0;
            } else {
                this.currentSelectedButton = this.currentSelectedButton + 1;
            }

            this.buttonStart = this.currentSelectedButton === 0;
        } else {
            this.buttonEnd = false;
            currentRow.classList.remove('hover');
            if (collectedRows) {
                event.preventDefault();
                const nextRow = collectedRows.elements.row;
                nextRow.focus();
                this.buttonStart = true;
                this.selectedRow$.next(this.flatTree[this.currentSelection + 1]);
            } else {
                this.buttonStart = false;
            }
        }
    }

    onShiftTab(event) {
        const buttons = this.collectRows()[this.currentSelection].elements.buttons;
        const currentRow = this.collectRows()[this.currentSelection].elements.row;
        const collectedRows = this.collectRows()[this.currentSelection - 1];

        this.initializeOnShiftTab(buttons);

        if (this.afterTab && currentRow.classList.contains('hover') && this.currentSelectedButton === 0) {
            this.buttonStart = true;
            this.buttonEnd = false;
            this.afterTab = false;
            return;
        }

        if (this.firstRowFromBelowNotHovered(currentRow)) {
            this.currentSelectedButton = buttons.length - 1;
        }

        if (this.firstRowFromBelow() && this.checkCurrentButton(currentRow, buttons)) {
            event.preventDefault();
            this.shiftTabBelowEnter(buttons);
            this.afterTab = false;
            return;
        }

        this.afterTab = false;

        if (this.firstRowFromBelow() && this.checkCurrentRow(currentRow, buttons)) {
            event.preventDefault();
            currentRow.focus();
            currentRow.classList.add('hover');
            return;
        }

        this.selectRowOrButton(collectedRows, currentRow, buttons, event);
    }

    initializeOnShiftTab(buttons) {
        if (this.currentSelectedButton === 0 && this.buttonEnd && buttons.length > 1 && document.activeElement !== buttons[0]) {
            this.buttonStart = false;
            this.currentSelectedButton = buttons.length - 1;
        }
    }

    shiftTabBelowEnter(buttons) {
        const lastRow = this.collectRows()[this.currentSelection].elements.row;
        if (!lastRow.classList.contains('hover')) {
            this.afterTab = false;
        }

        lastRow.classList.add('hover');

        if (this.afterTab) {
            this.currentSelectedButton = this.currentSelectedButton - 2;
        }

        if (buttons[this.currentSelectedButton]) {
            buttons[this.currentSelectedButton].focus();
        }

        this.currentSelectedButton = this.currentSelectedButton === 0 ? this.currentSelectedButton : this.currentSelectedButton - 1;

        if (this.currentSelectedButton < 0) {
            this.currentSelectedButton = 0;
        }

        if (this.currentSelectedButton === 0) {
            this.buttonStart = true;
            this.currentSelection -= 1;
        }

        this.selectedRow$.next(this.flatTree[this.currentSelection]);
    }

    firstRowFromBelow() {
        return this.collectRows().length - 1 === this.currentSelection;
    }

    firstRowFromBelowNotHovered(currentRow) {
        return this.firstRowFromBelow() && !currentRow.classList.contains('hover');
    }

    checkCurrentButton(currentRow, buttons) {
        return (
            this.currentSelectedButton >= 0 &&
            document.activeElement !== buttons[this.currentSelectedButton] &&
            (!currentRow.classList.contains('hover') || (currentRow.classList.contains('hover') && document.activeElement !== currentRow))
        );
    }

    checkCurrentRow(currentRow, buttons) {
        return (!this.currentSelectedButton || !buttons || !buttons.length) && document.activeElement !== currentRow;
    }

    selectRowOrButton(collectedRows, currentRow, buttons, event) {
        if (buttons.length > 0 && !this.buttonStart && document.activeElement !== currentRow) {
            event.preventDefault();
            currentRow.classList.add('hover');
            this.buttonEnd = this.currentSelectedButton === buttons.length - 1;

            if (!this.currentSelectedButton) {
                this.buttonStart = true;
                this.buttonEnd = false;
                this.currentSelectedButton = buttons.length - 1;

                currentRow.focus();
            } else {
                this.currentSelectedButton = this.currentSelectedButton - 1;

                this.buttonEnd = false;

                if (document.activeElement === buttons[this.currentSelectedButton] && this.currentSelectedButton === 0) {
                    this.buttonStart = false;
                    currentRow.focus();
                    return;
                }

                if (document.activeElement === buttons[this.currentSelectedButton]) {
                    this.currentSelectedButton = this.currentSelectedButton - 1;
                }

                buttons[this.currentSelectedButton].focus();
            }
        } else {
            this.buttonStart = false;
            currentRow.classList.remove('hover');

            if (collectedRows) {
                event.preventDefault();
                const prevRow = collectedRows.elements.row;
                prevRow.classList.add('hover');
                prevRow.focus();
                this.buttonEnd = true;

                this.navigateToLastButton(collectedRows);

                this.selectedRow$.next(this.flatTree[this.currentSelection - 1]);
            }
        }
    }

    navigateToLastButton(collectedRows) {
        const prevButtons = collectedRows.elements.buttons;

        if (prevButtons && prevButtons.length && prevButtons[prevButtons.length - 1]) {
            prevButtons[prevButtons.length - 1].visibility = 'visible';
            prevButtons[prevButtons.length - 1].focus();
        }
    }

    collectRows() {
        const order = [];

        this.ngZone.runOutsideAngular(() => {
            const rows = Array.from(document.querySelectorAll('table .cdk-row'));

            rows.forEach((row, index) => {
                order.push({ elements: { row } });
                const hasButtons = Array.from(row.querySelectorAll('button'));

                if (hasButtons) {
                    order[index].elements.buttons = [];
                    hasButtons.forEach(button => {
                        order[index].elements.buttons.push(button);
                    });
                }
            });
        });
        return order;
    }
}
