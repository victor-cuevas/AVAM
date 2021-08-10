import { Component, Input, TemplateRef, OnChanges } from '@angular/core';

@Component({
    selector: 'avam-info-icon-btn',
    templateUrl: './avam-info-icon-btn.component.html',
    styleUrls: ['./avam-info-icon-btn.component.scss']
})
export class AvamInfoIconBtnComponent {
    /**
     * The template for displaying the data in the popup
     *
     * @type {TemplateRef<any>}
     * @memberof AvamInfoIconBtnComponent
     */
    @Input() infoIconTemplate: TemplateRef<any>;

    /**
     * Property to indicate if the parent component is read-only
     * Used for styling the info button
     *
     * @type {boolean}
     * @memberof AvamInfoIconBtnComponent
     */
    @Input() readOnly: boolean;

    /**
     * Property to indicate if the parent component is disabled
     * Used for styling the info button
     *
     * @type {boolean}
     * @memberof AvamInfoIconBtnComponent
     */
    @Input() disabled: boolean;
}
