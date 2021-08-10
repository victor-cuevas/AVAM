import { Component, Input } from '@angular/core';
import { AvamComponentsTableBaseComponent } from '../avam-components-table-base';

@Component({
    selector: 'avam-components-table-input',
    template: `
        <ng-container *ngIf="options.isFirst && options.index === 0; else notFirst">
            <avam-label-input
                [coreAutofocus]="options.createdRow && !optionalFocus"
                [isDisabled]="options.component?.isDisabled | async"
                [parentForm]="parentForm"
                [controlName]="options.columnDef"
                [inputClass]="'col-lg-12 col-md-4'"
                [readOnly]="isReadOnlyBoolean ? options.component?.readOnly : (options.component?.readOnly | async)"
                (onChange)="parseChange(parentForm, options.component?.onChange)"
            ></avam-label-input>
        </ng-container>

        <ng-template #notFirst>
            <avam-label-input
                [isDisabled]="options.component?.isDisabled | async"
                [parentForm]="parentForm"
                [controlName]="options.columnDef"
                [inputClass]="'col-lg-12 col-md-4'"
                [readOnly]="isReadOnlyBoolean ? options.component?.readOnly : (options.component?.readOnly | async)"
                (onChange)="parseChange(parentForm, options.component?.onChange)"
            ></avam-label-input>
        </ng-template>
    `,
    providers: []
})
export class AvamComponentsTableInputComponent extends AvamComponentsTableBaseComponent {
    /**
     * If true deactivate the initial focus on the table.
     *
     * @type {booblean}
     * @memberof AvamComponentsTableInputComponent
     */
    @Input() optionalFocus: boolean;

    constructor() {
        super();
    }
}
