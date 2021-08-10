import { Component, Input } from '@angular/core';
import { AvamComponentsTableBaseComponent } from '../avam-components-table-base';

@Component({
    selector: 'avam-components-table-spracheautosuggest',
    template: `
        <ng-container *ngIf="options.isFirst && options.index === 0; else notFirst">
            <avam-sprache-autosuggest
                [coreAutofocus]="options.createdRow && !optionalFocus"
                [isDisabled]="options.component?.isDisabled | async"
                [parentForm]="parentForm"
                [controlName]="controlName"
                [readOnly]="isReadOnlyBoolean ? options.component?.readOnly : (options.component?.readOnly | async)"
                placeholder="{{ 'arbeitgeber.oste.label.sprache' }}"
                (onChange)="parseChange(parentForm, options.component?.onChange)"
                container="body"
                [scrollIntoView]="false"
            >
            </avam-sprache-autosuggest>
        </ng-container>

        <ng-template #notFirst>
            <avam-sprache-autosuggest
                [isDisabled]="options.component?.isDisabled | async"
                [parentForm]="parentForm"
                [controlName]="controlName"
                [readOnly]="isReadOnlyBoolean ? options.component?.readOnly : (options.component?.readOnly | async)"
                placeholder="{{ 'arbeitgeber.oste.label.sprache' }}"
                (onChange)="parseChange(parentForm, options.component?.onChange)"
                container="body"
                [scrollIntoView]="false"
            >
            </avam-sprache-autosuggest>
        </ng-template>
    `,
    providers: []
})
export class AvamComponentsTableSpracheautosuggestComponent extends AvamComponentsTableBaseComponent {
    /**
     * If true deactivate the initial focus on the table.
     *
     * @type {booblean}
     * @memberof AvamComponentsTableSpracheautosuggestComponent
     */
    @Input() optionalFocus: boolean;

    constructor() {
        super();
    }
}
