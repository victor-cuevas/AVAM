import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

/**
 * Author: Zdravko Tsvyatkov
 * Description: Wraps two avam calenders to create a date range picker (date from and to)
 * Usage: <avam-date-range-picker label="{{ 'stes.label.zwischenverdienst' }}" [parentForm]="zwischenverdienstForm"
 *        formControlNameFrom="zwischenverdienstVon" formControlNameTo="zwischenverdienstBis"></avam-date-range-picker>
 */

@Component({
    selector: 'avam-date-range-picker',
    templateUrl: './date-range-picker.component.html',
    styleUrls: ['./date-range-picker.component.scss']
})
export class DateRangePickerComponent implements OnInit {
    /**
     * Sets read only state dynamically if we have selected item.
     *
     * @memberof DateRangePickerComponent
     */
    @Input() set readOnly(state: string) {
        this.isReadOnly = state;
        this.readOnlyStyleVon = this.isReadOnly === 'von' || this.isReadOnly === 'all';
        this.readOnlyStyleBis = this.isReadOnly === 'bis' || this.isReadOnly === 'all';
    }
    /**
     * Parent form name string (required)
     */
    @Input() parentForm: FormGroup;
    /**
     * Form Control Name for the FROM calendar (required)
     */
    @Input() formControlNameFrom: string;
    /**
     * Form Control Name for the TO calendar (required)
     */
    @Input() formControlNameTo: string;
    /**
     * Label string (recommended)
     */
    @Input() label: string;
    /**
     * Placeholder for the FROM calendar (optional)
     */
    @Input() placeholderFrom: string;
    /**
     * Placeholder for the TO calendar (optional)
     */
    @Input() placeholderTo: string;
    /**
     * Css class string to resize input with col-? (optional)
     */
    @Input() inputClass: any = false;
    /**
     * Css class string to resize label with col-? (optional)
     */
    @Input() labelClass: string;
    /**
     * Css class string to resize wrapper (optional)
     */
    @Input() wrapperClass: string;
    /**
     * Css class string to resize container (optional)
     */
    @Input() containerClass: string;
    /**
     * Field to display a vertical layout
     */
    @Input() hasVerticalLayout: boolean;

    /**
     * Remove flex-wrap class
     */
    @Input() dropdownWrapper: boolean;

    /**
     * Field to restrict range dynamicaly
     */
    @Input() minFrom: Date;
    /**
     * Field to restrict range dynamicaly
     */
    @Input() maxFrom: Date;

    /**
     * Field to restrict range dynamicaly
     */
    @Input() minTo: Date;
    /**
     * Field to restrict range dynamicaly
     */
    @Input() maxTo: Date;

    /**
     * Determine if date picker is disabled.
     *
     * @memberof DateRangePickerComponent
     */
    @Input() isDisabled = false;

    /**
     * Add resposive behavior if true.
     *
     * @memberof DateRangePickerComponent
     */
    @Input() isResponsive = false;

    /**
     * Format for the displayed date.
     *
     * @memberof DateRangePickerComponent
     */
    @Input() bsConfig = { dateInputFormat: 'DD.MM.YYYY' };

    /**
     * Turns calendar field "von", "bis" or both in read-only state
     * depending on argument.
     *
     * @memberof DateRangePickerComponent
     */
    isReadOnly: string;

    /**
     * Input Value From
     *
     * @type {string}
     * @memberof DateRangePickerComponent
     */
    inputValueFrom: string;

    /**
     * Input Value To
     *
     * @type {string}
     * @memberof DateRangePickerComponent
     */
    inputValueTo: string;

    /**
     * Sets style to von field.
     *
     * @type {boolean}
     * @memberof DateRangePickerComponent
     */
    readOnlyStyleVon: boolean;

    /**
     * Sets style to bis field.
     *
     * @type {boolean}
     * @memberof DateRangePickerComponent
     */
    readOnlyStyleBis: boolean;

    @ViewChild('ngForm') formInstance: FormGroupDirective;

    constructor(private formUtils: FormUtilsService, private obliqueHelper: ObliqueHelperService) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);

        if (!this.inputClass) {
            if (this.isResponsive) {
                this.inputClass = '';
                return;
            }
            this.inputClass = 'col-lg-4 col-md-4';
        }

        if (!this.parentForm) {
            throw new Error('Please provide FormGroup "parentForm" as input for this component!');
        }
        if (!this.formControlNameFrom) {
            throw new Error('Please provide form control name for "from" calendar "formControlNameFrom" as input for this component!');
        }
        if (!this.formControlNameTo) {
            throw new Error('Please provide form control name for "to" calendar "formControlNameTo" as input for this component!');
        }
    }

    onValueChangeFrom(value: string) {
        this.inputValueFrom = this.formUtils.formatDateNgx(value, 'DD.MM.YYYY');
    }

    onValueChangeTo(value: string) {
        this.inputValueTo = this.formUtils.formatDateNgx(value, 'DD.MM.YYYY');
    }
}
