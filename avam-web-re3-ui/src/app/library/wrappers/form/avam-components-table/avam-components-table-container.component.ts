import { Component, Input } from '@angular/core';
import { FormGroup, FormControlName } from '@angular/forms';
import { ComponentOptions } from './avam-components-table.interface';
@Component({
    selector: 'avam-components-table-container',
    template: `
        <ng-container [ngSwitch]="column.component?.type">
            <avam-components-table-calendar
                [optionalFocus]="optionalFocus"
                *ngSwitchCase="'calendar'"
                [parentForm]="parentForm"
                [controlName]="controlName"
                [options]="options"
            ></avam-components-table-calendar>

            <avam-components-table-input
                [optionalFocus]="optionalFocus"
                *ngSwitchCase="'input'"
                [parentForm]="parentForm"
                [parentForm]="parentForm"
                [controlName]="controlName"
                [options]="options"
            ></avam-components-table-input>

            <avam-components-table-dropdown
                [optionalFocus]="optionalFocus"
                *ngSwitchCase="'dropdown'"
                [parentForm]="parentForm"
                [controlName]="controlName"
                [options]="options"
            ></avam-components-table-dropdown>

            <avam-components-table-spracheautosuggest
                [optionalFocus]="optionalFocus"
                *ngSwitchCase="'autosuggest'"
                [parentForm]="parentForm"
                [controlName]="controlName"
                [options]="options"
            ></avam-components-table-spracheautosuggest>
        </ng-container>
    `
})
export class AvamComponentsTableContainerComponent {
    //
    @Input() parentForm: FormGroup;

    @Input() controlName: FormControlName;

    @Input() isFirst: boolean;

    @Input() index: number;

    @Input() createdRow: boolean;

    /**
     * If true deactivate the initial focus on the table.
     *
     * @type {booblean}
     * @memberof AvamComponentsTableContainerComponent
     */
    @Input() optionalFocus: boolean;

    options: ComponentOptions;

    @Input()
    set column(data) {
        this._column = data;

        this.options = {
            isFirst: this.isFirst,
            index: this.index,
            columnDef: this.column.columnDef,
            component: this.column.component,
            createdRow: this.createdRow
        };
    }

    get column() {
        return this._column;
    }

    private _column;
}
