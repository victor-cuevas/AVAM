import { Component, Input } from '@angular/core';
import { AvamComponentsTableBaseComponent } from '../avam-components-table-base';

@Component({
    selector: 'avam-components-table-calendar',
    template: `
        <ng-container *ngIf="options.isFirst && options.index === 0; else notFirst">
            <avam-label-calendar
                [coreAutofocus]="createdRow && !optionalFocus"
                [id]="options.columnDef + options.index"
                [isDisabled]="options.component?.isDisabled | async"
                [parentForm]="parentForm"
                [controlName]="controlName"
                [readOnly]="isReadOnlyBoolean ? options.component?.readOnly : (options.component?.readOnly | async)"
                [inputClass]="'col-lg-12 col-md-4'"
                (dateChange)="parseChange(parentForm, options.component?.onChange)"
                [bsConfig]="{ dateInputFormat: 'DD.MM.YYYY' }"
            ></avam-label-calendar>
        </ng-container>

        <ng-template #notFirst>
            <avam-label-calendar
                [id]="options.columnDef + options.index"
                [isDisabled]="options.component?.isDisabled | async"
                [parentForm]="parentForm"
                [controlName]="controlName"
                [readOnly]="isReadOnlyBoolean ? options.component?.readOnly : (options.component?.readOnly | async)"
                [inputClass]="'col-lg-12 col-md-4'"
                (dateChange)="parseChange(parentForm, options.component?.onChange)"
                [bsConfig]="{ dateInputFormat: 'DD.MM.YYYY' }"
            ></avam-label-calendar>
        </ng-template>
    `,
    providers: []
})
export class AvamComponentsTableCalendarComponent extends AvamComponentsTableBaseComponent {
    /**
     * If true deactivate the initial focus on the table.
     *
     * @type {boolean}
     * @memberof AvamComponentsTableCalendarComponent
     */
    @Input() optionalFocus: boolean;

    constructor() {
        super();
    }
}
