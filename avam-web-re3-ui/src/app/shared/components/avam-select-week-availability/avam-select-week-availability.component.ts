import { Component, OnInit, OnChanges, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormControlName, FormArray, FormGroupDirective } from '@angular/forms';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';
import { VerfuegbarkeitAMMCodeEnum } from '@app/shared/enums/domain-code/verfuegbarkeit-amm-code.enum';
import { CodeDTO } from '@dtos/codeDTO';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

@Component({
    selector: 'avam-select-week-availability',
    templateUrl: './avam-select-week-availability.component.html',
    styleUrls: ['./avam-select-week-availability.component.scss']
})
export class AvamSelectWeekAvailabilityComponent implements OnInit, OnChanges {
    @Input() parentForm: FormGroup;
    @Input() vormittagsControlName: string;
    @Input() nachmittagsControlName: string;
    @Input() dropdownOptions: CodeDTO[];
    @Input() verfuegbarkeitControl: FormControlName;
    @Input() isDisabled: boolean;
    @Input() readOnly = false;
    // Checkboxes are cleared every time on dropdown change event.
    // If this flag is true, than the checkboxes remain the same
    // and the flag will be returned to true for the next dropdown change.
    @Input() clearCheckboxes = true;
    @Input() selectLabel = false;
    @Input() hideEmptyOption: boolean;
    @Output() onChanges: EventEmitter<any> = new EventEmitter();
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    daysForm: FormGroup;
    vormittags: FormArray;
    nachmittags: FormArray;
    showCheckboxPanel = false;
    workDays = 5;
    days = ['common.label.tagmo', 'common.label.tagdi', 'common.label.tagmi', 'common.label.tagdo', 'common.label.tagfr', 'common.label.tagsa', 'common.label.tagso'];
    value = '';
    constructor(private formUtils: FormUtilsService, private obliqueHelper: ObliqueHelperService) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.ngForm);
    }

    ngOnChanges() {
        this.vormittags = this.parentForm.get(this.vormittagsControlName) as FormArray;
        this.nachmittags = this.parentForm.get(this.nachmittagsControlName) as FormArray;
        if (!this.clearCheckboxes) {
            this.change(this.value);
        }
    }

    change(value: string) {
        this.value = value;
        if (this.clearCheckboxes) {
            this.unselectAll();
        }
        this.clearCheckboxes = true;
        this.checkNachmittags(value);
        this.checkVormittags(value);
        this.checkVollzeit(value);
        this.checkUntershiedlich(value);
        this.checkWochenplan(value);
    }

    checkVollzeit(value: string) {
        if (value && value === this.dropdownCode(VerfuegbarkeitAMMCodeEnum.VOLLZEIT)) {
            this.showCheckboxPanel = false;
            for (let i = 0; i < this.workDays; i++) {
                this.vormittags.at(i).setValue(true);
                this.nachmittags.at(i).setValue(true);
            }
        }
    }

    checkVormittags(value: string) {
        if (value && value === this.dropdownCode(VerfuegbarkeitAMMCodeEnum.VORMITTAGS)) {
            this.showCheckboxPanel = false;
            for (let i = 0; i < this.workDays; i++) {
                this.vormittags.at(i).setValue(true);
                this.nachmittags.at(i).setValue(false);
            }
        }
    }

    checkNachmittags(value: string) {
        if (value && value === this.dropdownCode(VerfuegbarkeitAMMCodeEnum.NACHMITTAGS)) {
            this.showCheckboxPanel = false;
            for (let i = 0; i < this.workDays; i++) {
                this.vormittags.at(i).setValue(false);
                this.nachmittags.at(i).setValue(true);
            }
        }
    }

    checkWochenplan(value: string) {
        const wochenPlanId = this.dropdownCode(VerfuegbarkeitAMMCodeEnum.WOCHENPLAN);

        if (value && value === wochenPlanId) {
            this.showCheckboxPanel = true;
        }
    }

    checkUntershiedlich(value: string) {
        if (value && value === this.dropdownCode(VerfuegbarkeitAMMCodeEnum.UNTERSCHIEDLICH)) {
            this.showCheckboxPanel = false;
        }
    }

    unselectAll() {
        this.vormittags.controls.forEach(control => {
            control.setValue(false);
            control.clearValidators();
        });
        this.nachmittags.controls.forEach(control => {
            control.setValue(false);
            control.clearValidators();
        });
    }

    private dropdownCode(verfuegbarkeitAMMCode: string) {
        return this.formUtils.getCodeIdByCode(this.dropdownOptions, verfuegbarkeitAMMCode);
    }
}
