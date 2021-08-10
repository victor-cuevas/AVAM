import { Component, Input } from '@angular/core';
import { AvamComponentsTableBaseComponent } from '../avam-components-table-base';

@Component({
    selector: 'avam-components-table-dropdown',
    template: `
        <ng-container *ngIf="options.isFirst && options.index === 0; else notFirst">
            <avam-label-dropdown
                [coreAutofocus]="options.createdRow && !optionalFocus"
                [isDisabled]="options.component?.isDisabled | async"
                [parentForm]="parentForm"
                [controlName]="controlName"
                [readOnly]="isReadOnlyBoolean ? options.component?.readOnly : (options.component?.readOnly | async)"
                [placeholder]="options.component?.placeholder | translate"
                [options]="options.component?.options"
                [inputClass]="'col-lg-12 col-md-4'"
                (onChange)="parseChange(parentForm, options.component?.onChange)"
            ></avam-label-dropdown>
        </ng-container>

        <ng-template #notFirst>
            <avam-label-dropdown
                [isDisabled]="options.component?.isDisabled | async"
                [parentForm]="parentForm"
                [controlName]="controlName"
                [readOnly]="isReadOnlyBoolean ? options.component?.readOnly : (options.component?.readOnly | async)"
                [placeholder]="options.component?.placeholder | translate"
                [options]="options.component?.options"
                [inputClass]="'col-lg-12 col-md-4'"
                (onChange)="parseChange(parentForm, options.component?.onChange)"
            ></avam-label-dropdown>
        </ng-template>
    `,
    providers: []
})
export class AvamComponentsTableDropwdownComponent extends AvamComponentsTableBaseComponent {
    /**
     * If true deactivate the initial focus on the table.
     *
     * @type {booblean}
     * @memberof AvamComponentsTableDropwdownComponent
     */
    @Input() optionalFocus: boolean;

    constructor() {
        super();
    }
}
