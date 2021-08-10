import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FormGroup, FormGroupDirective, ControlContainer } from '@angular/forms';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';
import { Component, Input, Output, EventEmitter, ViewChild, OnInit } from '@angular/core';

@Component({
    selector: 'avam-prepend-calendar',
    templateUrl: './avam-prepend-calendar.component.html',
    styleUrls: ['./avam-prepend-calendar.component.scss']
})
export class AvamPrependCalendarComponent implements OnInit {
    @Input() label = '';
    @Input() parentForm: FormGroup;
    @Input() controlName: string;
    @Input() inputClass: string;
    @Input() id: string;
    @Input() bsConfig = { dateInputFormat: 'DD.MM.YYYY' };
    @Input() inputPlaceholder: string;
    @Input() minDate: Date;
    @Input() maxDate: Date;
    @Input() isDisabled: boolean;
    @Input() isFocused: boolean;
    @Input() readOnly: boolean;
    @Output() dateChange: EventEmitter<any> = new EventEmitter();
    @ViewChild('ngForm') formInstance: FormGroupDirective;

    inputDate: any = '';

    constructor(private formUtils: FormUtilsService, private obliqueHelper: ObliqueHelperService, private controlContainer: ControlContainer) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);

        if (!this.id) {
            throw new Error('You need to specify id for this component!');
        }
        if (!this.controlContainer) {
            throw new Error('Cant find parent formGroup directive!');
        }
        if (!this.controlName) {
            throw new Error('Missing FormControlName directive from host element of the component!');
        }
    }

    onChangeDate(date: Date) {
        this.inputDate = this.formUtils.formatDateNgx(date, 'DD.MM.YYYY');
        this.dateChange.emit(date);
    }
}
